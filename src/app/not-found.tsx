import React, { Fragment } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import AuthProvider from "@/provider/auth-provider";
// import Header from "@/components/PublicLayout/Header";
// import Footer from "@/components/PublicLayout/Footer";

const notfound = () => {
  return (
    <Fragment>
      {/* <Header /> */}
      <div className="pt-[72px] min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-48px)] flex justify-center items-center">
        <div className="flex justify-center items-center">
          <div className="max-w-md justify-center flex flex-col gap-[64px]">
            <Image
              src="/svg/404.svg"
              alt="arrow icon"
              width={803}
              height={204}
            />
            <div className="flex justify-center">
              <Link href="/">
                <Button className="flex justify-center items-center py-[8px] px-[24px] gap-[8px] bg-[#D1F151] text-[32px] font-evogria text-[#010002] font-normal uppercase">
                  Back to newsfeed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </Fragment>
  );
};

export default notfound;
