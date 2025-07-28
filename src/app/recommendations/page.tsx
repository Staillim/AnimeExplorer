"use client";

import { useState } from "react";
import { animes } from "@/lib/data";
import { RecommendationForm } from "@/components/recommendation-form";
import type { RecommendAnimeOutput } from "@/ai/flows/recommend-anime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function RecommendationsPage() {
  const [recommendation, setRecommendation] = useState<RecommendAnimeOutput | null>(null);
  const animeOptions = animes.map(({ id, title }) => ({ id, title }));

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-headline text-primary">Get a Recommendation</h1>
        <p className="text-lg text-muted-foreground">
          Tell us what you've watched, and our AI will suggest your next favorite anime!
        </p>
        <RecommendationForm animes={animeOptions} onRecommendation={setRecommendation} />
      </div>

      <div className="sticky top-24">
        <Card className="min-h-[200px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Your AI Recommendation
            </CardTitle>
            <CardDescription>
              Based on your viewing history, we think you'll love this!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendation ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-accent">{recommendation.recommendation}</h3>
                <p className="text-foreground/80">{recommendation.reason}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Your recommendation will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
