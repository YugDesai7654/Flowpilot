"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart showing monthly profit and cost"

const chartConfig = {
  profit: {
    label: "Profit",
    color: "#10B981", // Green for profit
  },
  cost: {
    label: "Cost",
    color: "#EF4444", // Red for cost
  },
} satisfies ChartConfig

const currentYear = new Date().getFullYear()
const previousYear1 = currentYear - 1
const previousYear2 = currentYear - 2

export function ChartAreaInteractive({ companyId }: { companyId: string }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<"currentYear"|"previousYear1"|"previousYear2">("currentYear")
  const [transactions, setTransactions] = React.useState<Array<{ date: string; amount: number; type: string }>>([])

  // fetch all transactions once
  React.useEffect(() => {
    if (companyId) { // Only fetch if companyId is available
      console.log('Client: Fetching transactions for companyId:', companyId);
      fetch("/api/transactions") // API now handles companyId from token
        .then(res => {
          if (!res.ok) {
            console.error('Client: API response not OK:', res.status, res.statusText);
            return res.json().then(err => Promise.reject(err));
          }
          return res.json();
        })
        .then((data) => {
          console.log('Client: Received transaction data:', data);
          setTransactions(data);
        })
        .catch(error => {
          console.error('Client: Error fetching transactions:', error);
        });
    }
  }, [companyId]) // Add companyId to dependency array

  // determine selected year
  const year = React.useMemo(() => {
    if (timeRange === "previousYear1") return previousYear1
    if (timeRange === "previousYear2") return previousYear2
    return currentYear
  }, [timeRange])

  // aggregate monthly profit / cost
  const monthlyData = React.useMemo(() => {
    const base = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(year, i, 1).toISOString(),
      profit: 0,
      cost: 0,
    }))
    console.log('Chart: Initial monthlyData base:', base);
    transactions.forEach(tx => {
      console.log('Chart: Processing transaction:', tx);
      const d = new Date(tx.date)
      console.log('Chart: Transaction date object:', d);
      console.log('Chart: Transaction year:', d.getFullYear(), 'Current year for aggregation:', year);
      if (d.getFullYear() === year) {
        const idx = d.getMonth()
        console.log('Chart: Transaction month index:', idx, 'Type:', tx.type, 'Amount:', tx.amount);
        if (tx.type === "income") {
          base[idx].profit += Math.abs(tx.amount)
          console.log('Chart: Added income to month', idx, 'New profit:', base[idx].profit);
        } else if (tx.type === "expense") {
          base[idx].cost += Math.abs(tx.amount)
          console.log('Chart: Added expense to month', idx, 'New cost:', base[idx].cost);
        }
      }
    })
    console.log('Chart: Final aggregated monthlyData:', base);
    return base
  }, [transactions, year])

  const getCardDescription = () => {
    if (timeRange === "currentYear") {
      return `Showing data for Current Year (${currentYear})`
    }
    if (timeRange === "previousYear1") {
      return `Showing data for Previous Year (${previousYear1})`
    }
    return `Showing data for Previous Year (${previousYear2})`
  }

  return (
    <Card className="@container/card border border-gray-200 shadow-sm">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-semibold text-gray-900">Profit & Cost Analysis</CardTitle>
          <CardDescription className="text-gray-600">{getCardDescription()}</CardDescription>
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={value => {
              if (
                value === "currentYear" ||
                value === "previousYear1" ||
                value === "previousYear2"
              ) {
                setTimeRange(value)
              }
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="currentYear">Current Year</ToggleGroupItem>
            <ToggleGroupItem value="previousYear1">Previous Year 1</ToggleGroupItem>
            <ToggleGroupItem value="previousYear2">Previous Year 2</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={value =>
              setTimeRange(value as "currentYear" | "previousYear1" | "previousYear2")
            }
          >
            <SelectTrigger
              className="flex w-48 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a time range"
            >
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="currentYear">Current Year ({currentYear})</SelectItem>
              <SelectItem value="previousYear1">Previous Year ({previousYear1})</SelectItem>
              <SelectItem value="previousYear2">Previous Year ({previousYear2})</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.profit.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartConfig.profit.color} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.cost.color} stopOpacity={0.6} />
                <stop offset="95%" stopColor={chartConfig.cost.color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={5}
              tickFormatter={val =>
                new Date(val).toLocaleDateString("en-US", { month: "short" })
              }
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 0}
              content={
                <ChartTooltipContent
                  labelFormatter={val =>
                    new Date(val).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="cost"
              type="natural"
              fill="url(#fillCost)"
              stroke={chartConfig.cost.color}
              stackId="a"
              strokeWidth={2}
            />
            <Area
              dataKey="profit"
              type="natural"
              fill="url(#fillProfit)"
              stroke={chartConfig.profit.color}
              stackId="a"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
