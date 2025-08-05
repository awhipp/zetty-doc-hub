import React, { useState } from 'react';

interface ImageComponentProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  title?: string;
  currentDocPath?: string;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ 
  src, 
  alt = '', 
  title, 
  currentDocPath,
  ...props 
}) => {
  const [error, setError] = useState<boolean>(false);

  const resolveImagePath = (imageSrc: string, docPath?: string): string => {
    // If it's already an absolute URL, return as is
    if (imageSrc.startsWith('http') || imageSrc.startsWith('https')) {
      return imageSrc;
    }

    // If it starts with /, treat as absolute path from root
    if (imageSrc.startsWith('/')) {
      return imageSrc;
    }

    // Handle relative paths
    if (!docPath) {
      // Fallback: assume it's relative to docs root
      return `/docs/${imageSrc}`;
    }

    // Normalize the document path - handle both /src/docs/ and other formats
    let normalizedDocPath = docPath;
    if (normalizedDocPath.startsWith('/src/docs/')) {
      normalizedDocPath = normalizedDocPath.substring('/src/docs/'.length);
    }
    
    // Get the directory part (remove filename)
    const docDir = normalizedDocPath.replace(/\/[^/]*$/, '');
    
    let targetPath = '';

    if (imageSrc.startsWith('./')) {
      // Current directory reference
      const relativePath = imageSrc.substring(2);
      targetPath = docDir ? `${docDir}/${relativePath}` : relativePath;
    } else if (imageSrc.startsWith('../')) {
      // Parent directory reference
      const pathParts = docDir.split('/').filter(part => part !== '');
      const relativeParts = imageSrc.split('/');
      
      for (const part of relativeParts) {
        if (part === '..') {
          pathParts.pop();
        } else if (part !== '.' && part !== '') {
          pathParts.push(part);
        }
      }
      
      targetPath = pathParts.join('/');
    } else {
      // Direct relative path (no ./ prefix)
      targetPath = docDir ? `${docDir}/${imageSrc}` : imageSrc;
    }

    // Clean up any double slashes and ensure single leading slash
    const cleanPath = targetPath.replace(/\/+/g, '/').replace(/^\//, '');
    return `/docs/${cleanPath}`;
  };

  if (error) {
    return (
      <div className="image-error" style={{
        border: '2px dashed #ccc',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        margin: '1rem 0',
        color: '#666'
      }}>
        <div>📷 Image not found</div>
        <small>{src}</small>
      </div>
    );
  }

  const resolvedSrc = resolveImagePath(src, currentDocPath);
  
  return (
    <img 
      src={resolvedSrc} 
      alt={alt} 
      title={title}
      className="markdown-image"
      onError={() => {
        console.warn(`Failed to load image: ${resolvedSrc} (original: ${src})`);
        setError(true);
      }}
      {...props}
    />
  );
};

export default ImageComponent;
