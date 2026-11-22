import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQ, FAQ_VERSION } from "@/lib/ai/knowledge";
import { askInChat, setChatOpen } from "@/lib/ai/ui-state";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ & help · IPP" },
      {
        name: "description",
        content:
          "Approved answers about applying, placements and recommendations in the IPP demo, plus the help chatbot.",
      },
      { property: "og:title", content: "FAQ & help · IPP" },
      {
        property: "og:description",
        content: "Approved answers about applying, placements and recommendations in the IPP demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <AppShell>
      <PageHeader
        title="FAQ & help"
        subtitle="Approved answers for students. The help chatbot answers only from this list and hands anything else to the co-op office."
      />
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <span className="font-medium text-primary">{FAQ_VERSION}</span>
        <span className="text-muted-foreground">
          {FAQ.length} questions · synthetic classroom policy, not official university policy
        </span>
        <Button className="ml-auto" onClick={() => setChatOpen(true)}>
          <MessageCircle aria-hidden="true" className="h-4 w-4" /> Ask the chatbot
        </Button>
      </div>
      <Accordion
        type="multiple"
        className="max-w-3xl rounded-2xl border border-border bg-card px-5"
      >
        {FAQ.map((f) => (
          <AccordionItem key={f.id} value={f.id}>
            <AccordionTrigger className="text-left text-base">
              <span>
                <span className="mr-2 text-xs font-semibold text-muted-foreground">{f.id}</span>
                {f.question}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm leading-relaxed">{f.answer}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {f.category} · Source: {f.source}
              </p>
              <button
                type="button"
                onClick={() => askInChat(f.question)}
                className="mt-2 text-xs font-medium text-primary underline underline-offset-2"
              >
                Ask the chatbot this question
              </button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </AppShell>
  );
}
