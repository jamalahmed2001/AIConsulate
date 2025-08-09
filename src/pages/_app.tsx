import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { DefaultSeo } from "next-seo";
import Script from "next/script";

import { api } from "@/utils/api";
import { defaultSEO } from "@/seo.config";
import { SiteLayout } from "@/components/layout/SiteLayout";

import "@/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DefaultSeo {...defaultSEO} />
      <div className={geist.className}>
        <SiteLayout>
          <Component {...pageProps} />
        </SiteLayout>
      </div>
      <Script
        src="https://scripts.simpleanalyticscdn.com/latest.js"
        strategy="afterInteractive"
      />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
