interface NodeRecord {
  id: string
  label: string
  content?: string | null
  type?: string | null
  color?: string | null
  position_x: number
  position_y: number
}

let nodes: NodeRecord[] = [
  {
    id: 'node-1',
    label: 'Start here',
    content: 'Double-click a node to edit.',
    type: 'idea',
    color: '#38bdf8',
    position_x: 0,
    position_y: 0,
  },
]

export async function GET() {
  return Response.json({ nodes })
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<NodeRecord>
  const node: NodeRecord = {
    id: crypto.randomUUID(),
    label: body.label?.trim() || 'New node',
    content: body.content ?? null,
    type: body.type ?? null,
    color: body.color ?? null,
    position_x: body.position_x ?? 0,
    position_y: body.position_y ?? 0,
  }
  nodes = [...nodes, node]
  return Response.json({ node }, { status: 201 })
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<NodeRecord> & { id?: string }
  if (!body.id) {
    return Response.json({ error: 'Missing id' }, { status: 400 })
  }
  let updated: NodeRecord | null = null
  nodes = nodes.map((node) => {
    if (node.id !== body.id) return node
    updated = {
      ...node,
      label: body.label ?? node.label,
      content: body.content ?? node.content,
      type: body.type ?? node.type,
      color: body.color ?? node.color,
      position_x: body.position_x ?? node.position_x,
      position_y: body.position_y ?? node.position_y,
    }
    return updated
  })

  if (!updated) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({ node: updated })
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { id?: string }
  if (!body.id) {
    return Response.json({ error: 'Missing id' }, { status: 400 })
  }
  nodes = nodes.filter((node) => node.id !== body.id)
  return Response.json({ ok: true })
}
