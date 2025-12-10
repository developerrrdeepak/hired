/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 */

const requiredEnvVars = {
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: 'Firebase API Key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'Firebase Auth Domain',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'Firebase Project ID',
  
  // Stripe
  STRIPE_SECRET_KEY: 'Stripe Secret Key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe Publishable Key',
  
  // Google AI
  GOOGLE_GENAI_API_KEY: 'Google Gemini API Key',
} as const;

const optionalEnvVars = {
  WORKOS_API_KEY: 'WorkOS API Key',
  WORKOS_CLIENT_ID: 'WorkOS Client ID',
  ELEVENLABS_API_KEY: 'ElevenLabs API Key',
  VULTR_API_KEY: 'Vultr API Key',
  RAINDROP_API_KEY: 'Raindrop API Key',
} as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, name]) => {
    if (!process.env[key]) {
      missing.push(`${name} (${key})`);
    }
  });

  // Check optional variables
  Object.entries(optionalEnvVars).forEach(([key, name]) => {
    if (!process.env[key]) {
      warnings.push(`${name} (${key})`);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nPlease add them to your .env.local file.`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️  Optional environment variables not set:\n${warnings.map(v => `  - ${v}`).join('\n')}`
    );
  }

  console.log('✅ Environment variables validated');
}
