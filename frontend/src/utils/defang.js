/**
 * Defang IOCs to prevent accidental clicks
 * @param {string} ioc - IOC to defang
 * @param {string} type - Type of IOC (ip, domain, url, hash)
 * @returns {string} - Defanged IOC
 */
export const defangIOC = (ioc, type) => {
  if (!ioc) return "";

  switch (type?.toLowerCase()) {
    case "ip":
      return ioc.replace(/\./g, "[.]");

    case "domain":
      return ioc.replace(/\./g, "[.]").replace(/^http/i, "hXXp");

    case "url":
      return ioc.replace(/\./g, "[.]").replace(/^http/i, "hXXp");

    case "hash":
    case "file":
      return ioc;

    default:
      // Default defanging for unknown types
      return ioc.replace(/\./g, "[.]");
  }
};
