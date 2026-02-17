import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SidePanel from '@/components/SidePanel';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import WelcomeRenderer from '@/components/WelcomeRenderer';
import FolderView from '@/components/FolderView';
import Breadcrumb from '@/components/Breadcrumb';
import { humanize } from '@/utils/display';
import SearchModal from '@/components/SearchModal';
import GraphModal from '@/components/GraphModal';
import BackToTop from '@/components/BackToTop';
import ReadingProgress from '@/components/ReadingProgress';
import './App.css';

function isFilePath(path: string): boolean {
  const last = path.split('/').pop() || '';
  return last.includes('.');
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

function isImagePath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return IMAGE_EXTENSIONS.has(ext);
}

export default function App() {
  const { '*': splat } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  const [searchOpen, setSearchOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);

  // The current file path (decoded from URL)
  const currentFile = splat || null;
  const isFile = useMemo(() => currentFile ? isFilePath(currentFile) : false, [currentFile]);
  const isImage = useMemo(() => currentFile ? isImagePath(currentFile) : false, [currentFile]);

  const handleNavigate = useCallback(
    (path: string) => {
      if (!path) {
        navigate('/');
      } else {
        navigate(`/${path}`);
      }
      window.scrollTo(0, 0);
    },
    [navigate],
  );

  // Keyboard shortcut for search
  const handleSearchOpen = useCallback(() => setSearchOpen(true), []);
  const handleSearchClose = useCallback(() => setSearchOpen(false), []);
  const handleGraphOpen = useCallback(() => setGraphOpen(true), []);
  const handleGraphClose = useCallback(() => setGraphOpen(false), []);

  return (
    <div className="app-layout">
      <Header
        onMenuToggle={() => setSidebarOpen(o => !o)}
        onSearchOpen={handleSearchOpen}
        onGraphOpen={handleGraphOpen}
      />
      <ReadingProgress />

      <div className="app-body">
        <SidePanel
          selectedFile={currentFile}
          onFileSelect={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="app-main">
          {!currentFile ? (
            <WelcomeRenderer onSearchOpen={handleSearchOpen} />
          ) : isImage ? (
            <div className="image-viewer">
              <Breadcrumb filePath={currentFile} onNavigate={handleNavigate} />
              <h1 className="image-viewer-title">{humanize(currentFile.split('/').pop() || '')}</h1>
              <figure className="image-viewer-figure">
                <img
                  src={`/docs/${currentFile}`}
                  alt={currentFile.split('/').pop()}
                  loading="lazy"
                />
                <figcaption className="image-viewer-caption">
                  <span className="image-viewer-path">📄 {currentFile}</span>
                  <span className="image-viewer-ext">{(currentFile.split('.').pop() || '').toUpperCase()}</span>
                </figcaption>
              </figure>
            </div>
          ) : isFile ? (
            <MarkdownRenderer filePath={currentFile} onNavigate={handleNavigate} />
          ) : (
            <FolderView folderPath={currentFile} onNavigate={handleNavigate} />
          )}
          <Footer />
        </main>
      </div>

      <BackToTop />
      <SearchModal
        isOpen={searchOpen}
        onClose={handleSearchClose}
        onNavigate={handleNavigate}
      />
      <GraphModal
        isOpen={graphOpen}
        onClose={handleGraphClose}
        currentFile={currentFile}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
