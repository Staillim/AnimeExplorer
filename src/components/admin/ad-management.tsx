
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Ad } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  url: z.string().url({ message: 'Por favor, introduce una URL válida.' }),
  occurrences: z.number().int().min(1).max(10).default(1),
});

type FormData = z.infer<typeof formSchema>;

interface AdManagementProps {
  ads: Ad[];
}

export function AdManagement({ ads }: AdManagementProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '', occurrences: 1 },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormData) {
    try {
      await addDoc(collection(db, 'ads'), { 
        url: values.url,
        occurrences: values.occurrences || 1
      });
      toast({
        title: 'Anuncio Agregado',
        description: 'El nuevo anuncio se ha añadido correctamente.',
      });
      form.reset({ url: '', occurrences: 1 });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al agregar',
        description: error.message || 'No tienes permiso para realizar esta acción.',
      });
    }
  }

  async function handleDelete(ad: Ad) {
    setIsDeleting(ad.id);
    try {
      await deleteDoc(doc(db, 'ads', ad.id));
      toast({
        title: 'Anuncio Eliminado',
        description: 'El anuncio ha sido eliminado.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar',
        description: error.message || 'No tienes permiso para realizar esta acción.',
      });
    }
    setIsDeleting(null);
  }

  return (
    <div className="space-y-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Agregar Nuevo Anuncio</CardTitle>
              <CardDescription>Introduce la URL del enlace directo del anuncio.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Anuncio</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occurrences"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Número de Bloqueos de Seguridad (1-10)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10" 
                        placeholder="1" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Cuántas veces debe aparecer este anuncio de seguridad durante la reproducción
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                Agregar Anuncio
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anuncios Actuales</CardTitle>
          <CardDescription>Lista de todos los anuncios en rotación.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL del Anuncio</TableHead>
                  <TableHead>Bloqueos de Seguridad</TableHead>
                  <TableHead className="text-right w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.length > 0 ? (
                  ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium break-all">{ad.url}</TableCell>
                      <TableCell className="text-center">{ad.occurrences || 1}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará el anuncio permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(ad)}
                                disabled={isDeleting === ad.id}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {isDeleting === ad.id ? 'Eliminando...' : 'Sí, eliminar'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No hay anuncios.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
