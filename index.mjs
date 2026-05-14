import { streamText } from "ai";

const result = streamText({
  model: process.env.AI_MODEL || "openai/gpt-5.5",
  prompt: "Explain quantum computing in simple terms.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
