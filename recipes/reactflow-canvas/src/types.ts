export interface FlowNodeRecord {
  id: string
  label: string
  content?: string | null
  type?: string | null
  color?: string | null
  position_x: number
  position_y: number
}

export interface FlowEdgeRecord {
  id: string
  source: string
  target: string
  label?: string | null
}

export interface FlowNodeData extends Record<string, unknown> {
  label: string
  content?: string | null
  type?: string | null
  color?: string | null
  onUpdate?: (id: string, updates: Partial<FlowNodeRecord>) => void
  onDelete?: (id: string) => void
}
