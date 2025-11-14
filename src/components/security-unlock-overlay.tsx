"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Hourglass, CheckCircle, Loader2, AlertTriangle, RotateCw } from 'lucide-react';

interface SecurityUnlockOverlayProps {
  adUrl: string;
  onComplete: () => void;
  viewTimeSeconds?: number;
  unlockTimerSeconds?: number;
  adNumber?: number;
  totalAds?: number;
}

export default function SecurityUnlockOverlay({ 
  adUrl, 
  onComplete,
  viewTimeSeconds = 5,
  unlockTimerSeconds = 3,
  adNumber = 1,
  totalAds = 1
}: SecurityUnlockOverlayProps) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'verifying' | 'countdown' | 'failed'>('idle');
  const [countdown, setCountdown] = useState(unlockTimerSeconds);
  const adClickTimestamp = useRef<number | null>(null);

  const startUnlockCountdown = useCallback(() => {
    setStatus('countdown');
    setCountdown(unlockTimerSeconds);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onComplete, unlockTimerSeconds]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && status === 'waiting') {
      setStatus('verifying');
      const timeElapsed = adClickTimestamp.current ? (Date.now() - adClickTimestamp.current) / 1000 : 0;

      if (timeElapsed >= viewTimeSeconds) {
        startUnlockCountdown();
      } else {
        setStatus('failed');
      }
    }
  }, [status, startUnlockCountdown, viewTimeSeconds]);

  useEffect(() => {
    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Resetear el estado cuando cambia el URL del anuncio (nuevo anuncio)
  useEffect(() => {
    setStatus('idle');
    setCountdown(unlockTimerSeconds);
    adClickTimestamp.current = null;
  }, [adUrl, unlockTimerSeconds]);

  const handleAdClick = () => {
    window.open(adUrl, '_blank', 'noopener,noreferrer');
    adClickTimestamp.current = Date.now();
    setStatus('waiting');
  };

  const handleReset = () => {
    adClickTimestamp.current = null;
    setStatus('idle');
  }
  
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <>
            <div className="text-sm md:text-base text-muted-foreground mb-2">
              Bloqueo de Seguridad {adNumber} de {totalAds}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-headline text-primary">Contenido Bloqueado</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Haz clic en el anuncio y espera {viewTimeSeconds} segundos antes de volver para desbloquear.
            </p>
            <Button onClick={handleAdClick} size="lg" className="animate-pulse">
              <Hourglass className="mr-2" />
              Visitar Anuncio para Desbloquear
            </Button>
          </>
        );
      case 'waiting':
      case 'verifying':
        return (
          <>
            <div className="text-sm md:text-base text-muted-foreground mb-2">
              Bloqueo de Seguridad {adNumber} de {totalAds}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Verificando...</h2>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Por favor, regresa a esta pestaña una vez que hayas visto el anuncio.
            </p>
          </>
        );
      case 'failed':
        return (
          <>
            <div className="text-sm md:text-base text-muted-foreground mb-2">
              Bloqueo de Seguridad {adNumber} de {totalAds}
            </div>
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl md:text-3xl font-bold">Verificación Fallida</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Debes permanecer en la página del anuncio al menos {viewTimeSeconds} segundos.
            </p>
            <Button onClick={handleReset} size="lg" variant="outline">
              <RotateCw className="mr-2" />
              Intentar de Nuevo
            </Button>
          </>
        );
      case 'countdown':
        return (
          <>
            <div className="text-sm md:text-base text-muted-foreground mb-2">
              Bloqueo de Seguridad {adNumber} de {totalAds}
            </div>
            <CheckCircle className="h-12 w-12 text-green-400" />
            <h2 className="text-2xl md:text-3xl font-bold">¡Gracias!</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Desbloqueando en {countdown} segundo(s)...
            </p>
          </>
        );
    }
  }

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-white p-4 space-y-6 text-center">
      {renderContent()}
    </div>
  );
}
