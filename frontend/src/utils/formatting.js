import DOMPurify from "dompurify";

// Utility to safely get nested values
const getNestedValue = (obj, path, defaultValue = null) => {
  try {
    return (
      path.split(".").reduce((current, key) => current?.[key], obj) ??
      defaultValue
    );
  } catch {
    return defaultValue;
  }
};

// Format different data types with sanitization
const formatValue = (value, type) => {
  if (value === null || value === undefined) return null;

  let formatted;
  switch (type) {
    case "percentage":
      formatted = `${value}%`;
      break;
    case "number":
      formatted = Number(value).toLocaleString();
      break;
    case "date":
      formatted = new Date(value).toLocaleDateString();
      break;
    case "timestamp":
      // Convert Unix timestamp to readable date
      formatted = new Date(value * 1000).toLocaleDateString();
      break;
    case "boolean":
      formatted = value ? "Yes" : "No";
      break;
    case "array":
      // For handling tags which are stored in arrays
      if (Array.isArray(value)) {
        formatted = value.length > 0 ? value.join(", ") : "None";
      } else {
        formatted = "None";
      }
      break;
    default:
      formatted = String(value);
  }

  // Sanitize all formatted values to prevent XSS
  return DOMPurify.sanitize(formatted);
};

// Get display value for missing required fields
const getRequiredMissingMessage = (fieldLabel) => {
  const messages = {
    IP: "No IP data",
    Country: "Unknown location",
    Organization: "Unknown org",
    Malicious: "No scan data",
    Suspicious: "No scan data",
    Clean: "No scan data",
    Undetected: "No scan data",
    "Abuse Confidence": "No confidence data",
    "Total Reports": "No report data",
  };

  // These are hardcoded safe strings, but sanitize for consistency
  return DOMPurify.sanitize(messages[fieldLabel] || "No data");
};

export { getNestedValue, formatValue, getRequiredMissingMessage };
