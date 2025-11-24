import React from "react";
import { FiInfo, FiAlertCircle, FiX } from "react-icons/fi";

const StatusBanner = ({ connectedCount, totalCount, onClose }) => {
  const isHealthy = connectedCount > 0;

  return (
    <div
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200 ${
        isHealthy
          ? "bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-b border-blue-200 dark:border-blue-700"
          : "bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-100 border-b border-amber-200 dark:border-amber-700"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        {isHealthy ? (
          <FiInfo className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
        ) : (
          <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-300" />
        )}
        <span>
          {connectedCount} of {totalCount} database connection{totalCount !== 1 ? "s" : ""}{" "}
          {isHealthy ? "online and healthy" : "offline or unavailable"}
        </span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded transition flex-shrink-0"
          aria-label="Close banner"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default StatusBanner;
