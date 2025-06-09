
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ClipboardCopy, AlertCircle, Briefcase, FileText, Lightbulb, Sparkles, Download, SearchCheck, SearchSlash, CheckCircle, Columns } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { analyzeResume, type AnalyzeResumeInput, type AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-flow';
import { modifyResumeAndAnalyze, type ModifyResumeInput, type ModifyResumeOutput } from '@/ai/flows/modify-resume-flow';

type ActiveTabType = 'input' | 'initialAnalysis' | 'modifiedAnalysis';

const KeywordDisplay: React.FC<{ title: string; keywords: string[]; variant?: "default" | "secondary" | "outline" | "destructive"; icon?: React.ElementType }> = ({ title, keywords, variant = "secondary", icon: Icon }) => {
  if (!keywords || keywords.length === 0) {
    return null;
  }
  return (
    <div>
      <h4 className="text-md font-semibold text-foreground/90 mb-2 flex items-center">
        {Icon && <Icon className="mr-2 h-5 w-5 text-primary/80" />}
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge key={index} variant={variant} className="text-sm py-1 px-3 shadow-sm">
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export function ResumeAnalyzerForm() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modifiedResume, setModifiedResume] = useState<string | null>(null);
  const [modifiedAnalysisResult, setModifiedAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isModifying, setIsModifying] = useState(false);
  const [modificationError, setModificationError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTabType>('input');

  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    setModifiedResume(null);
    setModifiedAnalysisResult(null);
    setModificationError(null);

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
      setActiveTab('initialAnalysis');
    } catch (e: any) {
      console.error('Resume analysis error:', e);
      setError(e.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyResume = async () => {
    if (!analysisResult || !jobDescription || !resumeText) return;

    setIsModifying(true);
    setModifiedResume(null);
    setModifiedAnalysisResult(null);
    setModificationError(null);

    try {
      const result = await modifyResumeAndAnalyze({
        jobDescription,
        originalResumeText: resumeText,
        analysisSuggestions: analysisResult.suggestions,
      } as ModifyResumeInput);
      setModifiedResume(result.modifiedResumeText);
      setModifiedAnalysisResult(result.newAnalysis);
      setActiveTab('modifiedAnalysis');
    } catch (e: any) {
      console.error('Resume modification error:', e);
      setModificationError(e.message || 'Failed to modify resume. Please try again.');
    } finally {
      setIsModifying(false);
    }
  };

  const downloadTextFile = (filename: string, text: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: 'Download Started',
      description: `${filename} is being downloaded.`,
    });
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

  const renderAnalysisSection = (title: string, currentAnalysis: AnalyzeResumeOutput | null, isModifiedSection = false) => {
    if (!currentAnalysis) return null;

    const { matchScore, suggestions, keywords } = currentAnalysis;

    return (
      <Card className="shadow-xl rounded-xl overflow-hidden mt-6">
        <CardHeader className="bg-primary/10 p-6">
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            {isModifiedSection ? <Sparkles className="mr-3 h-6 w-6" /> : <FileText className="mr-3 h-6 w-6" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Match Score</h3>
            <p className="text-2xl text-primary font-bold bg-primary/5 p-4 rounded-md shadow-sm text-center">
              {matchScore}
            </p>
          </div>

          {isModifiedSection && modifiedResume && (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Modified Resume Text</h3>
               <Textarea
                value={modifiedResume}
                readOnly
                rows={15}
                className="rounded-lg border-border bg-background/50 shadow-sm p-4 whitespace-pre-wrap"
                aria-label="Modified resume text"
              />
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" /> Improvement Suggestions
            </h3>
            <div 
              className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 p-4 border border-border rounded-md bg-background/5 shadow-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n- /g, '<br />• ').replace(/^- /g, '• ') }} 
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center"><Columns className="mr-2 h-5 w-5 text-indigo-500" />Keyword Analysis</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <KeywordDisplay title="From Job Description" keywords={keywords.jobDescriptionKeywords} variant="outline" icon={SearchCheck} />
              <KeywordDisplay title="Found in Resume" keywords={keywords.presentInResume} variant="default" icon={CheckCircle} />
              <KeywordDisplay title="Missing from Resume" keywords={keywords.missingFromResume} variant="destructive" icon={SearchSlash} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-primary/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleCopyToClipboard(suggestions, 'Suggestions')} 
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg shadow-sm transition-colors w-full sm:w-auto"
          >
            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Suggestions
          </Button>
          {isModifiedSection && modifiedResume && (
            <Button 
              onClick={() => downloadTextFile('modified_resume.txt', modifiedResume)}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" /> Download Modified Resume
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-2"> {/* Reduced space-y for tighter layout with tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTabType)} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
          <TabsTrigger value="input">Step 1: Provide Details</TabsTrigger>
          <TabsTrigger value="initialAnalysis" disabled={!analysisResult && !isLoading}>
            Step 2: Initial Analysis
          </TabsTrigger>
          <TabsTrigger value="modifiedAnalysis" disabled={!modifiedResume && !isModifying}>
            Step 3: AI-Powered Revision
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card className="shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="bg-primary/10 p-6">
              <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <Briefcase className="mr-3 h-6 w-6" />
                Resume Analysis Inputs
              </CardTitle>
              <CardDescription>
                Paste the job description and your resume below. The AI will analyze them.
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
                    disabled={isLoading || isModifying} 
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
            <div className="flex flex-col justify-center items-center text-center py-10 bg-card/50 rounded-xl shadow-md mt-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-xl font-semibold text-foreground">Analyzing your resume...</p>
              <p className="text-muted-foreground">This might take a few moments.</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive" className="rounded-xl shadow-md mt-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Analysis Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="initialAnalysis">
          {analysisResult && renderAnalysisSection("Initial Analysis Results", analysisResult)}
          {analysisResult && !isLoading && !isModifying && !modifiedResume && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleModifyResume} 
                disabled={isModifying}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-8 py-3 text-base font-semibold transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Suggest & Modify Resume
              </Button>
            </div>
          )}
          {isModifying && (
            <div className="flex flex-col justify-center items-center text-center py-10 bg-card/50 rounded-xl shadow-md mt-8">
              <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
              <p className="text-xl font-semibold text-foreground">Modifying your resume with AI...</p>
              <p className="text-muted-foreground">This may take a bit longer.</p>
            </div>
          )}
          {modificationError && !isModifying && (
            <Alert variant="destructive" className="rounded-xl shadow-md mt-8">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Modification Error</AlertTitle>
              <AlertDescription>{modificationError}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="modifiedAnalysis">
          {modifiedAnalysisResult && modifiedResume && !isModifying && renderAnalysisSection("Modified Resume Analysis", modifiedAnalysisResult, true)}
           {isModifying && !modifiedResume && ( // Show loader here if modification is in progress and tab is somehow active
            <div className="flex flex-col justify-center items-center text-center py-10 bg-card/50 rounded-xl shadow-md mt-8">
              <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
              <p className="text-xl font-semibold text-foreground">Loading AI Revision...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
