import React from 'react';
import { AlertTriangle, Clock, Database, Download } from 'lucide-react';
import { exportResultsAsJSON } from '../utils/api';
import DesktopResultsTable from './DesktopResultsTable';
import MobileResultsTable from './MobileResultsTable';

const ResultsTable = ({ results, error, expandedRows, onToggleExpansion }) => {
  const handleExport = () => {
    exportResultsAsJSON(results);
  };

  // Error display
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // No results
  if (!results || results.length === 0) {
    return null;
  }

  // Render source data for expanded rows (on desktop and mobile)
  const renderSourceData = (sources) => {
    return sources.map((source, idx) => (
      <div key={idx} className="py-2 border-t border-gray-100 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <Database size={14} className="text-gray-500" />
          <span className="font-medium text-gray-700">{source.source}</span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            source.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {source.status}
          </span>
        </div>
        
        {source.status === 'success' && source.data && (
          <div className="ml-6 text-gray-600">
            {Object.entries(source.data).map(([key, value]) => (
              key !== 'permalink' ? (
                <div key={key} className="flex gap-2">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-mono">{String(value)}</span>
                </div>
              ) : null
            ))}
          </div>
        )}
        
        {source.status === 'error' && (
          <div className="ml-6 text-red-600 text-xs">
            {source.error || 'Unknown error'}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Main Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Analysis Results ({results.length} IOCs)
            </h2>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 bg-white px-3 py-2 rounded-lg text-sm transition-colors min-w-[120px] justify-center"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DesktopResultsTable
          results={results}
          expandedRows={expandedRows}
          onToggleExpansion={onToggleExpansion}
          renderSourceData={renderSourceData}
        />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-4">
        {results.map((result, idx) => (
          <MobileResultsTable
            key={idx}
            result={result}
            expandedRows={expandedRows}
            onToggleExpansion={onToggleExpansion}
            renderSourceData={renderSourceData}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsTable;