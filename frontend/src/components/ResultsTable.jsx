import React from 'react';
import { AlertTriangle, Clock, Database, Download } from 'lucide-react';
import DOMPurify from 'dompurify';
import { exportResultsAsJSON } from '../utils/api';
import DesktopResultsTable from './DesktopResultsTable';
import MobileResultsTable from './MobileResultsTable';

// Input validation functions
const validateResults = (results) => {
  return Array.isArray(results) && results.every(result => 
    result && 
    typeof result.ioc === 'string' && 
    typeof result.ioc_type === 'string' &&
    typeof result.risk_score === 'number'
  );
};

const validateSource = (source) => {
  return source &&
         typeof source.source === 'string' &&
         typeof source.status === 'string' &&
         ['success', 'error'].includes(source.status);
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

const ResultsTable = ({ results, error, expandedRows, onToggleExpansion }) => {
  const handleExport = () => {
    // Validate results before export
    if (!validateResults(results)) {
      console.error('Cannot export invalid results data');
      return;
    }
    exportResultsAsJSON(results);
  };

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

  // Render source data for expanded rows (on desktop and mobile) - with security
  const renderSourceData = (sources) => {
    // Validate sources array
    if (!Array.isArray(sources)) {
      console.warn('renderSourceData: sources must be an array');
      return <div className="text-sm text-red-500">Invalid source data</div>;
    }

    // Filter valid sources
    const validSources = sources.filter(validateSource);
    
    if (validSources.length !== sources.length) {
      console.warn(`renderSourceData: Filtered out ${sources.length - validSources.length} invalid sources`);
    }

    return validSources.map((source, idx) => (
      <div key={idx} className="py-2 border-t border-gray-100 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <Database size={14} className="text-gray-500" />
          <span className="font-medium text-gray-700">
            {escapeHtml(source.source)}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            source.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {escapeHtml(source.status)}
          </span>
        </div>
        
        {source.status === 'success' && source.data && typeof source.data === 'object' && (
          <div className="ml-6 text-gray-600">
            {Object.entries(source.data).map(([key, value]) => (
              key !== 'permalink' && value !== null && value !== undefined ? (
                <div key={key} className="flex gap-2">
                  <span className="capitalize">{escapeHtml(key.replace(/_/g, ' '))}:</span>
                  <span className="font-mono">
                    <span dangerouslySetInnerHTML={{
                      __html: sanitizeContent(String(value))
                    }} />
                  </span>
                </div>
              ) : null
            ))}
          </div>
        )}
        
        {source.status === 'error' && (
          <div className="ml-6 text-red-600 text-xs">
            <span dangerouslySetInnerHTML={{
              __html: sanitizeContent(source.error || 'Unknown error')
            }} />
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