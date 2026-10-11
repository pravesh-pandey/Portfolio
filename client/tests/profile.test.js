import { test } from "node:test";
import assert from "node:assert/strict";
import { projectShowcase } from "../src/data/profile.js";

test("every project has a unique kebab-case slug", () => {
  const slugs = projectShowcase.map((project) => project.slug);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.equal(new Set(slugs).size, slugs.length);
});
