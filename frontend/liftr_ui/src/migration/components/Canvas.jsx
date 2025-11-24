import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import IconNode from "./IconNode";

const nodeTypes = { icon: IconNode };

export default function Canvas({ nodes, setNodes, edges, setEdges, onNodeClick }) {
  const onNodesChange = (changes) =>
    setNodes((nds) => applyNodeChanges(changes, nds));

  const onEdgesChange = (changes) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  return (
    <div className="bg-gray-100 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        onNodeClick={(_, n) => onNodeClick(n)}
        style={{ width: "100%", height: "100%" }}
      >
        <Background color="#fb923c" variant="dots" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}