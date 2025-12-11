import React, { useCallback } from 'react';
import { Upload, FileCode, FileType } from 'lucide-react';

interface FileUploadProps {
  onCodeLoaded: (code: string, fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onCodeLoaded }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onCodeLoaded(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onCodeLoaded(text, file.name);
      };
      reader.readAsText(file);
    }
  }, [onCodeLoaded]);

  return (
    <div 
      className="border-2 border-dashed border-slate-600 bg-slate-800/50 rounded-xl p-10 text-center cursor-pointer hover:bg-slate-800 transition-colors group"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        id="fileInput" 
        className="hidden" 
        accept=".py,.cpp,.xml,.txt" 
        onChange={handleFileChange}
      />
      <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Upload ROS Node</h3>
        <p className="text-slate-400 max-w-sm mx-auto mb-6">
          Drag and drop your <span className="text-blue-300 font-mono">.py</span>, <span className="text-blue-300 font-mono">.cpp</span>, or <span className="text-blue-300 font-mono">package.xml</span> here, or click to browse.
        </p>
        <div className="flex gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><FileCode className="w-4 h-4" /> Python</span>
          <span className="flex items-center gap-1"><FileType className="w-4 h-4" /> C++</span>
        </div>
      </label>
    </div>
  );
};
