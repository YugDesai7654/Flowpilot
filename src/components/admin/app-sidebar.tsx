"use client"

import * as React from "react"
import {
  IconBuilding,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  // IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconCreditCard,
  IconLayoutSidebarLeftCollapse,
  IconHome,
} from "@tabler/icons-react"


import { NavMain } from "@/components/admin/nav-main"
import { NavSecondary } from "@/components/admin/nav-secondary"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: IconHome,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    // {
    //   title: "Lifecycle",
    //   url: "#",
    //   icon: IconListDetails,
    // },
    {
      title: "Transaction",
      url: "/dashboard/transaction",
      icon: IconChartBar,
    },
    {
      title: "Banks",
      url: "/dashboard/banks",
      icon: IconCreditCard,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: IconUsers,
    },
    {
      title: "Employees Approval",
      url: "/dashboard/employees",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/setting",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
    {
      title: "Toggle Sidebar",
      url: "#",
      icon: IconLayoutSidebarLeftCollapse,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ 
  companyName, 
  fullUserProfile, 
  onSearchClick,
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  companyName: string, 
  fullUserProfile: { name?: string; email?: string; role?: string },
  onSearchClick?: () => void
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 bg-white text-black font-bold text-lg tracking-tight mb-4 p-3 rounded-lg border shadow-sm">
              <IconBuilding size={24} />
              <span>{companyName}</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[#f6f9ff] rounded-none shadow-none mt-0 p-0 flex flex-col gap-2">
        {/* Main Navigation */}
        <NavMain items={data.navMain} />
        {/* Settings/Secondary Section */}
        <div className="mt-4 mb-1 px-6 text-xs font-semibold uppercase text-gray-400 tracking-wider">Settings</div>
        <NavSecondary items={data.navSecondary} onSearchClick={onSearchClick} />
      </SidebarContent>
      <SidebarFooter className="bg-[#f6f9ff] rounded-none shadow-none p-4 border-t border-gray-100 mt-4">
        <NavUser user={{
          name: fullUserProfile.name || 'User',
          email: fullUserProfile.email || 'user@example.com',
          avatar: '/default-avatar.png',
          role: fullUserProfile.role || 'user',
          companyId: 'default',
          companyName: 'Company'
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
