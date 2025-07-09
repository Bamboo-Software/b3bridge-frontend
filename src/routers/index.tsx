import { createBrowserRouter } from 'react-router-dom';

// import { lazy, Suspense } from 'react';
import PageLayout from '../layouts/PageLayout';
import ErrorPage from '@/pages/common/ErrorPage';
import { routesPaths } from '@/utils/constants/routes';
import HomePage from '@/pages/homepage';
import BridgePage from '@/pages/bridge';
import CreateTokenPage from '@/pages/create-token';
import CreateLaunchpadPage from '@/pages/launchpads/create';
import LaunchpadsPage from '@/pages/launchpads';
import LaunchpadDetailPage from '@/pages/launchpads/[id]';

const { ROOT,BRIDGE,CREATE_TOKEN,CREATE_LAUNCHPAD, LAUNCHPAD, LAUNCHPAD_DETAIL_PATTERN } = routesPaths;

const routes = createBrowserRouter([
  {
    path: ROOT,
    element: <PageLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path:BRIDGE, element: <BridgePage /> },
      { path:CREATE_TOKEN, element: <CreateTokenPage /> },
      { path:CREATE_LAUNCHPAD, element: <CreateLaunchpadPage /> },
      { path:LAUNCHPAD, element: <LaunchpadsPage /> },
      { path:LAUNCHPAD_DETAIL_PATTERN, element: <LaunchpadDetailPage /> },
    ],
  },

  { path: '*', element: <ErrorPage /> },
]);

export default routes;