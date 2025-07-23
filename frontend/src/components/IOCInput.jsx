import React from 'react';
import { AlertTriangle } from 'lucide-react';

const IOCInput = ({ 
  input, 
  setInput, 
  isLoading, 
  validationIssues, 
  iocCount, 
  canSubmit, 
  onSubmit 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter IOCs (one per line, max 10):
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="8.8.8.8&#10;google.com&#10;malicious-hash"
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-100 focus:border-sky-400 focus:outline-none font-mono text-sm"
          disabled={isLoading}
        />
        
        {/* Validation Messages */}
        {validationIssues.length > 0 && (
          <div className="mt-3 space-y-2">
            {validationIssues.map((issue, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle size={14} />
                <span>{issue.message}</span>
              </div>
            ))}
            <div className="text-xs text-gray-500">
              💡 Please put one IOC per line
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {iocCount} / 10 IOCs
          </div>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="bg-slate-500 text-white px-6 py-2 rounded-lg hover:bg-slate-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors min-w-[120px] justify-center text-sm"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </div>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOCInput;