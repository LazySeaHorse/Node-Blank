import { Handle, Position } from '@xyflow/react';

/**
 * The one connection point every node has, as large as the node and invisible. React Flow only draws a link
 * between nodes that have a handle, and with one this size a link can start or end anywhere on a node. It takes
 * the pointer only while the canvas allows connecting (linking mode), so it is inert the rest of the time.
 * With `ConnectionMode.Loose` one handle serves as both end of a link. `connectable` is the node's own flag
 * (React Flow does not apply it to handles by itself).
 */
export function LinkHandle({ connectable }: { connectable: boolean }) {
  return (
    <Handle type="source" position={Position.Right} className="link-handle" isConnectable={connectable} />
  );
}
