import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(async () => "test-token"),
}));

import {
  getContentDashboardSummary,
  getManagementExercise,
  listManagementExercises,
  patchManagementExercise,
  reorderTopicExercises,
  resetMockExerciseStore,
  shouldUseMockApi,
} from "./paag-api";
import { RailsRequestError } from "./rails";

describe("shouldUseMockApi (PAAG-301)", () => {
  const original = process.env.NEXT_PUBLIC_USE_MOCK_API;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_USE_MOCK_API;
    else process.env.NEXT_PUBLIC_USE_MOCK_API = original;
  });

  it("honors NEXT_PUBLIC_USE_MOCK_API=true", () => {
    process.env.NEXT_PUBLIC_USE_MOCK_API = "true";
    expect(shouldUseMockApi()).toBe(true);
  });

  it("honors NEXT_PUBLIC_USE_MOCK_API=false", () => {
    process.env.NEXT_PUBLIC_USE_MOCK_API = "false";
    expect(shouldUseMockApi()).toBe(false);
  });

  it("defaults to mock outside production when unset", () => {
    delete process.env.NEXT_PUBLIC_USE_MOCK_API;
    // Vitest runs with NODE_ENV=test (non-production) → mock on by default.
    expect(process.env.NODE_ENV).not.toBe("production");
    expect(shouldUseMockApi()).toBe(true);
  });
});

describe("paag-api mock store (PAAG-301/302)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USE_MOCK_API = "true";
    resetMockExerciseStore();
  });

  afterEach(() => {
    resetMockExerciseStore();
    delete process.env.NEXT_PUBLIC_USE_MOCK_API;
  });

  it("lists exercises and filters by status/difficulty/topic", async () => {
    const all = await listManagementExercises();
    expect(all.meta.totalCount).toBeGreaterThanOrEqual(5);

    const drafts = await listManagementExercises({ status: "draft" });
    expect(drafts.data.every((e) => e.status === "draft")).toBe(true);

    const easy = await listManagementExercises({ difficulty: "easy" });
    expect(easy.data.every((e) => e.difficulty === "easy")).toBe(true);

    const topic = await listManagementExercises({ topicId: "10" });
    expect(topic.data.every((e) => e.topicId === "10")).toBe(true);
  });

  it("returns a full exercise for preview including steps and hints", async () => {
    const exercise = await getManagementExercise("1");
    expect(exercise?.title).toMatch(/Derivada/);
    expect(exercise?.steps?.length).toBeGreaterThan(0);
    expect(exercise?.steps?.[0]?.hints?.[0]?.penaltyPercent).toBe(10);
  });

  it("rejects publish with 422 details when procedure/answers are incomplete", async () => {
    const error = await patchManagementExercise("5", { status: "published" }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(RailsRequestError);
    expect((error as RailsRequestError).status).toBe(422);
    const body = (error as RailsRequestError).body as {
      error?: { details?: { message: string }[] };
    };
    expect(body.error?.details?.some((d) => /procedure|respuesta/i.test(d.message))).toBe(true);
  });

  it("publishes a complete exercise", async () => {
    const updated = await patchManagementExercise("2", { status: "published" });
    expect(updated.status).toBe("published");
    const again = await getManagementExercise("2");
    expect(again?.status).toBe("published");
  });

  it("reorders exercises within a topic", async () => {
    await reorderTopicExercises("10", ["5", "1", "4"]);
    const topic = await listManagementExercises({ topicId: "10" });
    const byId = Object.fromEntries(topic.data.map((e) => [e.id, e.position]));
    expect(byId["5"]).toBe(1);
    expect(byId["1"]).toBe(2);
    expect(byId["4"]).toBe(3);
  });

  it("summarizes dashboard totals from the mock store", async () => {
    const summary = await getContentDashboardSummary();
    expect(summary.totalExercises).toBeGreaterThan(0);
    expect(
      summary.totalsByStatus.draft +
        summary.totalsByStatus.published +
        summary.totalsByStatus.archived,
    ).toBe(summary.totalExercises);
    expect(summary.recentImports.length).toBeGreaterThan(0);
  });
});
