
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Edit3, Briefcase, Github, Users, Link2, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

const BASE_VISITOR_COUNT = 400;
const LOCAL_STORAGE_KEY = 'jobAnalyzerVisitorCount';

export default function HomePage() {
  const [animatedCount, setAnimatedCount] = useState(BASE_VISITOR_COUNT);

  useEffect(() => {
    // This effect runs only on the client after hydration.
    // It increments the count stored in localStorage for this specific user/browser on each visit.
    const storedCountString = localStorage.getItem(LOCAL_STORAGE_KEY);
    let previousCountForAnimation: number;
    let newTotalCountToStore: number;

    if (storedCountString) {
      const storedCount = parseInt(storedCountString, 10);
      previousCountForAnimation = storedCount; // The count before this current visit
      newTotalCountToStore = storedCount + 1;  // Increment for this visit
    } else {
      // First visit for this browser, or localStorage was cleared
      previousCountForAnimation = BASE_VISITOR_COUNT - 1; // Start animation just below base
      newTotalCountToStore = BASE_VISITOR_COUNT;       // Set to base for this first visit
    }
    
    // Ensure the count never visually drops below the base if localStorage was manipulated
    // or if starting fresh. Also ensures animation starts from at least BASE_VISITOR_COUNT - 1.
    previousCountForAnimation = Math.max(BASE_VISITOR_COUNT - 1, previousCountForAnimation);
    newTotalCountToStore = Math.max(BASE_VISITOR_COUNT, newTotalCountToStore);

    // Save the new, incremented count back to localStorage for this user's browser.
    localStorage.setItem(LOCAL_STORAGE_KEY, newTotalCountToStore.toString());
    
    // Set the initial state for the animation to the count before this visit's increment.
    setAnimatedCount(previousCountForAnimation);

    // Animation logic for "live scrolling" effect
    if (previousCountForAnimation < newTotalCountToStore) {
        let currentDisplayValue = previousCountForAnimation;
        const intervalTime = 25; // Milliseconds for each increment step (faster for "scrolling" feel)
        
        const animate = () => {
            currentDisplayValue++; // Increment the display value by 1
            if (currentDisplayValue >= newTotalCountToStore) {
                setAnimatedCount(newTotalCountToStore); // Ensure it ends exactly on the target
            } else {
                setAnimatedCount(currentDisplayValue);
                setTimeout(animate, intervalTime); // Continue with the next increment
            }
        };
        // Start the animation after a brief delay to show the starting number
        const timeoutId = setTimeout(animate, intervalTime); 
        return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount
    } else {
        // If no animation is needed (e.g., count didn't actually increase), set directly.
        setAnimatedCount(newTotalCountToStore);
    }

  }, []); // Empty dependency array ensures this runs once on mount (per page load/refresh) client-side

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <section className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary mb-6">
          Welcome to JOB Analyzer
          <span className="block text-3xl md:text-4xl text-accent font-normal mt-2">A Student Friend</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Your AI-powered assistant for resume perfection, demo resume creation, and smart job discovery. Let's get you hired!
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-lg transition-transform hover:scale-105">
            <Link href="/resume-analyzer">
              Resume Analyzer by Job desc <FileText className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Link href="/find-jobs">
              Find Jobs by Resume <Briefcase className="ml-2 h-5 w-5" />
            </Link>
          </Button>
           <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Link href="/demo-resume-generator">
              Demo Resume Generator by Job desc <Edit3 className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-primary/10 p-6">
            <FileText className="h-10 w-10 text-primary mb-3" />
            <CardTitle className="text-2xl font-headline text-primary">Resume Analyzer by Job desc</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col flex-grow">
            <CardDescription className="text-base text-foreground/80 mb-6 flex-grow">
              Upload your resume and a job description. Get AI analysis, match scores, and keyword insights to tailor your resume effectively.
            </CardDescription>
            <Button asChild className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg">
              <Link href="/resume-analyzer">
                Go to Analyzer <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-primary/10 p-6">
            <Briefcase className="h-10 w-10 text-primary mb-3" />
            <CardTitle className="text-2xl font-headline text-primary">Find Jobs by Resume</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col flex-grow">
            <CardDescription className="text-base text-foreground/80 mb-6 flex-grow">
              Upload your resume and let our AI find suitable job openings from top companies, complete with match scores (basic testing version).
            </CardDescription>
            <Button asChild className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg">
              <Link href="/find-jobs">
                Start Job Search <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-primary/10 p-6">
            <Edit3 className="h-10 w-10 text-primary mb-3" />
            <CardTitle className="text-2xl font-headline text-primary">Demo Resume Generator by Job desc</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col flex-grow">
            <CardDescription className="text-base text-foreground/80 mb-6 flex-grow">
              Need a strong start? Provide a job description and experience level to generate a professional demo resume instantly.
            </CardDescription>
            <Button asChild className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg">
              <Link href="/demo-resume-generator">
                Go to Generator <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-20 text-center">
        <h2 className="text-3xl font-bold text-primary mb-6">Why JOB Analyzer?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2 text-foreground">AI-Powered Precision</h3>
            <p className="text-base text-muted-foreground">Leverage advanced AI for resume analysis, job matching, and content generation.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2 text-foreground">Career Focused</h3>
            <p className="text-base text-muted-foreground">Tools designed to help students and professionals optimize job applications effectively.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2 text-foreground">Efficient & Smart</h3>
            <p className="text-base text-muted-foreground">Save time and get ahead with intelligent resume tailoring and job discovery.</p>
          </div>
        </div>
      </section>

      <section className="mt-20 mb-16 text-center">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Join Our Growing Community!
        </h2>
        <p className="text-6xl font-extrabold text-accent tracking-tight">
          {animatedCount.toLocaleString()}
        </p>
        <p className="text-lg text-muted-foreground mt-1">
          Analyses Performed & Counting
        </p>
      </section>

      <footer className="mt-24 pt-8 border-t border-border text-center text-muted-foreground">
        <p className="text-sm">
          Done by Prem Charan Gudipudi
        </p>
        <p className="text-sm mt-2">
          <Link href="https://github.com/premcharan99" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:text-primary transition-colors">
            <Github className="h-4 w-4 mr-1.5" />
            premcharan99
          </Link>
        </p>
        <p className="text-sm mt-2">
          <Link href="https://premcharan-gudipudi.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:text-primary transition-colors">
            <Link2 className="h-4 w-4 mr-1.5" />
            My Portfolio
          </Link>
        </p>
        <p className="text-sm mt-2">
          For hiring inquiries, contact: <a href="mailto:gpremcharan999@gmail.com" className="inline-flex items-center hover:text-primary transition-colors">
            <Mail className="h-4 w-4 mr-1.5" />
            gpremcharan999@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}
