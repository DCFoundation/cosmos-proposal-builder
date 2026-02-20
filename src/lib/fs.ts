import * as fsT from 'fs';
import * as fspT from 'fs/promises';
import * as pathT from 'path';

const { freeze } = Object;

let mutex = Promise.resolve(undefined);

export const makeFileReader = (
  fileName: string,
  {
    fs,
    path,
  }: {
    fs: {
      promises: Pick<typeof fspT, 'readFile' | 'stat' | 'readdir'>;
    };
    path: Pick<typeof pathT, 'resolve' | 'relative' | 'normalize'>;
  }
) => {
  const make = (there: string) => makeFileReader(there, { fs, path });

  // fs.promises.exists isn't implemented in Node.js apparently because it's pure
  // sugar.
  const exists = (fn: string) =>
    fs.promises.stat(fn).then(
      () => true,
      e => {
        if (e.code === 'ENOENT') {
          return false;
        }
        throw e;
      }
    );

  const readText = async () => {
    const promise = mutex;
    let release = Function.prototype;
    mutex = new Promise(resolve => {
      release = resolve;
    });
    await promise;
    try {
      return await fs.promises.readFile(fileName, 'utf-8');
    } finally {
      release(undefined);
    }
  };

  const maybeReadText = () =>
    readText().catch(error => {
      if (
        error.message.startsWith('ENOENT: ') ||
        error.message.startsWith('EISDIR: ')
      ) {
        return undefined;
      }
      throw error;
    });

  const neighbor = (ref: string) => make(path.resolve(fileName, ref));
  return freeze({
    toString: () => fileName,
    readText,
    maybeReadText,
    neighbor,
    stat: () => fs.promises.stat(fileName),
    absolute: () => path.normalize(fileName),
    relative: (there: string) => path.relative(fileName, there),
    exists: () => exists(fileName),
    children: () =>
      fs.promises.readdir(fileName).then(refs => refs.map(neighbor)),
  });
};

export const makeFileWriter = (
  fileName: string,
  {
    fs,
    path,
  }: {
    fs: Pick<typeof fsT, 'existsSync'> & {
      promises: Pick<
        typeof fspT,
        'readFile' | 'stat' | 'writeFile' | 'mkdir' | 'rm' | 'rename'
      >;
    };
    path: Pick<typeof pathT, 'resolve' | 'relative' | 'normalize' | 'dirname'>;
  },
  make = (there: string) => makeFileWriter(there, { fs, path }, make)
) => {
  const writeText = async (txt: string, opts: object) => {
    const promise = mutex;
    let release = Function.prototype;
    mutex = new Promise(resolve => {
      release = resolve;
    });
    await promise;
    try {
      return await fs.promises.writeFile(fileName, txt, opts);
    } finally {
      release(undefined);
    }
  };

  return freeze({
    toString: () => fileName,
    writeText,
    readOnly: () => makeFileReader(fileName, { fs, path }),
    neighbor: (ref: string) => make(path.resolve(fileName, ref)),
    mkdir: (opts: object) => fs.promises.mkdir(fileName, opts),
    rm: (opts: object) => fs.promises.rm(fileName, opts),
    rename: (newName: string) =>
      fs.promises.rename(
        fileName,
        path.resolve(path.dirname(fileName), newName)
      ),
  });
};

export const makeAtomicFileWriter = (
  fileName: string,
  {
    fs,
    path,
  }: {
    fs: Pick<typeof fsT, 'existsSync'> & {
      promises: Pick<
        typeof fspT,
        'readFile' | 'stat' | 'writeFile' | 'mkdir' | 'rm' | 'rename'
      >;
    };
    path: Pick<typeof pathT, 'resolve' | 'relative' | 'normalize' | 'dirname'>;
  },
  pid: number | undefined = undefined,
  nonce: number | undefined = undefined,
  make = (there: string) =>
    makeAtomicFileWriter(there, { fs, path }, pid, nonce, make)
) => {
  const writer = makeFileWriter(fileName, { fs, path }, make);
  return freeze({
    ...writer,
    atomicWriteText: async (txt: string, opts: object) => {
      const scratchName = `${fileName}.${nonce || 'no-nonce'}.${
        pid || 'no-pid'
      }.scratch`;
      const scratchWriter = writer.neighbor(scratchName);
      await scratchWriter.writeText(txt, opts);
      const stats = await scratchWriter.readOnly().stat();
      await scratchWriter.rename(fileName);
      return stats;
    },
  });
};
