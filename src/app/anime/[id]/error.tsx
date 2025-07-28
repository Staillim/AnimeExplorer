
'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-destructive mb-4">¡Oh no! Algo salió mal.</h2>
      <p className="text-muted-foreground mb-6">
        No pudimos cargar esta página de anime. Esto puede ser un problema temporal.
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Intentar de nuevo
      </Button>
    </div>
  )
}
