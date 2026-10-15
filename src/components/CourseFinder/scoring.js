import { COURSES } from "../../constants/courses";

// The course finder's questions and its scoring, kept deliberately simple and
// visible, so the match can be explained in one sentence: every answer adds
// points to the courses that fit it, and the course with the most points
// wins (ties go to catalogue order).
//
// Weights are keyed by course id; an id that is not in COURSES is ignored,
// so renaming or removing a course cannot break the finder.

export const QUESTIONS = [
  {
    id: "start",
    legend: "How much coding experience do you have?",
    options: [
      {
        // Values match EXPERIENCE_LEVELS on the enrolment form.
        value: "beginner",
        label: "New to coding",
        detail: "I haven't written code before",
        reason: "you are new to coding",
      },
      {
        value: "some-coding",
        label: "Some coding",
        detail: "I've done a little programming",
        reason: "you have some coding behind you",
      },
      {
        value: "working-professional",
        label: "IT professional",
        detail: "I work in IT or software",
        reason: "you already work in IT",
      },
      {
        value: "advanced",
        label: "Already in data or ML",
        detail: "I already work with data or machine learning",
        reason: "you already work with data or ML",
      },
    ],
  },
  {
    id: "build",
    legend: "What do you want to build?",
    options: [
      {
        value: "llm",
        label: "Apps with LLMs & agents",
        detail: "Chatbots, RAG assistants, AI agents that use tools",
        reason: "you want to build with LLMs and agents",
      },
      {
        value: "models",
        label: "Models & ML systems",
        detail: "Train, evaluate and deploy models, including vision",
        reason: "you want to build models and ML systems",
      },
      {
        value: "insights",
        label: "Insights from data",
        detail: "Analysis, dashboards and predictions that drive decisions",
        reason: "you want to turn data into insights",
      },
      {
        value: "secure-deploy",
        label: "Secure & deploy AI at scale",
        detail: "Pipelines, cloud, monitoring and AI security",
        reason: "you want to secure and deploy AI at scale",
      },
      {
        value: "productivity",
        label: "Boost my productivity, no code",
        detail: "Use AI assistants well in the job you already do",
        reason: "you want AI productivity without code",
      },
    ],
  },
  {
    id: "focus",
    legend: "What is your main goal?",
    options: [
      {
        value: "switch",
        label: "A career switch",
        detail: "Move into an AI, ML or data role",
        reason: "you are planning a career switch",
      },
      {
        value: "upskill",
        label: "Upskill in my current role",
        detail: "Bring AI into the work you already do",
        reason: "you want to upskill where you are",
      },
      {
        value: "first-job",
        label: "My first tech job",
        detail: "Build a portfolio and land a first role",
        reason: "you are going for your first tech job",
      },
    ],
  },
];

// answer -> { courseId: points }
const WEIGHTS = {
  start: {
    beginner: { "python-for-ai": 3, "prompt-eng": 3, "data-science-ai": 2, "ai-ml": 1 },
    "some-coding": {
      "ai-ml": 3,
      "data-science-ai": 2,
      "gen-ai": 2,
      "python-for-ai": 1,
      "computer-vision": 1,
    },
    "working-professional": {
      "mlops-cloud-ai": 3,
      "ai-cybersecurity": 3,
      "gen-ai": 2,
      "ai-agents": 2,
      "ai-ml": 1,
    },
    advanced: { "gen-ai": 3, "ai-agents": 3, "computer-vision": 3, "mlops-cloud-ai": 2 },
  },
  build: {
    llm: { "gen-ai": 8, "ai-agents": 7, "prompt-eng": 2, "python-for-ai": 2 },
    models: { "ai-ml": 8, "computer-vision": 6, "data-science-ai": 2 },
    insights: { "data-science-ai": 8, "ai-ml": 2, "python-for-ai": 2 },
    "secure-deploy": { "mlops-cloud-ai": 7, "ai-cybersecurity": 7, "python-for-ai": 3 },
    productivity: { "prompt-eng": 10, "ai-agents": 3 },
  },
  focus: {
    switch: {
      "ai-ml": 2,
      "data-science-ai": 2,
      "python-for-ai": 1,
      "gen-ai": 1,
      "mlops-cloud-ai": 1,
    },
    upskill: {
      "prompt-eng": 2,
      "ai-agents": 2,
      "ai-cybersecurity": 2,
      "mlops-cloud-ai": 1,
      "gen-ai": 1,
    },
    "first-job": { "python-for-ai": 2, "data-science-ai": 2, "ai-ml": 1 },
  },
};

// Level fit: courses pitched at "Intermediate" assume you can already code,
// and pure beginner courses are a step back for someone already in data/ML.
const levelAdjustment = (course, start) => {
  if (start === "beginner" && course.level === "Intermediate") return -5;
  if (start === "advanced" && course.level === "Beginner") return -2;
  return 0;
};

export const optionFor = (questionId, value) =>
  (QUESTIONS.find((q) => q.id === questionId)?.options || []).find((o) => o.value === value);

// Returns every course with its score and the answers that pointed to it,
// best match first.
export const rankCourses = (answers) =>
  COURSES.map((course, order) => {
    let score = levelAdjustment(course, answers.start);
    const reasons = [];
    QUESTIONS.forEach((q) => {
      const points = WEIGHTS[q.id]?.[answers[q.id]]?.[course.id] || 0;
      score += points;
      if (points > 0) {
        const option = optionFor(q.id, answers[q.id]);
        if (option) reasons.push(option.reason);
      }
    });
    return { course, score, reasons, order };
  }).sort((a, b) => b.score - a.score || a.order - b.order);

// "a", "a and b", "a, b and c"
export const joinReasons = (items) => {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};
