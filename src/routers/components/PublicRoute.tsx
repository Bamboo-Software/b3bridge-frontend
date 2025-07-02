// import { useLazyGetMeQuery } from "@/app/services/auth";
// import LoadingPage from "@/pages/common/LoadingPage";
import { useRef } from "react";
// import { Navigate
  // , useLocation 
// } from "react-router-dom";
// import { routesPaths } from "@/types/constants/routes";

// const { ROOT } = routesPaths;

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('auth-token');
    // const location = useLocation();
    // const [getMe, { isLoading, error }] = useLazyGetMeQuery();
    const isGetMeCalled = useRef(false);
  
    if (token && !isGetMeCalled.current) {
      // getMe();
      isGetMeCalled.current = true;
    }
  
    // if (isLoading) {
    //   return <LoadingPage />;
    // }
  
    // if (location.pathname === '/auth/callback' || [RESET_PASSWORD, CHANGE_PASSWORD_SUCCESS].includes(location.pathname) ) {
    //   return children;
    // }
  
    // if (token && !(error && 'status' in error && error.status === 401)) {
    //   return <Navigate to={ROOT} replace />;
    // }
  
    return children;
  };