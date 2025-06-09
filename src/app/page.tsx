import { SummarizerForm } from '@/components/summarizer-form';

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary sm:text-5xl lg:text-6xl">
          Unlock Key Insights Instantly
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Paste your text or provide a URL. Synapse Summarizer, powered by AI, will distill the content into concise summaries of your chosen length.
        </p>
      </div>
      <SummarizerForm />
    </div>
  );
}
