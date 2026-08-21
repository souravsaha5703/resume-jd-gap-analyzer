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