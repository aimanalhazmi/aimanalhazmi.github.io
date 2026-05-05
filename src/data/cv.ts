export const experience = [
  {
    role: 'Software & Data Engineering (Working Student)',
    org: 'Computacenter AG & Co. oHG',
    period: 'Sep 2022 – Present',
    bullets: [
      'Developing and optimizing backend features',
      'Integrating and processing data from various sources',
      'Analyzing data to support decision-making processes',
    ],
  },
  {
    role: 'Volunteer IT Administrator',
    org: 'Association of Yemeni Students in Germany (VJSD)',
    period: 'Jun 2023 – May 2025',
    bullets: [
      'Automated internal workflows',
      "Developed and maintained the association's website",
    ],
  },
  {
    role: 'IT Administrator',
    org: 'Franz & Wach Personalservice GmbH',
    period: 'Jun 2022 – Sep 2022',
    bullets: ['Managed IP telephony (CloudPBX) and first-level technical support.'],
  },
];

export const education = [
  {
    school: 'Technical University of Berlin',
    degree: 'MSc Computer Science',
    period: 'Oct 2024 – 2026',
    detail: 'Focus: Data Science & Engineering.',
  },
  {
    school: 'Free University of Berlin',
    degree: 'BSc Computer Science',
    period: 'Oct 2020 – Sep 2024',
    detail: 'Thesis: Brand Detection on Garments (Computer Vision).',
  },
];

export type Skill = {
  name: string;
  /** simple-icons slug. Only set when a real brand logo exists. See https://simpleicons.org */
  icon?: string;
  /** Emoji to use as the icon (e.g. flag for languages). Ignored if `icon` is set. */
  emoji?: string;
};

export type SkillGroup = {
  group: string;
  items: Skill[];
};

export const skills: SkillGroup[] = [
  {
    group: 'Programming',
    items: [
      { name: 'Python', icon: 'python' },
      { name: 'Java' },
      { name: 'SQL' },
      { name: 'R', icon: 'r' },
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'PHP', icon: 'php' },
      { name: 'C', icon: 'c' },
      { name: 'Haskell', icon: 'haskell' },
    ],
  },
  {
    group: 'Generative AI & LLMs',
    items: [
      { name: 'LangChain', icon: 'langchain' },
      { name: 'RAG' },
      { name: 'LoRA / QLoRA' },
      { name: 'MCP' },
      { name: 'Ollama', icon: 'ollama' },
      { name: 'LM Studio' },
      { name: 'Llama.cpp' },
    ],
  },
  {
    group: 'AI / Machine Learning',
    items: [
      { name: 'PyTorch', icon: 'pytorch' },
      { name: 'TensorFlow', icon: 'tensorflow' },
      { name: 'HuggingFace', icon: 'huggingface' },
      { name: 'Neural Networks' },
    ],
  },
  {
    group: 'Data Science & Engineering',
    items: [
      { name: 'Data Science Lifecycle' },
      { name: 'Data Integration' },
      { name: 'Preprocessing' },
      { name: 'Statistical Analysis' },
      { name: 'Model Training & Evaluation' },
    ],
  },
  {
    group: 'Backend & DevOps',
    items: [
      { name: 'FastAPI', icon: 'fastapi' },
      { name: 'Flask', icon: 'flask' },
      { name: 'Spring Boot', icon: 'springboot' },
      { name: 'Docker', icon: 'docker' },
      { name: 'GitHub', icon: 'github' },
      { name: 'GitLab', icon: 'gitlab' },
      { name: 'Jira', icon: 'jira' },
      { name: 'Linux', icon: 'linux' },
    ],
  },
  {
    group: 'Languages',
    items: [
      { name: 'Arabic (Native)', emoji: '🇾🇪' },
      { name: 'German (Fluent)', emoji: '🇩🇪' },
      { name: 'English (Advanced)', emoji: '🇬🇧' },
    ],
  },
];

export type Society = {
  role: string;
  org: string;
  url?: string;
  logo?: string;
};

export const societies: Society[] = [
  {
    role: 'Board Member',
    org: 'VJSD e.V.',
    url: 'https://vjsd.org/',
    logo: '/img/societies/vjsd.png',
  },
  {
    role: 'Member',
    org: 'DJIV e.V.',
    url: 'https://djiv.de/',
    logo: '/img/societies/djiv.png',
  },
];

export type Interest = {
  name: string;
  emoji: string;
  category: 'Tech' | 'Creative' | 'Knowledge' | 'Lifestyle';
};

export const interests: Interest[] = [
  { name: 'AI', emoji: '🤖', category: 'Tech' },
  { name: 'LLMs', emoji: '💬', category: 'Tech' },
  { name: 'Computer Vision', emoji: '👁️', category: 'Tech' },
  { name: 'Design', emoji: '🎨', category: 'Creative' },
  { name: 'Marketing', emoji: '📣', category: 'Creative' },
  { name: 'Economics', emoji: '📈', category: 'Knowledge' },
  { name: 'Arabic Literature', emoji: '📖', category: 'Knowledge' },
  { name: 'Chess', emoji: '♟️', category: 'Lifestyle' },
  { name: 'Gym', emoji: '🏋️', category: 'Lifestyle' },
  { name: 'Volunteering', emoji: '🤝', category: 'Lifestyle' },
];
