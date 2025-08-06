import React, { useEffect } from 'react';
import { useDOMQuery } from '../hooks';
import { IconCopy, IconCheck } from './shared';
import { createRoot } from 'react-dom/client';
import './CopyCodeButton.css';

const CopyCodeButton: React.FC = () => {
  const { queryElements } = useDOMQuery({ cache: false }); // Don't cache as code blocks change

  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = queryElements<HTMLElement>('pre code');
      
      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement as HTMLPreElement;
        if (!pre || pre.querySelector('.copy-code-button')) return;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'copy-code-button';
        
        const CopyButton: React.FC = () => {
          const [copied, setCopied] = React.useState(false);
          
          const handleCopy = async () => {
            const code = codeBlock.textContent || '';
            
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch (err) {
              console.error('Failed to copy code:', err);
            }
          };

          return (
            <button
              onClick={handleCopy}
              className={`copy-code-btn ${copied ? 'copied' : ''}`}
              aria-label={copied ? 'Copied!' : 'Copy code to clipboard'}
              title={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? <IconCheck /> : <IconCopy />}
            </button>
          );
        };

        // Render React component into button container
        const root = createRoot(buttonContainer);
        root.render(<CopyButton />);
        
        pre.style.position = 'relative';
        pre.appendChild(buttonContainer);
      });
    };

    // Add copy buttons on initial load
    addCopyButtons();
    
    // Re-add copy buttons when content changes (for dynamic content)
    const observer = new MutationObserver(() => {
      addCopyButtons();
    });
    
    const mainContent = document.querySelector('.main-content-body');
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: true
      });
    }
    
    return () => {
      observer.disconnect();
    };
  }, [queryElements]);

  return null; // This component doesn't render anything itself
};

export default CopyCodeButton;