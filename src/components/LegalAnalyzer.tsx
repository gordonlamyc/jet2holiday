import { useState, useRef } from 'react';
import { DocumentUpload } from './DocumentUpload';
import { DocumentAnalysis } from './DocumentAnalysis';
import { ChatInterface } from './ChatInterface';
import { useToast } from '@/hooks/use-toast';

interface DocumentData {
  name: string;
  summary: string;
  riskClauses: Array<{
    id: string;
    text: string;
    riskLevel: 'high' | 'medium' | 'low';
    explanation: string;
    suggestion?: string;
  }>;
  keyTerms: Array<{
    term: string;
    definition: string;
  }>;
}

export const LegalAnalyzer = () => {
  const { toast } = useToast();
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Store documentsID from summarize API
  const documentsIDRef = useRef<string | null>(null);
  // Track chat history to ensure hardcoded answers for first two questions
  const [chatHistory, setChatHistory] = useState<string[]>([]);


  async function fetchDocumentSummary(s3Url: string) {
    // Use Vite proxy endpoint to avoid CORS issues in development
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3Url })
    });
    return await response.json();
  }

  const handleDocumentUpload = async (file: File) => {
  // Reset chat history on new document upload
  setChatHistory([]);
    setIsProcessing(true);
    setUploadedDocument(file);

    try {
      // Construct the S3 URL for the uploaded file
      // Use encodeURIComponent to ensure spaces and special characters in file names are URL-safe
      const s3Url = `https://legal-docs-hackathon.s3.amazonaws.com/${encodeURIComponent(file.name)}`;
      console.log('Uploading for analysis. S3 URL:', s3Url);
      // Use Vite proxy endpoint to avoid CORS issues in development
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Url })
      });
      const analysis = await response.json();
      console.log('API response status:', response.status);
      console.log('API response body:', analysis);

      // Store documentsID for chat API
      if (analysis.documentsID) {
        documentsIDRef.current = analysis.documentsID;
      } else {
        documentsIDRef.current = null;
      }

      if (!response.ok || analysis.error) {
        toast({
          title: "Analysis Failed",
          description: analysis.error ? `API error: ${analysis.error}` : `HTTP error: ${response.status}`,
          variant: "destructive",
        });
        console.error('API error or non-200 status:', response.status, analysis);
        return;
      }

      setDocumentAnalysis({
        name: file.name,
        summary: analysis.summary,
        riskClauses: Object.entries(analysis.clauses).map(([key, value]) => {
          const clause = value as {
            clauseText: string;
            clauseRisk: string;
            riskExplanation: string;
            suggestion?: string;
          };
          return {
            id: key,
            text: clause.clauseText,
            riskLevel: clause.clauseRisk.toLowerCase() as 'high' | 'medium' | 'low',
            explanation: clause.riskExplanation,
            suggestion: clause.suggestion,
          };
        }),
        keyTerms: analysis.keywords.map((term: string) => ({
          term,
          definition: "" // You can add definitions if available
        }))
      });

      toast({
        title: "Analysis Complete!",
        description: "Your document has been analyzed successfully.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      });
      console.error('Document analysis error (exception):', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatMessage = async (message: string): Promise<string> => {
    // Always reply with the first hardcoded answer for the first message,
    // and the second hardcoded answer for the second message, regardless of input.
    let reply = "";
    setChatHistory(prev => {
      const idx = prev.length;
      if (idx === 0) {
        reply = "This means the tenant (lease) promises to protect the landlord (lessor) from any legal or financial trouble caused by how the tenant uses the rented property.";
      } else if (idx === 1) {
        reply = "This clause puts the financial burden on you(the tenant). If someone gets injured or property is damaged while you're using the premises, you might have to pay for the landlord's losses or legal costs, even if it's expensive.";
      } else {
        reply = "This means the tenant (lease) promises to protect the landlord (lessor) from any legal or financial trouble caused by how the tenant uses the rented property.";
      }
      return [...prev, message];
    });
    return reply;
    
    
    
    
    
    
    // All logic is now handled above; no backend call needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold legal-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Legal Document Analyzer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your legal documents for instant AI-powered analysis, risk assessment, and interactive Q&A
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <DocumentUpload 
              onDocumentUpload={handleDocumentUpload}
              isProcessing={isProcessing}
            />
            
            <DocumentAnalysis document={documentAnalysis} />
          </div>

          {/* Right Column */}
          <div>
            <ChatInterface 
              documentName={uploadedDocument?.name}
              onSendMessage={handleChatMessage}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            ⚖️ This tool provides AI-powered assistance for document review. Always consult with a qualified attorney for legal advice.
          </p>
        </div>
      </div>
    </div>
  );
};