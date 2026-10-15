// The AI course catalogue.
//
// Every card shows the shared COURSE_FEE range (defined below).
//
// Payment: each course's Stripe payment link is managed in the admin
// dashboard (/admin -> Payment links) and looked up by `id` on the /payment
// page, so the ids here must not change once links are set.
//
// Fields
//   id          stable slug (payment links, URL hashes, enrolment emails)
//   title       course name
//   image       card / detail photo (credits in public/images/CREDITS.md)
//   track       which catalogue filter the course sits under (see TRACKS)
//   tagline     short badge text
//   summary     one or two sentences for cards
//   duration, level, mode
//   role        the job the course prepares you for
//   tools       technologies used, shown as chips
//   highlights  what the curriculum covers, in order
//   project     the capstone you finish with
//   accent      (unused by the current theme; kept for future styling)
export const COURSES = [
  {
    id: "ai-ml",
    title: "AI & Machine Learning Engineering",
    image: "/images/courses/ai-ml.webp",
    track: "core",
    tagline: "Flagship",
    summary:
      "From Python and the maths behind models to training, evaluating and shipping machine-learning systems that solve real problems.",
    duration: "6 months",
    level: "Beginner to Advanced",
    mode: "Live online",
    role: "Machine Learning Engineer",
    tools: ["Python", "NumPy", "scikit-learn", "PyTorch", "FastAPI"],
    highlights: [
      "Python, data handling and the maths machine learning actually uses",
      "Supervised and unsupervised learning, end to end",
      "Deep learning with PyTorch: neural networks, CNNs and transformers",
      "Model evaluation, tuning and avoiding data leakage",
      "Serving models behind an API and monitoring them in production",
      "Capstone, portfolio review and interview preparation",
    ],
    project: "An end-to-end prediction service, trained, deployed and monitored.",
    accent: "violet",
  },
  {
    id: "gen-ai",
    title: "Generative AI & LLM Applications",
    image: "/images/courses/gen-ai.webp",
    track: "genai",
    tagline: "Most in demand",
    summary:
      "Build production-ready apps on large language models: prompting, retrieval over your own data, evaluation and guardrails.",
    duration: "6 months",
    level: "Intermediate",
    mode: "Live online",
    role: "Generative AI Engineer",
    tools: ["OpenAI & Claude APIs", "LangChain", "Vector DBs", "Hugging Face", "Python"],
    highlights: [
      "How LLMs work: tokens, embeddings, attention and context windows",
      "Prompt design, structured outputs and function calling",
      "Retrieval-augmented generation (RAG) with vector databases",
      "Fine-tuning and adapting open models",
      "Evaluating LLM apps and keeping them safe and reliable",
      "A deployed GenAI product for your portfolio",
    ],
    project: "A RAG assistant that answers questions over a real document set.",
    accent: "pink",
  },
  {
    id: "ai-agents",
    title: "Agentic AI & Automation",
    image: "/images/courses/ai-agents.webp",
    track: "genai",
    tagline: "New",
    summary:
      "Design AI agents that plan, use tools and APIs, and automate multi-step work, with the testing and safety checks that production systems need.",
    duration: "6 months",
    level: "Intermediate",
    mode: "Live online",
    role: "AI Automation Engineer",
    tools: ["Python", "Tool calling", "MCP", "LangGraph", "n8n"],
    highlights: [
      "What makes a system agentic: planning, memory and tool use",
      "Function calling and connecting agents to APIs and databases",
      "Multi-step workflows and multi-agent patterns",
      "Workflow automation for business processes",
      "Testing, observability and human-in-the-loop controls",
      "Capstone: an agent that completes a real task end to end",
    ],
    project: "A tool-using agent that automates a multi-step business workflow.",
    accent: "cyan",
  },
  {
    id: "prompt-eng",
    title: "Prompt Engineering & AI Productivity",
    image: "/images/courses/prompt-eng.webp",
    track: "foundations",
    tagline: "No coding needed",
    summary:
      "Get reliable, high-quality results from AI assistants at work for writing, research, analysis and automation, without writing code.",
    duration: "6 months",
    level: "Beginner",
    mode: "Live online",
    role: "AI-skilled professional in any role",
    tools: ["ChatGPT", "Claude", "Gemini", "Copilot", "No-code automation"],
    highlights: [
      "How AI assistants work, and where they go wrong",
      "Prompt patterns: roles, examples, constraints and step-by-step reasoning",
      "Research, writing and data analysis with AI",
      "Building reusable prompt libraries and custom assistants",
      "No-code automations that connect AI to everyday tools",
      "Responsible use: privacy, accuracy and checking the output",
    ],
    project: "A personal AI toolkit that automates part of your own job.",
    accent: "violet",
  },
  {
    id: "computer-vision",
    title: "Computer Vision & Multimodal AI",
    image: "/images/courses/computer-vision.webp",
    track: "core",
    tagline: "Specialist",
    summary:
      "Teach machines to see: image classification, object detection and segmentation, through to models that combine vision and language.",
    duration: "6 months",
    level: "Intermediate",
    mode: "Live online",
    role: "Computer Vision Engineer",
    tools: ["PyTorch", "OpenCV", "YOLO", "Vision transformers", "Python"],
    highlights: [
      "Images as data: OpenCV and preprocessing pipelines",
      "Convolutional networks and transfer learning",
      "Object detection and segmentation in practice",
      "Vision transformers and multimodal (image + text) models",
      "Optimising models for edge and real-time use",
      "Capstone: a working vision application",
    ],
    project: "A real-time object detection app running on video.",
    accent: "cyan",
  },
  {
    id: "data-science-ai",
    title: "Data Science & AI Analytics",
    image: "/images/courses/data-science.webp",
    track: "data",
    tagline: "Career track",
    summary:
      "Turn raw data into decisions with analysis, visualisation and predictive models, using AI tools at every step.",
    duration: "6 months",
    level: "Beginner to Intermediate",
    mode: "Live online",
    role: "Data Scientist / Analyst",
    tools: ["Python", "Pandas", "SQL", "Power BI", "scikit-learn"],
    highlights: [
      "Python, Pandas and SQL on real datasets",
      "Statistics and exploratory data analysis",
      "Dashboards and data storytelling",
      "Predictive modelling and experiment design",
      "Using AI assistants to speed up analysis",
      "A portfolio of analysis projects",
    ],
    project: "An analytics case study with a live dashboard and forecast.",
    accent: "violet",
  },
  {
    id: "mlops-cloud-ai",
    title: "MLOps & Cloud AI",
    image: "/images/courses/mlops-cloud.webp",
    track: "data",
    tagline: "Engineering track",
    summary:
      "Take models from notebook to production on the cloud: pipelines, containers, CI/CD, monitoring and cost control.",
    duration: "6 months",
    level: "Intermediate",
    mode: "Live online",
    role: "MLOps / AI Platform Engineer",
    tools: ["Docker", "Kubernetes", "MLflow", "AWS / Azure / GCP", "GitHub Actions"],
    highlights: [
      "Reproducible ML: versioning data, code and models",
      "Containers and Kubernetes for ML workloads",
      "CI/CD pipelines for training and deployment",
      "Serving LLMs and models on cloud AI platforms",
      "Monitoring, drift detection and cost control",
      "Capstone: a fully automated ML pipeline",
    ],
    project: "A CI/CD pipeline that retrains and redeploys a model automatically.",
    accent: "pink",
  },
  {
    id: "ai-cybersecurity",
    title: "AI Security Engineering",
    image: "/images/courses/ai-security.webp",
    track: "core",
    tagline: "Specialist",
    summary:
      "Use AI to detect threats faster, and learn to secure AI systems themselves against prompt injection, data leaks and model attacks.",
    duration: "6 months",
    level: "Intermediate",
    mode: "Live online",
    role: "AI Security Engineer",
    tools: ["Python", "SIEM", "Anomaly detection", "OWASP LLM Top 10", "Red teaming"],
    highlights: [
      "Security fundamentals for AI practitioners",
      "Machine learning for threat and anomaly detection",
      "Securing LLM apps: prompt injection, data leakage and jailbreaks",
      "Adversarial attacks on models and how to defend against them",
      "AI governance, risk and compliance",
      "Capstone: red-team and harden an AI application",
    ],
    project: "A security assessment and hardening plan for a live LLM app.",
    accent: "cyan",
  },
  {
    id: "python-for-ai",
    title: "Python for AI: Foundations",
    image: "/images/courses/python-for-ai.webp",
    track: "foundations",
    tagline: "Start here",
    summary:
      "Learn to code from zero with Python, then use it to work with data and call AI models. It's the starting point for every other track.",
    duration: "6 months",
    level: "Beginner",
    mode: "Live online",
    role: "Junior Python / AI Developer",
    tools: ["Python", "Jupyter", "Git & GitHub", "APIs", "Pandas"],
    highlights: [
      "Programming fundamentals in Python",
      "Working with files, data and APIs",
      "Pandas and data handling basics",
      "Calling AI APIs from your own scripts",
      "Git, GitHub and a professional developer workflow",
      "Mini projects that build a starter portfolio",
    ],
    project: "A small AI-powered app built and published on GitHub.",
    accent: "violet",
  },
];

// Catalogue filters on the AI Courses page.
export const TRACKS = [
  { value: "all", label: "All courses" },
  { value: "foundations", label: "Foundations" },
  { value: "core", label: "Core AI" },
  { value: "genai", label: "Generative & Agentic AI" },
  { value: "data", label: "Data & MLOps" },
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
