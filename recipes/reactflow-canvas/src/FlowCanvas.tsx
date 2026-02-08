'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { FlowNode } from './FlowNode'
import { layoutWithDagre } from './layout'
import type { FlowEdgeRecord, FlowNodeRecord } from './types'

export interface FlowCanvasProps {
  nodesEndpoint?: string
  edgesEndpoint?: string
  className?: string
}

const nodeTypes = {
  flowNode: FlowNode,
}

function FlowCanvasInner({
  nodesEndpoint = '/api/nodes',
  edgesEndpoint = '/api/edges',
  className,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null)
  const { fitView, screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingLayout, setIsSavingLayout] = useState(false)

  const loadGraph = useCallback(async () => {
    setIsLoading(true)
    try {
      const [nodesResponse, edgesResponse] = await Promise.all([
        fetch(nodesEndpoint),
        fetch(edgesEndpoint),
      ])
      if (!nodesResponse.ok || !edgesResponse.ok) {
        throw new Error('Failed to load graph data')
      }
      const nodesData = await nodesResponse.json()
      const edgesData = await edgesResponse.json()

      setNodes(
        (nodesData.nodes as FlowNodeRecord[]).map((node) => ({
          id: node.id,
          type: 'flowNode',
          position: { x: node.position_x, y: node.position_y },
          data: {
            label: node.label,
            type: node.type,
            content: node.content,
            color: node.color,
          },
        }))
      )

      setEdges(
        (edgesData.edges as FlowEdgeRecord[]).map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label || undefined,
        }))
      )
    } finally {
      setIsLoading(false)
    }
  }, [edgesEndpoint, nodesEndpoint, setEdges, setNodes])

  useEffect(() => {
    loadGraph()
  }, [loadGraph])

  const handleUpdateNode = useCallback(
    async (nodeId: string, updates: Partial<FlowNodeRecord>) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                position:
                  updates.position_x !== undefined || updates.position_y !== undefined
                    ? {
                        x: updates.position_x ?? node.position.x,
                        y: updates.position_y ?? node.position.y,
                      }
                    : node.position,
                data: {
                  ...node.data,
                  ...(() => {
                    const { position_x, position_y, ...rest } = updates
                    return rest
                  })(),
                },
              }
            : node
        )
      )

      await fetch(nodesEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nodeId, ...updates }),
      })
    },
    [nodesEndpoint, setNodes]
  )

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== nodeId))
      setEdges((prev) => prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))

      await fetch(nodesEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nodeId }),
      })
    },
    [nodesEndpoint, setEdges, setNodes]
  )

  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onUpdate: handleUpdateNode,
          onDelete: handleDeleteNode,
        },
      }))
    )
  }, [handleDeleteNode, handleUpdateNode, setNodes])

  const createNodeAt = useCallback(
    async (position: { x: number; y: number }) => {
      const response = await fetch(nodesEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: 'New node',
          position_x: position.x,
          position_y: position.y,
        }),
      })

      if (!response.ok) return null

      const data = await response.json()
      const node = data.node as FlowNodeRecord
      const flowNode: Node = {
        id: node.id,
        type: 'flowNode',
        position: { x: node.position_x, y: node.position_y },
        data: {
          label: node.label,
          type: node.type,
          content: node.content,
          color: node.color,
          onUpdate: handleUpdateNode,
          onDelete: handleDeleteNode,
        },
      }
      setNodes((prev) => [...prev, flowNode])
      return flowNode
    },
    [handleDeleteNode, handleUpdateNode, nodesEndpoint, setNodes]
  )

  const handleConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return
      setConnectingNodeId(null)

      const response = await fetch(edgesEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: connection.source,
          target: connection.target,
        }),
      })

      if (!response.ok) return

      const data = await response.json()
      setEdges((prev) =>
        addEdge(
          {
            id: data.edge.id,
            source: data.edge.source,
            target: data.edge.target,
            label: data.edge.label || undefined,
          },
          prev
        )
      )
    },
    [edgesEndpoint, setEdges]
  )

  const handleConnectEnd = useCallback(
    async (event: MouseEvent | TouchEvent) => {
      if (!connectingNodeId || !reactFlowWrapper.current) return
      const target = event.target as HTMLElement
      if (!target.classList.contains('react-flow__pane')) {
        setConnectingNodeId(null)
        return
      }

      const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
      const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
      const position = screenToFlowPosition({ x: clientX, y: clientY })
      const newNode = await createNodeAt(position)
      if (newNode) {
        await handleConnect({
          source: connectingNodeId,
          target: newNode.id,
          sourceHandle: null,
          targetHandle: null,
        })
      }
      setConnectingNodeId(null)
    },
    [connectingNodeId, createNodeAt, handleConnect, screenToFlowPosition]
  )

  const handleNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      await handleUpdateNode(node.id, {
        position_x: node.position.x,
        position_y: node.position.y,
      })
    },
    [handleUpdateNode]
  )

  const handleDeleteSelection = useCallback(async () => {
    const selectedNodes = nodes.filter((node) => node.selected)
    const selectedEdges = edges.filter((edge) => edge.selected)

    await Promise.all(
      selectedNodes.map((node) =>
        fetch(nodesEndpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: node.id }),
        })
      )
    )
    await Promise.all(
      selectedEdges.map((edge) =>
        fetch(edgesEndpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: edge.id }),
        })
      )
    )

    setNodes((prev) => prev.filter((node) => !node.selected))
    setEdges((prev) => prev.filter((edge) => !edge.selected))
  }, [edges, edgesEndpoint, nodes, nodesEndpoint, setEdges, setNodes])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
      if (event.key === 'Delete' || event.key === 'Backspace') {
        handleDeleteSelection()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDeleteSelection])

  const handleAutoLayout = useCallback(async () => {
    if (nodes.length === 0) return
    setIsSavingLayout(true)
    const nextNodes = layoutWithDagre(nodes, edges)
    setNodes(nextNodes)
    await Promise.all(
      nextNodes.map((node) =>
        fetch(nodesEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: node.id,
            position_x: node.position.x,
            position_y: node.position.y,
          }),
        })
      )
    )
    setIsSavingLayout(false)
  }, [edges, nodes, nodesEndpoint, setNodes])

  const handleAddNode = useCallback(async () => {
    if (!reactFlowWrapper.current) return
    const rect = reactFlowWrapper.current.getBoundingClientRect()
    const position = screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    await createNodeAt(position)
  }, [createNodeAt, screenToFlowPosition])

  const minimapNodeColor = useCallback((node: Node): string => {
    if (node.data?.color && typeof node.data.color === 'string') return node.data.color
    return '#9ca3af'
  }, [])

  const toolbar = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs">
        <button
          type="button"
          className="rounded bg-sky-600 px-2 py-1 text-white"
          onClick={handleAddNode}
        >
          Add node
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1"
          onClick={handleAutoLayout}
        >
          Auto-layout
        </button>
        <button type="button" className="rounded border px-2 py-1" onClick={() => fitView({ padding: 0.2 })}>
          Fit view
        </button>
        {isSavingLayout ? <span className="text-slate-500">Saving layout...</span> : null}
      </div>
    ),
    [fitView, handleAddNode, handleAutoLayout, isSavingLayout]
  )

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading canvas...</div>
  }

  return (
    <div className={className || 'flex h-[600px] flex-col gap-3'}>
      {toolbar}
      <div className="flex-1 rounded-md border bg-white" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onConnectStart={(_, params) => setConnectingNodeId(params.nodeId)}
          onConnectEnd={handleConnectEnd}
          onNodeDragStop={handleNodeDragStop}
          onDoubleClick={(event) => {
            const target = event.target as HTMLElement
            if (!target.classList.contains('react-flow__pane')) return
            const position = screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            })
            createNodeAt(position)
          }}
          fitView
        >
          <MiniMap nodeColor={minimapNodeColor} />
          <Controls />
          <Background gap={24} size={1} />
        </ReactFlow>
      </div>
    </div>
  )
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
