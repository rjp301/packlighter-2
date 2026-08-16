import { z } from "astro/zod";

const zEnv = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  ABLY_API_KEY: z.string(),
  SITE: z.url().default("http://localhost:4321"),
  DATABASE_URL: z.url(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  API_KEY: z.string().optional(),
});

export type Environment = z.infer<typeof zEnv> & Env;

export function parseEnv(data: unknown) {
  const { data: env, error } = zEnv.safeParse(data);
  if (error) {
    const errorMessage = `Invalid environment variables: ${z.prettifyError(error)}`;
    throw new Error(errorMessage);
  }
  return env as Environment;
}
