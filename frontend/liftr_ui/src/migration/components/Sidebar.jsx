import { siPostgresql, siMongodb, siMysql } from "simple-icons/icons";

const brand = {
  "SQL DB": { icon: siMysql, color: `#${siMysql.hex}` },
  "PostgreSQL DB": { icon: siPostgresql, color: `#${siPostgresql.hex}` },
  "Mongo DB": { icon: siMongodb, color: `#${siMongodb.hex}` },
};

export default function Sidebar({ onAdd }) {
  const lib = [
    { key: "SQL DB", desc: "Connected" },
    { key: "PostgreSQL DB", desc: "Connection Pending" },
    { key: "Mongo DB", desc: "Connected" },
  ];

  return (
    <aside className="border-r border-gray-200 p-3 bg-white">
      <h2 className="text-xs uppercase text-gray-500 mb-3">Node Library</h2>
      <div className="grid grid-cols-2 gap-2">
        {lib.map((n) => {
          const meta = brand[n.key];
          return (
            <button
              key={n.key}
              onClick={() => onAdd(n)}
              className="aspect-square bg-white hover:bg-orange-50 border border-gray-200 rounded-lg flex items-center justify-center transition w-24 h-24"
              title={n.key}
            >
              <div className="w-12 h-12" style={{ color: meta.color }}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
                  <path d={meta.icon.path} fill="currentColor" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
