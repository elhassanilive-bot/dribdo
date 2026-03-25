const fs = require("fs");
const path = require("path");

const root = path.resolve("c:/D - Project-Web/Arzapress");
const exts = new Set([".js", ".jsx", ".ts", ".tsx", ".md", ".css", ".sql", ".mjs"]);
const replacements = [
  ["دريدود", "دريدود"],
  ["دريدود", "دريدود"],
  ["Dridoud", "Arzapress"],
  ["dridoud", "arzapress"],
];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!exts.has(path.extname(entry.name).toLowerCase())) continue;
    let content = fs.readFileSync(full, "utf8");
    let updated = content;
    for (const [target, replacement] of replacements) {
      updated = updated.split(target).join(replacement);
    }
    if (updated !== content) {
      fs.writeFileSync(full, updated, "utf8");
    }
  }
}

walk(root);
