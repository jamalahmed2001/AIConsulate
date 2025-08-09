import type { DefaultSeoProps } from "next-seo";

export const defaultSEO: DefaultSeoProps = {
  titleTemplate: "%s | AI Consulate Advisory",
  defaultTitle: "AI Consulate Advisory",
  description: "Strategy, automation, and AI agents that ship real outcomes.",
  openGraph: {
    type: "website",
    site_name: "AI Consulate Advisory",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "AI Consulate Advisory",
      },
    ],
  },
  twitter: { cardType: "summary_large_image" },
  additionalMetaTags: [
    {
      name: "keywords",
      content: "AI agency, AI automation, AI agents, RAG, LLM, integrations",
    },
  ],
};
