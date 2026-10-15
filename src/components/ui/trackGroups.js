import { COURSES, TRACKS } from "../../constants/courses";

// The catalogue grouped by track, in TRACKS order ("all" is a filter, not a
// track). Tracks with no courses are left out. Used by the header's course
// menu and the footer.
//
// `blurb` is a one-line description of the track written for the site; a
// track added to TRACKS without one simply shows no line.
const BLURBS = {
  foundations: "For beginners: Python, data basics and everyday AI tools.",
  core: "Machine learning, computer vision and AI security.",
  genai: "Build applications and agents with large language models.",
  data: "Analyse data, then deploy and run models in production.",
};

export const TRACK_GROUPS = TRACKS.filter((t) => t.value !== "all")
  .map((t) => ({
    ...t,
    blurb: BLURBS[t.value] || "",
    courses: COURSES.filter((c) => c.track === t.value),
  }))
  .filter((t) => t.courses.length > 0);
