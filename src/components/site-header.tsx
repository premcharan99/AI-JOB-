import { Brain, FileText, Edit3 } from 'lucide-react';
import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 max-w-screen-xl">
        <Link href="/" className="flex items-center space-x-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold sm:inline-block font-headline text-primary">
            Student Analyzer
          </span>
        </Link>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <Link 
            href="/resume-analyzer" 
            className="flex items-center text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-2 sm:px-3 py-1 rounded-md hover:bg-primary/10"
          >
            <FileText className="mr-1.5 h-4 w-4" />
            Resume Analyzer
          </Link>
          <Link 
            href="/demo-resume-generator" 
            className="flex items-center text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-2 sm:px-3 py-1 rounded-md hover:bg-primary/10"
          >
            <Edit3 className="mr-1.5 h-4 w-4" />
            Demo Resume
          </Link>
        </nav>
      </div>
    </header>
  );
}
