import { z, flattenError } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = flattenError(parsed.error);
  const fieldErrors = Object.entries(issues.fieldErrors)
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k}: ${(v as string[]).join(", ")}`)
    .join("\n");
  console.error("\n❌ Invalid or missing environment variables:\n");
  console.error(fieldErrors || parsed.error.message);
  throw new Error(
    "Environment validation failed. Set the variables above in .env file and restart the server."
  );
}

const { NODE_ENV, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_BASE_URL } = parsed.data;
