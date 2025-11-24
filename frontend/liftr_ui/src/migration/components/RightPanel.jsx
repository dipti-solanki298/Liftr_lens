import IconNode from "./IconNode";

const statusColor = (s) =>
  s === "Connected" ? "bg-green-500" : s === "Connection Pending" ? "bg-amber-400" : "bg-red-500";

export default function RightPanel({ node, onClose, onUpdateLabel, onDelete }) {
  const status = node.data?.status ?? "";
  return (
    <aside className="w-80 border-l border-gray-200 bg-white flex flex-col">
        <header className="p-3 border-b border-gray-200 flex justify-between items-center">
            <strong>Node Details</strong>
            <button onClick={onClose} className="text-sm bg-gray-100 px-2 py-1 rounded">Close</button>
        </header>

        <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
                <IconNode.Preview kind={node.data?.kind} />
                <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white ${statusColor(status)}`} />
            </div>

            <div>
                <div className="text-xs text-gray-400">Type</div>
                <div className="font-medium flex items-center gap-2">
                {node.data?.kind}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${status === 'Connected' ? 'bg-green-50 text-green-600' : status === 'Connection Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {status}
                </span>
                </div>
            </div>
            </div>

            <div>
            <div className="text-xs text-gray-400">Label</div>
            <input
                value={node.data?.label ?? ""}
                onChange={(e) => onUpdateLabel(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded p-2 text-gray-900"
            />
            </div>

            <button onClick={onDelete} className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-sm w-full text-white">
            Delete Node
            </button>
        </div>
    </aside>
  );
}