import React from 'react';
import { Shield, Download } from 'lucide-react';
import { exportResultsAsJSON } from '../utils/api';

const Header = ({ results }) => {
  const handleExport = () => {
    exportResultsAsJSON(results);
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          IOC Risk Assessment Tool
        </h1>
      </div>
      
      {results.length > 0 && (
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Export Results
        </button>
      )}
    </div>
  );
};

export default Header;