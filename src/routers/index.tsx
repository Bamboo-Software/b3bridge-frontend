import { createBrowserRouter } from 'react-router-dom';
import Home from '@/pages/home';

// import { lazy, Suspense } from 'react';
import PageLayout from '../layouts/PageLayout';
import ErrorPage from '@/pages/common/ErrorPage';
import { routesPaths } from '@/utils/constants/routes';

const { ROOT } = routesPaths;

const routes = createBrowserRouter([
  {
    path: ROOT,
    element: <PageLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },

  { path: '*', element: <ErrorPage /> },
]);

export default routes;