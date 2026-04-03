import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

/**
 * Genkit initialization with Groq plugin.
 * We wrap the plugin call to ensure it conforms to the Genkit 1.x registry expectations.
 */
export const ai = genkit({
  plugins: [
    groq({
      apiKey: process.env.GROQ_API_KEY,
    }),
  ],
});
