import {
    $applyNodeReplacement,
    DecoratorNode,
    DOMConversionMap,
    DOMConversionOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
  } from 'lexical'
import { JSX } from 'react'
import type { SerializedEditorState } from 'lexical';

  
  export type SerializedFootnoteNode = Spread<
    {
      id: string
      number: number
      content: string
      json: SerializedEditorState | null
    },
    SerializedLexicalNode
  >
  
  export class FootnoteNode extends DecoratorNode<JSX.Element> {
    __id: string
    __number: number
    __content: string
    __json: SerializedEditorState | null
  
    static getType(): string {
      return 'footnote'
    }
  
    static clone(node: FootnoteNode): FootnoteNode {
      return new FootnoteNode(node.__id, node.__number, node.__content, node.__json, node.__key)
    }
  
    constructor(id: string, number: number, content: string = '', json: SerializedEditorState | null, key?: NodeKey) {
      super(key)
      this.__id = id
      this.__number = number
      this.__content = content
      this.__json = json
    }

    // Add a setter for your JSON content
  setJsonContent(json: SerializedEditorState | null): void {
    const writable = this.getWritable();
    writable.__json = json
  }

  getJsonContent(): SerializedEditorState | null {
    return this.__json;
  }
  
    createDOM(config: EditorConfig): HTMLElement {
      const span = document.createElement('span')
      span.setAttribute('data-footnote-id', this.__id)
      return span
    }
  
    updateDOM(): false {
      return false
    }
  
    getId(): string {
      return this.__id
    }
  
    getNumber(): number {
      return this.__number
    }
  
    getContent(): string {
      return this.__content
    }
  
    setContent(content: string): void {
      const writable = this.getWritable()
      writable.__content = content
    }
  
    setNumber(number: number): void {
      const writable = this.getWritable()
      writable.__number = number
    }
  
    static importJSON(serializedNode: SerializedFootnoteNode): FootnoteNode {
      const { id, number, content, json } = serializedNode
      return new FootnoteNode(id, number, content, json) // $createFootnoteNode(id, number, content, json)
    }
  
    exportJSON(): SerializedFootnoteNode {
      return {
        ...super.exportJSON(),
        id: this.__id,
        number: this.__number,
        content: this.__content,
        type: 'footnote',
        version: 1,
        json: this.__json,
      }
    }
  
    decorate(): JSX.Element {

      const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
      // Fire custom event with node data and JSON
      const customEvent = new CustomEvent('footnoteHover', {
        detail: {
          node: this,
          json: this.__json,
          id: this.__id,
          number: this.__number,
          content: this.__content
        }
      });
      window.dispatchEvent(customEvent);
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      // Fire custom event with node data and JSON
      const customEvent = new CustomEvent('footnoteClick', {
        detail: {
          node: this,
          json: this.__json,
          id: this.__id,
          number: this.__number,
          content: this.__content
        }
      });
      window.dispatchEvent(customEvent);
    }
      return (
        <sup
          style={{
            cursor: 'pointer',
            color: 'blue',
            textDecoration: 'underline',
          }}
          data-footnote-id={this.__id}
          // onMouseEnter={handleMouseEnter}
          // onFocus={handleMouseEnter}
          onMouseDown={handleMouseEnter}
          onClick={handleClick}
        >
          {this.__number}
        </sup>
      )
    }
  
    isInline(): boolean {
      return true
    }
  
    static importDOM(): DOMConversionMap | null {
      return {
        sup: (domNode: HTMLElement): import('lexical').DOMConversion<HTMLElement> | null => {
          const id = domNode.getAttribute('data-footnote-id')
          if (id) {
            return {
              conversion: (node: HTMLElement) => ({
                node: $createFootnoteNode(
                  id,
                  parseInt(node.textContent || '1'),
                  '',
                ),
              }),
              priority: 1,
            }
          }
          return null
        },
      }
    }
  }
  
  export function $createFootnoteNode(
    id: string,
    number: number,
    content: string = '',
    json?: SerializedEditorState | null
  ): FootnoteNode {
    return $applyNodeReplacement(new FootnoteNode(id, number, content, json ?? null))
  }
  
  export function $isFootnoteNode(
    node: LexicalNode | null | undefined
  ): node is FootnoteNode {
    return node instanceof FootnoteNode
  }
  
  export function createFootnoteNode() {
    return FootnoteNode
  }
  