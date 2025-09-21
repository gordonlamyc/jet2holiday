import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  onDocumentUpload: (file: File) => void;
  isProcessing?: boolean;
}

export const DocumentUpload = ({ onDocumentUpload, isProcessing = false }: DocumentUploadProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileValidation = (file: File): boolean => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!handleFileValidation(file)) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
      //const response = await fetch('https://d6drzs41k4.execute-api.ap-southeast-5.amazonaws.com/prod/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        toast({
          title: "Document uploaded successfully",
          description: result.message || "Processing your legal document...",
        });
        onDocumentUpload(file);
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "An error occurred while uploading.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Network error or server unavailable.",
        variant: "destructive",
      });
    }
  }, [onDocumentUpload, toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <Card className={`card-shadow smooth-transition ${isDragging ? 'border-primary bg-primary/5' : ''} ${isProcessing ? 'opacity-50' : ''}`}>
      <div
        className="p-8 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {isProcessing ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>
        
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          {isProcessing ? 'Processing Document...' : 'Upload Legal Document'}
        </h3>
        
        <p className="mb-6 text-muted-foreground">
          Drag and drop your PDF or image file here, or click to browse
        </p>
        
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button 
            variant="default" 
            disabled={isProcessing}
            onClick={() => document.getElementById('file-upload')?.click()}
            className="legal-shadow hover:scale-105 smooth-transition"
          >
            <FileText className="mr-2 h-4 w-4" />
            Choose File
          </Button>
        </div>
        
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          Supports PDF, JPG, PNG files up to 10MB
        </div>
      </div>
    </Card>
  );
};