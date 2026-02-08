'use client'

import { useEffect, useState } from 'react'
import { Handle, type Node as FlowNodeType, type NodeProps, Position } from '@xyflow/react'
import type { FlowNodeData } from './types'

export type FlowNode = FlowNodeType<FlowNodeData, 'flow'>

export function FlowNode({ id, data, selected }: NodeProps<FlowNode>) {
  const [isEditing, setIsEditing] = useState(false)
  const [labelValue, setLabelValue] = useState(data.label)
  const [contentValue, setContentValue] = useState(data.content || '')

  useEffect(() => {
    setLabelValue(data.label)
  }, [data.label])

  useEffect(() => {
    setContentValue(data.content || '')
  }, [data.content])

  const handleSave = () => {
    setIsEditing(false)
    const nextLabel = labelValue.trim() || 'Untitled'
    const nextContent = contentValue.trim() || null
    if (nextLabel !== data.label || nextContent !== (data.content || null)) {
      data.onUpdate?.(id, {
        label: nextLabel,
        content: nextContent,
      })
    }
  }

  return (
    <div
      className={`relative min-w-[160px] rounded-md border bg-white px-3 py-2 text-xs shadow-sm ${
        selected ? 'ring-2 ring-sky-400' : ''
      }`}
      style={{ borderColor: data.color || undefined }}
      onDoubleClick={(event) => {
        event.stopPropagation()
        setIsEditing(true)
      }}
    >
      <Handle type="target" position={Position.Left} className="h-2 w-2" />
      <Handle type="source" position={Position.Right} className="h-2 w-2" />

      {isEditing ? (
        <div className="space-y-2">
          <input
            value={labelValue}
            onChange={(event) => setLabelValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSave()
              if (event.key === 'Escape') {
                setLabelValue(data.label)
                setContentValue(data.content || '')
                setIsEditing(false)
              }
            }}
            className="w-full rounded border px-2 py-1 text-xs"
            autoFocus
          />
          <textarea
            value={contentValue}
            onChange={(event) => setContentValue(event.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
            rows={3}
            placeholder="Add notes..."
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded bg-sky-600 px-2 py-1 text-white"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => {
                setLabelValue(data.label)
                setContentValue(data.content || '')
                setIsEditing(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1 text-center">
          <div className="text-sm font-semibold">{data.label}</div>
          {data.type ? (
            <div className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide">
              {data.type}
            </div>
          ) : null}
          {data.content ? (
            <div className="text-[11px] text-slate-500 line-clamp-3">{data.content}</div>
          ) : null}
        </div>
      )}

      <button
        type="button"
        className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-rose-500"
        onClick={(event) => {
          event.stopPropagation()
          data.onDelete?.(id)
        }}
      >
        Delete
      </button>
    </div>
  )
}
