
'use client';

import Link from 'next/link';
import { FileText, Edit3, Briefcase, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';

const navLinks = [
  { href: '/resume-analyzer', label: 'Resume Analyzer by Job desc', icon: FileText },
  { href: '/find-jobs', label: 'Find Job by Resume', icon: Briefcase },
  { href: '/demo-resume-generator', label: 'Demo Resume Generator by Job desc', icon: Edit3 },
];

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center max-w-screen-xl px-4">
        <Link href="/" className="flex items-center space-x-2 pl-1 sm:pl-0"> {/* Added pl-1 for small mobile gap */}
          <span className="text-xl font-bold sm:inline-block font-headline text-primary leading-tight">
            JOB Analyzer
          </span>
        </Link>

        {/* Spacer to push nav items to the right */}
        <div className="flex-grow" /> 

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-3 py-1 rounded-md hover:bg-primary/10"
            >
              <link.icon className="mr-1.5 h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden flex items-center ml-2"> {/* ml-2 to ensure it's to the right */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 bg-background">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center space-x-2">
                   <span className="text-lg font-bold font-headline text-primary leading-tight">
                    JOB Analyzer
                  </span>
                </SheetTitle>
                 <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col space-y-2 p-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center text-md font-medium text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-primary/10"
                    >
                      <link.icon className="mr-2 h-5 w-5" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
