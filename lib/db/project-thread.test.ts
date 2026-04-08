import { beforeEach, describe, expect, it, vi } from "vitest";

const getSqlMock = vi.fn();

vi.mock("@/lib/db", () => ({
  getSql: () => getSqlMock(),
}));

import {
  getProjectThread,
  insertChatMessage,
  listProjectsForUser,
  loadChatMessages,
} from "@/lib/db/project-thread";

function stubSql(
  sequentialResults: unknown[],
): ReturnType<typeof vi.fn> {
  let i = 0;
  return vi.fn(() => {
    const next = sequentialResults[i];
    i += 1;
    return Promise.resolve(next);
  });
}

describe("listProjectsForUser", () => {
  beforeEach(() => {
    getSqlMock.mockReset();
  });

  it("maps rows and ISO-formats Date updatedAt", async () => {
    const sql = stubSql([
      [
        {
          id: "p1",
          title: "Doc chat",
          updatedAt: new Date("2026-04-08T15:30:00.000Z"),
        },
      ],
    ]);
    getSqlMock.mockReturnValue(sql);

    const rows = await listProjectsForUser("user_abc");

    expect(rows).toEqual([
      {
        id: "p1",
        title: "Doc chat",
        updatedAt: "2026-04-08T15:30:00.000Z",
      },
    ]);
    expect(sql).toHaveBeenCalledTimes(1);
    expect(sql.mock.calls[0][1]).toBe("user_abc");
  });

  it("stringifies non-Date updatedAt", async () => {
    const sql = stubSql([[{ id: "p2", title: null, updatedAt: 12345 }]]);
    getSqlMock.mockReturnValue(sql);

    const rows = await listProjectsForUser("u");

    expect(rows[0].updatedAt).toBe("12345");
  });
});

describe("getProjectThread", () => {
  beforeEach(() => {
    getSqlMock.mockReset();
  });

  it("returns null when no row", async () => {
    const sql = stubSql([[]]);
    getSqlMock.mockReturnValue(sql);

    await expect(
      getProjectThread("user_1", "550e8400-e29b-41d4-a716-446655440000"),
    ).resolves.toBeNull();
  });

  it("returns thread row when document is linked", async () => {
    const sql = stubSql([
      [
        {
          projectId: "550e8400-e29b-41d4-a716-446655440000",
          title: "Hi",
          documentId: "660e8400-e29b-41d4-a716-446655440001",
          fileUrl: "https://utfs.io/f/x",
        },
      ],
    ]);
    getSqlMock.mockReturnValue(sql);

    const row = await getProjectThread(
      "user_1",
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(row).toEqual({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Hi",
      documentId: "660e8400-e29b-41d4-a716-446655440001",
      fileUrl: "https://utfs.io/f/x",
    });
    expect(sql.mock.calls[0][1]).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(sql.mock.calls[0][2]).toBe("user_1");
  });
});

describe("loadChatMessages", () => {
  beforeEach(() => {
    getSqlMock.mockReset();
  });

  it("maps id, role, and parts into UIMessage shape", async () => {
    const parts = [{ type: "text", text: "Hello" }];
    const sql = stubSql([
      [
        { id: "m1", role: "user", parts },
        {
          id: "m2",
          role: "assistant",
          parts: [
            { type: "text", text: "Hi", state: "done" },
            { type: "data-citations", id: "citations", data: [] },
          ],
        },
      ],
    ]);
    getSqlMock.mockReturnValue(sql);

    const messages = await loadChatMessages(
      "user_1",
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ id: "m1", role: "user", parts });
    expect(messages[1].role).toBe("assistant");
  });
});

describe("insertChatMessage", () => {
  beforeEach(() => {
    getSqlMock.mockReset();
  });

  it("resolves next sort_index, inserts row, and touches project", async () => {
    const sql = stubSql([[{ n: 4 }], [], []]);
    getSqlMock.mockReturnValue(sql);

    await insertChatMessage({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      id: "msg_1",
      role: "user",
      parts: [{ type: "text", text: "Q?" }],
    });

    expect(sql).toHaveBeenCalledTimes(3);

    const insertCall = sql.mock.calls[1];
    expect(insertCall[1]).toBe("msg_1");
    expect(insertCall[2]).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(insertCall[3]).toBe("user");
    expect(insertCall[4]).toBe(
      JSON.stringify([{ type: "text", text: "Q?" }]),
    );
    expect(insertCall[5]).toBe(4);
  });
});
