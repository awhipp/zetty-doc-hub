
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  useNavigate,
  useMatch,
  Outlet
} from '@tanstack/react-router';
import { getBasePath } from './utils/constants';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import Header from './components/Header';
import SidePanel from './components/SidePanel';
import MainContent from './components/MainContent';
import TableOfContents from './components/TableOfContents';
import WelcomeRenderer from './components/WelcomeRenderer';
import { urlToFilePath } from './utils/routing';

function MainLayout() {
  const match = useMatch({ strict: false });
  const selectedFile = match?.params?.filePath ? decodeURIComponent(match.params.filePath) : undefined;
  const navigate = useNavigate();
  const handleFileSelect = (filePath: string) => {
    if (filePath) {
      // Remove /src/docs/ prefix for routing
      const relPath = filePath.startsWith('/src/docs/') ? filePath.slice('/src/docs/'.length) : filePath.replace(/^\/+/, '');
  const basePath = getBasePath();
  const url = `${basePath === '/' ? '' : basePath}/doc/${encodeURI(relPath)}`;
  console.log('MainLayout handleFileSelect:', { filePath, relPath, url });
  navigate({ to: url });
    }
  };
  return (
    <SiteConfigProvider>
  <Header currentFilePath={selectedFile} onSearchResultSelect={handleFileSelect} />
      <div className="app-content">
        <SidePanel selectedFile={selectedFile} onFileSelect={handleFileSelect} />
        <Outlet />
        <TableOfContents filePath={selectedFile} />
      </div>
    </SiteConfigProvider>
  );
}

// Home route (welcome)
function HomeRoute() {
  return <WelcomeRenderer onNavigateToFile={() => {}} />;
}

// Dynamic doc route (for documentation files)
function DocRoute() {
  // Use useParams() to access the wildcard param (_splat)
  const { _splat } = docRoute.useParams();
  const decodedFilePath = _splat ? decodeURIComponent(_splat) : undefined;
  const fullFilePath = decodedFilePath ? urlToFilePath('/' + decodedFilePath) : undefined;
  console.log('DocRoute debug:', { _splat, decodedFilePath, fullFilePath });
  return <MainContent selectedFile={fullFilePath} />;
}

// 404 route
function NotFoundRoute() {
  return <div style={{ padding: 32, textAlign: 'center' }}>404 – Not Found</div>;
}

// Define routes

const rootRoute = createRootRoute({
  component: MainLayout,
});


const basePath = getBasePath();
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoute,
});

const docRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/doc/$', // catch-all for docs
  component: DocRoute,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundRoute,
});

const routeTree = rootRoute.addChildren([homeRoute, docRoute, notFoundRoute]);
const router = createRouter({
  routeTree,
  basepath: basePath === '/' ? '' : basePath,
});

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
