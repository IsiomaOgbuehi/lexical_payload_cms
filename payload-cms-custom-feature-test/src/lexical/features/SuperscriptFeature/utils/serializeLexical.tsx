import type { SerializedListItemNode, SerializedListNode } from '@lexical/list'
import type { SerializedHeadingNode, SerializedQuoteNode } from '@lexical/rich-text'
import { IS_BOLD, IS_CODE, IS_ITALIC, IS_STRIKETHROUGH, IS_SUBSCRIPT, IS_SUPERSCRIPT, IS_UNDERLINE, TextNode, type SerializedElementNode, type SerializedLexicalNode, type SerializedTextNode } from 'lexical'

import escapeHTML from 'escape-html'
import React, { Fragment, JSX } from 'react'
import { list } from 'postcss'

interface NodeData {
  id: string
  type: string
  content: SerializedLexicalNode
}

interface Props {
  nodes: SerializedLexicalNode[]
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

// Global collection for all nodes in the current render
let allNodes: NodeData[] = []

export function SerializeLexical({ nodes }: Props): JSX.Element {
  // Reset nodes collection for each top-level render
  allNodes = []
  
  const content = renderNodes(nodes)
  
  return (
    <Fragment>
      {/* {content} */}
      {allNodes.length > 0 && (
        <footer className="all-nodes-section">
          <ul className="all-nodes-list" style={{listStyle: 'none'}}>
            {allNodes.map((nodeData, index) => (
              <li key={`${nodeData.type}-${index}-${Math.random()}`}>
                {renderSingleNode(nodeData.content, index)}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </Fragment>
  )
}

function renderNodes(nodes: SerializedLexicalNode[]): JSX.Element {
  return (
    <Fragment>
      {nodes?.map((_node, index): JSX.Element | null => {
        // Collect all nodes except text and link nodes
        if (_node.type !== 'text' && _node.type !== 'linebreak' && _node.type !== 'link') {
          allNodes.push({
            id: `node-${index}`,
            type: _node.type,
            content: _node
          })
        }
        if (_node.type === 'text') {
          const node = _node as SerializedTextNode
          let text = (
            <span dangerouslySetInnerHTML={{ __html: escapeHTML(node.text) }} key={index} />
          )
          if (node.format & IS_BOLD) {
            text = <strong key={index}>{text}</strong>
          }
          if (node.format & IS_ITALIC) {
            text = <em key={index}>{text}</em>
          }
          if (node.format & IS_STRIKETHROUGH) {
            text = (
              <span key={index} style={{ textDecoration: 'line-through' }}>
                {text}
              </span>
            )
          }
          if (node.format & IS_UNDERLINE) {
            text = (
              <span key={index} style={{ textDecoration: 'underline' }}>
                {text}
              </span>
            )
          }
          if (node.format & IS_CODE) {
            text = <code key={index}>{text}</code>
          }
          if (node.format & IS_SUBSCRIPT) {
            text = <sub key={index}>{text}</sub>
          }
          if (node.format & IS_SUPERSCRIPT) {
            text = <sup key={index}>{text}</sup>
          }

          return text
        }

        if (_node == null) {
          return null
        }

        // NOTE: Hacky fix for
        // https://github.com/facebook/lexical/blob/d10c4e6e55261b2fdd7d1845aed46151d0f06a8c/packages/lexical-list/src/LexicalListItemNode.ts#L133
        // which does not return checked: false (only true - i.e. there is no prop for false)
        const serializedChildrenFn = (node: SerializedElementNode): JSX.Element | null => {
          if (node.children == null) {
            return null
          } else {
            if (node?.type === 'list' && (node as SerializedListNode)?.listType === 'check') {
              for (const item of node.children) {
                if ('checked' in item) {
                  if (!item?.checked) {
                    item.checked = false
                  }
                }
              }
              return renderNodes(node.children)
            } else {
              return renderNodes(node.children)
            }
          }
        }

        const serializedChildren =
          'children' in _node ? serializedChildrenFn(_node as SerializedElementNode) : ''

        switch (_node.type) {
          case 'linebreak': {
            return <br key={index} />
          }
          case 'paragraph': {
            return <p key={index}>{serializedChildren}</p>
          }
          case 'heading': {
            const node = _node as SerializedHeadingNode

            type Heading = Extract<keyof JSX.IntrinsicElements, 'h1' | 'h2' | 'h3' | 'h4' | 'h5'>
            const Tag = node?.tag as Heading
            return <Tag key={index}>{serializedChildren}</Tag>
          }
          case 'label':
            return <span key={index}>{serializedChildren}</span>

          case 'largeBody': {
            return <span key={index}>{serializedChildren}</span>
          }
          case 'list': {
            const node = _node as SerializedListNode

            type List = Extract<keyof JSX.IntrinsicElements, 'ol' | 'ul'>
            const Tag = node?.tag as List
            return (
              <Tag className={node?.listType} key={index}>
                {serializedChildren}
              </Tag>
            )
          }
          case 'listitem': {
            const node = _node as SerializedListItemNode

            if (node?.checked != null) {
              return (
                <li
                  aria-checked={node.checked ? 'true' : 'false'}
                  className={`component--list-item-checkbox ${
                    node.checked
                      ? 'component--list-item-checkbox-checked'
                      : 'component--list-item-checked-unchecked'
                  }`}
                  key={index}
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                  role="checkbox"
                  tabIndex={-1}
                  value={node?.value}
                >
                  {serializedChildren}
                </li>
              )
            } else {
              return (
                <li key={index} value={node?.value}>
                  {serializedChildren}
                </li>
              )
            }
          }
          case 'quote': {
            const node = _node as SerializedQuoteNode

            return <blockquote key={index}>{serializedChildren}</blockquote>
          }
          case 'link': {
            const node = _node as LinkNode

            if (node.url !== undefined) {
            //   const rel = fields.newTab ? 'noopener noreferrer' : undefined

              return (
                <a
                  href={escapeHTML(node.url)}
                  key={`${index}-${node.url}`}
                  {...(node?.target
                    ? {
                        rel: 'noopener noreferrer',
                        target: '_blank',
                      }
                    : {})}
                >
                  {serializedChildren}
                </a>
              )
            } else {
              return <span key={index}>...</span>
            }
          }
          case 'footnote': {
            const node = _node as any // FootnoteNode serialized data
            
            return (
              <sup key={index} className="footnote-ref">
                {node.number}
              </sup>
            )
          }

          default:
            return null
        }
      })}
    </Fragment>
  )
}

function renderSingleNode(node: SerializedLexicalNode, index: number): JSX.Element | null {
  if (node.type === 'text') {
    const textNode = node as SerializedTextNode
    let text = (
      <span key={`${index}-${Math.random}`} dangerouslySetInnerHTML={{ __html: escapeHTML(textNode.text) }} />
    )
    if (textNode.format & IS_BOLD) {
      text = <strong key={`${index}-${Math.random}`}>{text}</strong>
    }
    if (textNode.format & IS_ITALIC) {
      text = <em key={`${index}-${Math.random}`}>{text}</em>
    }
    if (textNode.format & IS_STRIKETHROUGH) {
      text = <span key={`${index}-${Math.random}`} style={{ textDecoration: 'line-through' }}>{text}</span>
    }
    if (textNode.format & IS_UNDERLINE) {
      text = <span key={`${index}-${Math.random}`} style={{ textDecoration: 'underline' }}>{text}</span>
    }
    if (textNode.format & IS_CODE) {
      text = <code key={`${index}-${Math.random}`}>{text}</code>
    }
    if (textNode.format & IS_SUBSCRIPT) {
      text = <sub key={`${index}-${Math.random}`}>{text}</sub>
    }
    if (textNode.format & IS_SUPERSCRIPT) {
      text = <sup key={`${index}-${Math.random}`}>{text}</sup>
    }
    return text
  }

  const serializedChildrenFn = (elementNode: SerializedElementNode): JSX.Element | null => {
    if (elementNode.children == null) {
      return null
    }
    return (
      <Fragment>
        {elementNode.children.map((child, childIndex) => renderSingleNode(child, childIndex))}
      </Fragment>
    )
  }

  const serializedChildren = 'children' in node ? serializedChildrenFn(node as SerializedElementNode) : null

  switch (node.type) {
    case 'paragraph': {
      return <p>{serializedChildren}</p>
    }
    case 'heading': {
      const headingNode = node as SerializedHeadingNode
      type Heading = Extract<keyof JSX.IntrinsicElements, 'h1' | 'h2' | 'h3' | 'h4' | 'h5'>
      const Tag = headingNode?.tag as Heading
      return <Tag>{serializedChildren}</Tag>
    }
    case 'list': {
      const listNode = node as SerializedListNode
      type List = Extract<keyof JSX.IntrinsicElements, 'ol' | 'ul'>
      const Tag = listNode?.tag as List
      return <Tag className={listNode?.listType}>{serializedChildren}</Tag>
    }
    case 'listitem': {
      const listItemNode = node as SerializedListItemNode
      return <li value={listItemNode?.value}>{serializedChildren}</li>
    }
    case 'quote': {
      return <blockquote>{serializedChildren}</blockquote>
    }
    case 'link': {
      const linkNode = node as LinkNode
      // if (linkNode.url) {
        return (
          <a
          key={`${index}-${linkNode.url}`}
            href={escapeHTML(linkNode.url)}
            {...(linkNode?.target ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
          >
            {serializedChildren}
          </a>
        )
      // } else {
      //   return <span key={'non-link'}></span>
      // }
    }
    case 'footnote': {
      const footnoteNode = node as any
      const footnoteContent = footnoteNode.json?.root?.children || null
      return (
        <div>
          <sup>{footnoteNode.number}</sup>
          {footnoteContent && (
            <div>
              {footnoteContent.map((child: SerializedLexicalNode, childIndex: number) => 
                renderSingleNode(child, childIndex)
              )}
            </div>
          )}
        </div>
      )
    }
    default:
      return <span>{serializedChildren}</span>
  }
}