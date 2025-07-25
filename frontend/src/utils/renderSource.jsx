import { Database } from "lucide-react";
import SOURCE_FIELD_CONFIGS from "./sourceConfig";
import {
  getNestedValue,
  formatValue,
  getRequiredMissingMessage,
} from "./formatting";

const renderSourceData = (sources) => {
  return sources.map((source, index) => {
    const sourceName = source.source || `Source ${index + 1}`;
    const config = SOURCE_FIELD_CONFIGS[sourceName];
    const status = source.status || "unknown";

    return (
      <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center gap-2 mb-2">
          <Database size={16} className="text-gray-500" />
          <span className="font-medium text-gray-700">{sourceName}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            status === "success" ? "bg-green-100 text-green-600" : 
            status === "error" ? "bg-red-100 text-red-600" : 
            "bg-gray-100 text-gray-600"
          }`}>
            {status}
          </span>
        </div>

        {config && source.data ? (
          <div className="text-sm text-gray-600 space-y-1 ml-6">
            {config.fields.map((field) => {
              const rawValue = getNestedValue(source.data, field.key);
              const formattedValue = formatValue(rawValue, field.type);
              const isMissing = rawValue === null || rawValue === undefined;

              // Required fields: always show
              if (field.required) {
                return (
                  <div key={field.key}>
                    <span className="font-medium">{field.label}:</span>{" "}
                    <span className={isMissing ? "text-amber-600 italic" : ""}>
                      {isMissing ? getRequiredMissingMessage(field.label) : formattedValue}
                    </span>
                  </div>
                );
              }

              // Optional fields: hide if missing
              if (isMissing) {
                return null;
              }

              return (
                <div key={field.key}>
                  <span className="font-medium">{field.label}:</span> {formattedValue}
                </div>
              );
            })}
          </div>
        ) : status === "error" ? (
          <div className="text-sm text-red-600">
            {source.error || "Failed to fetch data"}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            No data configuration available for {sourceName}
          </div>
        )}
      </div>
    );
  });
};

export default renderSourceData;