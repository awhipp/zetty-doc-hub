import React, { useState, useEffect } from 'react';
import { getFileExtension } from '../utils/fileUtils';
import { loadImageUrl } from '../utils/imageLoader';
import './ImageRenderer.css';

interface ImageRendererProps {
  filePath: string;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ filePath }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const url = await loadImageUrl(filePath);
        if (url) {
          setImageUrl(url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
      }
    };

    loadImage();
  }, [filePath]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop() || '';
  };

  const getFileSize = (filePath: string): string => {
    // This is a placeholder - in a real implementation, you might want to fetch actual file size
    const ext = getFileExtension(filePath);
    switch (ext) {
      case 'svg':
        return 'Vector Image';
      case 'png':
        return 'PNG Image';
      case 'jpg':
      case 'jpeg':
        return 'JPEG Image';
      case 'gif':
        return 'GIF Image';
      case 'webp':
        return 'WebP Image';
      default:
        return 'Image';
    }
  };

  const formatDimensions = (size: { width: number; height: number }): string => {
    return `${size.width} × ${size.height} pixels`;
  };

  if (error) {
    return (
      <div className="image-renderer">
        <div className="image-error">
          <div className="error-icon">🖼️</div>
          <h3>Image Not Found</h3>
          <p>The image file could not be loaded:</p>
          <code>{getFileName(filePath)}</code>
          <p className="error-details">
            Please check that the file exists and is accessible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-renderer">
      <div className="image-header">
        <div className="image-info">
          <h2 className="image-title">{getFileName(filePath)}</h2>
          <div className="image-meta">
            <span className="image-type">{getFileSize(filePath)}</span>
            {naturalSize && (
              <>
                <span className="meta-separator">•</span>
                <span className="image-dimensions">{formatDimensions(naturalSize)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="image-container">
        {loading && (
          <div className="image-loading">
            <div className="loading-spinner"></div>
            <p>Loading image...</p>
          </div>
        )}
        
        {imageUrl && (
          <img
            src={imageUrl}
            alt={getFileName(filePath)}
            className={`image-display ${loading ? 'loading' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: loading ? 'none' : 'block' }}
          />
        )}
      </div>

      {!loading && !error && (
        <div className="image-details">
          <div className="detail-item">
            <strong>File:</strong> {getFileName(filePath)}
          </div>
          <div className="detail-item">
            <strong>Type:</strong> {getFileSize(filePath)}
          </div>
          {naturalSize && (
            <div className="detail-item">
              <strong>Dimensions:</strong> {formatDimensions(naturalSize)}
            </div>
          )}
          <div className="detail-item">
            <strong>Path:</strong> <code>{filePath}</code>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageRenderer;
