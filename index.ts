import { streamText } from "ai";
import "dotenv/config";
import { config as loadDotenv } from "dotenv";

// Vercel AI Gateway works in two authenticated modes:
//   1. AI_GATEWAY_API_KEY in .env.local (recommended for local CLI use)
//   2. VERCEL_OIDC_TOKEN in .env.local (pulled via `vc env pull .env.local`)
// dotenv/config already loaded .env, this picks up .env.local too without
// requiring `node --env-file=.env.local`.
loadDotenv({ path: ".env.local", override: false });

async function main() {
  const result = streamText({
    model: "openai/gpt-5.5",
    prompt: "Invent a new holiday and describe its traditions.",
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log();
  console.log("Token usage:", await result.usage);
  console.log("Finish reason:", await result.finishReason);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
