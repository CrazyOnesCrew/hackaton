import { requireContentManager } from "@/lib/auth/server";
import { exportGradesCsv } from "@/lib/paag-api";
import { railsErrorResponse } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    await requireContentManager();
    const contextId = new URL(request.url).searchParams.get("contextId");
    if (!contextId) {
      return Response.json(
        { error: { code: "validation_error", message: "contextId es obligatorio." } },
        { status: 422 },
      );
    }
    const { filename, body } = await exportGradesCsv(contextId);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}
