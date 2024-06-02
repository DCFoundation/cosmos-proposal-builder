import { useEffect } from 'react';
import Prism from 'prismjs';
import { classNames } from '../utils/classNames';

export interface CodeHighlightProps {
  content: string;
  prismTag: 'lang-json' | 'lang-javascript' | string;
}

const CodeHighlight = ({ content, prismTag }: CodeHighlightProps) => {
  useEffect(() => {
    // @todo not sure this does anything. check configuration.
    Prism.highlightAll();
  }, []);

  return (
    <pre className='language-javascript'>
      <code className={classNames(prismTag)}>{content}</code>
    </pre>
  );
};

export { CodeHighlight };
