import { genkit } from 'genkit';
import { groq } from 'genkitx-groq';

/**
 * Genkit initialization with Groq plugin.
 * The plugin will automatically use the GROQ_API_KEY environment variable.
 */
export const ai = genkit({
  plugins: [
    groq(),
  ],
});
