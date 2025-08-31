"use client"

import { type Icon } from "@tabler/icons-react"
import { useRouter, usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  onClick={() => router.push(item.url)} 
                  className={`modern-sidebar-btn ${isActive ? 'active' : ''}`}
                >
                  {item.icon && <item.icon className="modern-sidebar-icon" />}
                  <span className="modern-sidebar-label">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

<style jsx global>{`
  .modern-sidebar-btn {
    @apply flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base text-gray-700 bg-white hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md;
  }
  
  .modern-sidebar-btn.active {
    @apply bg-blue-600 text-white border-blue-600 shadow-md;
  }
  
  .modern-sidebar-btn.active:hover {
    @apply bg-blue-700 text-white border-blue-700;
  }
  
  .modern-sidebar-icon {
    @apply w-6 h-6;
  }
  
  .modern-sidebar-btn:not(.active) .modern-sidebar-icon {
    @apply text-gray-600;
  }
  
  .modern-sidebar-btn:hover:not(.active) .modern-sidebar-icon {
    @apply text-blue-600;
  }
  
  .modern-sidebar-btn.active .modern-sidebar-icon {
    @apply text-white;
  }
  
  .modern-sidebar-label {
    @apply text-base font-semibold tracking-wide;
  }
`}</style>
