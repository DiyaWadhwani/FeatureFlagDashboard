import { useEffect, useState } from "react";
import { useConfig } from "../hooks/useConfig";
import { Navigate } from "react-router-dom";
import { FEATURE_FLAGS } from "../constants";

type AuditEntry = {
  id: string;
  flagName: string;
  oldValue: boolean;
  newValue: boolean;
  source: string;
  updatedAt: string;
};

export default function Audit() {
  const { config } = useConfig();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config?.[FEATURE_FLAGS.BETA_ANALYTICS]) return;
    console.log("Fetching audit logs...");
    fetch("http://localhost:3000/audit")
      .then((res) => res.json())
      .then((data) => {
        console.log("Received audit logs:", data);
        setLogs(data);
        setLoading(false);
      });
  }, [config?.[FEATURE_FLAGS.BETA_ANALYTICS]]);

  if (!config?.[FEATURE_FLAGS.BETA_ANALYTICS]) {
    return <Navigate to="/" replace />;
  }

  if (loading)
    return <p className="text-muted-foreground">Loading audit logs…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Audit Log</h1>
      <div className="rounded-md-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-muted-foreground">
              <th className="text-left p-3">Time</th>
              <th className="text-left p-3">Flag</th>
              <th className="text-left p-3">Change</th>
              <th className="text-left p-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="p-3">
                  {new Date(log.updatedAt).toLocaleString()}
                </td>
                <td className="p-3 font-mono">{log.flagName}</td>
                <td className="p-3">
                  {String(log.oldValue)} → {String(log.newValue)}
                </td>
                <td className="p-3">{log.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
