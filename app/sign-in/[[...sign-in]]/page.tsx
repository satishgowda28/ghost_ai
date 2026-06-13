import { SignIn } from "@clerk/nextjs";
import { Network, Share2, FileText } from "lucide-react";

const features = [
  {
    icon: Network,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-base">
      {/* Left panel — 50% */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between px-14 py-10 border-r border-surface-border bg-surface">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold text-[#080809]">
            G
          </div>
          <span className="font-semibold text-copy-primary">Ghost AI</span>
        </div>

        {/* Hero copy */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-copy-primary leading-tight">
            Design systems at the<br />speed of thought.
          </h1>
          <p className="text-copy-secondary leading-relaxed max-w-sm">
            Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
          </p>

          {/* Feature list */}
          <ul className="flex flex-col gap-5 mt-2">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-accent-dim flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-copy-primary">{title}</span>
                  <span className="text-sm text-copy-secondary">{description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-copy-muted">© 2026 Ghost AI. All rights reserved.</p>
      </div>

      {/* Right panel — 50% */}
      <div className="flex flex-1 items-center justify-center">
        <SignIn forceRedirectUrl="/editor" />
      </div>
    </div>
  );
}
