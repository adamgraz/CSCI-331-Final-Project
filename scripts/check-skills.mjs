// Checks that skill matching works. Run it with npm run check:skills.
// Prints "All skill checks passed" or stops at the first check that fails.
import assert from "node:assert/strict";
import { findSkills } from "../lib/skills.js";

const skills = [
  { name: "JavaScript", aliases: "js, ecmascript" },
  { name: "Java", aliases: "" },
  { name: "C++", aliases: "cpp" },
  { name: "Node.js", aliases: "node" },
  { name: "SQL", aliases: "mysql" },
];

function names(text) {
  return findSkills(text, skills).map((s) => s.name);
}

assert.deepEqual(names("We use JavaScript daily."), ["JavaScript"], "Java must not match inside JavaScript");
assert.deepEqual(names("Java and JS"), ["JavaScript", "Java"], "an alias counts as the skill");
assert.deepEqual(names("strong c++ skills"), ["C++"], "capital letters don't matter, and + is allowed");
assert.deepEqual(names("APIs in Node.js."), ["Node.js"], "a period after the name still matches");
assert.deepEqual(names("MySQL databases"), ["SQL"], "alias found, and SQL alone isn't inside MySQL");
assert.deepEqual(names("nothing relevant, like javascripting"), [], "longer words don't match");
assert.deepEqual(names(""), [], "empty text finds nothing");

console.log("All skill checks passed");
