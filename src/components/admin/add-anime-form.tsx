
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Separator } from "../ui/separator";
import type { Anime } from "@/lib/types";

const chapterSchema = z.object({
  title: z.string().optional(),
  url: z.string().url({ message: "Por favor, introduce una URL válida." }),
});

const formSchema = z.object({
  title: z.string().min(1, { message: "El título es obligatorio." }),
  season: z.string().min(1, { message: "La temporada o tipo es obligatoria." }),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5),
  coverImage: z.string().url({ message: "Por favor, introduce una URL de imagen de portada válida." }),
  bannerImage: z.string().url({ message: "Por favor, introduce una URL de imagen de banner válida." }).optional().or(z.literal('')),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  genres: z.string().min(1, { message: "Introduce al menos un género." }),
  rating: z.coerce.number().min(0).max(10),
  chapters: z.array(chapterSchema).min(1, { message: "Debes agregar al menos un capítulo." }),
  dataAiHint: z.string().min(2, { message: "AI hint must be at least 2 characters." }),
});

type FormData = z.infer<typeof formSchema>;

interface AddAnimeFormProps {
  animeToEdit?: Anime;
  onSuccess?: () => void;
}

export function AddAnimeForm({ animeToEdit, onSuccess }: AddAnimeFormProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: animeToEdit
      ? {
          ...animeToEdit,
          genres: animeToEdit.genres.join(", "),
        }
      : {
          title: "",
          season: "",
          year: new Date().getFullYear(),
          coverImage: "",
          bannerImage: "",
          description: "",
          genres: "",
          rating: 7.0,
          chapters: [{ title: "Capítulo 1", url: "" }],
          dataAiHint: "anime",
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "chapters",
  });

  const { isSubmitting } = form.formState;
  const isEditMode = !!animeToEdit;

  async function onSubmit(values: FormData) {
    try {
      const genresArray = values.genres.split(',').map(g => g.trim());
      const submissionData = {
        ...values,
        bannerImage: values.bannerImage || `https://placehold.co/1200x400.png`,
        genres: genresArray,
      };

      if (isEditMode) {
        const docRef = doc(db, "animes", animeToEdit.id);
        await updateDoc(docRef, submissionData);
        toast({
          title: "Contenido Actualizado",
          description: `${values.title} ha sido actualizado correctamente.`,
        });
      } else {
        await addDoc(collection(db, "animes"), submissionData);
        toast({
          title: "Contenido Agregado",
          description: `${values.title} ha sido agregado al catálogo.`,
        });
        form.reset();
      }
      
      if (onSuccess) onSuccess();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isEditMode ? "Error al actualizar" : "Error al agregar",
        description: error.message,
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
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporada / Tipo</FormLabel>
                    <FormControl>
                      <Input placeholder="Temporada 1, Película, OVA" {...field} />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <h3 className="text-lg font-medium mb-4">Capítulos</h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                      <FormField
                        control={form.control}
                        name={`chapters.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título del Capítulo {index + 1} (Opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={`Capítulo ${index + 1}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`chapters.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link del Capítulo {index + 1}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ title: `Capítulo ${fields.length + 1}`, url: "" })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar otro capítulo
              </Button>
               <FormField
                  control={form.control}
                  name="chapters"
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
