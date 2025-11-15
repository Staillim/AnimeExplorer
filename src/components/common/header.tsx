
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clapperboard, Search, ShieldCheck, LogIn, LogOut, X, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { useSearch } from "@/context/search-context";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";

export default function Header() {
  const router = useRouter();
  const { user, userProfile, loading, logout } = useAuth();
  const { selectedGenres, setSelectedGenres, allGenres, showFeaturedOnly, setShowFeaturedOnly } = useSearch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };
  
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);
  
  // Clear search when search bar is closed and query exists
  const handleToggleSearch = () => {
    if (isSearchOpen && searchInput) {
      setSearchInput('');
    }
    setIsSearchOpen(!isSearchOpen);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      setIsSearchOpen(false);
    }
  };
  
  // Handle closing on blur, but not if the search icon itself was clicked
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // relatedTarget is the element receiving focus
    if (!e.relatedTarget?.closest('#search-toggle-button') && !e.relatedTarget?.closest('form')) {
      setIsSearchOpen(false);
       if (searchInput) {
          setSearchInput('');
       }
    }
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(
      selectedGenres.includes(genre)
        ? selectedGenres.filter(g => g !== genre)
        : [...selectedGenres, genre]
    );
  };

  return (
    <header className="bg-background/70 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Clapperboard className="h-8 w-8 text-primary group-hover:animate-pulse" />
            <span className={cn(
              "text-lg sm:text-xl font-bold font-headline tracking-tight group-hover:glow-text transition-all duration-300",
              isSearchOpen && "hidden md:block" // Hide title on mobile when search is open
              )}>
              CineStelar
            </span>
          </Link>
          
          <nav className="flex items-center gap-1 sm:gap-2">
            
            <div className="flex items-center justify-end gap-1">
               <form onSubmit={handleSearchSubmit} className={cn(
                  "flex items-center transition-all duration-300 ease-in-out",
                  isSearchOpen ? "w-48 sm:w-64" : "w-0"
                )}>
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar contenido..."
                  className={cn(
                    "w-full bg-input border-0 h-10 transition-all duration-300 ease-in-out",
                     isSearchOpen ? "opacity-100 px-3" : "opacity-0 p-0"
                  )}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onBlur={handleBlur}
                  aria-label="Search"
                />
              </form>

               <Button id="search-toggle-button" variant="ghost" size="icon" onClick={handleToggleSearch}>
                  {isSearchOpen ? <X className="h-5 w-5"/> : <Search className="h-5 w-5" />}
                  <span className="sr-only">Buscar</span>
                </Button>

                {/* Género Filter Menu */}
                <DropdownMenu open={isGenresOpen} onOpenChange={setIsGenresOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="Filtrar por géneros">
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">Géneros</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-96 overflow-y-auto" align="end">
                    <DropdownMenuLabel>Filtrar por Género</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Opción de Contenido Destacado */}
                    <div className="p-2 border-b">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured-content"
                          checked={showFeaturedOnly}
                          onCheckedChange={(checked) => setShowFeaturedOnly(checked as boolean)}
                        />
                        <label
                          htmlFor="featured-content"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          🔥 Animes H
                        </label>
                      </div>
                    </div>

                    {/* Géneros */}
                    {allGenres.length > 0 ? (
                      <div className="space-y-2 p-2">
                        {allGenres.map((genre) => (
                          <div key={genre} className="flex items-center space-x-2">
                            <Checkbox
                              id={`genre-${genre}`}
                              checked={selectedGenres.includes(genre)}
                              onCheckedChange={() => handleGenreToggle(genre)}
                            />
                            <label
                              htmlFor={`genre-${genre}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {genre}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <DropdownMenuItem disabled>
                        No hay géneros disponibles
                      </DropdownMenuItem>
                    )}
                    {(selectedGenres.length > 0 || showFeaturedOnly) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setSelectedGenres([]);
                          setShowFeaturedOnly(false);
                        }}>
                          Limpiar todos los filtros
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            {userProfile?.role === 'admin' && (
              <Button asChild variant="ghost">
                <Link href="/admin">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="hidden md:inline ml-2">Admin</span>
                </Link>
              </Button>
            )}
            
            <div className="w-px h-6 bg-border mx-2" />

            {loading ? (
              <Skeleton className="w-10 h-10 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary transition-colors">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Iniciar Sesión</span>
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
