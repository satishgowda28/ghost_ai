"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectData } from "@/types/project";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate: () => void;
  onOpenRename: (project: ProjectData) => void;
  onOpenDelete: (project: ProjectData) => void;
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
}

function ProjectItem({
  project,
  isActive,
  onRename,
  onDelete,
}: {
  project: ProjectData;
  isActive?: boolean;
  onRename?: (project: ProjectData) => void;
  onDelete?: (project: ProjectData) => void;
}) {
  return (
    <Link
      href={`/editor/${project.id}`}
      className={`flex items-center gap-1 px-2 py-2 mx-2 rounded-xl hover:bg-elevated cursor-pointer ${isActive ? "bg-elevated" : ""}`}
    >
      <span className="flex-1 text-sm text-copy-primary truncate">
        {project.name}
      </span>
      {onRename && onDelete && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(project);
            }}
            className="p-1 rounded-lg text-copy-faint hover:text-copy-muted hover:bg-subtle transition-colors"
            aria-label={`Rename ${project.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
            className="p-1 rounded-lg text-copy-faint hover:text-error hover:bg-subtle transition-colors"
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </Link>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onOpenCreate,
  onOpenRename,
  onOpenDelete,
  ownedProjects,
  sharedProjects,
}: ProjectSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-12 left-0 bottom-0 w-72 z-40 flex flex-col bg-surface border-r border-surface-border transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <span className="text-sm font-medium text-copy-primary">
            Projects
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
            className="h-7 w-7 text-copy-muted hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex flex-col flex-1 min-h-0">
          <TabsList
            variant="line"
            className="w-full rounded-none border-b border-surface-border px-4 justify-start"
          >
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              {ownedProjects.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-copy-faint text-sm">
                  No projects yet
                </div>
              ) : (
                <div className="py-2">
                  {ownedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={pathname === `/editor/${project.id}`}
                      onRename={onOpenRename}
                      onDelete={onOpenDelete}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shared" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              {sharedProjects.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-copy-faint text-sm">
                  No shared projects
                </div>
              ) : (
                <div className="py-2">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={pathname === `/editor/${project.id}`}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-surface-border">
          <Button className="w-full gap-2" onClick={onOpenCreate}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
