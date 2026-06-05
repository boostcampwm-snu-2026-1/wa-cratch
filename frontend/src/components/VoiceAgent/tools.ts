import type { RefObject } from 'react'
import * as Blockly from 'blockly'

interface ToolDeclaration {
  type: 'function'
  name: string
  description: string
  parameters: Record<string, unknown>
}

export const TOOL_DECLARATIONS: ToolDeclaration[] = [
  {
    type: 'function',
    name: 'get_project_context',
    description: '현재 열린 프로젝트의 제목, 블록 수, 블록 구조 JSON을 반환합니다.',
    parameters: { type: 'object', properties: {} },
  },
]

export function handleToolCall(
  name: string,
  _args: string,
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>,
  projectTitle: string
): Record<string, unknown> {
  if (name === 'get_project_context') {
    const workspace = workspaceRef.current
    if (!workspace) return { title: projectTitle, blockCount: 0, blocks_json: {} }
    return {
      title: projectTitle,
      blockCount: workspace.getAllBlocks(false).length,
      blocks_json: Blockly.serialization.workspaces.save(workspace),
    }
  }
  return { error: `Unknown tool: ${name}` }
}
