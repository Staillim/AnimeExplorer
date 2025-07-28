import Link from "next/link";
import { Clapperboard, Home, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Clapperboard className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline tracking-tight">
              Anime Explorer
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Catalog
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/recommendations">
                <WandSparkles className="h-4 w-4 mr-2" />
                Recommendations
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
