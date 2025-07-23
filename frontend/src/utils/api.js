const API_BASE_URL = "http://localhost:8000";

/**
 * Analyze IOCs using backend API
 * @param {Array} iocs - Array of IOC strings to analyze
 * @returns {Promise} - API response data
 */
export const analyzeIOCs = async (iocs) => {
  const response = await fetch(`${API_BASE_URL}/api/enrich`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ iocs }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Export results as JSON file
 * @param {Array} results - Analysis results to export
 */
export const exportResultsAsJSON = (results) => {
  const timestamp = new Date().toISOString().slice(0, 19);
  const filename = `ioc-analysis-${timestamp}.json`;

  const dataStr = JSON.stringify(results, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
};
