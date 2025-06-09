
import { ResumeAnalyzerForm } from '@/components/resume-analyzer-form';
import { DemoResumeGeneratorForm } from '@/components/demo-resume-generator-form';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary sm:text-5xl lg:text-6xl">
          Student Resume Toolkit
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          Analyze your resume's fitness for a job, get AI-powered suggestions, modify your resume, or generate a tailored demo resume.
        </p>
      </div>
      
      <section id="resume-analyzer" className="scroll-mt-20">
        <ResumeAnalyzerForm />
      </section>

      <Separator className="my-12 md:my-16" />

      <section id="demo-resume-generator" className="scroll-mt-20">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight font-headline text-primary sm:text-4xl">
            Generate a Demo Resume
          </h2>
          <p className="mt-3 max-w-2xl text-md text-muted-foreground">
            Need a starting point? Provide a job description and select an experience level to create a sample resume.
          </p>
        </div>
        <DemoResumeGeneratorForm />
      </section>
    </div>
  );
}
