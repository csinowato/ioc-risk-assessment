import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { defangIOC } from '../utils/defang';
import { getRiskColor, getRiskIcon } from '../utils/riskScoring';

// Input validation functions
const validateResult = (result) => {
  return result && 
         typeof result.ioc === 'string' && 
         typeof result.ioc_type === 'string' &&
         typeof result.risk_score === 'number' &&
         result.risk_score >= 0 && 
         result.risk_score <= 100;
};

// Character escaping function
const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Safe sanitization wrapper
const sanitizeContent = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(String(content));
};

const DesktopResultsTable = ({ results, expandedRows, onToggleExpansion, renderSourceData }) => {
  // Validate props
  if (!Array.isArray(results)) {
    console.warn('DesktopResultsTable: results prop must be an array');
    return <div className="text-red-500 p-4">Invalid results data</div>;
  }

  if (!expandedRows || typeof expandedRows.has !== 'function') {
    console.warn('DesktopResultsTable: expandedRows must be a Set');
    return <div className="text-red-500 p-4">Invalid expandedRows data</div>;
  }

  if (typeof onToggleExpansion !== 'function') {
    console.warn('DesktopResultsTable: onToggleExpansion must be a function');
    return <div className="text-red-500 p-4">Invalid onToggleExpansion prop</div>;
  }

  // Filter out invalid results
  const validResults = results.filter(validateResult);
  
  if (validResults.length !== results.length) {
    console.warn(`DesktopResultsTable: Filtered out ${results.length - validResults.length} invalid results`);
  }

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
          {validResults.map((result, idx) => (
            <React.Fragment key={idx}>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-mono text-gray-900">
                  {defangIOC(result.ioc, result.ioc_type)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 uppercase">
                  {escapeHtml(result.ioc_type)}
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getRiskIcon(result.risk_score)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(result.risk_score)}`}>
                      {Math.round(result.risk_score)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  <div dangerouslySetInnerHTML={{
                    __html: sanitizeContent(result.summary || 'No summary available')
                  }} />
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
                      {result.sources && Array.isArray(result.sources) && result.sources.length > 0 ? (
                        <div className="bg-white rounded border p-3">
                          <h4 className="font-medium text-gray-900 mb-2">Source Details:</h4>
                          {renderSourceData ? renderSourceData(result.sources) : (
                            <div className="text-sm text-gray-500">No renderSourceData function provided</div>
                          )}
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