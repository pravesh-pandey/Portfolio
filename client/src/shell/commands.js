import { projectShowcase } from "../data/profile.js";
import { caseStudies } from "../data/caseStudies.js";
import { EMAIL, UPWORK_URL } from "../data/links.js";

// A command returns { lines, navigate?, href?, clear?, close?, shortcuts? }.
// navigate is an in-site route; href opens in a new tab (relative hrefs resolve against BASE_URL);
// shortcuts (boolean) turns the single-key shortcuts on or off.
const opened = (path, title) => ({ lines: [`→ opened ${title}`], navigate: path });

const findStudy = (slug) => caseStudies.find((item) => item.slug === slug);
const findProject = (slug) => projectShowcase.find((item) => item.slug === slug);

const openProject = (slug) => {
  if (!slug) return { lines: ["usage: open <project>   (see: ls projects)"] };
  const study = findStudy(slug);
  if (study) return opened(`/case-studies/${slug}`, study.title);
  const project = findProject(slug);
  if (project) return { lines: [`${project.title}: ${project.tagline}`, "→ opened Projects"], navigate: `/projects#${slug}` };
  return { lines: [`open: no project named ${slug}. Try ls projects`] };
};

const catProject = (slug) => {
  if (!slug) return { lines: ["usage: cat <project>   (see: ls projects)"] };
  const study = findStudy(slug);
  if (study) {
    return {
      lines: [study.title, "", study.summary, "", "highlights:", ...study.highlights.map((item) => `  - ${item}`)]
    };
  }
  const project = findProject(slug);
  if (project) return { lines: [`${project.title}: ${project.tagline}`, "", project.description] };
  return { lines: [`cat: no project named ${slug}. Try ls projects`] };
};

const COMMANDS = [
  { name: "help", usage: "help", summary: "list commands", run: () => ({ lines: helpLines() }) },
  {
    name: "whoami",
    usage: "whoami",
    summary: "who built this",
    run: () => ({
      lines: ["Pravesh Pandey: SDE @ Amazon Alexa AI · builds trading systems in C++ and Python"]
    })
  },
  { name: "hire", usage: "hire", summary: "start a project with me", run: () => opened("/work-with-me", "Work with me") },
  {
    name: "upwork",
    usage: "upwork",
    summary: "open my Upwork profile",
    run: () => ({ lines: ["→ opening Upwork profile"], href: UPWORK_URL })
  },
  { name: "trading", usage: "trading", summary: "trading systems", run: () => opened("/trading", "Trading systems") },
  {
    name: "resume",
    usage: "resume [--pdf]",
    summary: "experience, or the CV as PDF",
    run: (args) =>
      args.includes("--pdf")
        ? { lines: ["→ opening resume.pdf"], href: "resume.pdf" }
        : opened("/#experience", "Experience")
  },
  {
    name: "ls",
    usage: "ls projects",
    summary: "list projects",
    run: (args) =>
      args[0] === "projects"
        ? { lines: projectShowcase.map((project) => `${project.slug.padEnd(28)}${project.title}`) }
        : { lines: ["usage: ls projects"] }
  },
  { name: "open", usage: "open <project>", summary: "open a project or case study", run: (args) => openProject(args[0]) },
  { name: "cat", usage: "cat <project>", summary: "print a project summary here", run: (args) => catProject(args[0]) },
  { name: "lab", usage: "lab", summary: "order-flow playground", run: () => ({ lines: ["lab: coming soon"] }) },
  {
    name: "contact",
    usage: "contact",
    summary: "how to reach me",
    run: () => ({ lines: [`email   ${EMAIL}`, "form    /#contact"] })
  },
  {
    name: "man",
    usage: "man <command>",
    summary: "explain a command",
    run: (args) => {
      if (!args[0]) return { lines: ["usage: man <command>"] };
      const command = COMMANDS.find((item) => item.name === args[0] && !item.hidden);
      return command
        ? { lines: [`${command.usage} — ${command.summary}`] }
        : { lines: [`man: no manual entry for ${args[0]}`] };
    }
  },
  {
    name: "shortcuts",
    usage: "shortcuts on|off",
    summary: "single-key shortcuts (` and 1–5)",
    run: (args) => {
      if (args[0] === "on") return { lines: ["keyboard shortcuts on"], shortcuts: true };
      if (args[0] === "off") return { lines: ["keyboard shortcuts off — use the >_ Shell button and the menu"], shortcuts: false };
      return { lines: ["usage: shortcuts on|off"] };
    }
  },
  { name: "clear", usage: "clear", summary: "clear the screen", run: () => ({ lines: [], clear: true }) },
  { name: "exit", usage: "exit", summary: "close the shell", run: () => ({ lines: [], close: true }) },
  {
    name: "sudo",
    hidden: true,
    usage: "sudo <command>",
    summary: "",
    run: (args) =>
      args[0] === "hire"
        ? { lines: ["[sudo] permission granted.", "→ opened Work with me"], navigate: "/work-with-me" }
        : { lines: ["nice try. (hint: sudo hire)"] }
  }
];

const visible = COMMANDS.filter((command) => !command.hidden);
const helpLines = () => visible.map((command) => `${command.usage.padEnd(18)}${command.summary}`);

export const commandNames = visible.map((command) => command.name);

export const runCommand = (input) => {
  const [name, ...args] = input.trim().toLowerCase().split(/\s+/);
  if (!name) return { lines: [] };
  const command = COMMANDS.find((item) => item.name === name);
  if (!command) return { lines: [`command not found: ${name}. Try help`] };
  return command.run(args);
};

const ARGUMENTS = {
  open: () => projectShowcase.map((project) => project.slug),
  cat: () => projectShowcase.map((project) => project.slug),
  ls: () => ["projects"],
  man: () => commandNames,
  shortcuts: () => ["on", "off"]
};

// Returns full replacement inputs that complete `input`, e.g. "open fl" → ["open flowpulse"].
export const complete = (input) => {
  const text = input.trimStart().toLowerCase();
  const [first = "", ...rest] = text.split(/\s+/);
  if (rest.length === 0) return commandNames.filter((name) => name.startsWith(first));
  if (rest.length > 1 || !ARGUMENTS[first]) return [];
  return ARGUMENTS[first]()
    .filter((option) => option.startsWith(rest[0]))
    .map((option) => `${first} ${option}`);
};
