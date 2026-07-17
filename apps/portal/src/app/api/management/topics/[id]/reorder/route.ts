import { NextResponse } from "next/server";
import { requireContentManager } from "@/lib/auth/server";
import { reorderTopicExercises } from "@/lib/paag-api";
import { railsErrorResponse, validateOrigin } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const csrf = validateOrigin(request);
  if (csrf) return csrf;

  try {
    await requireContentManager();
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const exerciseIds = body?.exerciseIds;
    if (!Array.isArray(exerciseIds) || !exerciseIds.every((x: unknown) => typeof x === "string")) {
      return NextResponse.json(
        { error: { code: "validation_error", message: "exerciseIds debe ser un arreglo de ids." } },
        { status: 422 },
      );
    }
    await reorderTopicExercises(id, exerciseIds);
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}
