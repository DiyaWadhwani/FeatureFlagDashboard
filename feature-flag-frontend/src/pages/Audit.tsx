import { useEffect, useState } from "react";
import { useConfig } from "../hooks/useConfig";
import { Navigate } from "react-router-dom";
import { FEATURE_FLAGS } from "../constants";
import type { AuditEntry } from "../types/auditEntry";
import { AUDIT_API_ENDPOINT } from "../URL";

export default function Audit() {
  const { config } = useConfig();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFlag, setActiveFlag] = useState<string>("ALL");

  useEffect(() => {
    if (!config?.[FEATURE_FLAGS.AUDIT_LOG_VISIBILITY]) return;
    console.log("Fetching audit logs...");
    fetch(AUDIT_API_ENDPOINT)
      .then((res) => res.json())
      .then((data) => {
        console.log("Received audit logs:", data);
        setLogs(data);
        setLoading(false);
      });
  }, [config?.[FEATURE_FLAGS.AUDIT_LOG_VISIBILITY]]);

  function formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!config?.[FEATURE_FLAGS.AUDIT_LOG_VISIBILITY]) {
    return <Navigate to="/" replace />;
  }

  if (loading)
    return <p className="text-muted-foreground">Loading audit logs…</p>;

  if (!logs.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No feature flag changes recorded yet.
      </p>
    );
  }

  const flagTabs = [
    FEATURE_FLAGS.AUDIT_LOG_VISIBILITY,
    FEATURE_FLAGS.DARK_MODE,
    FEATURE_FLAGS.DISCOUNTED_CHECKOUT,
    FEATURE_FLAGS.EXPERIMENTAL_CACHE,
  ];

  const filteredLogs =
    activeFlag === "ALL"
      ? logs
      : logs.filter((log) => log.flagName === activeFlag);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Audit Log</h1>
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveFlag("ALL")}
          className={`px-3 py-1.5 text-sm rounded-md border ${
            activeFlag === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          All
        </button>

        {flagTabs.map((flag) => (
          <button
            key={flag}
            onClick={() => setActiveFlag(flag)}
            className={`px-3 py-1.5 text-sm rounded-md border font-mono ${
              activeFlag === flag
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {flag}
          </button>
        ))}
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="divide-y">
          {filteredLogs.map((log) => {
            const wasEnabled = log.oldValue;
            const isEnabled = log.newValue;

            return (
              <div key={log.id} className="p-4 flex gap-4">
                {/* Status Dot */}
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${
                    isEnabled ? "bg-green-500" : "bg-gray-400"
                  }`}
                />

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="font-mono text-sm font-medium">
                    {log.flagName}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {wasEnabled ? "ON" : "OFF"}
                    </span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span
                      className={`font-medium ${
                        isEnabled ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      {isEnabled ? "ON" : "OFF"}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {log.source} · {formatTimestamp(log.updatedAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
