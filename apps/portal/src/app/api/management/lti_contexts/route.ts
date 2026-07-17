import { NextResponse } from "next/server";
import { requireContentManager } from "@/lib/auth/server";
import { listLtiContexts } from "@/lib/paag-api";
import { railsErrorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    await requireContentManager();
    const data = await listLtiContexts();
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Response) return error;
    return railsErrorResponse(error);
  }
}
