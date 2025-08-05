import React, { useEffect } from 'react';
import './CopyCodeButton.css';

const CopyCodeButton: React.FC = () => {
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('pre code');
      
      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement as HTMLPreElement;
        if (!pre || pre.querySelector('.copy-code-button')) return;
        
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        button.setAttribute('title', 'Copy code');
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `;
        
        button.addEventListener('click', async () => {
          const code = codeBlock.textContent || '';
          
          try {
            await navigator.clipboard.writeText(code);
            button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            `;
            button.setAttribute('title', 'Copied!');
            button.classList.add('copied');
            
            setTimeout(() => {
              button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              `;
              button.setAttribute('title', 'Copy code');
              button.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy code:', err);
            button.setAttribute('title', 'Failed to copy');
          }
        });
        
        pre.style.position = 'relative';
        pre.appendChild(button);
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
  }, []);

  return null; // This component doesn't render anything itself
};

export default CopyCodeButton;