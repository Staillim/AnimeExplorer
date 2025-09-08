
"use client";

import Link from "next/link";
import { Clapperboard, Home, WandSparkles, LogIn, User, ShieldCheck, LogOut, Search } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Input } from "../ui/input";
import { useSearch } from "@/context/search-context";

export default function Header() {
  const { user, userProfile, loading, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-background/70 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Clapperboard className="h-8 w-8 text-primary group-hover:animate-pulse" />
            <span className="text-lg sm:text-xl font-bold font-headline tracking-tight group-hover:glow-text transition-all duration-300">
              PlayWave
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button asChild variant="ghost" size="icon">
                  <Link href="#">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Buscar</span>
                  </Link>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, género, año..."
                    className="w-full bg-input border-0 pl-10 text-lg h-14"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search"
                  />
                </div>
              </SheetContent>
            </Sheet>
            
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
