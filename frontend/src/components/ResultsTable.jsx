import React, { useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import DOMPurify from 'dompurify';
import DesktopResultsTable from './DesktopResultsTable';
import MobileResultsTable from './MobileResultsTable';
import renderSourceData from '../utils/renderSource';

// Input validation functions
const validateResults = (results) => {
  return Array.isArray(results) && results.every(result => 
    result && 
    typeof result.ioc === 'string' && 
    typeof result.ioc_type === 'string' &&
    typeof result.risk_score === 'number'
  );
};

// Safe sanitization wrapper
const sanitizeContent = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(String(content));
};

const ResultsTable = ({ results, error, expandedRows, onToggleExpansion }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'

  // Error display with sanitization
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={16} />
          <span dangerouslySetInnerHTML={{
            __html: sanitizeContent(error)
          }} />
        </div>
      </div>
    );
  }

  // Validate results prop
  if (results && !validateResults(results)) {
    console.warn('ResultsTable: Invalid results data structure');
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={16} />
          <span>Invalid results data structure</span>
        </div>
      </div>
    );
  }

  // No results
  if (!results || results.length === 0) {
    return null;
  }

  // Validate other props
  if (!expandedRows || typeof expandedRows.has !== 'function') {
    console.error('ResultsTable: expandedRows must be a Set');
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="text-red-700">Invalid expandedRows prop</div>
      </div>
    );
  }

  if (typeof onToggleExpansion !== 'function') {
    console.error('ResultsTable: onToggleExpansion must be a function');
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="text-red-700">Invalid onToggleExpansion prop</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Main Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Analysis Results ({results.length} IOCs)
            </h2>
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden" style={{ width: '140px' }}>
            <button
              onClick={() => setViewMode('table')}
              className={`text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-slate-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={{ width: '70px', padding: '8px 4px' }}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`text-sm font-medium transition-colors ${
                viewMode === 'json' 
                  ? 'bg-slate-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={{ width: '70px', padding: '8px 4px' }}
            >
              JSON
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'table' ? (
        <>
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
        </>
      ) : (
        /* JSON View */
        <div className="p-4">
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap border">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;