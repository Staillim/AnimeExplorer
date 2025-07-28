"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { handleRecommendation } from "@/app/recommendations/actions";
import type { RecommendAnimeOutput } from "@/ai/flows/recommend-anime";
import { useToast } from "@/lib/hooks/use-toast";
import { Loader2, WandSparkles } from "lucide-react";

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one anime.",
  }),
});

interface RecommendationFormProps {
  animes: { id: string; title: string }[];
  onRecommendation: (data: RecommendAnimeOutput) => void;
}

export function RecommendationForm({ animes, onRecommendation }: RecommendationFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const selectedTitles = animes
      .filter(anime => data.items.includes(anime.id))
      .map(anime => anime.title);

    const result = await handleRecommendation({ viewingHistory: selectedTitles });

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: result.error,
      });
    } else if (result.data) {
      onRecommendation(result.data);
      toast({
        title: "Recommendation generated!",
        description: "Check out your new anime suggestion.",
      });
    }
  }

  const { isSubmitting } = form.formState;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <CardHeader>
            <CardTitle>Select Watched Anime</CardTitle>
            <FormDescription>
              Choose from the list below to get a personalized recommendation.
            </FormDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  <ScrollArea className="h-72 w-full rounded-md border p-4">
                    <div className="space-y-2">
                    {animes.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="items"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.title}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <WandSparkles className="mr-2 h-4 w-4" />
              )}
              Generate Recommendation
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
