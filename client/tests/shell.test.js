import { test } from "node:test";
import assert from "node:assert/strict";
import { runCommand, complete, commandNames } from "../src/shell/commands.js";
import { isShellToggleKey, navShortcut } from "../src/shell/hotkey.js";

test("help lists every command", () => {
  const { lines } = runCommand("help");
  for (const name of commandNames) {
    assert.ok(lines.some((line) => line.startsWith(name)), `help is missing ${name}`);
  }
});

test("unknown commands suggest help", () => {
  assert.deepEqual(runCommand("rm -rf /").lines, ["command not found: rm. Try help"]);
});

test("blank input does nothing", () => {
  assert.deepEqual(runCommand("   "), { lines: [] });
});

test("commands are case-insensitive and ignore extra spaces", () => {
  assert.equal(runCommand("  HIRE  ").navigate, "/work-with-me");
});

test("open goes to a case study when one exists", () => {
  const result = runCommand("open flowpulse");
  assert.equal(result.navigate, "/case-studies/flowpulse");
  assert.deepEqual(result.lines, ["→ opened FlowPulse"]);
});

test("open falls back to the project's card for projects without a case study", () => {
  const result = runCommand("open tamperscripts");
  assert.equal(result.navigate, "/projects#tamperscripts");
  assert.match(result.lines[0], /^TamperScripts Collection: /);
});

test("open explains itself without an argument or with an unknown slug", () => {
  assert.match(runCommand("open").lines[0], /^usage: open/);
  assert.match(runCommand("open nope").lines[0], /^open: no project named nope/);
});

test("ls projects lists every slug", () => {
  const { lines } = runCommand("ls projects");
  assert.equal(lines.length, 12);
  assert.ok(lines[0].startsWith("flowpulse"));
});

test("resume navigates, resume --pdf opens the CV", () => {
  assert.equal(runCommand("resume").navigate, "/#experience");
  assert.equal(runCommand("resume --pdf").href, "resume.pdf");
});

test("lab is announced as coming soon until the playground ships", () => {
  assert.deepEqual(runCommand("lab"), { lines: ["lab: coming soon"] });
});

test("clear and exit signal the drawer", () => {
  assert.equal(runCommand("clear").clear, true);
  assert.equal(runCommand("exit").close, true);
});

test("cat prints a summary without leaving the page", () => {
  const study = runCommand("cat flowpulse");
  assert.equal(study.navigate, undefined);
  assert.equal(study.lines[0], "FlowPulse");
  assert.ok(study.lines.includes("highlights:"));
  assert.match(runCommand("cat covin").lines[0], /^Covin Web Application: /);
  assert.match(runCommand("cat nope").lines[0], /^cat: no project named nope/);
  assert.match(runCommand("cat").lines[0], /^usage: cat/);
});

test("man explains commands", () => {
  assert.deepEqual(runCommand("man open").lines, ["open <project> — open a project or case study"]);
  assert.deepEqual(runCommand("man sudo").lines, ["man: no manual entry for sudo"]);
  assert.deepEqual(runCommand("man").lines, ["usage: man <command>"]);
});

test("sudo hire is a hidden shortcut to hiring", () => {
  const result = runCommand("sudo hire");
  assert.equal(result.navigate, "/work-with-me");
  assert.equal(result.lines[0], "[sudo] permission granted.");
  assert.match(runCommand("sudo rm -rf /").lines[0], /^nice try/);
  assert.ok(!commandNames.includes("sudo"));
  assert.ok(!runCommand("help").lines.some((line) => line.startsWith("sudo")));
});

test("shortcuts can be turned off and on", () => {
  assert.equal(runCommand("shortcuts off").shortcuts, false);
  assert.equal(runCommand("shortcuts on").shortcuts, true);
  assert.equal(runCommand("shortcuts").shortcuts, undefined);
});

test("tab completion completes commands and open slugs", () => {
  assert.deepEqual(complete("tr"), ["trading"]);
  assert.deepEqual(complete("open fl"), ["open flowpulse"]);
  assert.deepEqual(complete("ls p"), ["ls projects"]);
  assert.deepEqual(complete("open c"), ["open cell-phone-controlled-car", "open covin", "open curves"]);
  assert.deepEqual(complete("cat lo"), ["cat localcache"]);
  assert.deepEqual(complete("man op"), ["man open"]);
  assert.deepEqual(complete("shortcuts o"), ["shortcuts on", "shortcuts off"]);
  assert.deepEqual(complete("su"), [], "hidden commands do not complete");
  assert.deepEqual(complete("zzz"), []);
  assert.deepEqual(complete("hire now"), []);
});

const element = (tagName, extra = {}) => ({ tagName, isContentEditable: false, value: "", ...extra });
const key = (target, extra = {}) => ({ key: "`", ctrlKey: false, metaKey: false, altKey: false, target, ...extra });

test("backtick toggles the shell outside form fields", () => {
  assert.equal(isShellToggleKey(key(element("BODY")), null), true);
  assert.equal(isShellToggleKey(key(element("A")), null), true);
});

test("backtick is ignored while typing in form fields", () => {
  for (const tag of ["INPUT", "TEXTAREA", "SELECT"]) {
    assert.equal(isShellToggleKey(key(element(tag)), null), false, tag);
  }
  assert.equal(isShellToggleKey(key(element("DIV", { isContentEditable: true })), null), false);
});

test("backtick in the shell input closes only when the input is empty", () => {
  const shellInput = element("INPUT");
  assert.equal(isShellToggleKey(key(shellInput), shellInput), true);
  shellInput.value = "open";
  assert.equal(isShellToggleKey(key(shellInput), shellInput), false);
});

test("other keys and modified backticks never toggle", () => {
  assert.equal(isShellToggleKey(key(element("BODY"), { key: "a" }), null), false);
  assert.equal(isShellToggleKey(key(element("BODY"), { ctrlKey: true }), null), false);
});

const NAV = [
  { path: "/work-with-me", key: "1" },
  { path: "/trading", key: "2" }
];

test("number keys map to nav items outside form fields", () => {
  assert.equal(navShortcut(key(element("BODY"), { key: "2" }), NAV), "/trading");
  assert.equal(navShortcut(key(element("BODY"), { key: "9" }), NAV), null);
});

test("number keys type normally in form fields and with modifiers", () => {
  assert.equal(navShortcut(key(element("INPUT"), { key: "1" }), NAV), null);
  assert.equal(navShortcut(key(element("BODY"), { key: "1", metaKey: true }), NAV), null);
});
