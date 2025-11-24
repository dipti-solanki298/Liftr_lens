import React, { useState } from "react";
import { FiMoreVertical, FiCheck, FiAlertCircle } from "react-icons/fi";

const ConnectionCard = ({ connection, onViewDetails, onTestConnection, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusColor =
    connection.status === "Connected"
      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
  const StatusIcon = connection.status === "Connected" ? FiCheck : FiAlertCircle;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition overflow-hidden">
      {/* Header with menu */}
      <div className="px-4 py-3 flex items-start justify-between border-b border-gray-100 dark:border-gray-700">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">
            {connection.connectionName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{connection.dbTypeLabel}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            aria-label="More options"
          >
            <FiMoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onTestConnection(connection);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition border-b border-gray-100 dark:border-gray-600"
              >
                Test Connection
              </button>
              <button
                onClick={() => {
                  onDelete(connection.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition"
              >
                Delete Connection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-2">
        {/* Status */}
        <div className="flex items-center gap-2">
          <StatusIcon className="w-3 h-3" />
          <span className={`text-xs font-medium px-2 py-1 rounded ${statusColor}`}>
            {connection.status || "Disconnected"}
          </span>
        </div>

        {/* Connection details */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Server:</span>
            <span className="text-gray-900 font-medium truncate">{connection.server}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Auth Type:</span>
            <span className="text-gray-900 font-medium capitalize">
              {connection.authType === "windows" ? "Windows" : "SQL"}
            </span>
          </div>
          {connection.username && (
            <div className="flex justify-between">
              <span className="text-gray-600">User:</span>
              <span className="text-gray-900 font-medium truncate">{connection.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
        <button
          onClick={() => onViewDetails(connection)}
          className="w-full text-sm text-orange-600 font-medium hover:text-orange-700 transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ConnectionCard;
