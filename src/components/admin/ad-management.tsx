
"use client";

import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Ad } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { addAdAction, deleteAdAction } from '@/app/admin/actions';
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

const formSchema = z.object({
  url: z.string().url({ message: 'Por favor, introduce una URL válida.' }),
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
    defaultValues: { url: '' },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormData) {
    const result = await addAdAction(values.url);
    if (result.success) {
      toast({
        title: 'Anuncio Agregado',
        description: 'El nuevo anuncio se ha añadido correctamente.',
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al agregar',
        description: result.message,
      });
    }
  }

  async function handleDelete(ad: Ad) {
    setIsDeleting(ad.id);
    const result = await deleteAdAction(ad.id);
    if (result.success) {
      toast({
        title: 'Anuncio Eliminado',
        description: 'El anuncio ha sido eliminado.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar',
        description: result.message,
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
                  <TableHead className="text-right w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.length > 0 ? (
                  ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium break-all">{ad.url}</TableCell>
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
