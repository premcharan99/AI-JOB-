
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ClipboardCopy, AlertCircle, FileText, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { generateDemoResume } from '@/ai/flows/generate-demo-resume-flow';
import type { GenerateDemoResumeInput, GenerateDemoResumeOutput } from '@/ai/flows/generate-demo-resume-flow';

export function DemoResumeGeneratorForm() {
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | 'intermediate' | 'senior'>('fresher');
  
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedResume(null);
    setError(null);

    if (!jobDescription.trim()) {
      setError('Please enter the job description.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateDemoResume({
        jobDescription,
        experienceLevel,
      } as GenerateDemoResumeInput);
      setGeneratedResume(result.demoResume);
    } catch (e: any)
      {
      console.error('Demo resume generation error:', e);
      setError(e.message || 'Failed to generate demo resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (textToCopy: string) => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast({
            title: 'Copied to clipboard!',
            description: 'The generated resume has been copied to your clipboard.',
          });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast({
            title: 'Error',
            description: 'Failed to copy resume to clipboard.',
            variant: 'destructive',
          });
        });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 p-6">
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <UserPlus className="mr-3 h-6 w-6" />
            Demo Resume Generator Inputs
          </CardTitle>
          <CardDescription>
            Paste the job description and select an experience level to generate a demo resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="demo-job-description" className="block mb-2 font-medium text-foreground/80">
                Job Description
              </Label>
              <Textarea
                id="demo-job-description"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="rounded-lg border-border focus:ring-primary focus:border-primary transition-shadow duration-200 ease-in-out shadow-sm hover:shadow-md"
                aria-label="Job description input for demo resume"
              />
            </div>

            <div>
              <Label className="block mb-2 font-medium text-foreground/80">Experience Level</Label>
              <RadioGroup
                value={experienceLevel}
                onValueChange={(value: 'fresher' | 'intermediate' | 'senior') => setExperienceLevel(value)}
                className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fresher" id="fresher" />
                  <Label htmlFor="fresher" className="font-normal">Fresher</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="font-normal">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="senior" id="senior" />
                  <Label htmlFor="senior" className="font-normal">Senior</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg px-8 py-3 text-base font-semibold transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Demo Resume'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col justify-center items-center text-center py-10 bg-card/50 rounded-xl shadow-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl font-semibold text-foreground">Generating demo resume...</p>
          <p className="text-muted-foreground">This might take a few moments.</p>
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="destructive" className="rounded-xl shadow-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">An Error Occurred</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedResume && !isLoading && (
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/10 p-6">
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <FileText className="mr-3 h-6 w-6" />
              Generated Demo Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              value={generatedResume}
              readOnly
              rows={20}
              className="rounded-lg border-border bg-background/50 shadow-sm p-4 whitespace-pre-wrap"
              aria-label="Generated demo resume"
            />
          </CardContent>
          <CardFooter className="p-6 bg-primary/5 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => handleCopyToClipboard(generatedResume)} 
              className="border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg shadow-sm transition-colors"
            >
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Resume
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
