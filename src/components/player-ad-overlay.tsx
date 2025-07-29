
"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Hourglass, CheckCircle } from 'lucide-react';

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
              <LoaderIcon className="animate-spin mr-2" />
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

function LoaderIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v4" />
        <path d="m16.2 7.8 2.8-2.8" />
        <path d="M18 12h4" />
        <path d="m16.2 16.2 2.8 2.8" />
        <path d="M12 18v4" />
        <path d="m7.8 16.2-2.8 2.8" />
        <path d="M6 12H2" />
        <path d="m7.8 7.8-2.8-2.8" />
      </svg>
    )
  }
