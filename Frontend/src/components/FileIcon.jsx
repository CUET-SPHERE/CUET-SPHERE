import React from 'react';
import { File, FileText, FileImage, FileVideo, FileAudio, FileArchive, Code } from 'lucide-react';

const FileIcon = ({ fileType, className = "h-6 w-6" }) => {
  if (!fileType) return <File className={className} />;

  if (fileType.startsWith('image/')) {
    return <FileImage className={className} />;
  }
  if (fileType.startsWith('video/')) {
    return <FileVideo className={className} />;
  }
  if (fileType.startsWith('audio/')) {
    return <FileAudio className={className} />;
  }

  switch (fileType) {
    case 'application/pdf':
      return <FileText className={`${className} text-red-500`} />;
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return <FileText className={`${className} text-blue-500`} />;
    case 'application/zip':
    case 'application/x-rar-compressed':
      return <FileArchive className={className} />;
    case 'text/html':
    case 'text/css':
    case 'application/javascript':
      return <Code className={className} />;
    default:
      return <File className={className} />;
  }
};

export default FileIcon;
