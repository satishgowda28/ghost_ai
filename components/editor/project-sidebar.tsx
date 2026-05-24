"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={`fixed top-12 left-0 bottom-0 w-72 z-40 flex flex-col bg-surface border-r border-surface-border transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <span className="text-sm font-medium text-copy-primary">Projects</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
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
            <div className="flex items-center justify-center h-48 text-copy-faint text-sm">
              No projects yet
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="shared" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="flex items-center justify-center h-48 text-copy-faint text-sm">
              No shared projects
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-surface-border">
        <Button className="w-full gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
