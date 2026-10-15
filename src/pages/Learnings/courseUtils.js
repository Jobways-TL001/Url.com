// Small helpers shared by the course list (/courses) and the course pages
// (/courses/:courseId). Everything is derived from src/constants/courses.js.
import { COURSES, TRACKS, labelOf } from "../../constants/courses";

// Level filter options. A course's level is free text such as "Beginner" or
// "Beginner to Advanced"; a range covers every level in between.
export const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function levelsOf(course) {
  const text = String(course.level || "").toLowerCase();
  const found = LEVELS.map((l, i) => (text.includes(l.value) ? i : -1)).filter(
    (i) => i >= 0
  );
  if (!found.length) return [];
  const from = Math.min(...found);
  const to = Math.max(...found);
  return LEVELS.slice(from, to + 1).map((l) => l.value);
}

export const trackLabel = (track) => labelOf(TRACKS, track);

export const findCourse = (id) => COURSES.find((c) => c.id === id) || null;

// Text a search matches against: title, summary, tools and role (plus the
// tagline and track name, which people also type).
export function matchesQuery(course, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    course.title,
    course.summary,
    course.role,
    course.tagline,
    trackLabel(course.track),
    ...(course.tools || []),
  ]
    .join(" ")
    .toLowerCase();
  // Every word typed must appear somewhere, in any order.
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

// Up to `count` other courses: same track first, then the rest in list
// order.
export function relatedCourses(course, count = 3) {
  const others = COURSES.filter((c) => c.id !== course.id);
  return [
    ...others.filter((c) => c.track === course.track),
    ...others.filter((c) => c.track !== course.track),
  ].slice(0, count);
}

// What every course comes with (only claims the business already makes).
export const INCLUDED = [
  "Live online classes, Monday to Friday",
  "A dedicated industry mentor",
  "Hands-on projects and a capstone",
  "Career advice, interview and job support",
  "100% placement support",
];

export const pad2 = (n) => String(n).padStart(2, "0");

// "Beginner to Advanced" -> "Beginner to advanced".
export const sentenceCase = (text) => {
  const s = String(text || "").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};
