import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Geist } from "next/font/google";
import { DefaultSeo } from "next-seo";
import Script from "next/script";
import Head from "next/head";

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
      <Head>
        <link rel="preconnect" href="https://scripts.simpleanalyticscdn.com" />
      </Head>
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
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerPolicy="no-referrer-when-downgrade" />
      </noscript>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
