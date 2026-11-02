type CompoundInterestEndpoint = "projections" | "targets";

export function getCompoundInterestEndpoint(endpoint: CompoundInterestEndpoint): string {
  const baseUrl = process.env.OLIVE_CAP_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) throw new Error("compound-interest-api-url-not-configured");
  return `${baseUrl}/compound-interest/${endpoint}`;
}
