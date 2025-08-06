import React, { useState, useEffect } from 'react';
import { loadImageUrl, resolveImagePath } from '../utils/imageLoader';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);
      
      try {
        // If it's an external URL, use it directly
        if (src.startsWith('http') || src.startsWith('https')) {
          setResolvedSrc(src);
          setLoading(false);
          return;
        }

        // Resolve the image path to absolute internal path
        const absolutePath = resolveImagePath(src, currentDocPath);
        
        // Load the image URL via Vite modules
        const imageUrl = await loadImageUrl(absolutePath);
        
        if (imageUrl) {
          setResolvedSrc(imageUrl);
        } else {
          console.warn(`Image not found: ${src} (resolved to: ${absolutePath})`);
          setError(true);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src, currentDocPath]);

  if (loading) {
    return (
      <span className="image-loading" style={{
        display: 'inline-block',
        border: '2px dashed #ccc',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        margin: '1rem 0',
        color: '#666',
        verticalAlign: 'middle'
      }}>
        <span>📷 Loading image...</span>
        <br />
        <small>{src}</small>
      </span>
    );
  }

  if (error || !resolvedSrc) {
    return (
      <span className="image-error" style={{
        display: 'inline-block',
        border: '2px dashed #ccc',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        margin: '1rem 0',
        color: '#666',
        verticalAlign: 'middle'
      }}>
        <span>📷 Image not found</span>
        <br />
        <small>{src}</small>
      </span>
    );
  }
  
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
