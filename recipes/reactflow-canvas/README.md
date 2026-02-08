# ReactFlow Canvas Recipe

Generic ReactFlow canvas with editable nodes, drag + drop, auto-layout (dagre), and example CRUD API routes. This version is standalone and has no auth dependencies.

## Dependencies

- `@xyflow/react`
- `dagre`

## Setup

1. Install dependencies:

```bash
bun add @xyflow/react dagre
```

2. Copy the recipe files into your app (or import directly if your tooling supports it):

```
recipes/reactflow-canvas/src/FlowCanvas.tsx
recipes/reactflow-canvas/src/FlowNode.tsx
recipes/reactflow-canvas/src/layout.ts
recipes/reactflow-canvas/src/types.ts
```

3. Add the example API routes or wire up your own endpoints:

```
recipes/reactflow-canvas/example/api/nodes/route.ts
recipes/reactflow-canvas/example/api/edges/route.ts
```

4. Render the canvas:

```tsx
import { FlowCanvas } from '@/recipes/reactflow-canvas/src/FlowCanvas'

export default function Page() {
  return (
    <div className="p-6">
      <FlowCanvas />
    </div>
  )
}
```

## Endpoints

`FlowCanvas` expects two JSON endpoints:

- `GET /api/nodes` → `{ nodes: FlowNodeRecord[] }`
- `GET /api/edges` → `{ edges: FlowEdgeRecord[] }`
- `POST /api/nodes` → `{ node: FlowNodeRecord }`
- `PUT /api/nodes` → `{ node: FlowNodeRecord }`
- `DELETE /api/nodes` → `{ ok: true }`
- `POST /api/edges` → `{ edge: FlowEdgeRecord }`
- `PUT /api/edges` → `{ edge: FlowEdgeRecord }`
- `DELETE /api/edges` → `{ ok: true }`

You can override the endpoints:

```tsx
<FlowCanvas nodesEndpoint="/api/graph/nodes" edgesEndpoint="/api/graph/edges" />
```

## Notes

- Nodes are editable on double-click.
- Dragging a node saves its position via `PUT /api/nodes`.
- Delete selected nodes/edges with Backspace/Delete.
- Auto-layout uses dagre (left-to-right by default).

