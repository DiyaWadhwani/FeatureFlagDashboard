export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

export const GRAPHQL_ENDPOINT = `${BACKEND_URL}/graphql`;
export const AUDIT_API_ENDPOINT = `${BACKEND_URL}/audit`;
export const CHECKOUT_API_ENDPOINT_V1 = `${BACKEND_URL}/checkout/experience?version=v1`;
export const CHECKOUT_API_ENDPOINT_V2 = `${BACKEND_URL}/checkout/experience?version=v2`;
