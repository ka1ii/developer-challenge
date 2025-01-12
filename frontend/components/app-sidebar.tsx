"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Store,
  Command,
  SquareTerminal,
  Wallet,
  File
} from "lucide-react"
import Cookies from 'js-cookie';

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const cookieUsername = Cookies.get('username') || "";
    setUsername(cookieUsername);
  }, []);

  const data = {
    user: {
      name: username,
      email: "@example.com"
    },
    navMain: [
      {
        title: "Job Board",
        url: "/jobs",
        icon: Store,
        isActive: true,
        items: [
          {
            title: "Post a Job",
            url: "/jobs/new",
          }
        ],
      },
      {
        title: "Contracts",
        url: "/contracts",
        icon: File,
        items: [
          {
            title: "Approve",
            url: "/contracts/approve",
          },
          {
            title: "New",
            url: "/contracts/new",
          },
          {
            title: "Pending",
            url: "/contracts/pending",
          },
        ],
      },
      {
        title: "Wallet",
        url: "/wallet",
        icon: Wallet
      },
    ],
  }
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
