
'use client';

import { useState, type FormEvent, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ClipboardCopy, AlertCircle, Briefcase, FileText, Lightbulb, Sparkles, Download, SearchCheck, SearchSlash, CheckCircle, Columns, Upload, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';

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

  let qualitative = scoreStr; 
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
  const searchParams = useSearchParams();
  const prefilledJobDescription = searchParams.get('jobDescription');

  const [jobDescription, setJobDescription] = useState(prefilledJobDescription || '');
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [modifiedResume, setModifiedResume] = useState<string | null>(null);
  const [modifiedAnalysisResult, setModifiedAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isModifying, setIsModifying] = useState(false);
  const [modificationError, setModificationError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTabType>('input');
  const [isLoadingPopupVisible, setIsLoadingPopupVisible] = useState(false);
  const [loadingPopupMessage, setLoadingPopupMessage] = useState('');
  const [showPdfWarning, setShowPdfWarning] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (prefilledJobDescription) {
      setJobDescription(prefilledJobDescription);
    }
  }, [prefilledJobDescription]);

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setResumeDataUri(null); 
    setResumeFileName(null);
    setShowPdfWarning(false);
    const file = event.target.files?.[0];

    if (file) {
      if (file.type === "application/pdf") {
        setResumeFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUri = e.target?.result as string;
          setResumeDataUri(dataUri); 
        };
        reader.onerror = () => {
          setFileError("Error reading file. Please try again.");
          setResumeFileName(null);
          setResumeDataUri(null);
        };
        reader.readAsDataURL(file); 
      } else {
        setFileError("Invalid file type. Please upload a .pdf file only.");
        setResumeFileName(null);
        setResumeDataUri(null);
        event.target.value = ''; 
      }
    } else {
        setFileError("No file selected. Please upload your resume.");
        setResumeDataUri(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setAnalysisResult(null);
    setModifiedResume(null);
    setModifiedAnalysisResult(null);
    setModificationError(null);
    setShowPdfWarning(false);

    if (!jobDescription.trim()) {
      setError('Please enter the job description.');
      return;
    }
    if (!resumeFileName || !resumeDataUri) { 
       setError('Please upload your resume file (.pdf).');
       setFileError('Please upload your resume file (.pdf) and ensure it is processed.');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await analyzeResume({
        jobDescription,
        resumeDataUri, 
      } as AnalyzeResumeInput);
      setAnalysisResult(result);
      setActiveTab('initialAnalysis');
    } catch (e: any) {
      console.error('Resume analysis error:', e);
      setError(e.message || 'Failed to analyze resume. The AI may not have been able to process the uploaded PDF. Please try a different PDF or ensure it is text-based.');
      setActiveTab('input'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleModifyResume = async () => {
    if (!analysisResult || !jobDescription || !resumeDataUri) return;

    setModificationError(null);
    setModifiedResume(null);
    setModifiedAnalysisResult(null);
    setIsModifying(true);

    try {
      const result = await modifyResumeAndAnalyze({
        jobDescription,
        originalResumeDataUri: resumeDataUri, 
        analysisSuggestions: analysisResult.suggestions,
      } as ModifyResumeInput);
      setModifiedResume(result.modifiedResumeText);
      setModifiedAnalysisResult(result.newAnalysis);
      setActiveTab('modifiedAnalysis');
    } catch (e: any) {
      console.error('Resume modification error:', e);
      setModificationError(e.message || 'Failed to modify resume. The AI may not have been able to process the original PDF for modification.');
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 items-start">
            {/* Match Score - Order 1 on mobile, Order 2 on md */}
            <div className="md:col-span-1 flex flex-col items-center justify-start text-center space-y-3 py-4 order-1 md:order-2 md:row-span-2">
              <h3 className="text-lg font-semibold text-foreground">Match Score</h3>
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-primary flex flex-col justify-center items-center text-center shadow-lg bg-card p-2">
                {percentage !== null ? (
                  <>
                    <span className="text-4xl sm:text-5xl font-bold text-primary">{percentage}</span>
                    <span className="text-xs text-muted-foreground mt-1">/ 100</span>
                  </>
                ) : (
                   <span className="text-lg font-bold text-primary px-2 text-center break-words">{matchScore || "N/A"}</span>
                )}
              </div>
              <p className="text-lg font-semibold text-primary">{qualitative}</p>
            </div>
            
            {/* Improvement Suggestions - Order 2 on mobile, Order 1 on md */}
            <div className="md:col-span-1 space-y-3 order-2 md:order-1">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" /> Improvement Suggestions
              </h3>
              <div className="p-4 border border-border rounded-md bg-background/5 shadow-sm max-h-96 overflow-y-auto">
                {renderSuggestions(suggestions)}
              </div>
            </div>

            {/* Keyword Analysis - Order 3 on mobile, Order 3 on md */}
            <div className="md:col-span-1 space-y-3 order-3 md:order-3">
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
          <div className="bg-card p-6 sm:p-8 rounded-lg shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-4" />
            <p className="text-lg sm:text-xl font-semibold text-foreground">{loadingPopupMessage}</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait a few moments.</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTabType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1 mb-6">
          <TabsTrigger 
            value="input" 
            disabled={isLoading || isModifying}
            className="px-3 py-2.5 text-center whitespace-normal"
          >
            Step 1
          </TabsTrigger>
          <TabsTrigger 
            value="initialAnalysis" 
            disabled={!analysisResult && !isLoading && !isModifying}
            className="px-3 py-2.5 text-center whitespace-normal"
          >
            Step 2
          </TabsTrigger>
          <TabsTrigger 
            value="modifiedAnalysis" 
            disabled={!modifiedResume && !isModifying}
            className="px-3 py-2.5 text-center whitespace-normal"
          >
            Step 3
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
                Paste the job description and upload your resume (.pdf format only).
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
                  <Label htmlFor="resume-file" className="block mb-2 font-medium text-foreground/80">
                    Upload Your Resume (.pdf file only)
                  </Label>
                  <div className="flex items-center space-x-3 mt-1">
                    <label htmlFor="resume-file" className="flex-grow">
                      <div className="flex items-center justify-center w-full px-4 py-3 text-sm text-primary border-2 border-dashed border-primary/50 rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
                        <FileUp className="w-5 h-5 mr-2" />
                        <span>{resumeFileName || "Click to upload or drag & drop .pdf file"}</span>
                      </div>
                      <Input
                        id="resume-file"
                        type="file"
                        accept=".pdf" 
                        onChange={handleFileChange}
                        className="sr-only" 
                        aria-label="Resume file input"
                        disabled={isLoading || isModifying}
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

                {showPdfWarning && (
                  <Alert variant="default" className="mt-4 bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300 rounded-lg shadow">
                    <AlertCircle className="h-5 w-5 !text-yellow-600 dark:!text-yellow-400" />
                    <AlertTitle className="font-semibold">PDF Processing Note</AlertTitle>
                    <AlertDescription>
                      The AI will attempt to extract text from your PDF. For best results with complex PDFs, consider converting to a text-based format first.
                    </AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert variant="destructive" className="rounded-xl shadow-md">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Analysis Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading || isModifying || !jobDescription.trim() || !resumeFileName || !!fileError || !resumeDataUri} 
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
          {analysisResult && !modifiedResume && ( 
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleModifyResume} 
                disabled={isModifying || isLoading || !resumeDataUri}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 sm:px-8 py-3 text-base font-semibold transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Suggest & Modify Resume with AI
              </Button>
            </div>
          )}
          {modificationError && ( 
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

