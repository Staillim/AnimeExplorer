'use server';

/**
 * @fileOverview An anime recommendation AI agent.
 *
 * - recommendAnime - A function that handles the anime recommendation process.
 * - RecommendAnimeInput - The input type for the recommendAnime function.
 * - RecommendAnimeOutput - The return type for the recommendAnime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendAnimeInputSchema = z.object({
  viewingHistory: z.array(z.string()).describe('A list of anime titles the user has watched.'),
});
export type RecommendAnimeInput = z.infer<typeof RecommendAnimeInputSchema>;

const RecommendAnimeOutputSchema = z.object({
  recommendation: z.string().describe('The recommended anime title based on the viewing history.'),
  reason: z.string().describe('The reason why this anime is recommended.'),
});
export type RecommendAnimeOutput = z.infer<typeof RecommendAnimeOutputSchema>;

export async function recommendAnime(input: RecommendAnimeInput): Promise<RecommendAnimeOutput> {
  return recommendAnimeFlow(input);
}

const recommendAnimePrompt = ai.definePrompt({
  name: 'recommendAnimePrompt',
  input: {schema: RecommendAnimeInputSchema},
  output: {schema: RecommendAnimeOutputSchema},
  prompt: `You are an expert anime recommender. Based on the user's viewing history, you will recommend an anime that the user might enjoy.

Viewing History: {{#each viewingHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Consider the user's viewing history and recommend an anime that is similar in genre, theme, or style. Provide a reason for your recommendation.
`,
});

const recommendAnimeFlow = ai.defineFlow(
  {
    name: 'recommendAnimeFlow',
    inputSchema: RecommendAnimeInputSchema,
    outputSchema: RecommendAnimeOutputSchema,
  },
  async input => {
    const {output} = await recommendAnimePrompt(input);
    return output!;
  }
);
