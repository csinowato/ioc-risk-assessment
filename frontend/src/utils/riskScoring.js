/**
 * Get Tailwind CSS classes for risk score styling
 * @param {number} riskScore - Risk score percentage (0-100)
 * @returns {string} - Tailwind CSS classes
 */
export const getRiskColor = (riskScore) => {
  if (riskScore >= 70) return "text-red-600 bg-red-50"; // High (70%+)
  if (riskScore >= 40) return "text-orange-600 bg-orange-50"; // Moderate (40-69%)
  if (riskScore >= 15) return "text-yellow-600 bg-yellow-50"; // Low (15-39%)
  return "text-green-600 bg-green-50"; // Minimal (0-14%)
};

/**
 * Get emoji icon for risk score
 * @param {number} riskScore - Risk score percentage (0-100)
 * @returns {string} - Emoji icon
 */
export const getRiskIcon = (riskScore) => {
  if (riskScore >= 70) return "🔴"; // High
  if (riskScore >= 40) return "🟠"; // Moderate
  if (riskScore >= 15) return "🟡"; // Low
  return "🟢"; // Minimal
};

/**
 * Get risk level text
 * @param {number} riskScore - Risk score percentage (0-100)
 * @returns {string} - Risk level text
 */
export const getRiskLevel = (riskScore) => {
  if (riskScore >= 70) return "High";
  if (riskScore >= 40) return "Moderate";
  if (riskScore >= 15) return "Low";
  return "Minimal";
};
