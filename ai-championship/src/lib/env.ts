import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  
  DATABASE_URL: z.string().url().optional(),
  
  GOOGLE_GENAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  RAINDROP_API_KEY: z.string().optional(),
  VULTR_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  JWT_SECRET: z.string().min(32).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export const getEnv = (): Env => {
  if (env) return env;

  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (typeof window !== 'undefined') {
        console.warn("Skipping server-side env validation on client");
        return {} as Env;
    }
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
};

export const isProduction = (): boolean => getEnv().NODE_ENV === 'production';
export const isDevelopment = (): boolean => getEnv().NODE_ENV === 'development';
export const isTest = (): boolean => getEnv().NODE_ENV === 'test';

export const getDatabaseUrl = (): string => {
  const url = getEnv().DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return url;
};

export const getJwtSecret = (): string => {
  const secret = getEnv().JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
};

export const getAppUrl = (): string => getEnv().NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (typeof window === 'undefined') {
  getEnv();
}
