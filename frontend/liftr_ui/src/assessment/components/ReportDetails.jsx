import React, { useState } from "react";
import { FiX, FiDatabase, FiTable, FiColumns, FiChevronDown, FiChevronRight, FiSearch } from "react-icons/fi";

const ReportDetails = ({ report, metadata, onClose }) => {
    const [expandedDatabases, setExpandedDatabases] = useState({});
    const [expandedTables, setExpandedTables] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    if (!metadata) {
        return (
            <div className="w-full h-full bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No metadata available</p>
                </div>
            </div>
        );
    }

    const toggleDatabase = (dbName) => {
        setExpandedDatabases((prev) => ({
            ...prev,
            [dbName]: !prev[dbName],
        }));
    };

    const toggleTable = (tableKey) => {
        setExpandedTables((prev) => ({
            ...prev,
            [tableKey]: !prev[tableKey],
        }));
    };

    // Filter tables based on search term
    const filterTables = (tables) => {
        if (!searchTerm) return tables;
        return tables.filter((table) =>
            table.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    // Get database statistics
    const getDatabaseStats = (dbData) => {
        return {
            tables: dbData.tables?.length || 0,
            views: dbData.views?.length || 0,
            procedures: dbData.procedures?.length || 0,
            functions: dbData.functions?.length || 0,
            triggers: dbData.triggers?.length || 0,
        };
    };

    return (
        <div className="w-full h-full bg-gray-50 overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Database Metadata</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {report?.connectionName || "SQL Server Metadata Explorer"}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Close"
                >
                    <FiX className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                    </div>
                </div>

                {/* Report Info Card (if report exists) */}
                {report && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Report Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Connection Name</p>
                                <p className="text-base font-medium text-gray-900">
                                    {report.connectionName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Database Name</p>
                                <p className="text-base font-medium text-gray-900">
                                    {report.databaseName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Assessment Score</p>
                                <p className="text-base font-medium text-gray-900">
                                    {report.assessmentScore}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created Date</p>
                                <p className="text-base font-medium text-gray-900">
                                    {report.createdDate}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Databases */}
                <div className="space-y-4">
                    {Object.entries(metadata).map(([dbName, dbData]) => {
                        const stats = getDatabaseStats(dbData);
                        const isExpanded = expandedDatabases[dbName];
                        const filteredTables = filterTables(dbData.tables || []);

                        return (
                            <div
                                key={dbName}
                                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                            >
                                {/* Database Header */}
                                <div
                                    className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-orange-100 transition"
                                    onClick={() => toggleDatabase(dbName)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <FiChevronDown className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <FiChevronRight className="w-5 h-5 text-gray-600" />
                                            )}
                                            <FiDatabase className="w-5 h-5 text-orange-500" />
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {dbName}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                                {stats.tables} Tables
                                            </span>
                                            {stats.views > 0 && (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                                                    {stats.views} Views
                                                </span>
                                            )}
                                            {stats.procedures > 0 && (
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                                                    {stats.procedures} Procedures
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Database Content */}
                                {isExpanded && (
                                    <div className="p-6">
                                        {/* Tables Section */}
                                        {filteredTables.length > 0 ? (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                                    Tables ({filteredTables.length})
                                                </h4>
                                                {filteredTables.map((table, tableIndex) => {
                                                    const tableKey = `${dbName}-${table.schema}-${table.name}`;
                                                    const isTableExpanded = expandedTables[tableKey];

                                                    return (
                                                        <div
                                                            key={tableIndex}
                                                            className="border border-gray-200 rounded-lg overflow-hidden"
                                                        >
                                                            {/* Table Header */}
                                                            <div
                                                                className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                                                                onClick={() => toggleTable(tableKey)}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        {isTableExpanded ? (
                                                                            <FiChevronDown className="w-4 h-4 text-gray-600" />
                                                                        ) : (
                                                                            <FiChevronRight className="w-4 h-4 text-gray-600" />
                                                                        )}
                                                                        <FiTable className="w-4 h-4 text-gray-600" />
                                                                        <span className="font-medium text-gray-900">
                                                                            {table.schema}.{table.name}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                                                        <span className="flex items-center gap-1">
                                                                            <FiColumns className="w-3 h-3" />
                                                                            {table.columns?.length || 0} columns
                                                                        </span>
                                                                        {table.created_at && (
                                                                            <span className="text-gray-500">
                                                                                Created: {new Date(table.created_at).toLocaleDateString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Table Columns */}
                                                            {isTableExpanded && table.columns && table.columns.length > 0 && (
                                                                <div className="bg-white">
                                                                    <div className="overflow-x-auto">
                                                                        <table className="min-w-full divide-y divide-gray-200">
                                                                            <thead className="bg-gray-50">
                                                                                <tr>
                                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                                                        Column Name
                                                                                    </th>
                                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                                                        Data Type
                                                                                    </th>
                                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                                                        Max Length
                                                                                    </th>
                                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                                                        Nullable
                                                                                    </th>
                                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                                                        Default
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                                {table.columns.map((column, colIndex) => (
                                                                                    <tr
                                                                                        key={colIndex}
                                                                                        className="hover:bg-gray-50 transition"
                                                                                    >
                                                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                                            {column.column_name}
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono text-xs">
                                                                                                {column.data_type}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                                                            {column.max_length !== null ? column.max_length : "-"}
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-sm">
                                                                                            <span
                                                                                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${column.nullable === "YES"
                                                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                                                        : "bg-green-100 text-green-800"
                                                                                                    }`}
                                                                                            >
                                                                                                {column.nullable === "YES" ? "Nullable" : "Not Null"}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">
                                                                                            {column.default || "-"}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-600">
                                                    {searchTerm ? "No tables match your search" : "No tables found"}
                                                </p>
                                            </div>
                                        )}

                                        {/* Views, Procedures, Functions, Triggers sections */}
                                        {dbData.views && dbData.views.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                                    Views ({dbData.views.length})
                                                </h4>
                                                <div className="text-sm text-gray-600">
                                                    {dbData.views.length} view(s) available
                                                </div>
                                            </div>
                                        )}

                                        {dbData.procedures && dbData.procedures.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                                    Stored Procedures ({dbData.procedures.length})
                                                </h4>
                                                <div className="text-sm text-gray-600">
                                                    {dbData.procedures.length} procedure(s) available
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {Object.keys(metadata).length === 0 && (
                    <div className="text-center py-12">
                        <FiDatabase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No database metadata available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportDetails;
