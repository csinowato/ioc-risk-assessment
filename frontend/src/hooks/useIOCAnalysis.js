import { useState, useEffect } from "react";
import { validateInput, parseIOCs } from "../utils/validation";
import { analyzeIOCs } from "../utils/api";

/**
 * Custom hook for IOC analysis state and operations
 */
export const useIOCAnalysis = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationIssues, setValidationIssues] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Validate input
  useEffect(() => {
    if (input.trim()) {
      const issues = validateInput(input);
      setValidationIssues(issues);
    } else {
      setValidationIssues([]);
    }
  }, [input]);

  // Toggle row expansion
  const toggleRowExpansion = (ioc) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ioc)) {
      newExpanded.delete(ioc);
    } else {
      newExpanded.add(ioc);
    }
    setExpandedRows(newExpanded);
  };

  // Submit IOCs for analysis
  const submitAnalysis = async () => {
    // Final validation
    const issues = validateInput(input);
    const criticalIssues = issues.filter(
      (issue) => issue.type === "limit" || issue.type === "multiple"
    );

    if (criticalIssues.length > 0) {
      setError("Please fix validation issues before submitting");
      return;
    }

    const iocs = parseIOCs(input);
    if (iocs.length === 0) {
      setError("Please enter at least one IOC");
      return;
    }

    setIsLoading(true);
    setError("");
    setResults([]);
    setExpandedRows(new Set());

    try {
      const data = await analyzeIOCs(iocs);
      setResults(data.results || []);
    } catch (err) {
      console.error("IOC analysis failed:", err);
      setError("Failed to analyze IOCs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear data
  const clearAll = () => {
    setInput("");
    setResults([]);
    setError("");
    setValidationIssues([]);
    setExpandedRows(new Set());
  };

  // Get IOC count for display
  const iocCount = parseIOCs(input).length;

  // Check if form can be submitted
  const canSubmit =
    !isLoading &&
    !validationIssues.some(
      (issue) => issue.type === "limit" || issue.type === "multiple"
    ) &&
    input.trim().length > 0;

  return {
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
    clearAll,
  };
};
