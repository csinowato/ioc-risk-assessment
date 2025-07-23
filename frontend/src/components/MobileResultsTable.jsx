import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { defangIOC } from '../utils/defang';
import { getRiskColor, getRiskIcon } from '../utils/riskScoring';

const MobileResultCard = ({ result, expandedRows, onToggleExpansion, renderSourceData }) => {
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
          <div className="text-sm text-gray-900 uppercase">{result.ioc_type}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Risk</div>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getRiskIcon(result.risk_score)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(result.risk_score)}`}>
              {result.risk_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Summary</div>
        <div className="text-sm text-gray-700">
          {result.summary || 'No summary available'}
        </div>
      </div>

      {/* Expanded content */}
      {expandedRows.has(result.ioc) && (
        <div className="pt-3 border-t border-gray-200">
          {result.sources && result.sources.length > 0 ? (
            <div className="bg-gray-50 rounded border p-3">
              <h4 className="font-medium text-gray-900 mb-2">Source Details:</h4>
              {renderSourceData(result.sources)}
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