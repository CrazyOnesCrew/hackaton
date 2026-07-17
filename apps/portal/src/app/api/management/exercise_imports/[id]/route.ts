import { NextResponse } from "next/server";
import { requireContentManager } from "@/lib/auth/server";
import { getImportJob } from "@/lib/paag-api";
import { railsErrorResponse } from "@/lib/api-utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  try {
    await requireContentManager();
    const { id } = await context.params;
    const job = await getImportJob(id);
    if (!job) {
      return NextResponse.json(
        { error: { code: "not_found", message: "Importación no encontrada." } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: job });
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}
