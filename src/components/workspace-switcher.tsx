'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus, Upload } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Workspace = {
  name: string;
  logo: string;
};

const workspaces: Workspace[] = [
  { name: 'Alpha', logo: 'A' },
  { name: 'Beta Corp', logo: 'B' },
  { name: 'Gamma Studio', logo: 'G' },
];

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const [activeWorkspace, setActiveWorkspace] = React.useState(workspaces[0]);
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
              {activeWorkspace.logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeWorkspace.name}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 opacity-50" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
          align="start"
          side={isMobile ? 'bottom' : 'right'}
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.name}
              onClick={() => setActiveWorkspace(workspace)}
              className="gap-2 p-2 cursor-pointer"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background text-[10px] font-bold">
                {workspace.logo}
              </div>
              <span className="flex-1">{workspace.name}</span>
              {activeWorkspace.name === workspace.name && (
                <Check className="size-4 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 p-2 cursor-pointer"
            onClick={() => setCreateOpen(true)}
          >
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-3.5" />
            </div>
            <span className="font-medium text-muted-foreground">Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>Create and customise workspace.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Logo upload */}
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted" />
              <div className="space-y-1">
                <p className="text-sm text-foreground">Set a workspace logo</p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="size-3" />
                  Upload logo
                </button>
              </div>
            </div>

            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="ws-name">Name</Label>
              <Input id="ws-name" placeholder="My Workspace" />
            </div>

            {/* Domain field */}
            <div className="space-y-2">
              <Label htmlFor="ws-domain">Domain Name</Label>
              <Input id="ws-domain" placeholder="my-workspace" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateOpen(false)}>
              <Plus className="size-4" />
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
