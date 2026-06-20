import Link from "next/link";
import { Lock } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated">
        <Lock className="h-6 w-6 text-copy-muted" />
      </div>
      <div className="text-center">
        <p className="font-medium text-copy-primary">Access denied</p>
        <p className="mt-1 text-sm text-copy-muted">
          This project does not exist or you do not have access.
        </p>
      </div>
      <Link
        href="/editor"
        className="text-sm text-copy-muted hover:text-copy-primary transition-colors"
      >
        Back to editor
      </Link>
    </div>
  );
}
