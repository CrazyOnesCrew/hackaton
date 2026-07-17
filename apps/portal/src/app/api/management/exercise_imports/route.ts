import { NextResponse } from "next/server";
import { requireContentManager } from "@/lib/auth/server";
import { createImportJob, listImportJobs } from "@/lib/paag-api";
import { railsErrorResponse, validateOrigin } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    await requireContentManager();
    const page = Number(new URL(request.url).searchParams.get("page") ?? "1") || 1;
    const result = await listImportJobs(page);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const csrf = validateOrigin(request);
  if (csrf) return csrf;

  try {
    await requireContentManager();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "validation_error", message: "Debes adjuntar un archivo XML." } },
        { status: 422 },
      );
    }
    const job = await createImportJob(file);
    return NextResponse.json({ data: job }, { status: 202 });
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}
