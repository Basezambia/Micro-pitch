"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onUploadComplete: (ipfsUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
  description?: string;
  currentFile?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  ipfsUrl?: string;
  uploading?: boolean;
  error?: string;
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  acceptedTypes = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'],
  maxSizeMB = 10,
  label = "Upload File",
  description = "Drag and drop your file here, or click to browse",
  currentFile
}: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        error: validation
      });
      onUploadError?.(validation);
      return;
    }

    // Set uploading state
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      uploading: true
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ipfs', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.hash}`;

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        ipfsUrl
      });

      onUploadComplete(ipfsUrl, file.name);
    } catch (error) {
      const errorMessage = 'Failed to upload file. Please try again.';
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        error: errorMessage
      });
      onUploadError?.(errorMessage);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryUpload = () => {
    if (uploadedFile && fileInputRef.current?.files?.[0]) {
      uploadFile(fileInputRef.current.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-all cursor-pointer ${
          isDragOver 
            ? 'border-yellow-400 bg-yellow-400/10' 
            : uploadedFile?.error 
              ? 'border-red-400 bg-red-400/10'
              : uploadedFile?.ipfsUrl
                ? 'border-green-400 bg-green-400/10'
                : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <AnimatePresence mode="wait">
            {!uploadedFile ? (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-300">{description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supported formats: {acceptedTypes.join(', ')} • Max size: {maxSizeMB}MB
                  </p>
                </div>
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
                  Choose File
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="file-status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center space-x-3">
                  <File className="w-8 h-8 text-blue-400" />
                  <div className="text-left">
                    <p className="font-medium text-white">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                </div>

                {uploadedFile.uploading && (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                    <span className="text-sm text-yellow-400">Uploading to IPFS...</span>
                  </div>
                )}

                {uploadedFile.error && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{uploadedFile.error}</span>
                    </div>
                    <div className="flex space-x-2 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={retryUpload}
                        className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      >
                        Retry
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={removeFile}
                        className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                {uploadedFile.ipfsUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Successfully uploaded to IPFS</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                        Stored on IPFS
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={removeFile}
                        className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Current File Display */}
      {currentFile && !uploadedFile && (
        <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Current file:</span>
              <a 
                href={currentFile} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-yellow-400 hover:text-yellow-300 underline"
              >
                View File
              </a>
            </div>
            <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">
              Uploaded
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}