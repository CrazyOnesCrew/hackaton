import { NextResponse } from "next/server";
import { requireContentManager } from "@/lib/auth/server";
import {
  deleteManagementExercise,
  getManagementExercise,
  patchManagementExercise,
} from "@/lib/paag-api";
import { railsErrorResponse, validateOrigin } from "@/lib/api-utils";
import type { ExerciseStatus } from "@/lib/paag-types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    await requireContentManager();
    const { id } = await context.params;
    const exercise = await getManagementExercise(id);
    if (!exercise) {
      return NextResponse.json(
        { error: { code: "not_found", message: "Ejercicio no encontrado." } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: exercise });
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: Ctx) {
  const csrf = validateOrigin(request);
  if (csrf) return csrf;

  try {
    await requireContentManager();
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const status = body?.status as ExerciseStatus | undefined;
    if (!status) {
      return NextResponse.json(
        { error: { code: "validation_error", message: "status es obligatorio." } },
        { status: 422 },
      );
    }
    const data = await patchManagementExercise(id, { status });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: Ctx) {
  const csrf = validateOrigin(request);
  if (csrf) return csrf;

  try {
    await requireContentManager();
    const { id } = await context.params;
    await deleteManagementExercise(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}
