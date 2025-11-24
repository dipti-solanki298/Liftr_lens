import React from "react";
import Topbar from "./components/Topbar";
import MigrationPageMain from "./migration/MigrationPageMain";
import AssessmentPageMain from "./assessment/AssessmentPageMain";
import { ThemeProvider } from "./context/ThemeContext";
import { ConnectionProvider } from "./context/ConnectionContext";

function AppContent() {
  return (
    <div className="grid grid-rows-[56px_1fr] grid-cols-1 h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50 transition-colors duration-200 relative">
      <div className="col-span-1">
        <Topbar />
      </div>
      <AssessmentPageMain />
      {/* Copyright Footer */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Indium Tech. All rights reserved.
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ConnectionProvider>
        <AppContent />
      </ConnectionProvider>
    </ThemeProvider>
  );
}
