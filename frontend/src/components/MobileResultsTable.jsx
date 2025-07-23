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

const MobileResultCard = ({ result, expandedRows, onToggleExpansion, renderSourceData }) => {
  // Validate props
  if (!validateResult(result)) {
    console.warn('MobileResultCard: Invalid result data', result);
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-700 text-sm">Invalid result data</div>
      </div>
    );
  }

  if (!expandedRows || typeof expandedRows.has !== 'function') {
    console.warn('MobileResultCard: expandedRows must be a Set');
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-700 text-sm">Invalid expandedRows data</div>
      </div>
    );
  }

  if (typeof onToggleExpansion !== 'function') {
    console.warn('MobileResultCard: onToggleExpansion must be a function');
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-700 text-sm">Invalid onToggleExpansion prop</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Header with IOC and expand button */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">IOC (Defanged)</div>
          <div className="font-mono text-sm text-gray-900 break-all">
            {defangIOC(result.ioc, result.ioc_type)}
          </div>
        </div>
        <button
          onClick={() => onToggleExpansion(result.ioc)}
          className="flex items-center justify-center w-8 h-8 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded ml-2 flex-shrink-0"
        >
          {expandedRows.has(result.ioc) ? (
            <ChevronDown size={16} strokeWidth={3} />
          ) : (
            <ChevronRight size={16} strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Type and Risk Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</div>
          <div className="text-sm text-gray-900 uppercase">{escapeHtml(result.ioc_type)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Risk</div>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getRiskIcon(result.risk_score)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(result.risk_score)}`}>
              {Math.round(result.risk_score)}%
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Summary</div>
        <div className="text-sm text-gray-700">
          <div dangerouslySetInnerHTML={{
            __html: sanitizeContent(result.summary || 'No summary available')
          }} />
        </div>
      </div>

      {/* Expanded content */}
      {expandedRows.has(result.ioc) && (
        <div className="pt-3 border-t border-gray-200">
          {result.sources && Array.isArray(result.sources) && result.sources.length > 0 ? (
            <div className="bg-gray-50 rounded border p-3">
              <h4 className="font-medium text-gray-900 mb-2">Source Details:</h4>
              {renderSourceData ? renderSourceData(result.sources) : (
                <div className="text-sm text-gray-500">No renderSourceData function provided</div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded border text-sm text-gray-500">
              No source data available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileResultCard;