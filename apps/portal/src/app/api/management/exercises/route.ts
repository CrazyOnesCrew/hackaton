import { NextResponse } from "next/server";
import { requireContentManager } from "@/lib/auth/server";
import { listManagementExercises } from "@/lib/paag-api";
import { railsErrorResponse } from "@/lib/api-utils";
import type { ExerciseDifficulty, ExerciseStatus } from "@/lib/paag-types";

export async function GET(request: Request) {
  try {
    await requireContentManager();
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId") ?? undefined;
    const status = (searchParams.get("status") as ExerciseStatus | null) ?? undefined;
    const difficulty =
      (searchParams.get("difficulty") as ExerciseDifficulty | null) ?? undefined;
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const result = await listManagementExercises({ topicId, status, difficulty, page });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}
