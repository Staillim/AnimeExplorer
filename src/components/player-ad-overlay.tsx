
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
  const [isCountingDown, setIsCountingDown] = useState(false);

  // This function will be called when the user returns to the tab
  const handleFocus = useCallback(() => {
    // Only start the countdown if the ad has been clicked and we are not already counting down
    if (hasClickedAd && !isCountingDown) {
      setIsCountingDown(true);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev - 1 <= 0) {
            clearInterval(timer);
            onComplete(); // Unlock the content
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [hasClickedAd, isCountingDown, onComplete]);

  useEffect(() => {
    // Listen for when the window or tab regains focus
    window.addEventListener('focus', handleFocus);
    // Also listen for visibility change as a fallback
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            handleFocus();
        }
    });

    // Cleanup the listeners when the component unmounts
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [handleFocus]);


  const handleAdClick = () => {
    window.open(adUrl, '_blank', 'noopener,noreferrer');
    setHasClickedAd(true);
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-white p-4 space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-primary">Contenido Bloqueado</h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-md">
          {isCountingDown 
            ? `¡Gracias! Desbloqueando en ${countdown} segundos...`
            : hasClickedAd 
            ? 'Regresa a esta pestaña para iniciar el desbloqueo.'
            : 'Haz clic en el anuncio para poder desbloquear el contenido.'
          }
        </p>
      </div>

      {!hasClickedAd && !isCountingDown && (
        <Button onClick={handleAdClick} size="lg" className="animate-pulse">
          <Hourglass className="mr-2" />
          Visitar Anuncio para Desbloquear
        </Button>
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
