import React from 'react';
import { AlertTriangle, Clock, ChevronDown, ChevronRight, Database, Download } from 'lucide-react';
import { defangIOC } from '../utils/defang';
import { getRiskColor, getRiskIcon } from '../utils/riskScoring';
import { exportResultsAsJSON } from '../utils/api';

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

  // Render source data for expanded rows
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
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IOC (Defanged)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Summary
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result, idx) => (
              <React.Fragment key={idx}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-mono text-gray-900">
                    {defangIOC(result.ioc, result.ioc_type)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 uppercase">
                    {result.ioc_type}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getRiskIcon(result.risk_score)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(result.risk_score)}`}>
                        {result.risk_score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {result.summary || 'No summary available'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <button
                      onClick={() => onToggleExpansion(result.ioc)}
                      className="flex items-center justify-center w-6 h-6 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                    >
                      {expandedRows.has(result.ioc) ? (
                        <ChevronDown size={16} strokeWidth={3} />
                      ) : (
                        <ChevronRight size={16} strokeWidth={3} />
                      )}
                    </button>
                  </td>
                </tr>
                
                {/* Expanded row content */}
                {expandedRows.has(result.ioc) && (
                  <tr>
                    <td colSpan="5" className="px-4 pb-4 bg-gray-50">
                      <div className="space-y-2">
                        {result.sources && result.sources.length > 0 ? (
                          <div className="bg-white rounded border p-3">
                            <h4 className="font-medium text-gray-900 mb-2">Source Details:</h4>
                            {renderSourceData(result.sources)}
                          </div>
                        ) : (
                          <div className="p-3 bg-white rounded border text-sm text-gray-500">
                            No source data available
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;