import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { defangIOC } from '../utils/defang';
import { getRiskColor, getRiskIcon } from '../utils/riskScoring';

const DesktopResultsTable = ({ results, expandedRows, onToggleExpansion, renderSourceData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
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
  );
};

export default DesktopResultsTable;