
"use client";

import { useForm, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/use-toast";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";
import type { Anime } from "@/lib/types";
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


const chapterSchema = z.object({
  title: z.string().optional(),
  url: z.string().url({ message: "Por favor, introduce una URL válida." }),
});

const seasonSchema = z.object({
  type: z.enum(['season', 'movie']),
  title: z.string().min(1, { message: "El título es obligatorio."}),
  language: z.enum(['sub', 'latino']),
  chapters: z.array(chapterSchema).optional(),
  movieUrl: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.type === 'season' && (!data.chapters || data.chapters.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Las temporadas deben tener al menos un capítulo.",
      path: ['chapters'],
    });
  }
  if (data.type === 'movie' && (!data.movieUrl || !z.string().url().safeParse(data.movieUrl).success)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Se requiere una URL válida para la película.",
      path: ['movieUrl'],
    });
  }
});


const formSchema = z.object({
  title: z.string().min(1, { message: "El título es obligatorio." }),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5),
  coverImage: z.string().url({ message: "Por favor, introduce una URL de imagen de portada válida." }),
  bannerImage: z.string().url({ message: "Por favor, introduce una URL de imagen de banner válida." }).optional().or(z.literal('')),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  genres: z.string().min(1, { message: "Introduce al menos un género." }),
  rating: z.coerce.number().min(0).max(10),
  seasons: z.array(seasonSchema).min(1, { message: "Debes agregar al menos una temporada o película."}),
  dataAiHint: z.string().min(2, { message: "AI hint must be at least 2 characters." }),
});

type FormData = z.infer<typeof formSchema>;

interface AddAnimeFormProps {
  animeToEdit?: Anime;
  onSuccess?: () => void;
}

const getDefaultSeason = (type: 'season' | 'movie' = 'season', title = "Temporada 1") => {
    return {
        type: type,
        title: title,
        language: 'sub' as const,
        chapters: type === 'season' ? [{ title: "Capítulo 1", url: "" }] : [],
        movieUrl: type === 'movie' ? "" : null,
    };
}


export function AddAnimeForm({ animeToEdit, onSuccess }: AddAnimeFormProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: animeToEdit
      ? {
          ...animeToEdit,
          genres: animeToEdit.genres.join(", "),
          seasons: animeToEdit.seasons.map(s => ({
            ...s,
            movieUrl: s.type === 'movie' ? s.chapters[0]?.url || '' : null,
          })),
        }
      : {
          title: "",
          year: new Date().getFullYear(),
          coverImage: "",
          bannerImage: "",
          description: "",
          genres: "",
          rating: 7.0,
          seasons: [getDefaultSeason()],
          dataAiHint: "anime",
        },
  });

  const { fields: seasonFields, append: appendSeason, remove: removeSeason } = useFieldArray({
    control: form.control,
    name: "seasons",
  });

  const { isSubmitting } = form.formState;
  const isEditMode = !!animeToEdit;

  async function onSubmit(values: FormData) {
    try {
      const genresArray = values.genres.split(',').map(g => g.trim());
      
      const processedSeasons = values.seasons.map(season => {
        if (season.type === 'movie') {
          return {
            type: 'movie',
            title: values.title, // Use main title for movie
            language: season.language,
            chapters: [{ title: values.title, url: season.movieUrl || '' }],
          };
        }
        return {
          type: 'season',
          title: season.title,
          language: season.language,
          chapters: season.chapters || [],
        };
      });

      const submissionData = {
        ...values,
        bannerImage: values.bannerImage || `https://placehold.co/1200x400.png`,
        genres: genresArray,
        seasons: processedSeasons,
      };

      if (isEditMode) {
        const docRef = doc(db, 'animes', animeToEdit.id);
        await updateDoc(docRef, submissionData);
      } else {
        await addDoc(collection(db, 'animes'), submissionData);
      }
      
      toast({
        title: isEditMode ? "Contenido Actualizado" : "Contenido Agregado",
        description: `${values.title} ha sido ${isEditMode ? 'actualizado' : 'agregado'} correctamente.`,
      });

      if (!isEditMode) {
        form.reset();
      }
      if (onSuccess) onSuccess();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isEditMode ? "Error al actualizar" : "Error al agregar",
        description: error.message || "Ocurrió un error inesperado.",
      });
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{isEditMode ? "Editar Contenido" : "Agregar Nuevo Contenido"}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? `Editando los detalles de ${animeToEdit.title}.`
                : "Rellena los campos para añadir un nuevo anime o película al catálogo."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Attack on Titan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Una historia sobre..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Portada</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bannerImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Banner (Opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormDescription>Si se deja vacío, se usará un banner genérico.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
             <FormField
              control={form.control}
              name="dataAiHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Hint</FormLabel>
                  <FormControl>
                    <Input placeholder="anime action" {...field} />
                  </FormControl>
                   <FormDescription>
                    One or two keywords for image generation hints.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="genres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Géneros</FormLabel>
                    <FormControl>
                      <Input placeholder="Acción, Fantasía" {...field} />
                    </FormControl>
                     <FormDescription>Separados por comas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="8.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Versiones y Contenido</h3>
              <div className="space-y-6">
                {seasonFields.map((season, seasonIndex) => (
                  <SeasonField
                    key={season.id}
                    seasonIndex={seasonIndex}
                    removeSeason={removeSeason}
                    totalSeasons={seasonFields.length}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={() => appendSeason(getDefaultSeason('season', `Temporada ${seasonFields.length + 1}`))}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Versión (Temporada o Película)
              </Button>
              <FormField
                control={form.control}
                name="seasons"
                render={() => (
                   <FormItem>
                     <FormMessage className="mt-2" />
                   </FormItem>
                )}
              />
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Guardar Cambios" : "Guardar Contenido"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


function SeasonField({ seasonIndex, removeSeason, totalSeasons }: { seasonIndex: number, removeSeason: (index: number) => void, totalSeasons: number }) {
  const { control, setValue } = useFormContext<FormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `seasons.${seasonIndex}.chapters`,
  });

  const versionType = useWatch({
    control,
    name: `seasons.${seasonIndex}.type`,
  });

  return (
    <div className="p-4 border rounded-lg bg-secondary/20 relative space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`seasons.${seasonIndex}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Versión</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === 'movie') {
                    setValue(`seasons.${seasonIndex}.chapters`, []);
                    setValue(`seasons.${seasonIndex}.movieUrl`, "");
                  } else {
                     setValue(`seasons.${seasonIndex}.chapters`, [{ title: "Capítulo 1", url: ""}]);
                     setValue(`seasons.${seasonIndex}.movieUrl`, null);
                  }
                }} 
                defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="season">Temporada</SelectItem>
                  <SelectItem value="movie">Película</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {versionType === 'season' && (
          <FormField
            control={control}
            name={`seasons.${seasonIndex}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título de la Versión</FormLabel>
                <FormControl><Input {...field} placeholder={'Temporada 1'} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={control}
          name={`seasons.${seasonIndex}.language`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idioma</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sub">Subtitulado</SelectItem>
                  <SelectItem value="latino">Latino</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {versionType === 'movie' && (
         <FormField
          control={control}
          name={`seasons.${seasonIndex}.movieUrl`}
          render={({ field }) => (
            <FormItem>
               <FormLabel>URL de la Película</FormLabel>
              <FormControl><Input {...field} placeholder="https://..." value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {versionType === 'season' && (
      <>
        <h4 className="text-md font-medium pt-2">Capítulos</h4>
        <div className="space-y-3">
          {fields.map((chapter, chapterIndex) => (
            <div key={chapter.id} className="flex items-end gap-2">
              <FormField
                control={control}
                name={`seasons.${seasonIndex}.chapters.${chapterIndex}.title`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl><Input {...field} placeholder={`Título del Cap. ${chapterIndex + 1} (opcional)`} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`seasons.${seasonIndex}.chapters.${chapterIndex}.url`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(chapterIndex)}
                disabled={fields.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3"
          onClick={() => append({ title: `Capítulo ${fields.length + 1}`, url: "" })}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Capítulo
        </Button>
        <FormField
            control={control}
            name={`seasons.${seasonIndex}.chapters`}
            render={() => (
              <FormItem>
                <FormMessage className="mt-2" />
              </FormItem>
            )}
          />
      </>
      )}
      
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => removeSeason(seasonIndex)}
        disabled={totalSeasons <= 1}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
