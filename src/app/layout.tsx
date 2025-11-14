
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { AuthProvider } from '@/context/auth-context';
import { SearchProvider } from '@/context/search-context';

export const metadata: Metadata = {
  title: 'PlayWave',
  description: 'Explore a world of content.',
};

const Orb = ({ className, animation }: { className: string; animation: string }) => (
  <div
    className={cn(
      'absolute rounded-full opacity-30 mix-blend-screen filter blur-3xl',
      className
    )}
    style={{ animation: `${animation} 20s infinite ease-in-out` }}
  />
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased flex flex-col min-h-screen bg-background relative overflow-x-hidden')}>
        <div className="absolute inset-0 -z-20 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.15),rgba(255,255,255,0))]"></div>
        <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none">
          <Orb className="h-[400px] w-[400px] bg-primary top-1/4 left-1/4" animation="float-orb-1" />
          <Orb className="h-[300px] w-[300px] bg-accent -bottom-20 -right-10" animation="float-orb-2" />
          <Orb className="h-[250px] w-[250px] bg-secondary top-1/3 right-1/4" animation="float-orb-3" />
          <Orb className="h-[200px] w-[200px] bg-primary/70 bottom-1/2 left-10" animation="float-orb-4" />
        </div>
        
        <AuthProvider>
          <SearchProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
