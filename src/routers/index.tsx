import { createBrowserRouter } from 'react-router-dom';
import Home from '@/pages/home';

// import { lazy, Suspense } from 'react';
import PageLayout from '../layouts/PageLayout';
import ErrorPage from '@/pages/common/ErrorPage';
import { routesPaths } from '@/utils/constants/routes';
import HomePage from '@/pages/homepage';
import BridgePage from '@/pages/bridge';
import CreateTokenPage from '@/pages/create-token';

const { ROOT,BRIDGE,CREATE_TOKEN,LAUNCH_PAD } = routesPaths;

const routes = createBrowserRouter([
  {
    path: ROOT,
    element: <PageLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path:BRIDGE, element: <BridgePage /> },
      { path:CREATE_TOKEN, element: <CreateTokenPage /> },
      // { path:"bridge", element: <BridgePage /> },
    ],
  },

  { path: '*', element: <ErrorPage /> },
]);

export default routes;