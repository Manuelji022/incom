import type { ProjectionPoint } from "@/features/compound-calculator/types/compound-interest";

export function getTotalInvested(point: ProjectionPoint): number {
  return Number(point.initial_principal) + Number(point.cumulative_contributions);
}
