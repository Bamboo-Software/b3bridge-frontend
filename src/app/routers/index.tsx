import { routesPaths } from '@/types/constants/routes';
import { createBrowserRouter } from 'react-router-dom';
import Home from '@/pages/home';

// import { lazy, Suspense } from 'react';
import PageLayout from '../layouts/PageLayout';
import ErrorPage from '@/pages/common/ErrorPage';

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