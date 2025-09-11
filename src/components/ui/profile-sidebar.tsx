"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import {
  Settings,
  LogOut,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  companyName: string
  phone?: string
  joinDate: string
  avatar?: string
}

export function ProfileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/signup" })
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={userProfile?.avatar} alt={userProfile?.name} />
          <AvatarFallback>
            {userProfile?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Profile</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : userProfile ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-4 ring-4 ring-blue-100">
                        <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                        <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {userProfile.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-semibold">{userProfile.name}</h3>
                      <p className="text-sm text-gray-500">{userProfile.role}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span>{userProfile.companyName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span>{userProfile.email}</span>
                      </div>
                      {userProfile.phone && (
                        <div className="flex items-center gap-3 text-gray-600 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <Phone className="h-5 w-5 text-blue-600" />
                          <span>{userProfile.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-gray-600 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span>Joined {new Date(userProfile.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span>Role: {userProfile.role}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 mb-2 hover:bg-gray-50"
                        onClick={() => router.push("/settings")}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-gray-500">
                    Failed to load profile
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 