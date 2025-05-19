// "use client";

// // import { useGetProfile } from "@/hooks/useGetProfile";
// import { publicUrls } from "@/modules/configs";
// // import { getRefreshToken } from "@/modules/services/httpClient";
// import { redirect, usePathname } from "next/navigation";
// import { FC, Fragment, useEffect } from "react";
// // import { useWallet } from "../bitcoin-provider/hooks";

// interface IAuthProvider {
//   children: React.ReactNode;
// }

// const AuthProvider: FC<IAuthProvider> = ({ children }) => {
//   const pathName = usePathname();
//   const baseUrl = `/${pathName.split("/")[1]}`;
// //   const { address } = useWallet();
// //   const refreshToken = getRefreshToken();

//   const { getProfile } = useGetProfile();

//   useEffect(() => {
//     if (refreshToken) {
//       getProfile();
//     }
//   }, [
//     //   address,
    
//       refreshToken]);

//   useEffect(() => {
//       if (
//         //   !address
//           && !publicUrls.includes(baseUrl) && !refreshToken) {
//       redirect("/");
//     }
//   }, [baseUrl,
//     //   address,
//       refreshToken]);

//   return <Fragment>{children}</Fragment>;
// };

// export default AuthProvider;
