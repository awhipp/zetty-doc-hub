import { useCallback, useRef } from 'react';
import './CopyCodeButton.css';

export default function CopyCodeButton() {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleCopy = useCallback(() => {
    const pre = btnRef.current?.parentElement?.querySelector('pre');
    if (!pre) return;
    const code = pre.textContent || '';
    navigator.clipboard.writeText(code).then(() => {
      if (btnRef.current) {
        btnRef.current.textContent = '✓ Copied!';
        setTimeout(() => {
          if (btnRef.current) btnRef.current.textContent = '📋 Copy';
        }, 2000);
      }
    });
  }, []);

  return (
    <button ref={btnRef} className="copy-code-btn" onClick={handleCopy}>
      📋 Copy
    </button>
  );
}
