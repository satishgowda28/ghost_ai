import { NewProjectButton } from "@/components/editor/new-project-button";

export default function EditorPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-5">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-muted">
          Start a new architecture workspace or choose a project from the
          sidebar.
        </p>
      </div>
      <NewProjectButton />
    </div>
  );
}
