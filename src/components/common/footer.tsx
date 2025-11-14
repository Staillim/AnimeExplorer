
import { Clapperboard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-transparent border-t border-border/20 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-primary" />
            <span className="font-bold">PlayWave</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
