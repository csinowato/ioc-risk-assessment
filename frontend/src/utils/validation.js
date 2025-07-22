/**
 * Validate IOC input without echoing potentially malicious input
 * @param {string} text - Raw textarea input
 * @returns {Array} - Array of validation issues
 */
export const validateInput = (text) => {
  const lines = text.split("\n").filter((line) => line.trim());
  const issues = [];

  // Check for too many IOCs
  if (lines.length > 10) {
    issues.push({
      type: "limit",
      message: `Too many IOCs (${lines.length}/10 max)`,
    });
  }

  // Check for multiple values per line (security: don't echo input)
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (
      trimmed &&
      (trimmed.includes(",") || trimmed.includes(" ") || trimmed.includes("\t"))
    ) {
      const parts = trimmed.split(/[,\s\t]+/).filter(Boolean);
      if (parts.length > 1) {
        issues.push({
          type: "multiple",
          line: index + 1,
          count: parts.length,
          message: `Line ${index + 1}: Multiple values detected (${
            parts.length
          } items)`,
        });
      }
    }
  });

  return issues;
};

/**
 * Parse and clean IOC input
 * @param {string} input - Raw textarea input
 * @returns {Array} - Array of cleaned IOCs
 */
export const parseIOCs = (input) => {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};
