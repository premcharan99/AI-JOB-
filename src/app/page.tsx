
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Edit3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
      <section className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-primary mb-6">
          Elevate Your Career with AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Student Analyzer provides cutting-edge AI tools to help you perfect your resume and create compelling demo applications, tailored to your target job and experience level.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg shadow-lg transition-transform hover:scale-105">
            <Link href="/resume-analyzer">
              Analyze Your Resume <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Link href="/demo-resume-generator">
              Generate Demo Resume <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-primary/10 p-6">
            <FileText className="h-10 w-10 text-primary mb-3" />
            <CardTitle className="text-2xl font-headline text-primary">Resume Analyzer</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col flex-grow">
            <CardDescription className="text-base text-foreground/80 mb-6 flex-grow">
              Upload your resume and a job description to get an AI-powered analysis. Receive a match score, keyword insights, and actionable suggestions to tailor your resume for success.
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
            <Edit3 className="h-10 w-10 text-primary mb-3" />
            <CardTitle className="text-2xl font-headline text-primary">Demo Resume Generator</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col flex-grow">
            <CardDescription className="text-base text-foreground/80 mb-6 flex-grow">
              Need a strong starting point? Provide a job description and select an experience level (Fresher, Intermediate, Senior) to generate a professional demo resume instantly.
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
        <h2 className="text-3xl font-bold text-primary mb-6">Why Student Analyzer?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2 text-foreground">AI-Powered Insights</h3>
            <p className="text-base text-muted-foreground">Leverage advanced AI to understand how well your resume matches job requirements and get specific feedback.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2 text-foreground">Tailored for You</h3>
            <p className="text-base text-muted-foreground">Generate resumes based on experience level or modify your existing one with AI suggestions.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2 text-foreground">Fast & Efficient</h3>
            <p className="text-base text-muted-foreground">Save time in your job application process with quick analyses and resume generation.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
