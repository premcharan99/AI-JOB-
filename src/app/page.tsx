
import { ResumeAnalyzerForm } from '@/components/resume-analyzer-form';

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary sm:text-5xl lg:text-6xl">
          Analyze Your Resume Fitness
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Paste a job description and your resume to get an AI-powered analysis. Receive a match score and actionable suggestions to improve your chances.
        </p>
      </div>
      <ResumeAnalyzerForm />
    </div>
  );
}
