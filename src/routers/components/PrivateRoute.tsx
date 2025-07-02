// import { useGetMeQuery } from "@/app/services/auth";
// import LoadingPage from "@/pages/common/LoadingPage";
// import { Navigate } from "react-router-dom";
// import { routesPaths } from "@/types/constants/routes";


// const { AUTH } = routesPaths;
// export const PrivateRoute = ({ children }: {children: React.ReactNode}) => {
//     const token = localStorage.getItem('auth-token');
  
//     // const { error, isLoading } = useGetMeQuery();
    
//     if (isLoading) {
//       return <LoadingPage/>;
//     }
//     if (!token || (error && 'status' in error && error.status === 401)) {
//       localStorage.removeItem('auth-token');
//       return <Navigate to={AUTH} replace />;
//     }
//     return children;
//   };