interface EdgeRecord {
  id: string
  source: string
  target: string
  label?: string | null
}

let edges: EdgeRecord[] = []

export async function GET() {
  return Response.json({ edges })
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<EdgeRecord>
  if (!body.source || !body.target) {
    return Response.json({ error: 'Missing source or target' }, { status: 400 })
  }
  const edge: EdgeRecord = {
    id: crypto.randomUUID(),
    source: body.source,
    target: body.target,
    label: body.label ?? null,
  }
  edges = [...edges, edge]
  return Response.json({ edge }, { status: 201 })
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<EdgeRecord> & { id?: string }
  if (!body.id) {
    return Response.json({ error: 'Missing id' }, { status: 400 })
  }
  let updated: EdgeRecord | null = null
  edges = edges.map((edge) => {
    if (edge.id !== body.id) return edge
    updated = {
      ...edge,
      source: body.source ?? edge.source,
      target: body.target ?? edge.target,
      label: body.label ?? edge.label,
    }
    return updated
  })

  if (!updated) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({ edge: updated })
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { id?: string }
  if (!body.id) {
    return Response.json({ error: 'Missing id' }, { status: 400 })
  }
  edges = edges.filter((edge) => edge.id !== body.id)
  return Response.json({ ok: true })
}
