'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ClipboardCopy, AlertCircle, FileText, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { summarizeContent } from '@/ai/flows/summarize-content';
import type { SummarizeContentInput } from '@/ai/flows/summarize-content';
import { summarizeWebpage } from '@/ai/flows/summarize-webpage';
import type { SummarizeWebpageInput } from '@/ai/flows/summarize-webpage';
import { generateSummaryWithVariableLength } from '@/ai/flows/generate-summary-variations';
import type { GenerateSummaryWithVariableLengthInput } from '@/ai/flows/generate-summary-variations';

type SummaryLength = 'short' | 'medium' | 'long';
type InputMode = 'text' | 'url';

export function SummarizerForm() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInputValue, setTextInputValue] = useState('');
  const [urlInputValue, setUrlInputValue] = useState('');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  
  const [summary, setSummary] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setSummary(null);
    setSourceUrl(null);
    setError(null);

    try {
      if (inputMode === 'text') {
        if (!textInputValue.trim()) {
          setError('Please enter some text to summarize.');
          setIsLoading(false);
          return;
        }
        const result = await summarizeContent({
          text: textInputValue,
          length: summaryLength,
        } as SummarizeContentInput);
        setSummary(result.summary);
      } else if (inputMode === 'url') {
        if (!urlInputValue.trim()) {
          setError('Please enter a URL to summarize.');
          setIsLoading(false);
          return;
        }
        // Validate URL format
        try {
          new URL(urlInputValue);
        } catch (_) {
          setError('Invalid URL format. Please enter a valid URL (e.g., https://example.com).');
          setIsLoading(false);
          return;
        }

        // Step 1: Get initial summary from webpage
        const pageData = await summarizeWebpage({ url: urlInputValue } as SummarizeWebpageInput);
        setSourceUrl(pageData.sourceUrl);

        // Step 2: Refine summary to desired length using its text content
        const finalSummaryData = await generateSummaryWithVariableLength({
          content: pageData.summary, // Use the text summary from summarizeWebpage
          length: summaryLength,
        } as GenerateSummaryWithVariableLengthInput);
        setSummary(finalSummaryData.summary);
      }
    } catch (e: any) {
      console.error('Summarization error:', e);
      setError(e.message || 'Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary)
        .then(() => {
          toast({
            title: 'Copied to clipboard!',
            description: 'The summary has been copied to your clipboard.',
          });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast({
            title: 'Error',
            description: 'Failed to copy summary to clipboard.',
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
            {inputMode === 'text' ? 
              <FileText className="mr-3 h-6 w-6" /> : 
              <LinkIcon className="mr-3 h-6 w-6" />}
            Input Your Content
          </CardTitle>
          <CardDescription>
            Choose your input method, paste content or URL, select summary length, and hit Summarize.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-primary/5 rounded-lg">
                <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md py-2.5">
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="url" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md py-2.5">
                  Enter URL
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <Textarea
                  placeholder="Paste your text here to get a summary..."
                  value={textInputValue}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  rows={8}
                  className="rounded-lg border-border focus:ring-primary focus:border-primary transition-shadow duration-200 ease-in-out shadow-sm hover:shadow-md"
                  aria-label="Text input for summarization"
                />
              </TabsContent>
              <TabsContent value="url">
                <Input
                  type="url"
                  placeholder="https://example.com/article"
                  value={urlInputValue}
                  onChange={(e) => setUrlInputValue(e.target.value)}
                  className="rounded-lg border-border focus:ring-primary focus:border-primary transition-shadow duration-200 ease-in-out shadow-sm hover:shadow-md"
                  aria-label="URL input for summarization"
                />
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <div className="flex-grow w-full sm:w-auto">
                <Label htmlFor="summary-length" className="block mb-2 font-medium text-foreground/80">
                  Desired Summary Length
                </Label>
                <Select value={summaryLength} onValueChange={(value) => setSummaryLength(value as SummaryLength)}>
                  <SelectTrigger id="summary-length" className="w-full rounded-lg border-border focus:ring-primary focus:border-primary transition-shadow duration-200 ease-in-out shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg px-8 py-3 text-base font-semibold transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  'Summarize'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col justify-center items-center text-center py-10 bg-card/50 rounded-xl shadow-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-xl font-semibold text-foreground">Generating your summary...</p>
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

      {summary && !isLoading && (
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/10 p-6">
            <CardTitle className="text-2xl font-headline text-primary">Generated Summary</CardTitle>
            {sourceUrl && (
              <CardDescription className="pt-1">
                Source: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">{sourceUrl}</a>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
              {summary}
            </p>
          </CardContent>
          <CardFooter className="p-6 bg-primary/5">
            <Button 
              variant="outline" 
              onClick={handleCopyToClipboard} 
              className="ml-auto border-primary text-primary hover:bg-primary/10 hover:text-primary rounded-lg shadow-sm transition-colors"
            >
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Summary
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
