import type React from "react"
import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { ArrowDownRight, ArrowUpRight, DollarSign, Briefcase, TrendingUp, Banknote } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Added MetricCardProps interface
interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  description: string
  subtext: string
  icon: React.ReactNode
  color: "emerald" | "rose" | "blue" | "slate" | "amber"
  className?: string
}

// Professional color scheme - removed violet, added slate
const colorStyles = {
  emerald: {
    bgLight: "bg-white",
    bgDark: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "bg-emerald-100 text-emerald-700",
    gradient: "from-emerald-50/50 to-transparent",
  },
  rose: {
    bgLight: "bg-white",
    bgDark: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: "bg-rose-100 text-rose-700",
    gradient: "from-rose-50/50 to-transparent",
  },
  blue: {
    bgLight: "bg-white",
    bgDark: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "bg-blue-100 text-blue-700",
    gradient: "from-blue-50/50 to-transparent",
  },
  slate: {
    bgLight: "bg-white",
    bgDark: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: "bg-slate-100 text-slate-700",
    gradient: "from-slate-50/50 to-transparent",
  },
  amber: {
    bgLight: "bg-white",
    bgDark: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "bg-amber-100 text-amber-700",
    gradient: "from-amber-50/50 to-transparent",
  },
}

// Professional MetricCard component
function MetricCard({ title, value, change, trend, description, subtext, icon, color, className }: MetricCardProps) {
  const styles = colorStyles[color]

  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-xl border-0 shadow-lg", styles.bgLight, className)}>
      <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", styles.gradient)} />
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl shadow-md", styles.icon)}>
            {icon}
          </div>
          {change && (
            <Badge
              variant="outline"
              className={cn(
                "font-medium text-xs px-3 py-1 rounded-full",
                trend === "up"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200",
              )}
            >
              {trend === "up" ? (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3" />
              )}
              {change}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm font-medium text-gray-600 mb-2">{title}</CardDescription>
        <CardTitle className="text-3xl font-bold text-gray-900">{value}</CardTitle>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-2 pt-0 relative z-10">
        <div
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            trend === "up" ? "text-green-700" : "text-red-700",
          )}
        >
          {description}
          {trend === "up" ? <IconTrendingUp className="h-4 w-4" /> : <IconTrendingDown className="h-4 w-4" />}
        </div>
        <div className="text-xs text-gray-500">{subtext}</div>
      </CardFooter>
    </Card>
  )
}

export function SectionCards() {
  const [bankBalance, setBankBalance] = useState<number | null>(null)
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null)
  const [growthRate, setGrowthRate] = useState<{rate: number|null, trend: 'up'|'down', change: string}>({rate: null, trend: 'up', change: ''})
  const [loading, setLoading] = useState(true)
  const [activeProjectsCount, setActiveProjectsCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [banksRes, transactionsRes, projectsRes] = await Promise.all([
          fetch("/api/banks"),
          fetch("/api/transactions"),
          fetch("/api/projects")
        ])
        const banks = await banksRes.json()
        const transactions = await transactionsRes.json()
        const projects = await projectsRes.json()
        const totalBank = Array.isArray(banks) ? banks.reduce((sum, b) => sum + (b.currentAmount || 0), 0) : 0
        const totalRev = Array.isArray(transactions) ? transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + (t.amount || 0), 0) : 0
        setBankBalance(totalBank)
        setTotalRevenue(totalRev)

        // Calculate growth rate (month-over-month revenue growth)
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
        const thisMonthRevenue = transactions.filter((t: { type: string; date: string }) => t.type === "income" && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear).reduce((sum: number, t: { amount?: number }) => sum + (t.amount || 0), 0)
        const lastMonthRevenue = transactions.filter((t: { type: string; date: string }) => t.type === "income" && new Date(t.date).getMonth() === lastMonth && new Date(t.date).getFullYear() === lastMonthYear).reduce((sum: number, t: { amount?: number }) => sum + (t.amount || 0), 0)
        let rate: number|null = null
        let trend: 'up'|'down' = 'up'
        let change = ''
        if (lastMonthRevenue > 0) {
          rate = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          trend = rate >= 0 ? 'up' : 'down'
          change = (rate >= 0 ? '+' : '') + rate.toFixed(1) + '%'
        } else if (thisMonthRevenue > 0) {
          rate = 100
          trend = 'up'
          change = '+100%'
        } else {
          rate = 0
          trend = 'down'
          change = '0%'
        }
        setGrowthRate({rate, trend, change})

        // Active projects: not archived
        const activeProjects = Array.isArray(projects) ? projects.filter((p: { isArchived?: boolean }) => !p.isArchived) : []
        setActiveProjectsCount(activeProjects.length)
      } catch {
        setBankBalance(null)
        setTotalRevenue(null)
        setGrowthRate({rate: null, trend: 'up', change: ''})
        setActiveProjectsCount(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "--"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const cardsData: MetricCardProps[] = [
    {
      title: "Total Revenue",
      value: loading ? "--" : formatCurrency(totalRevenue),
      change: "",
      trend: "up",
      description: "Total income from all transactions",
      subtext: "Sum of all completed income transactions",
      icon: <DollarSign className="h-5 w-5" />,
      color: "emerald",
    },
    {
      title: "Bank Balance",
      value: loading ? "--" : formatCurrency(bankBalance),
      change: "",
      trend: "up",
      description: "Sum of all bank accounts",
      subtext: "Current balance across all banks",
      icon: <Banknote className="h-5 w-5" />,
      color: "blue",
    },
    {
      title: "Active Projects",
      value: loading ? "--" : (activeProjectsCount !== null ? activeProjectsCount.toString() : "--"),
      change: "",
      trend: "up",
      description: "Ongoing initiatives and tasks",
      subtext: "Tracking progress and milestones",
      icon: <Briefcase className="h-5 w-5" />,
      color: "slate",
    },
    {
      title: "Growth Rate",
      value: loading ? "--" : (growthRate.rate !== null ? growthRate.change : '--'),
      change: loading ? "" : (growthRate.rate !== null ? growthRate.change : ''),
      trend: growthRate.trend,
      description: "Month-over-month revenue growth",
      subtext: "Compared to previous month",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "amber",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 lg:px-6">
      {cardsData.map((card) => {
        if (card.title === "Active Projects") {
          return (
            <Link href="/projects" key={card.title} className="contents">
              <MetricCard
                title={card.title}
                value={card.value}
                change={card.change}
                trend={card.trend}
                description={card.description}
                subtext={card.subtext}
                icon={card.icon}
                color={card.color}
              />
            </Link>
          );
        }
        return (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            trend={card.trend}
            description={card.description}
            subtext={card.subtext}
            icon={card.icon}
            color={card.color}
          />
        );
      })}
    </div>
  )
}
