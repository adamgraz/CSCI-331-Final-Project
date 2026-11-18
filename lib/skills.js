// Finds which skills a piece of text mentions, such as a job posting.
// It's a plain function with no database, so scripts/check-skills.mjs can test it on its own.

// Each skill is { name, aliases }, where aliases is text like "js, ecmascript".
// Returns the skills whose name or any alias appears in the text.
export function findSkills(text, skills) {
  return skills.filter((skill) => termsFor(skill).some((term) => mentions(text, term)));
}

function termsFor(skill) {
  const aliases = (skill.aliases ?? "").split(",").map((a) => a.trim());
  return [skill.name, ...aliases].filter(Boolean);
}

// True when the term appears as a whole word, ignoring capital letters.
// "Whole word" means no letter or digit right before or after it. That keeps Java from
// matching inside JavaScript, and unlike \b it still works for names like C++ and Node.js.
// A period right before the term also blocks it, so the js in "Node.js" isn't JavaScript.
// ponytail: a one-letter skill like "C" would also match the C in "C++" or "C#".
function mentions(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![a-z0-9.])${escaped}(?![a-z0-9])`, "i").test(text);
}
