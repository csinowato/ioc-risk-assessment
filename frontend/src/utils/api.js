const API_BASE_URL = "http://localhost:8000";

/**
 * Analyze IOCs using backend API
 * @param {Array} iocs - Array of IOC strings to analyze
 * @returns {Promise} - API response data
 */
export const analyzeIOCs = async (iocs) => {
  const response = await fetch(`${API_BASE_URL}/api/assess`, {
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
