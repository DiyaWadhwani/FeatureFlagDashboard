export const FEATURE_FLAGS = {
  DARK_MODE: "dark_mode",
  DISCOUNTED_CHECKOUT: "discounted_checkout",
  AUDIT_LOG_VISIBILITY: "audit_log_visibility",
  EXPERIMENTAL_CACHE: "experimental_cache",
};

export const FLAG_TIERS = {
  SAFE: "SAFE",
  SENSITIVE: "SENSITIVE",
  CRITICAL: "CRITICAL",
};

export type ActorRole = "ADMIN" | "DEVELOPER";

export const ROLE_LABELS: Record<ActorRole, string> = {
  ADMIN: "Admin",
  DEVELOPER: "Developer",
};

export const CAN_TOGGLE_TIER: Record<ActorRole, Set<string>> = {
  ADMIN: new Set(["SAFE", "SENSITIVE", "CRITICAL"]),
  DEVELOPER: new Set(["SAFE", "SENSITIVE"]),
};
