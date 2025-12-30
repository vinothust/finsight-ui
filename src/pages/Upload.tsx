import React, { useState, useCallback } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Upload: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; status: 'uploading' | 'success' | 'error'; progress: number }[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    const fileEntry = {
      name: file.name,
      size: file.size,
      status: 'uploading' as const,
      progress: 0,
    };

    setUploadedFiles((prev) => [...prev, fileEntry]);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? {
                ...f,
                progress: Math.min(f.progress + 10 + Math.random() * 20, 100),
              }
            : f
        )
      );
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      );
      toast.success(`${file.name} uploaded successfully`);
    }, 2000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        toast.error(`${file.name} is not a supported format`);
      }
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold font-display">Upload P&L Data</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Import your Excel spreadsheets for analysis
            </p>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Upload Excel File</CardTitle>
              <CardDescription>
                Drag and drop your P&L spreadsheet or click to browse. Supports .xlsx, .xls, and .csv formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer',
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <UploadIcon size={32} className="text-primary" />
                  </div>
                  <p className="text-lg font-medium mb-1">
                    {isDragging ? 'Drop your files here' : 'Drop files here or click to upload'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Maximum file size: 25MB
                  </p>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="p-2 rounded-lg bg-success/10">
                      <FileSpreadsheet size={24} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2">
                          {file.status === 'success' && (
                            <CheckCircle size={18} className="text-success" />
                          )}
                          {file.status === 'error' && (
                            <AlertCircle size={18} className="text-destructive" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFile(file.name)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={file.progress} className="flex-1 h-1.5" />
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {file.status === 'uploading'
                            ? `${Math.round(file.progress)}%`
                            : formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Need a Template?</CardTitle>
              <CardDescription>
                Download our standard P&L template to ensure your data is formatted correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="gap-2">
                <FileSpreadsheet size={18} />
                Download Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Upload;
