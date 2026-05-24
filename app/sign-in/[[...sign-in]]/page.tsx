import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-base">
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-14 border-r border-surface-border bg-surface">
        <span className="text-lg font-semibold text-copy-primary mb-6">Ghost AI</span>
        <p className="text-2xl font-medium text-copy-primary leading-snug mb-6">
          Design systems,<br />not diagrams.
        </p>
        <ul className="space-y-2 text-sm text-copy-secondary">
          <li>AI-generated architecture from plain English</li>
          <li>Real-time collaborative canvas</li>
          <li>Exportable technical specifications</li>
        </ul>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <SignIn />
      </div>
    </div>
  );
}
