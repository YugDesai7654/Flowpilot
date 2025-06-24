"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "./button"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { useInView } from "react-intersection-observer"
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"

export function HeroSection() {
  const router = useRouter()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
  }

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          style={{ y, opacity }}
          className="absolute -left-20 top-20 h-64 w-64 animate-float rounded-full bg-blue-200/20 blur-3xl"
        />
        <motion.div
          style={{ y, opacity }}
          className="absolute -right-20 top-40 h-80 w-80 animate-float-delayed rounded-full bg-indigo-200/20 blur-3xl"
        />
        <motion.div
          style={{ y, opacity }}
          className="absolute bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 animate-float-slow rounded-full bg-purple-200/20 blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl"
          >
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              All-in-One Dashboard
            </span>
            <span className="block text-gray-900">for Smarter Company Management</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600"
          >
            Manage your finances, projects, and teams — all from a single intuitive platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push("/signup")}
            >
              Get Started
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push("/demo")}
            >
              Book a Demo
            </Button> */}
          </motion.div>

          {/* Feature Cards */}
          <div ref={ref} className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ChartBarIcon,
                title: "Financial Analytics",
                description: "Real-time insights and comprehensive financial reporting",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: ClockIcon,
                title: "Project Timeline & Tasks",
                description: "Streamlined project management with intuitive timelines",
                color: "from-indigo-500 to-indigo-600",
              },
              {
                icon: UserGroupIcon,
                title: "Team Collaboration",
                description: "Enhanced team coordination with granular access control",
                color: "from-purple-500 to-purple-600",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="group relative overflow-hidden rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                <div className="relative">
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${feature.color} p-3 text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 