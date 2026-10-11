import { test } from "node:test";
import assert from "node:assert/strict";
import { projectShowcase } from "../src/data/profile.js";
import { caseStudies, findCaseStudy } from "../src/data/caseStudies.js";

test("every case study matches a project and has all its sections", () => {
  const projectSlugs = new Set(projectShowcase.map((project) => project.slug));
  for (const study of caseStudies) {
    assert.ok(projectSlugs.has(study.slug), `${study.slug} has no project`);
    assert.ok(["trading", "infrastructure"].includes(study.kind), `${study.slug}.kind`);
    for (const key of ["title", "summary", "problem"]) {
      assert.ok(study[key].length > 0, `${study.slug}.${key}`);
    }
    assert.ok(study.pipeline.length >= 3, `${study.slug}.pipeline`);
    assert.ok(study.approach.length >= 1, `${study.slug}.approach`);
    assert.ok(study.highlights.length >= 3 && study.highlights.length <= 5, `${study.slug}.highlights`);
    assert.ok(study.limitations.length >= 1, `${study.slug}.limitations`);
    assert.ok(study.stack.length >= 1, `${study.slug}.stack`);
    assert.ok(study.decisions.length >= 2 && study.decisions.length <= 4, `${study.slug}.decisions`);
    for (const row of study.decisions) {
      for (const key of ["decision", "chosen", "rejected"]) assert.ok(row[key].length > 0, `${study.slug} decision.${key}`);
    }
  }
});

test("trading case studies publish no numbers", () => {
  for (const study of caseStudies.filter((item) => item.kind === "trading")) {
    const text = [
      study.summary,
      study.problem,
      ...study.pipeline,
      ...study.approach,
      ...study.highlights,
      ...study.limitations,
      ...study.decisions.flatMap((row) => [row.decision, row.chosen, row.rejected])
    ]
      .join(" ")
      .replaceAll("C++20", "C++");
    assert.doesNotMatch(text, /\d/, `${study.slug} contains a digit`);
  }
});

test("findCaseStudy returns the study or undefined", () => {
  assert.equal(findCaseStudy("flowpulse").title, "FlowPulse");
  assert.equal(findCaseStudy("does-not-exist"), undefined);
});
