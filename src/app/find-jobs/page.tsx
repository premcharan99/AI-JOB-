
'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, Briefcase, FileUp, Upload, Sparkles, ExternalLink, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { findJobsByResume, type FindJobsByResumeInput, type FoundJob } from '@/ai/flows/find-jobs-by-resume-flow';
import { Badge } from '@/components/ui/badge';

const targetCompanies = [
  "Amazon", "DBS", "Adobe", "Microsoft", "NCR", "Micron", 
  "Flipkart", "Salesforce", "Uber", "Servicenow", "ADP"
];

export default function FindJobsPage() {
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [foundJobs, setFoundJobs] = useState<FoundJob[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoadingPopupVisible, setIsLoadingPopupVisible] = useState(false);

  const router = useRouter();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setResumeDataUri(null);
    setResumeFileName(null);
    setFoundJobs(null);
    const file = event.target.files?.[0];

    if (file) {
      if (file.type === 'application/pdf') {
        setResumeFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUri = e.target?.result as string;
          setResumeDataUri(dataUri);
        };
        reader.onerror = () => {
          setFileError('Error reading file. Please try again.');
        };
        reader.readAsDataURL(file);
      } else {
        setFileError('Invalid file type. Please upload a .pdf file only.');
        event.target.value = '';
      }
    } else {
      setFileError('No file selected. Please upload your resume.');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFoundJobs(null);

    if (!resumeDataUri || !resumeFileName) {
      setFileError('Please upload your resume file (.pdf).');
      return;
    }

    setIsLoading(true);
    setIsLoadingPopupVisible(true);
    try {
      const result = await findJobsByResume({ resumeDataUri } as FindJobsByResumeInput);
      setFoundJobs(result.jobs);
    } catch (e: any) {
      console.error('Find jobs error:', e);
      setError(e.message || 'Failed to find jobs. The AI may not have been able to process the resume or generate job listings.');
    } finally {
      setIsLoading(false);
      setIsLoadingPopupVisible(false);
    }
  };

  const handleModifyResumeForJob = (jobDescription: string) => {
    if (!resumeDataUri) {
        setError("Resume data is missing. Please upload your resume again.");
        return;
    }
    router.push(`/resume-analyzer?jobDescription=${encodeURIComponent(jobDescription)}`);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      {isLoadingPopupVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-card p-6 sm:p-8 rounded-lg shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-4" />
            <p className="text-lg sm:text-xl font-semibold text-foreground">Finding matching jobs...</p>
            <p className="text-sm text-muted-foreground mt-1">AI is analyzing your resume. Please wait.</p>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary sm:text-5xl lg:text-6xl">
          Find Jobs by Resume
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          Upload your resume (PDF) and let our AI discover job opportunities that match your profile.
        </p>
      </div>

      <Card className="shadow-xl rounded-xl overflow-hidden mb-8">
        <CardHeader className="bg-primary/10 p-6">
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Upload className="mr-3 h-6 w-6" />
            Upload Your Resume
          </CardTitle>
          <CardDescription>
            Provide your resume in PDF format to start the job search.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="resume-file-find-jobs" className="block mb-2 font-medium text-foreground/80">
                Resume File (.pdf only)
              </Label>
              <div className="flex items-center space-x-3 mt-1">
                <label htmlFor="resume-file-find-jobs" className="flex-grow">
                  <div className="flex items-center justify-center w-full px-4 py-3 text-sm text-primary border-2 border-dashed border-primary/50 rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
                    <FileUp className="w-5 h-5 mr-2" />
                    <span>{resumeFileName || 'Click to upload or drag & drop .pdf file'}</span>
                  </div>
                  <Input
                    id="resume-file-find-jobs"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                    aria-label="Resume file input for job search"
                    disabled={isLoading}
                  />
                </label>
                {resumeFileName && !fileError && <Upload className="h-5 w-5 text-green-500 shrink-0" />}
              </div>
              {resumeFileName && !fileError && <p className="text-xs text-muted-foreground mt-1.5">Selected: {resumeFileName}</p>}
              {fileError && (
                <Alert variant="destructive" className="mt-2 rounded-md shadow-sm py-2 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">File Error</AlertTitle>
                  <AlertDescription className="text-xs">{fileError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="mt-6 p-4 border border-dashed border-border rounded-lg bg-card/50">
                <h3 className="text-md font-semibold text-foreground mb-2 flex items-center">
                    <Building className="mr-2 h-5 w-5 text-primary" />
                    Searching from companies like:
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                    {targetCompanies.map(company => (
                        <Badge key={company} variant="secondary" className="text-xs">{company}</Badge>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground">More companies coming soon...</p>
                <p className="text-xs text-muted-foreground mt-1">Note: Job listings are AI-generated simulations based on your resume.</p>
            </div>


            {error && (
              <Alert variant="destructive" className="rounded-xl shadow-md mt-4">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Search Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isLoading || !resumeDataUri || !!fileError}
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg px-8 py-3 text-base font-semibold transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Find Matching Jobs'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {foundJobs && foundJobs.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-primary">Matching Job Opportunities</h2>
          {foundJobs.map((job, index) => (
            <Card key={index} className="shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="bg-card border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-semibold text-primary">{job.jobTitle}</CardTitle>
                        <CardDescription className="text-md text-foreground/80">{job.companyName}</CardDescription>
                    </div>
                    <span className="text-sm font-semibold text-accent py-1 px-3 rounded-full bg-accent/10 border border-accent/30 whitespace-nowrap">
                        {job.matchPercentage}
                    </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{job.jobDescription}</p>
              </CardContent>
              <CardFooter className="p-6 bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-3">
                <Button
                    variant="outline"
                    onClick={() => handleModifyResumeForJob(job.jobDescription)}
                    className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg"
                    title="Pre-fill this job description in Resume Analyzer"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Modify Resume for this Job
                </Button>
                <Button
                  asChild
                  variant={job.applyLink && job.applyLink !== '#' ? 'default' : 'secondary'}
                  className={`w-full sm:w-auto ${job.applyLink && job.applyLink !== '#' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed hover:bg-gray-400'}`}
                  disabled={!job.applyLink || job.applyLink === '#'}
                >
                  <a
                    href={job.applyLink && job.applyLink !== '#' ? job.applyLink : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => (!job.applyLink || job.applyLink === '#') && e.preventDefault()}
                    aria-disabled={!job.applyLink || job.applyLink === '#'}
                  >
                    Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {foundJobs && foundJobs.length === 0 && !isLoading && (
         <Alert className="rounded-xl shadow-md">
            <Briefcase className="h-5 w-5" />
            <AlertTitle className="font-semibold">No Specific Matches Found by AI</AlertTitle>
            <AlertDescription>
                The AI couldn't pinpoint specific job matches right now. Try refining your resume or check back later.
                You can still use the Resume Analyzer or Demo Resume Generator.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
