import { LeadInput } from "@/lib/types";

export interface EvaluationTestCase {
  id: string;
  input: LeadInput;
  expected: string[];
}

export const evaluationTestCases: EvaluationTestCase[] = [
  {
    id: "course_creator",
    input: {
      fullName: "Avery Brooks",
      email: "avery@example.com",
      linkedinUrl: "https://www.linkedin.com/in/averybrooks",
      role: "Course Creator",
      companyName: "Avery Teaches Design",
      companyWebsite: "https://example.com",
      primaryGoal: "Launch courses with AI",
    },
    expected: ["Mentions launching a course", "Mentions audience or student interest", "Avoids unsupported enterprise claims", "Includes meeting CTA"],
  },
  {
    id: "small_school",
    input: {
      fullName: "Morgan Lee",
      email: "morgan@example.com",
      linkedinUrl: "https://www.linkedin.com/in/morganlee",
      role: "Director of Online Learning",
      companyName: "Northstar Learning",
      companyWebsite: "https://example.com",
      primaryGoal: "Get enrollment insights",
    },
    expected: ["Mentions student enrollment", "Mentions online learning", "Keeps tone professional", "Does not invent student numbers"],
  },
  {
    id: "education_saas",
    input: {
      fullName: "Taylor Chen",
      email: "taylor@example.com",
      linkedinUrl: "https://www.linkedin.com/in/taylorchen",
      role: "Founder",
      companyName: "SkillPath",
      companyWebsite: "https://example.com",
      primaryGoal: "Automate student outreach",
    },
    expected: ["Mentions automated follow up", "Mentions personalization", "Explains CoursePilot fit", "Avoids unsupported growth claims"],
  },
];
