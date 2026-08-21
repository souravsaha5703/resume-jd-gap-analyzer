import { z } from 'zod';

export const resumeSchema = z.object({
    skills: z.array(z.string()).describe("Technical, Courseword and soft skills mentioned"),
    experience: z.array(
        z.object({
            role: z.string(),
            company: z.string(),
            duration: z.string().describe("e.g., 'Jan 2023 - Present'"),
            bullets: z.array(z.string()).describe("Key responsibilities/achievements"),
        })
    ),
    education: z.array(
        z.object({
            degree: z.string(),
            institution: z.string(),
            year: z.string().optional(),
        })
    ),
    projects: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
            tech_stack: z.array(z.string()),
        })
    ),
    certifications: z.array(z.string()).optional(),
});

export const jdSchema = z.object({
    must_have_skills: z.array(z.string()),
    nice_to_have_skills: z.array(z.string()),
    experience_level: z.string().describe("e.g., 'Entry level', '2-4 years', 'Senior'"),
    key_responsibilities: z.array(z.string()),
});

export const analysisSchema = z.object({
    match_score: z
        .number()
        .min(0)
        .max(100)
        .describe("Overall match score between resume and job description, 0-100"),

    matched_skills: z
        .array(z.string())
        .describe("Skills/technologies present in both the resume and the JD requirements, using JD terminology"),

    missing_skills: z
        .array(z.string())
        .describe("Skills the JD requires that do not appear anywhere in the resume"),

    partial_matches: z
        .array(
            z.object({
                skill: z.string().describe("The JD-required skill that is only partially matched"),
                note: z.string().describe("Brief explanation of why this is a partial match, not a full match"),
            })
        )
        .describe("Skills where the resume shows related but not exact matching experience"),

    suggestions: z
        .array(
            z.object({
                area: z.string().describe("The skill or requirement this suggestion addresses"),
                type: z
                    .enum(["rewrite", "learning"])
                    .describe("'rewrite' if the skill likely exists but wasn't phrased in matching terms, 'learning' if it's a genuine gap"),
                suggestion: z.string().describe("Specific, actionable advice — not generic tips"),
            })
        )
        .describe("Actionable suggestions to improve resume-JD alignment"),
});