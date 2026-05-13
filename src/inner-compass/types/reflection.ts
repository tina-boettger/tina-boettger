export interface ReflectionCategory {
  selected: string[];
  custom: string;
}

export interface ReflectionData {
  energy: ReflectionCategory;
  strengths: ReflectionCategory;
  impact: ReflectionCategory;
  recognition: ReflectionCategory;
  environment: ReflectionCategory;
}

export const WORD_LISTS = {
  energy: [
    "building", "solving", "teaching", "designing", "exploring", "coding",
    "fixing", "learning", "creating", "organizing", "analyzing", "structuring",
    "improving", "documenting", "testing", "supporting", "mentoring", "planning",
    "understanding", "repairing",
  ],
  strengths: [
    "clarity", "logic", "pattern-recognition", "empathy", "reliability", "speed",
    "accuracy", "problem-solving", "memory", "persistence", "curiosity", "design",
    "detail", "listening", "structure", "calm", "language", "systems-thinking",
    "planning", "adaptability",
  ],
  impact: [
    "clarity", "order", "trust", "stability", "organization", "humor",
    "ideas", "understanding", "precision", "reliability", "structure", "insight",
    "perspective", "patience", "safety", "teamwork", "calm", "creativity",
    "transparency", "momentum",
  ],
  recognition: [
    "speed", "flexibility", "talking", "presentation", "teamwork", "leadership",
    "long hours", "availability", "results", "cost-saving", "creativity", "stability",
    "reliability", "helping", "visibility", "deadlines", "compliance", "innovation",
    "efficiency", "data",
  ],
  environment: [
    "clear tasks", "flexible time", "sensory quiet", "too much noise", "unclear priorities",
    "many switches", "long meetings", "social pressure", "autonomy", "micro interruptions",
    "predictable routine", "helpful feedback", "too many surprises", "body fatigue",
    "enough rest",
  ],
};
