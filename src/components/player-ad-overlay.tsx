
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Hourglass, CheckCircle, Loader2 } from 'lucide-react';

interface PlayerAdOverlayProps {
  adUrl: string;
  onComplete: () => void;
}

const UNLOCK_TIMER_SECONDS = 5;

export default function PlayerAdOverlay({ adUrl, onComplete }: PlayerAdOverlayProps) {
  const [countdown, setCountdown] = useState(UNLOCK_TIMER_SECONDS);
  const [hasClickedAd, setHasClickedAd] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasClickedAd && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      onComplete();
    }
    return () => clearInterval(timer);
  }, [hasClickedAd, countdown, onComplete]);

  const handleAdClick = () => {
    window.open(adUrl, '_blank', 'noopener,noreferrer');
    setHasClickedAd(true);
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-white p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-primary">Contenido Bloqueado</h2>
        <p className="text-base md:text-lg text-muted-foreground">
          {hasClickedAd
            ? `Espera ${countdown} segundos para continuar...`
            : 'Haz clic en el anuncio y espera 5 segundos para desbloquear.'}
        </p>
      </div>

      {!hasClickedAd && (
        <Button onClick={handleAdClick} size="lg" className="animate-pulse">
          <Hourglass className="mr-2" />
          Visitar Anuncio para Desbloquear
        </Button>
      )}

      {hasClickedAd && (
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
