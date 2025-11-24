import React from "react";

const ReportCard = ({ report, onViewDetails, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {report.connectionName} Assessment Report
          </h3>
          <p className="text-xs text-gray-500 mt-1">{report.databaseName}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {/* Status Badge */}
        {report.completed && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800">
              Completed
            </span>
          </div>
        )}

        {/* Assessment Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Assessment Score</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-orange-600">{report.assessmentScore}</span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Created On</span>
          <span className="text-xs text-gray-900 font-medium">{report.createdDate}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2">
        <button
          onClick={() => onViewDetails(report)}
          className="w-full text-sm text-orange-600 font-medium hover:text-orange-700 transition mb-2"
        >
          View Report
        </button>
        <button
          onClick={() => onDelete(report.id)}
          className="w-full text-sm text-red-600 font-medium hover:text-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
