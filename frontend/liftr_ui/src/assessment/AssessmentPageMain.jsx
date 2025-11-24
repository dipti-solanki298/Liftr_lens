import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Connections from "./components/Connections";
import Reports from "./components/Reports";

const AssessmentPageMain = () => {
  const [activeSection, setActiveSection] = useState("Connections");

  const renderContent = () => {
    switch (activeSection) {
      case "Connections":
        return <Connections />;
      case "Reports":
        return <Reports />;
      case "Need Help":
        return <div className="flex-1 flex items-center justify-center">Need Help Section</div>;
      default:
        return <Connections />;
    }
  };

  return (
    <div className="flex w-full h-full bg-white dark:bg-gray-950 transition-colors duration-200">
      <Sidebar onSectionChange={setActiveSection} />
      <div className="flex-1 h-full w-full overflow-hidden">{renderContent()}</div>
    </div>
  );
};

export default AssessmentPageMain;
