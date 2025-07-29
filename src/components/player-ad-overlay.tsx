
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Hourglass, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

interface PlayerAdOverlayProps {
  adUrl: string;
  onComplete: () => void;
}

const UNLOCK_TIMER_SECONDS = 5;

export default function PlayerAdOverlay({ adUrl, onComplete }: PlayerAdOverlayProps) {
  const [countdown, setCountdown] = useState(UNLOCK_TIMER_SECONDS);
  const [hasClickedAd, setHasClickedAd] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [adClickTimestamp, setAdClickTimestamp] = useState<number | null>(null);

  const startCountdown = useCallback(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev - 1 <= 0) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && adClickTimestamp) {
      const timeElapsed = Date.now() - adClickTimestamp;
      if (timeElapsed < UNLOCK_TIMER_SECONDS * 1000) {
        // User came back too soon
        setHasClickedAd(false);
        setAdClickTimestamp(null);
        setVerificationFailed(true);
      } else {
        // Verification successful, start the final countdown
        startCountdown();
      }
      // Clean up timestamp after check
      setAdClickTimestamp(null);
    }
  }, [adClickTimestamp, startCountdown]);
  
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);


  const handleAdClick = () => {
    window.open(adUrl, '_blank', 'noopener,noreferrer');
    setHasClickedAd(true);
    setVerificationFailed(false);
    setAdClickTimestamp(Date.now());
  };
  
  const isVerifying = hasClickedAd && adClickTimestamp !== null;
  const isCountingDown = hasClickedAd && adClickTimestamp === null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-white p-4 space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-primary">Contenido Bloqueado</h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-md">
          {isCountingDown && `¡Gracias! Desbloqueando en ${countdown} segundos...`}
          {isVerifying && 'Verificando... Por favor, permanece en la página del anuncio al menos 5 segundos.'}
          {!hasClickedAd && !isVerifying && 'Haz clic en el anuncio y espera 5 segundos en esa página para desbloquear el contenido.'}
        </p>
      </div>

      {!hasClickedAd && !isVerifying && (
        <Button onClick={handleAdClick} size="lg" className="animate-pulse">
          <Hourglass className="mr-2" />
          Visitar Anuncio para Desbloquear
        </Button>
      )}
      
      {verificationFailed && (
         <p className="flex items-center gap-2 text-yellow-400">
          <AlertTriangle className="h-5 w-5" />
          Has vuelto muy rápido. Por favor, inténtalo de nuevo.
        </p>
      )}

      {isCountingDown && (
        <div className="flex items-center text-lg font-semibold text-green-400">
          {countdown > 0 ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              <span>Desbloqueando en {countdown}...</span>
            </>
          ) : (
            <>
              <CheckCircle className="mr-2" />
              <span>¡Contenido Desbloqueado!</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
