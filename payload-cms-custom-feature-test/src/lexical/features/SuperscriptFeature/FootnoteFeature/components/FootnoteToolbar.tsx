// import React, { JSX } from 'react'
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
// import { 
//   $getSelection,
//   $isRangeSelection,
//   FORMAT_TEXT_COMMAND,
//   LexicalEditor,
// } from 'lexical'
// import { Bold, Italic, Strikethrough, Link } from 'lucide-react'

// export function ToolbarPlugin(): JSX.Element {
//   const [editor] = useLexicalComposerContext()

//   const formatText = (format: 'bold' | 'italic' | 'strikethrough') => {
//     editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
//   }

//   return (
//     <div className="flex gap-1 p-2 border-b bg-gray-50">
//       <button
//       type='button'
//         // variant="ghost"
//         // size="sm"
//         onClick={() => formatText('bold')}
//         title="Bold"
//       >
//         <Bold size={16} />
//       </button>
      
//       <button
//       type='button'
//         // variant="ghost"
//         // size="sm"
//         onClick={() => formatText('italic')}
//         title="Italic"
//       >
//         <Italic size={16} />
//       </button>
      
//       <button
//       type='button'
//         // variant="ghost"
//         // size="sm"
//         onClick={() => formatText('strikethrough')}
//         title="Strikethrough"
//       >
//         <Strikethrough size={16} />
//       </button>
      
//       <button
//       type='button'
//         // variant="ghost"
//         // size="sm"
//         onClick={() => {
//           const url = prompt('Enter URL:')
//           if (url) {
//             editor.update(() => {
//               const selection = $getSelection()
//               if ($isRangeSelection(selection)) {
//                 // Add link functionality here
//               }
//             })
//           }
//         }}
//         title="Add Link"
//       >
//         <Link size={16} />
//       </button>
//     </div>
//   )
// }


/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {useCallback, useEffect, useRef, useState} from 'react';
import { Bold, Italic, Strikethrough, Link } from 'lucide-react'
import { TOGGLE_LINK_COMMAND } from '@payloadcms/richtext-lexical/client';
import { $toggleLink, LinkNode } from '@lexical/link'

function Divider() {
  return <div className="divider" />;
}

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsLink(selection.hasFormat('highlight'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  }, []);

  useEffect(() => {

    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, $updateToolbar]);

  useEffect(() => {
        if (!editor.hasNodes([LinkNode])) {
            throw new Error('LinkPlugin: LinkNode not registered on editor')
        }

        return editor.registerCommand(
            TOGGLE_LINK_COMMAND,
            (payload) => {
                // const { linkTitle, linkUrl, linkType } = payload
                // const {fields} = payload
                console.log('Payload: ================ ', payload)
                const { fields, text, selectedNodes } = payload!

                if (fields.url && fields.url !== '') {
                    editor.update(() => {
                        const selection = $getSelection()
                        if ($isRangeSelection(selection)) {
                            const { anchor, focus } = selection

                            //add text for the link
                            selection.insertText(text!)

                            //select inserted text
                            anchor.offset -= text!.length
                            focus.offset = anchor.offset + text!.length

                            //transform selection into a link
                            $toggleLink(fields.url!, { rel: fields.newTab ? 'noopener noreferrer' : undefined, target: fields.newTab ? '_blank' : undefined })
                        }
                    })
                }

                //clean up
                return true
            },
            COMMAND_PRIORITY_LOW
        )
    }, [editor])

  return (
    <div className="toolbar" ref={toolbarRef}>
      {/* <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo">
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo">
        <i className="format redo" />
      </button> 
      <Divider /> */ }
      <button
      type='button'
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
        aria-label="Format Bold">
        <Bold size={16} />
      </button>
      <button
      type='button'
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
        aria-label="Format Italics">
         <Italic size={16} />
      </button>
      <button
      type='button'
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
        aria-label="Format Strikethrough">
        <Strikethrough size={16} />
      </button>
      <button
      type='button'
        // onClick={() => {
        //   editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight');
        // }}
          onClick={() => {
          const url = prompt('Enter URL:')
          if (url) {
            editor.update(() => {
              console.log('url', url)
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                console.log('Selection:', selection)
                const selectedText = selection.getTextContent();
                const selectedNodes = selection.getNodes();
                 editor.focus()
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                  fields: { url: url, newTab: true, linkType: 'custom' },
                  text: selectedText,
                  selectedNodes,
                });
              }
            })
          }
        }}
        className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
        aria-label="Format Link">
        <Link size={16} />
      </button>
      <Divider />
     
    </div>
  );
}
