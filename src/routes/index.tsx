import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/student" });
  },
  head: () => ({
    meta: [
      { title: "IPP – Internship Practicum Platform" },
      { name: "description", content: "Demo workspace for the university Internship Practicum Platform." },
      { property: "og:title", content: "IPP – Internship Practicum Platform" },
      { property: "og:description", content: "Demo workspace for the university Internship Practicum Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
