import React from 'react';

interface TextNode {
  detail: number;
  format: number;
  mode: string;
  style: string;
  text: string;
  type: 'text';
  version: number;
}

interface LinkNode {
  children: (TextNode | LinkNode)[];
  direction: string;
  format: string;
  indent: number;
  type: 'link';
  version: number;
  rel?: string;
  target?: string | null;
  title?: string | null;
  url: string;
}

interface ParagraphNode {
  children: (TextNode | LinkNode)[];
  direction: string | null;
  format: string;
  indent: number;
  type: 'paragraph';
  version: number;
  textFormat: number;
  textStyle: string;
}

interface HeadingNode {
  children: (TextNode | LinkNode)[];
  direction: string;
  format: string;
  indent: number;
  type: 'heading';
  version: number;
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface ListNode {
  children: ListItemNode[];
  direction: string;
  format: string;
  indent: number;
  type: 'list';
  version: number;
  listType: 'bullet' | 'number';
  start: number;
  tag: 'ul' | 'ol';
}

interface ListItemNode {
  children: (TextNode | LinkNode | ParagraphNode)[];
  direction: string;
  format: string;
  indent: number;
  type: 'listitem';
  version: number;
  value: number;
}

interface QuoteNode {
  children: (TextNode | LinkNode | ParagraphNode)[];
  direction: string;
  format: string;
  indent: number;
  type: 'quote';
  version: number;
}

interface RootNode {
  children: (ParagraphNode | HeadingNode | ListNode | QuoteNode)[];
  direction: string;
  format: string;
  indent: number;
  type: 'root';
  version: number;
}

interface SerializedLexicalNode {
  type: string;
  version: number;
  [key: string]: any;
}

interface RichTextData {
  root: {
    type: 'root';
    children: SerializedLexicalNode[];
    direction: string;
    format: string;
    indent: number;
    version: number;
  };
}

// Format flags (bitwise)
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;
const FORMAT_SUBSCRIPT = 32;
const FORMAT_SUPERSCRIPT = 64;

function getTextFormatting(format: number): string {
  const classes: string[] = [];
  
  if (format & FORMAT_BOLD) classes.push('font-bold');
  if (format & FORMAT_ITALIC) classes.push('italic');
  if (format & FORMAT_STRIKETHROUGH) classes.push('line-through');
  if (format & FORMAT_UNDERLINE) classes.push('underline');
  if (format & FORMAT_CODE) classes.push('font-mono bg-muted px-1 py-0.5 rounded text-sm');
  if (format & FORMAT_SUBSCRIPT) classes.push('align-sub text-xs');
  if (format & FORMAT_SUPERSCRIPT) classes.push('align-super text-xs');
  
  return classes.join(' ');
}

function renderTextNode(node: TextNode, key: string): React.ReactNode {
  const formatting = getTextFormatting(node.format);
  
  if (formatting) {
    return (
      <span key={key} className={formatting}>
        {node.text}
      </span>
    );
  }
  
  return node.text;
}

function renderLinkNode(node: LinkNode, key: string): React.ReactNode {
  return (
    <a
      key={key}
      href={node.url}
      target={node.target || '_blank'}
      rel={node.rel || 'noopener noreferrer'}
      title={node.title || undefined}
      className="text-primary hover:underline"
    >
      {node.children.map((child, index) => renderNode(child, `${key}-${index}`))}
    </a>
  );
}

function renderParagraphNode(node: ParagraphNode, key: string): React.ReactNode {
  // Skip empty paragraphs
  if (node.children.length === 0) {
    return <br key={key} />;
  }
  
  return (
    <p key={key} className="mb-4 last:mb-0">
      {node.children.map((child, index) => renderNode(child, `${key}-${index}`))}
    </p>
  );
}

function renderHeadingNode(node: HeadingNode, key: string): React.ReactNode {
  const Tag = node.tag;
  const headingClasses = {
    h1: 'text-4xl font-bold mb-6',
    h2: 'text-3xl font-semibold mb-5',
    h3: 'text-2xl font-semibold mb-4',
    h4: 'text-xl font-semibold mb-3',
    h5: 'text-lg font-semibold mb-3',
    h6: 'text-base font-semibold mb-2',
  };
  
  return (
    <Tag key={key} className={headingClasses[Tag]}>
      {node.children.map((child, index) => renderNode(child, `${key}-${index}`))}
    </Tag>
  );
}

function renderListNode(node: ListNode, key: string): React.ReactNode {
  const Tag = node.tag;
  const listClasses = Tag === 'ul' ? 'list-disc ml-6 mb-4' : 'list-decimal ml-6 mb-4';
  
  return (
    <Tag key={key} className={listClasses}>
      {node.children.map((child, index) => renderNode(child, `${key}-${index}`))}
    </Tag>
  );
}

function renderListItemNode(node: ListItemNode, key: string): React.ReactNode {
  return (
    <li key={key} className="mb-1">
      {node.children.map((child, index) => {
        // For list items, render paragraphs without margin
        if (child.type === 'paragraph') {
          return (
            <span key={`${key}-${index}`}>
              {child.children.map((grandchild, gIndex) => 
                renderNode(grandchild, `${key}-${index}-${gIndex}`)
              )}
            </span>
          );
        }
        return renderNode(child, `${key}-${index}`);
      })}
    </li>
  );
}

function renderQuoteNode(node: QuoteNode, key: string): React.ReactNode {
  return (
    <blockquote key={key} className="border-l-4 border-muted-foreground/20 pl-4 italic my-4">
      {node.children.map((child, index) => renderNode(child, `${key}-${index}`))}
    </blockquote>
  );
}

function renderNode(node: SerializedLexicalNode, key: string): React.ReactNode {
  switch (node.type) {
    case 'text':
      return renderTextNode(node as TextNode, key);
    case 'link':
      return renderLinkNode(node as LinkNode, key);
    case 'paragraph':
      return renderParagraphNode(node as ParagraphNode, key);
    case 'heading':
      return renderHeadingNode(node as HeadingNode, key);
    case 'list':
      return renderListNode(node as ListNode, key);
    case 'listitem':
      return renderListItemNode(node as ListItemNode, key);
    case 'quote':
      return renderQuoteNode(node as QuoteNode, key);
    case 'root':
      return node.children?.map((child: SerializedLexicalNode, index: number) => renderNode(child, `root-${index}`));
    default:
      console.warn('Unknown node type:', node.type);
      return null;
  }
}

export function richTextToJSX(data: RichTextData): React.ReactNode {
  if (!data?.root?.children) {
    return null;
  }
  
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {renderNode(data.root, 'root')}
    </div>
  );
}

export function richTextToHTML(data: RichTextData): string {
  // For server-side rendering or when you need plain HTML string
  const jsx = richTextToJSX(data);
  // Note: This would require a server-side rendering setup to convert JSX to HTML string
  // For now, this is a placeholder that could be implemented with ReactDOMServer
  return jsx ? jsx.toString() : '';
}

// Component wrapper for easy use
interface RichTextRendererProps {
  data: RichTextData;
  className?: string;
}

export function RichTextRenderer({ data, className }: RichTextRendererProps): React.ReactElement | null {
  const content = richTextToJSX(data);
  
  if (!content) {
    return null;
  }
  
  return (
    <div className={className}>
      {content}
    </div>
  );
}