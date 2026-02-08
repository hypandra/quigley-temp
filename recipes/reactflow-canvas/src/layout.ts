import dagre from 'dagre'
import type { Edge, Node } from '@xyflow/react'

export interface DagreLayoutOptions {
  direction?: 'LR' | 'TB'
  nodeWidth?: number
  nodeHeight?: number
  rankSep?: number
  nodeSep?: number
}

const DEFAULTS: Required<DagreLayoutOptions> = {
  direction: 'LR',
  nodeWidth: 180,
  nodeHeight: 90,
  rankSep: 80,
  nodeSep: 40,
}

export function layoutWithDagre(
  nodes: Node[],
  edges: Edge[],
  options: DagreLayoutOptions = {}
): Node[] {
  const settings = { ...DEFAULTS, ...options }
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: settings.direction,
    ranksep: settings.rankSep,
    nodesep: settings.nodeSep,
  })

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: settings.nodeWidth, height: settings.nodeHeight })
  })
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)

  return nodes.map((node) => {
    const { x, y } = graph.node(node.id)
    return {
      ...node,
      position: {
        x: x - settings.nodeWidth / 2,
        y: y - settings.nodeHeight / 2,
      },
    }
  })
}
