"use server";

import { recommendAnime, RecommendAnimeInput } from "@/ai/flows/recommend-anime";

export async function handleRecommendation(input: RecommendAnimeInput): Promise<{
  data?: { recommendation: string; reason: string };
  error?: string;
}> {
  try {
    const result = await recommendAnime(input);
    return { data: result };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      error: `Failed to get recommendation: ${errorMessage}`,
    };
  }
}
