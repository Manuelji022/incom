import { fetchTarget, TargetApiError, targetProblem, validateTargetInput } from "@/features/compound-calculator/lib/compound-interest-target";
import type { ProblemDetail, TargetInput } from "@/features/compound-calculator/types/compound-interest-target";

function problemResponse(problem: ProblemDetail) {
  return Response.json(problem, { status: problem.status, headers: { "Content-Type": "application/problem+json", "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return problemResponse(targetProblem(400, "Send a valid JSON request.")); }
  const errors = validateTargetInput(body);
  if (errors.length) return problemResponse(targetProblem(422, "Check the highlighted target assumptions.", errors));
  try {
    const result = await fetchTarget(body as TargetInput, "https://incom-api.manuelji.dev/api/v1/compound-interest/targets");
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof TargetApiError && (error.problem.status === 400 || error.problem.status === 422)) return problemResponse(error.problem);
    return problemResponse(targetProblem(500, "Target results are temporarily unavailable. Please try again shortly."));
  }
}
