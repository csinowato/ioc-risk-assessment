import React from 'react';
import Header from './components/Header';
import IOCInput from './components/IOCInput';
import ResultsTable from './components/ResultsTable';
import { useIOCAnalysis } from './hooks/useIOCAnalysis';

function App() {
  const {
    // State
    input,
    results,
    isLoading,
    error,
    validationIssues,
    expandedRows,
    iocCount,
    canSubmit,
    
    // Actions
    setInput,
    submitAnalysis,
    toggleRowExpansion,
  } = useIOCAnalysis();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Header results={results} />
        
        <IOCInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          validationIssues={validationIssues}
          iocCount={iocCount}
          canSubmit={canSubmit}
          onSubmit={submitAnalysis}
        />
        
        <ResultsTable
          results={results}
          error={error}
          expandedRows={expandedRows}
          onToggleExpansion={toggleRowExpansion}
        />
      </div>
    </div>
  );
}

export default App;