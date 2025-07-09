import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
  TextNode,
} from 'lexical'

export type SerializedMarkNode = Spread<
  {
    type: 'mark'
    version: 1
  },
  SerializedTextNode
>

export class MarkNode extends TextNode {
  static getType(): string {
    return 'mark'
  }

  static clone(node: MarkNode): MarkNode {
    return new MarkNode(node.__text, node.__key)
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key)
  }

  createDOM(): HTMLElement {
    const element = document.createElement('mark')
    element.textContent = this.__text
    element.style.backgroundColor = '#b1fed5'
    return element
  }

  static importDOM(): DOMConversionMap | null {
    return {
      mark: () => ({
        conversion: convertMarkElement,
        priority: 1,
      }),
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('mark')
    element.textContent = this.getTextContent()
    return { element }
  }

  static importJSON(serializedNode: SerializedMarkNode): MarkNode {
    const node = $createMarkNode(serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON(): SerializedMarkNode {
    return {
      ...super.exportJSON(),
      type: 'mark',
      version: 1,
    }
  }
}

function convertMarkElement(): DOMConversionOutput {
  return {
    node: $createMarkNode(''),
  }
}

export function $createMarkNode(text = ''): MarkNode {
  return $applyNodeReplacement(new MarkNode(text))
}

export function $isMarkNode(node: LexicalNode | null | undefined): node is MarkNode {
  return node instanceof MarkNode
}
