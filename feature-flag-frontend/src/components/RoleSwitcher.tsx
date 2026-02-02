import { useState } from "react";
import type { ActorRole } from "@/constants";

const ROLES: ActorRole[] = ["ADMIN", "DEVELOPER"];

export function RoleSwitcher() {
  const [role, setRole] = useState<ActorRole>(() => {
    return (localStorage.getItem("actorRole") as ActorRole) ?? "DEVELOPER";
  });

  const handleChange = (newRole: ActorRole) => {
    setRole(newRole);
    localStorage.setItem("actorRole", newRole);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="hidden sm:inline">Viewing as</span>
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value as ActorRole)}
        className="h-8 rounded-md border bg-background px-2 text-xs text-foreground"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
