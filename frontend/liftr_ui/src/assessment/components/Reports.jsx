import React, { useState } from "react";
import { FiPlus, FiFileText } from "react-icons/fi";
import ReportCard from "./ReportCard";
import ReportDetails from "./ReportDetails";
import { reportService } from "../service";
import sampleMetadata from "../../data/sqlserver_metadata.json";

const Reports = () => {
  const [reports, setReports] = useState([
    {
      id: "1",
      connectionName: "Production Database",
      databaseName: "production_db",
      assessmentScore: 85,
      createdDate: "2024-11-15",
      completed: true,
    },
  ]);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const handleAddNewReport = () => {
    setShowNewReportForm(true);
  };

  const handleCancelNewReport = () => {
    setShowNewReportForm(false);
  };

  const handleViewDetails = async (report) => {
    console.log("View report details:", report);
    setSelectedReport(report);
    setIsLoadingMetadata(true);

    try {
      const response = await reportService.fetchSqlServerMetadata();

      if (response.status === "success") {
        console.log("SQL Server Metadata:", response.metadata);
        setMetadata(response.metadata);
      } else {
        console.error("Failed to fetch metadata:", response.message);
        // Fallback to sample data for testing
        console.log("Loading sample metadata for testing...");
        setMetadata(sampleMetadata);
      }
    } catch (error) {
      console.error("Error fetching SQL Server metadata:", error);
      // Fallback to sample data for testing
      console.log("Loading sample metadata for testing...");
      setMetadata(sampleMetadata);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
    setMetadata(null);
  };

  const handleDeleteReport = (reportId) => {
    setReports((prev) => prev.filter((rep) => rep.id !== reportId));
  };

  // Show loading state while fetching metadata
  if (isLoadingMetadata) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading report details...</p>
        </div>
      </div>
    );
  }

  // Show report details view
  if (selectedReport) {
    return (
      <ReportDetails
        report={selectedReport}
        metadata={metadata}
        onClose={handleCloseDetails}
      />
    );
  }

  if (showNewReportForm) {
    return (
      <div className="w-full h-full bg-white overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <button
            onClick={handleCancelNewReport}
            className="p-1 hover:bg-gray-100 rounded transition"
            aria-label="Go back"
          >
            <FiPlus className="w-5 h-5 text-gray-600 rotate-45" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Create New Report</h1>
        </div>

        {/* Placeholder Form Content */}
        <div className="px-6 py-6 w-full">
          <div className="text-center py-12">
            <p className="text-gray-600">Report creation form coming soon...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-auto">
      {reports.length === 0 ? (
        // Empty state
        <div className="h-full flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiFileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No Reports</h2>
            <p className="text-sm text-gray-600 mb-4">
              You haven't created any reports yet. Generate one to get started.
            </p>
            <button
              onClick={handleAddNewReport}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-4 text-sm rounded-lg transition"
            >
              Create Report
            </button>
          </div>
        </div>
      ) : (
        // Reports grid
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
            <button
              onClick={handleAddNewReport}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-4 text-sm rounded-lg transition"
            >
              <FiPlus className="w-4 h-4" />
              Create Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteReport}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
