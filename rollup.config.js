import ts from 'rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/bin/downloadConfig.ts',
  output: {
    file: 'dist/downloadConfig.js',
    format: 'cjs',
  },
  plugins: [
    resolve(),
    commonjs(),
    ts(),
  ],
};