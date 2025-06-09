
import { DemoResumeGeneratorForm } from '@/components/demo-resume-generator-form';

export default function DemoResumeGeneratorPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary sm:text-5xl lg:text-6xl">
          Demo Resume Generator
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          Need a starting point for your resume? Provide a job description and select an experience level (Fresher, Intermediate, or Senior) to generate a professional demo resume tailored by AI.
        </p>
      </div>
      <DemoResumeGeneratorForm />
    </div>
  );
}
