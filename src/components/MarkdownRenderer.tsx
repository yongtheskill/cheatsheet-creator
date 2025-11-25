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
  imageMap?: Record<string, string>; // Maps image names to data URLs or paths
}

// Convert Obsidian-style ![[image.png]] to standard markdown ![image](url)
// Supports: ![[image.png]], ![[image.png|alt]], ![[image.png|250]] (width in px)
const processObsidianImages = (content: string, imageMap: Record<string, string> = {}): string => {
  // Match ![[filename]] or ![[filename|alt or width]] patterns
  return content.replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_match, filename, modifier) => {
    const trimmedFilename = filename.trim();
    const imageUrl = imageMap[trimmedFilename];

    // If image not found in map, return empty string (skip rendering)
    if (!imageUrl) return '';

    const trimmedModifier = modifier?.trim() || '';

    // Check if modifier is a number (width)
    const isWidth = /^\d+$/.test(trimmedModifier);

    // Encode width in alt text using a special marker: {{w:250}}
    const alt = isWidth ? `{{w:${trimmedModifier}}}` : trimmedModifier;

    return `![${alt}](${imageUrl})`;
  });
};

const InnerMarkdown = React.memo(
  ({ content, imageMap }: { content: string; imageMap: Record<string, string> }) => {
    const processedContent = processObsidianImages(content, imageMap);

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        urlTransform={(url) => url}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter {...props} style={vs} language={match[1]} PreTag='div'>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
          img({ src, alt, ...props }: any) {
            if (!src) return null;

            // Parse width from alt text marker {{w:250}}
            const widthMatch = alt?.match(/^\{\{w:(\d+)\}\}$/);
            const width = widthMatch ? parseInt(widthMatch[1], 10) : undefined;
            const cleanAlt = widthMatch ? '' : alt || '';

            return (
              <img
                src={src}
                alt={cleanAlt}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  ...(width && { width: `${width}px` }),
                }}
                {...props}
              />
            );
          },
          p({ children, ...props }: any) {
            // Check if paragraph contains only images
            const childArray = React.Children.toArray(children);
            const allImages = childArray.every(
              (child: any) =>
                child?.type === 'img' ||
                child?.type?.name === 'img' ||
                (React.isValidElement(child) && (child.type === 'img' || (child.props as any)?.src))
            );

            // If multiple images, wrap in flex container
            if (allImages && childArray.length > 1) {
              return (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    alignItems: 'flex-start',
                  }}>
                  {children}
                </div>
              );
            }

            return <p {...props}>{children}</p>;
          },
        }}>
        {processedContent}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) =>
    prevProps.content === nextProps.content && prevProps.imageMap === nextProps.imageMap
);

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  fontSize = 16,
  imageMap = {},
}) => {
  return (
    <div
      className='w-full h-full overflow-hidden mdContainer'
      style={{ fontSize: `${fontSize}px` }}>
      <InnerMarkdown content={content} imageMap={imageMap} />
    </div>
  );
};

MarkdownRenderer.displayName = 'MarkdownRenderer';
