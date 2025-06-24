"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Menu, Home, BarChart3, FolderKanban, User, Settings, LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"

async function getCurrentUser() {
  const res = await fetch('/api/user/profile', { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/login';
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  const navItems = [
    { name: "Home", href: "/", icon: Home, description: "Go to main dashboard" },
    { name: "Finance Dashboard", href: "/dashboard", icon: BarChart3, description: "View financial overview" },
    { name: "Current Projects", href: "/projects", icon: FolderKanban, description: "Manage your projects" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full mt-2 md:mt-4">
      <div className="mx-2 md:mx-6">
        <div className="flex h-14 md:h-16 items-center justify-between rounded-xl md:rounded-2xl border bg-white/90 backdrop-blur-xl shadow-lg px-3 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="FlowPilot Logo" 
              width={40} 
              height={40} 
              className="h-8 w-8 md:h-12 md:w-12 object-contain" 
            />
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              FlowPilot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Profile & Mobile Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden sm:flex">
                    <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full hover:ring-2 hover:ring-blue-200 transition-all">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <div className="flex items-center space-x-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                        <p className="text-sm font-medium leading-none">{user.email || 'user@example.com'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/signup" className="hidden sm:block">
                <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-50 transition-colors">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
                {/* Mobile Header */}
                <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src="/logo.png" 
                      alt="FlowPilot Logo" 
                      width={40} 
                      height={40} 
                      className="h-10 w-10 object-contain" 
                    />
                    <div>
                      <SheetTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        FlowPilot
                      </SheetTitle>
                      <p className="text-sm text-muted-foreground">Finance Management</p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex flex-col h-full">
                  {/* Navigation Items */}
                  <div className="flex-1 px-6 py-6">
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-4 p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
                            <item.icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* User Section */}
                  <div className="px-6 py-4 bg-gray-50">
                    {user ? (
                      <div className="space-y-3">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user.name || 'User'} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                              {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>

                        {/* User Actions */}
                        <div className="space-y-1">
                          <Link href="/profile" onClick={() => setIsOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-left hover:bg-blue-50">
                              <User className="mr-3 h-4 w-4" />
                              Profile
                            </Button>
                          </Link>
                          <Link href="/settings" onClick={() => setIsOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-left hover:bg-blue-50">
                              <Settings className="mr-3 h-4 w-4" />
                              Settings
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-left hover:bg-red-50 text-red-600 hover:text-red-700"
                            onClick={() => {
                              logout()
                              setIsOpen(false)
                            }}
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Log out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
