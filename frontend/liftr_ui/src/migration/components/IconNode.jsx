import { Handle, Position } from "reactflow";
import { siPostgresql, siMongodb, siMysql } from "simple-icons/icons";

const brand = {
  "SQL DB": { icon: siMysql, color: `#${siMysql.hex}` },
  "PostgreSQL DB": { icon: siPostgresql, color: `#${siPostgresql.hex}` },
  "Mongo DB": { icon: siMongodb, color: `#${siMongodb.hex}` }, // using MongoDB art for Oracle slot
};

const statusBg = (s) => (s === "Connected" ? "bg-green-500" : s === "Connection Pending" ? "bg-amber-400" : "bg-red-500");

export default function IconNode({ data }) {
  const { kind = "SQL DB", status = "Connected" } = data || {};
  const meta = brand[kind] || brand["SQL DB"];

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-3 shadow-sm text-gray-900 min-w-[60px]">
      <div className="w-8 h-8 text-orange-500" style={{ color: meta.color }}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
          <path d={meta.icon.path} fill="currentColor" />
        </svg>
      </div>

      {/* status dot */}
      <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white ${statusBg(status)}`} />

      <Handle type="target" position={Position.Top} className="!w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" />
    </div>
  );
}

// Preview for RightPanel
export function Preview({ kind = "SQL DB" }) {
  const meta = brand[kind] || brand["SQL DB"];
  return (
    <div className="w-full h-full" style={{ color: meta.color }}>
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d={meta.icon.path} fill="currentColor" />
      </svg>
    </div>
  );
}

IconNode.Preview = Preview;
