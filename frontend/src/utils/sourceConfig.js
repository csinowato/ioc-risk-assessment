const SOURCE_FIELD_CONFIGS = {
  VirusTotal: {
    fields: [
      {
        key: "data.attributes.last_analysis_stats.malicious",
        label: "Malicious",
        type: "number",
        required: true,
      },
      {
        key: "data.attributes.last_analysis_stats.suspicious",
        label: "Suspicious",
        type: "number",
        required: true,
      },
      {
        key: "data.attributes.last_analysis_stats.harmless",
        label: "Clean",
        type: "number",
        required: true,
      },
      {
        key: "data.attributes.last_analysis_stats.undetected",
        label: "Undetected",
        type: "number",
        required: true,
      },
      {
        key: "data.attributes.last_analysis_date",
        label: "Last Scan",
        type: "timestamp",
        required: false,
      },
      {
        key: "data.attributes.as_owner",
        label: "AS Owner",
        type: "string",
        required: false,
      },
      {
        key: "data.attributes.country",
        label: "Country",
        type: "string",
        required: false,
      },
      {
        key: "data.attributes.reputation",
        label: "Reputation",
        type: "number",
        required: false,
      },
      {
        key: "data.attributes.network",
        label: "Network",
        type: "string",
        required: false,
      },
      {
        key: "data.attributes.tags",
        label: "Tags",
        type: "array",
        required: false,
      },
    ],
  },
  AbuseIPDB: {
    fields: [
      {
        key: "abuseConfidenceScore",
        label: "Abuse Confidence",
        type: "percentage",
        required: true,
      },
      {
        key: "totalReports",
        label: "Total Reports",
        type: "number",
        required: true,
      },
      {
        key: "lastReportedAt",
        label: "Last Reported",
        type: "date",
        required: false,
      },
      { key: "countryCode", label: "Country", type: "string", required: false },
      { key: "isp", label: "ISP", type: "string", required: false },
    ],
  },
  IPInfo: {
    fields: [
      { key: "ip", label: "IP", type: "string", required: true },
      { key: "hostname", label: "Hostname", type: "string", required: false },
      { key: "city", label: "City", type: "string", required: false },
      { key: "region", label: "Region", type: "string", required: false },
      { key: "country", label: "Country", type: "string", required: true },
      { key: "org", label: "Organization", type: "string", required: true },
      { key: "timezone", label: "Timezone", type: "string", required: false },
      { key: "anycast", label: "Anycast", type: "boolean", required: false },
    ],
  },
};

export default SOURCE_FIELD_CONFIGS;
