
import { ResumeAnalyzerForm } from '@/components/resume-analyzer-form';

export default function ResumeAnalyzerPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary sm:text-5xl lg:text-6xl">
          Resume Analyzer
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          Paste a job description and your resume to get an AI-powered analysis. 
          Receive a match score, keyword insights, and actionable suggestions. 
          You can also let AI modify your resume based on these suggestions.
        </p>
      </div>
      <ResumeAnalyzerForm />
    </div>
  );
}
