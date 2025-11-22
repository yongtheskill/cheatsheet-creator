import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import '../md.css';

interface MarkdownRendererProps {
  content: string;
  fontSize?: number;
}

const InnerMarkdown = React.memo(({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              style={vs}
              language={match[1]}
              PreTag="div"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}, (prevProps, nextProps) => prevProps.content === nextProps.content);

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, fontSize = 16 }) => {
  return (
    <div className="w-full h-full overflow-hidden mdContainer" style={{ fontSize: `${fontSize}px` }}>
      <InnerMarkdown content={content} />
    </div>
  );
};

MarkdownRenderer.displayName = 'MarkdownRenderer';
