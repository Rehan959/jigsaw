import { describe, it, expect } from "vitest";
import { generateId, truncate, slugify, chunkArray } from "../utils";

describe("generateId", () => {
  it("returns a valid UUID format", () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("returns unique IDs on successive calls", () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
  });
});

describe("truncate", () => {
  it("returns string unchanged when under max length", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns string unchanged at exact max length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and adds ellipsis when over max length", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World#")).toBe("hello-world");
  });

  it("replaces spaces and underscores with hyphens", () => {
    expect(slugify("hello_world foo")).toBe("hello-world-foo");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});

describe("chunkArray", () => {
  it("splits array into chunks of given size", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns single chunk when size >= array length", () => {
    expect(chunkArray([1, 2], 5)).toEqual([[1, 2]]);
  });

  it("returns empty array for empty input", () => {
    expect(chunkArray([], 3)).toEqual([]);
  });

  it("handles size 1", () => {
    expect(chunkArray([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
});
