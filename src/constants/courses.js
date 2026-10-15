// The AI course catalogue.
//
// Every card shows the shared COURSE_FEE range (defined below).
//
// Payment: each course's Stripe payment link is managed in the admin
// dashboard (/admin -> Payment links) and looked up by `id` on the /payment
// page, so the ids here must not change once links are set.
export const COURSES = [
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    image: "/images/courses/ai-machine-learning.webp",
    tagline: "Flagship Programme",
    summary:
      "A mentor-led programme that takes you from Python fundamentals to deploying your own models — built around what employers are hiring for right now.",
    duration: "6 months",
    level: "Beginner to Advanced",
    mode: "Live online",
    highlights: [
      "Python, data handling and the maths that machine learning actually uses",
      "Supervised and unsupervised learning, end to end",
      "Deep learning: neural networks, CNNs and transformers",
      "Natural language processing and generative AI with LLMs",
      "Taking a model to production — MLOps, deployment and monitoring",
      "A capstone project, portfolio review and interview preparation",
    ],
  },
  {
    id: "gen-ai",
    title: "Generative AI & LLM Engineering",
    image: "/images/courses/generative-ai.webp",
    tagline: "Most In Demand",
    summary:
      "Build real applications on top of large language models — from prompt design to retrieval-augmented chatbots and AI agents that work with your own data.",
    duration: "6 months",
    level: "Intermediate",
    mode: "Live online",
    highlights: [
      "How large language models work: tokens, embeddings and transformers",
      "Prompt engineering and structured outputs",
      "Retrieval-augmented generation (RAG) with vector databases",
      "Building AI agents that use tools and APIs",
      "Fine-tuning, evaluation and keeping LLM apps safe",
      "A deployed GenAI capstone project for your portfolio",
    ],
  },
  {
    id: "data-science-ai",
    title: "Data Science & AI Analytics",
    image: "/images/courses/data-science.webp",
    tagline: "Career Track",
    summary:
      "Turn raw data into decisions. Learn the analysis, visualisation and predictive modelling skills data teams use every day, with AI tools built in.",
    duration: "6 months",
    level: "Beginner to Intermediate",
    mode: "Live online",
    highlights: [
      "Python, Pandas and SQL for working with real datasets",
      "Statistics and exploratory data analysis",
      "Dashboards and data visualisation",
      "Predictive modelling with scikit-learn",
      "Using AI assistants to speed up analysis",
      "An industry case-study project and interview preparation",
    ],
  },
  {
    id: "mlops-cloud-ai",
    title: "MLOps & Cloud AI",
    image: "/images/courses/mlops-cloud.webp",
    tagline: "Engineering Track",
    summary:
      "Learn to ship and run AI in production on the cloud — the skills that turn a working notebook into a reliable, monitored service.",
    duration: "6 months",
    level: "Intermediate",
    mode: "Live online",
    highlights: [
      "AI services on AWS, Azure and Google Cloud",
      "Packaging models with Docker and serving them as APIs",
      "CI/CD pipelines for machine learning",
      "Model monitoring, drift detection and retraining",
      "Cost, security and scaling for AI workloads",
      "An end-to-end cloud deployment project",
    ],
  },
  {
    id: "ai-cybersecurity",
    title: "AI for Cybersecurity",
    image: "/images/courses/cybersecurity.webp",
    tagline: "Specialist Track",
    summary:
      "Use machine learning to detect threats faster and understand how attackers target AI systems — a growing specialism in every security team.",
    duration: "6 months",
    level: "Intermediate",
    mode: "Live online",
    highlights: [
      "Security fundamentals for AI practitioners",
      "Anomaly and intrusion detection with machine learning",
      "Phishing and malware classification",
      "Securing AI systems: prompt injection and adversarial attacks",
      "AI-assisted incident response",
      "A hands-on threat-detection project",
    ],
  },
  {
    id: "python-for-ai",
    title: "Python for AI",
    image: "/images/courses/python-for-ai.webp",
    tagline: "Beginner Friendly",
    summary:
      "Start from zero and learn the Python every AI course assumes you know — the ideal first step before moving into machine learning or generative AI.",
    duration: "6 months",
    level: "Beginner",
    mode: "Live online",
    highlights: [
      "Python syntax, data types and control flow",
      "Functions, modules and writing clean code",
      "NumPy and Pandas for working with data",
      "Calling AI APIs from your own Python scripts",
      "Git, GitHub and setting up a developer workflow",
      "Mini projects that build a starter portfolio",
    ],
  },
];

// Every course card shows the same fee range.
export const COURSE_FEE = "$1,000 - $1,400";

// How much experience a learner is starting with, asked on the enrolment
// form so a mentor can be matched before the first session.
export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Complete beginner" },
  { value: "some-coding", label: "Some coding experience" },
  { value: "working-professional", label: "Working IT professional" },
  { value: "advanced", label: "Already working with data or ML" },
];

// Classes run Monday to Friday only.
export const BATCH_OPTIONS = [
  { value: "weekday", label: "Monday – Friday" },
];

// Turn a stored value back into the label shown on the form, so the enquiry
// email reads the way the learner saw it rather than as a slug.
export const labelOf = (options, value) =>
  (options.find((o) => o.value === value) || {}).label || value;
