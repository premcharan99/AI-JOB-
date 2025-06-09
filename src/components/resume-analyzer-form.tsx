
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ClipboardCopy, AlertCircle, Briefcase, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { analyzeResume } from '@/ai/flows/analyze-resume-flow';
import type { AnalyzeResumeInput, AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-flow';

export function ResumeAnalyzerForm() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    if (!jobDescription.trim()) {
      setError('Please enter the job description.');
      setIsLoading(false);
      return;
    }
    if (!resumeText.trim()) {
      setError('Please enter your resume text.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await analyzeResume({
        jobDescription,
        resumeText,
      } as AnalyzeResumeInput);
      setAnalysisResult(result);
    } catch (e: any) {
      console.error('Resume analysis error:', e);
      setError(e.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (textToCopy: string, type: string) => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast({
            title: `Copied ${type} to clipboard!`,
            description: `The ${type.toLowerCase()} has been copied to your clipboard.`,
          });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast({
            title: 'Error',
            description: `Failed to copy ${type.toLowerCase()} to clipboard.`,
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
            <Briefcase className="mr-3 h-6 w-6" />
            Resume Analysis Inputs
          </CardTitle>
          <CardDescription>
            Paste the job description and your resume below, then click "Analyze Resume".
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="job-description" className="block mb-2 font-medium text-foreground/80">
                Job Description
              </Label>
              <Textarea
                id="job-description"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="rounded-lg border-border focus:ring-primary focus:border-primary transition-shadow duration-200 ease-in-out shadow-sm hover:shadow-md"
                aria-label="Job description input"
              />
            </div>

            <div>
              <Label htmlFor="resume-text" className="block mb-2 font-medium text-foreground/80">
                Your Resume
              </Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your full resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={15}
                className="rounded-lg border-border focus:ring-primary focus:border-primary transition-shadow duration-200 ease-in-out shadow-sm hover:shadow-md"
                aria-label="Resume text input"
              />
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
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col justify-center items-center text-center py-10 bg-card/50 rounded-xl shadow-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl font-semibold text-foreground">Analyzing your resume...</p>
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

      {analysisResult && !isLoading && (
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/10 p-6">
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <FileText className="mr-3 h-6 w-6" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Match Score</h3>
              <p className="text-lg text-primary font-bold bg-primary/5 p-3 rounded-md shadow-sm">
                {analysisResult.matchScore}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Improvement Suggestions</h3>
              <div 
                className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 p-4 border border-border rounded-md bg-background shadow-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: analysisResult.suggestions.replace(/\n- /g, '<br />• ').replace(/^- /g, '• ') }} 
              />
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-primary/5 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => handleCopyToClipboard(analysisResult.suggestions, 'Suggestions')} 
              className="border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg shadow-sm transition-colors"
            >
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Suggestions
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

