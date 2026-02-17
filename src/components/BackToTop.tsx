import { useScrollHandler } from '@/hooks';
import './BackToTop.css';

export default function BackToTop() {
  const show = useScrollHandler(300);

  if (!show) return null;

  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      ⬆️
    </button>
  );
}
