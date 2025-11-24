import React from "react";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import RightPanel from "./components/RightPanel";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const MigrationPageMain = () => {
  const counter = React.useRef({ "SQL DB": 0, "PostgreSQL DB": 0, "Oracle DB": 0 });
  const [nodes, setNodes] = React.useState([
    {
      id: "start",
      position: { x: 200, y: 120 },
      data: { label: "SQL DB 1", kind: "SQL DB", status: "Connected" },
      type: "icon",
    },
  ]);
  const [edges, setEdges] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const addNode = (item) => {
    const { key: kind, desc: status } = item;
    counter.current[kind]++;
    const id = uid();
    const label = `${kind} ${counter.current[kind]}`;
    const x = 150 + Math.round(Math.random() * 600);
    const y = 80 + Math.round(Math.random() * 400);
    setNodes((nds) =>
      nds.concat({ id, position: { x, y }, data: { label, kind, status }, type: "icon" })
    );
  };
  return (
    <>
      {/* Sidebar (row 2, col 1) */}
      <div className="row-start-2 col-start-1 h-full">
        <Sidebar onAdd={addNode} />
      </div>

      {/* Canvas (row 2, col 2) */}
      <div className="row-start-2 col-start-2 h-full">
        <Canvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          onNodeClick={setSelected}
        />
      </div>

      {/* Right panel (row 2, col 3) */}
      {selected && (
        <div className="row-start-2 col-start-3 h-full">
          <RightPanel
            node={selected}
            onClose={() => setSelected(null)}
            onUpdateLabel={(val) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === selected.id ? { ...n, data: { ...n.data, label: val } } : n
                )
              );
              setSelected((s) => ({ ...s, data: { ...s.data, label: val } }));
            }}
            onDelete={() => {
              setNodes((nds) => nds.filter((n) => n.id !== selected.id));
              setSelected(null);
            }}
          />
        </div>
      )}
    </>
  );
};

export default MigrationPageMain;
