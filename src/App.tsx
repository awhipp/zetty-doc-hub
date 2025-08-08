import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo, useRef } from 'react'
import Header from './components/Header'
import SidePanel from './components/SidePanel'
import MainContent from './components/MainContent'
import Footer from './components/Footer'
import BuildTime from './components/BuildTime'
import TableOfContents from './components/TableOfContents'
import { urlToFilePathWithExtension, filePathToUrl } from './utils/routing'
import { getAvailableFiles } from './utils/markdownLoader'
import { SiteConfigProvider } from './contexts/SiteConfigContext'
import { useSiteConfig } from './hooks/useSiteConfig'
import { UI } from './utils/constants'
import { IconChevronRight, IconChevronLeft } from './components/shared/Icons'
import './App.css'

// Component that handles the routed content display
const RoutedContent = () => {
  const { '*': urlPath } = useParams();
  const navigate = useNavigate();
  // Memoize expensive operations to prevent unnecessary re-renders
  const availableFiles = useMemo(() => getAvailableFiles(), []);
  const [isSidePanelVisible, setIsSidePanelVisible] = useState(false);
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const siteConfig = useSiteConfig();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Update document title when component mounts or config changes
  useEffect(() => {
    document.title = siteConfig.site.title;
  }, [siteConfig.site.title]);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= UI.MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Convert URL path to file path
  const potentialFile = urlToFilePathWithExtension(`/${urlPath || ''}`, availableFiles);
  const selectedFile = availableFiles.includes(potentialFile) ? potentialFile : undefined;
  
  const handleFileSelect = (filePath: string) => {
    // Convert file path to URL and navigate (now preserves file extensions)
    const url = filePathToUrl(filePath);
    navigate(url);
  };

  const toggleSidePanel = () => {
    setIsSidePanelVisible(!isSidePanelVisible);
  };

  const toggleSidePanelCollapse = () => {
    setIsSidePanelCollapsed(!isSidePanelCollapsed);
  };

  const toggleTocCollapse = () => {
    setIsTocCollapsed(!isTocCollapsed);
  };

  const closeSidePanel = () => {
    setIsSidePanelVisible(false);
  };

  const handleSearchResultSelect = (filePath: string) => {
    handleFileSelect(filePath);
  };

  return (
    <>
      <Header
        onToggleSidePanel={toggleSidePanel}
        isSidePanelVisible={isSidePanelVisible}
        onSearchResultSelect={handleSearchResultSelect}
      />
      <div className={`app-content ${isSidePanelCollapsed ? 'side-panel-collapsed' : ''} ${isTocCollapsed ? 'toc-collapsed' : ''}`}>
        {/* Floating expand button for collapsed side panel */}
        {isSidePanelCollapsed && (
          <button 
            className="floating-expand-button floating-expand-left btn-base btn-icon btn-secondary"
            onClick={toggleSidePanelCollapse}
            aria-label="Show sidebar"
            title="Show sidebar"
          >
            <IconChevronRight />
          </button>
        )}
        
        {/* Floating expand button for collapsed TOC */}
        {isTocCollapsed && (
          <button 
            className="floating-expand-button floating-expand-right btn-base btn-icon btn-secondary"
            onClick={toggleTocCollapse}
            aria-label="Show table of contents"
            title="Show table of contents"
          >
            <IconChevronLeft />
          </button>
        )}
        
        <SidePanel 
          onFileSelect={handleFileSelect} 
          selectedFile={selectedFile}
          isMobileVisible={isMobile ? isSidePanelVisible : true}
          onMobileClose={closeSidePanel}
          isCollapsed={isSidePanelCollapsed}
          onToggleCollapse={toggleSidePanelCollapse}
        />
        <MainContent 
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          contentRef={contentRef}
        />
        <TableOfContents 
          contentRef={contentRef} 
          isCollapsed={isTocCollapsed}
          onToggleCollapse={toggleTocCollapse}
        />
      </div>
    </>
  );
};

function App() {
  return (
    <SiteConfigProvider>
      <AppContent />
    </SiteConfigProvider>
  )
}

function AppContent() {
  const siteConfig = useSiteConfig();
  
  // Use base path from site configuration, ensure it doesn't have trailing slash for basename
  const basename = siteConfig.deployment?.basePath === '/' ? undefined : siteConfig.deployment?.basePath?.replace(/\/$/, '');
  
  return (
    <Router basename={basename}>
      <div className="app">
        <Routes>
          <Route path="/*" element={<RoutedContent />} />
        </Routes>
        <Footer />
        <BuildTime />
      </div>
    </Router>
  );
}

export default App
