
'use client';

import { useState, type FormEvent, useEffect } from 'react';
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
import { modifyResumeAndAnalyze, type ModifyResumeInput } from '@/ai/flows/modify-resume-flow';

type ActiveTabType = 'input' | 'initialAnalysis' | 'modifiedAnalysis';

const KeywordDisplay: React.FC<{ title: string; keywords: string[]; variant?: "default" | "secondary" | "outline" | "destructive"; icon?: React.ElementType }> = ({ title, keywords, variant = "secondary", icon: Icon }) => {
  if (!keywords || keywords.length === 0) {
    return (
      <div>
        <h4 className="text-md font-semibold text-foreground/90 mb-2 flex items-center">
          {Icon && <Icon className="mr-2 h-5 w-5 text-primary/80" />}
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">None found.</p>
      </div>
    );
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

const parseMatchScore = (scoreStr: string | undefined): { percentage: number | null; text: string; qualitative: string } => {
  if (!scoreStr) return { percentage: null, text: "N/A", qualitative: "Not available" };

  let percentage: number | null = null;
  const match = scoreStr.match(/(\d+)%/);
  if (match && match[1]) {
    percentage = parseInt(match[1], 10);
  }

  let qualitative = scoreStr; // Default to the original string if no better qualitative assessment is found
  if (percentage !== null) {
    if (percentage >= 90) qualitative = "Insane Match";
    else if (percentage >= 75) qualitative = "Strong Match";
    else if (percentage >= 50) qualitative = "Moderate Match";
    else if (percentage > 0) qualitative = "Low Match";
    else qualitative = "Very Low Match";
  } else {
    const lowerScoreStr = scoreStr.toLowerCase();
    if (lowerScoreStr.includes("insane") || lowerScoreStr.includes("excellent")) qualitative = "Insane Match";
    else if (lowerScoreStr.includes("strong")) qualitative = "Strong Match";
    else if (lowerScoreStr.includes("moderate") || lowerScoreStr.includes("good")) qualitative = "Moderate Match";
    else if (lowerScoreStr.includes("weak") || lowerScoreStr.includes("low") || lowerScoreStr.includes("fair")) qualitative = "Low Match";
  }
  return { percentage, text: scoreStr, qualitative };
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
  const [isLoadingPopupVisible, setIsLoadingPopupVisible] = useState(false);
  const [loadingPopupMessage, setLoadingPopupMessage] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) {
      setLoadingPopupMessage('Analyzing your resume...');
      setIsLoadingPopupVisible(true);
    } else if (isModifying) {
      setLoadingPopupMessage('Modifying your resume with AI...');
      setIsLoadingPopupVisible(true);
    } else {
      setIsLoadingPopupVisible(false);
    }
  }, [isLoading, isModifying]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setAnalysisResult(null);
    setModifiedResume(null);
    setModifiedAnalysisResult(null);
    setModificationError(null);

    if (!jobDescription.trim()) {
      setError('Please enter the job description.');
      return;
    }
    if (!resumeText.trim()) {
      setError('Please enter your resume text.');
      return;
    }
    setIsLoading(true);
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
      setActiveTab('input'); // Stay on input tab if error
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyResume = async () => {
    if (!analysisResult || !jobDescription || !resumeText) return;

    setModificationError(null);
    setModifiedResume(null);
    setModifiedAnalysisResult(null);
    setIsModifying(true);

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
      // Stay on initialAnalysis tab if error during modification
    } finally {
      setIsModifying(false);
    }
  };

  const downloadTextFile = (filename: string, text: string | null) => {
    if (!text) return;
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

  const handleCopyToClipboard = (textToCopy: string | undefined, type: string) => {
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
  
  const renderSuggestions = (suggestions: string | undefined) => {
    if (!suggestions) return <p className="text-sm text-muted-foreground">No suggestions provided.</p>;
    // Create a basic list from newline-separated suggestions, assuming AI provides bullet points or simple lines.
    const suggestionItems = suggestions.split('\n').filter(line => line.trim() !== "").map((line, index) => (
      <li key={index} className="text-sm leading-relaxed text-foreground/90 mb-1">{line.replace(/^- ?/, '• ')}</li>
    ));
    return <ul className="list-none pl-0">{suggestionItems}</ul>;
  };


  const renderAnalysisSection = (title: string, currentAnalysis: AnalyzeResumeOutput | null, isModifiedSection = false) => {
    if (!currentAnalysis) return null;

    const { matchScore, suggestions, keywords } = currentAnalysis;
    const { percentage, qualitative } = parseMatchScore(matchScore);

    return (
      <Card className="shadow-xl rounded-xl overflow-hidden mt-6">
        <CardHeader className="bg-primary/10 p-6">
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            {isModifiedSection ? <Sparkles className="mr-3 h-6 w-6" /> : <FileText className="mr-3 h-6 w-6" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isModifiedSection && modifiedResume && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Revised Resume Text</h3>
               <Textarea
                value={modifiedResume}
                readOnly
                rows={15}
                className="rounded-lg border-border bg-background/50 shadow-sm p-4 whitespace-pre-wrap"
                aria-label="Modified resume text"
              />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-x-8 gap-y-6 items-start">
            {/* Left Column: Suggestions */}
            <div className="md:col-span-1 space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" /> Improvement Suggestions
              </h3>
              <div className="p-4 border border-border rounded-md bg-background/5 shadow-sm max-h-96 overflow-y-auto">
                {renderSuggestions(suggestions)}
              </div>
            </div>

            {/* Center Column: Match Score */}
            <div className="md:col-span-1 flex flex-col items-center justify-start text-center space-y-3 py-4 md:order-first md:row-span-2 order-first mb-6 md:mb-0">
              <h3 className="text-lg font-semibold text-foreground">Match Score</h3>
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-primary flex flex-col justify-center items-center text-center shadow-lg bg-card p-2">
                {percentage !== null ? (
                  <>
                    <span className="text-4xl sm:text-5xl font-bold text-primary">{percentage}</span>
                    <span className="text-xs text-muted-foreground mt-1">/ 100</span>
                  </>
                ) : (
                   <span className="text-lg font-bold text-primary px-2 break-all">{matchScore || "N/A"}</span>
                )}
              </div>
              <p className="text-lg font-semibold text-primary">{qualitative}</p>
            </div>

            {/* Right Column: Keywords */}
            <div className="md:col-span-1 space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center"><Columns className="mr-2 h-5 w-5 text-indigo-500" />Keyword Analysis</h3>
              <div className="space-y-4 p-4 border border-border rounded-md bg-background/5 shadow-sm">
                <KeywordDisplay title="From Job Description" keywords={keywords.jobDescriptionKeywords} variant="outline" icon={SearchCheck} />
                <Separator className="my-3"/>
                <KeywordDisplay title="Found in Resume" keywords={keywords.presentInResume} variant="default" icon={CheckCircle} />
                <Separator className="my-3"/>
                <KeywordDisplay title="Missing from Resume" keywords={keywords.missingFromResume} variant="destructive" icon={SearchSlash} />
              </div>
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
    <div className="space-y-2">
      {isLoadingPopupVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-card p-8 rounded-lg shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-xl font-semibold text-foreground">{loadingPopupMessage}</p>
            <p className="text-muted-foreground mt-1">Please wait a few moments.</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTabType)} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
          <TabsTrigger value="input" disabled={isLoading || isModifying}>Step 1: Provide Details</TabsTrigger>
          <TabsTrigger value="initialAnalysis" disabled={!analysisResult && !isLoading && !isModifying}>
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
                    disabled={isLoading || isModifying}
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
                    disabled={isLoading || isModifying}
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive" className="rounded-xl shadow-md">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Analysis Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || isModifying || !jobDescription.trim() || !resumeText.trim()} 
                    className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg px-8 py-3 text-base font-semibold transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md"
                  >
                    Analyze Resume
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="initialAnalysis">
          {analysisResult && renderAnalysisSection("Initial Analysis Results", analysisResult)}
          {analysisResult && !modifiedResume && ( // Show modify button only if not already modified
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleModifyResume} 
                disabled={isModifying || isLoading}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-8 py-3 text-base font-semibold transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Suggest & Modify Resume with AI
              </Button>
            </div>
          )}
          {modificationError && ( // Show modification error here if it occurred
            <Alert variant="destructive" className="rounded-xl shadow-md mt-8">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Modification Error</AlertTitle>
              <AlertDescription>{modificationError}</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="modifiedAnalysis">
          {modifiedAnalysisResult && modifiedResume && renderAnalysisSection("Modified Resume Analysis", modifiedAnalysisResult, true)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
