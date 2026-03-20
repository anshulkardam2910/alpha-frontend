'use client';
import * as React from 'react';
import {
  BookOpen,
  Home,
  Inbox,
  LogOut,
  Megaphone,
  PackageOpen,
  PanelLeftIcon,
  Settings,
  Sparkles,
  UserPlus2,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

type NavSubItem = { title: string; url: string; isActive?: boolean };
type NavItem = { title: string; url: string; icon: LucideIcon; items?: NavSubItem[] };

const data: { navMain: NavItem[] } = {
  navMain: [
    {
      title: 'Home',
      url: '/dashboard',
      icon: Home,
    },
    {
      title: 'Inbox',
      url: '/dashboard/inbox',
      icon: Inbox,
    },
    {
      title: 'Knowledge',
      url: '/dashboard/knowledge',
      icon: BookOpen,
    },
    {
      title: 'Assets',
      url: '/dashboard/assets',
      icon: PackageOpen,
    },
    {
      title: 'Campaigns',
      url: '/dashboard/campaigns',
      icon: Megaphone,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = React.useCallback(() => {
    logout();
    router.replace('/signin');
  }, [logout, router]);

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSidebar();
                }}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image src="/alpha.jpg" alt="Alpha" width={32} height={32} />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium text-lg">Alpha</span>
                </div>
                <PanelLeftIcon className="ml-auto size-4" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <WorkspaceSwitcher />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    <item.icon className="size-4" />
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu> 
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/dashboard/settings">
                <Settings /> Settings
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-pointer">
              <UserPlus2 /> Invite Team Members
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Credits widget */}
        <div className="group-data-[collapsible=icon]:hidden rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-sidebar-foreground">200 Credits</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">of 500</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-sidebar-border/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: '60%' }}
            />
          </div>
          <a
            href="#"
            className="mt-2.5 flex items-center justify-center gap-1.5 rounded-md bg-sidebar-primary py-1.5 text-[11px] font-semibold text-sidebar-primary-foreground transition-colors hover:bg-sidebar-primary/90"
          >
            <Sparkles className="size-3" />
            Upgrade Plan
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-sidebar-border bg-sidebar py-1.5 text-[11px] font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="size-3" />
            Logout
          </button>
        </div>

        {/* Collapsed state: icon-only credits indicator */}
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2">
          <a
            href="#"
            className="flex size-8 items-center justify-center rounded-md bg-sidebar-accent transition-colors hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            title="200 Credits — Upgrade"
          >
            <Zap className="size-4 text-amber-500" />
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex size-8 items-center justify-center rounded-md bg-sidebar-accent transition-colors hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            title="Logout"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
