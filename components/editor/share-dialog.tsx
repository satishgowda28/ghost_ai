"use client";

import { useState, useEffect, useCallback } from "react";
import { Link2, X, Mail, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OwnerInfo {
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

interface Collaborator {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  isOwner: boolean;
}

function Avatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl: string | null;
  size?: "sm" | "md";
}) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const cls =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : "h-10 w-10 text-sm";

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${cls} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-elevated font-medium text-copy-secondary border border-surface-border`}
    >
      {initials || "?"}
    </div>
  );
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  isOwner,
}: ShareDialogProps) {
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCollaborators = useCallback(async () => {
    setLoadingCollabs(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) {
        const data: { owner: OwnerInfo; collaborators: Collaborator[] } =
          await res.json();
        setOwner(data.owner);
        setCollaborators(data.collaborators);
      }
    } finally {
      setLoadingCollabs(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) fetchCollaborators();
  }, [open, fetchCollaborators]);

  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setInviteEmail("");
        await fetchCollaborators();
      } else {
        const data = await res.json().catch(() => ({}));
        setInviteError(
          (data as { error?: string }).error ?? "Failed to invite"
        );
      }
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(collaboratorId: string) {
    setRemovingId(collaboratorId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
      }
    } finally {
      setRemovingId(null);
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const totalCount = 1 + collaborators.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="w-full max-w-lg rounded-3xl border border-surface-border bg-surface p-6 shadow-2xl"
      >
        <DialogHeader className="mb-1">
          <DialogTitle className="text-lg font-semibold text-copy-primary">
            Share project
          </DialogTitle>
          <p className="text-sm text-copy-muted">
            Invite collaborators, copy the workspace link, and manage access.
          </p>
        </DialogHeader>

        {/* Workspace link card */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-surface-border bg-elevated px-4 py-3 gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-copy-primary">
              Workspace link
            </p>
            <p className="mt-0.5 text-xs text-copy-muted">
              Share a direct link with teammates after you grant them access.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="shrink-0 gap-2 border border-surface-border bg-subtle text-copy-secondary hover:text-copy-primary"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Copy link
              </>
            )}
          </Button>
        </div>

        {/* Invite row (owner only) */}
        {isOwner && (
          <div className="mt-3 flex items-center rounded-2xl border border-surface-border bg-elevated px-3 py-2 gap-2">
            <Mail className="h-4 w-4 shrink-0 text-copy-faint" />
            <input
              type="email"
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInvite();
              }}
              disabled={inviting}
              className="min-w-0 flex-1 bg-transparent text-sm text-copy-primary placeholder:text-copy-faint outline-none disabled:opacity-50"
            />
            <Button
              size="sm"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="shrink-0 bg-brand text-base hover:bg-brand/90 text-black font-medium"
            >
              Invite
            </Button>
          </div>
        )}
        {inviteError && (
          <p className="mt-1.5 text-xs text-error">{inviteError}</p>
        )}

        {/* People with access */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-copy-primary">
              People with access
            </p>
            <span className="text-xs text-copy-muted">
              {loadingCollabs ? "…" : `${totalCount} total`}
            </span>
          </div>

          <div className="rounded-2xl border border-surface-border bg-elevated overflow-hidden">
            {/* Owner row */}
            {owner && (
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar name={owner.displayName} avatarUrl={owner.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-copy-primary">
                      {owner.displayName}
                    </p>
                    <span className="shrink-0 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                      Owner
                    </span>
                  </div>
                  {owner.email && (
                    <p className="truncate text-xs text-copy-muted">
                      {owner.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Collaborator rows */}
            {loadingCollabs && collaborators.length === 0 && !owner && (
              <div className="px-4 py-4 text-center text-sm text-copy-faint">
                Loading…
              </div>
            )}
            {!loadingCollabs && collaborators.length === 0 && owner && null}
            {collaborators.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < collaborators.length - 1 || owner
                    ? "border-t border-surface-border"
                    : ""
                }`}
              >
                <Avatar name={c.displayName} avatarUrl={c.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-copy-primary">
                    {c.displayName}
                  </p>
                  {c.displayName !== c.email && (
                    <p className="truncate text-xs text-copy-muted">
                      {c.email}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(c.id)}
                    disabled={removingId === c.id}
                    aria-label={`Remove ${c.displayName}`}
                    className="h-7 w-7 shrink-0 text-copy-faint hover:text-error"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
