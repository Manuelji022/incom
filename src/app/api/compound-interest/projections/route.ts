import { handleProjectionRequest } from "@/features/compound-calculator/api/projection-handler";

export async function POST(request: Request) {
  return handleProjectionRequest(request);
}
