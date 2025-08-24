"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { z } from "zod"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconPencil,
  IconPlus,
} from "@tabler/icons-react"


import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,

} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { TransactionForm } from "./transaction-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export const schema = z.object({
  _id: z.string(),
  date: z.string(),
  description: z.string(),
  category: z.string(),
  amount: z.number(),
  type: z.enum(["income", "expense"]),
  status: z.enum(["Completed", "Pending"]),
  account: z.string(),
  color: z.string(),
  client: z.string().optional(),
  vendor: z.string().optional(),
  invoice: z.string().optional(),
  department: z.string().optional(),
  payment_id: z.string().optional(),
})

interface TransactionTableProps {
  data: z.infer<typeof schema>[]
}

const categoryColors: Record<string, string> = {
  Revenue: "#22C55E",
  Payroll: "#3B82F6",
  Operations: "#6B7280",
  "IT Expenses": "#8B5CF6",
  Facilities: "#F59E42",
  Marketing: "#EC4899",
  Travel: "#14B8A6",
  Insurance: "#6366F1",
  Tax: "#EF4444",
};

interface TransactionDetailDrawerProps {
  transaction: z.infer<typeof schema> | null;
  onOpenChange: (open: boolean) => void;
}

function TransactionDetailDrawer({
  transaction,
  onOpenChange,
}: TransactionDetailDrawerProps) {
  if (!transaction) {
    return null;
  }

  return (
    <Drawer open={!!transaction} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Transaction Details</DrawerTitle>
          <DrawerDescription>
            Invoice: {transaction.invoice || transaction.payment_id || "N/A"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 overflow-y-auto px-6 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Amount</Label>
              <p className={transaction.amount >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(transaction.amount)}
              </p>
            </div>
            <div>
              <Label>Date</Label>
              <p>{transaction.date}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Status</Label>
              <p>{transaction.status}</p>
            </div>
            <div>
              <Label>Category</Label>
              <p>{transaction.category}</p>
            </div>
          </div>
          <Separator />
          <div>
            <Label>Description</Label>
            <p>{transaction.description}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Account</Label>
              <p>{transaction.account}</p>
            </div>
            <div>
              <Label>Type</Label>
              <p>{transaction.type}</p>
            </div>
          </div>
          <Separator />
          {transaction.client && (
            <div>
              <Label>Client</Label>
              <p>{transaction.client}</p>
            </div>
          )}
          {transaction.vendor && (
            <div>
              <Label>Vendor</Label>
              <p>{transaction.vendor}</p>
            </div>
          )}
          {transaction.department && (
            <div>
              <Label>Department</Label>
              <p>{transaction.department}</p>
            </div>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function TransactionTable({ data: initialData }: TransactionTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [selectedTransaction, setSelectedTransaction] = React.useState<z.infer<typeof schema> | null>(null);
  const [, setIsDrawerOpen] = React.useState(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<z.infer<typeof schema> | null>(null);
  const [transactionToEdit, setTransactionToEdit] = React.useState<z.infer<typeof schema> | null>(null);
  const [isNewTransactionFormOpen, setIsNewTransactionFormOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async (transaction: z.infer<typeof schema>) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/transactions/${transaction._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete transaction');
      }

      // Remove the deleted transaction from the local state
      setData(currentData => currentData.filter((t) => t._id !== transaction._id));
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    // Refresh the data after successful edit
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setData(data.data);
        }
      })
      .catch(error => {
        console.error('Error refreshing data:', error);
      });
  };

  const table = useReactTable<z.infer<typeof schema>>({
    data,
    columns: React.useMemo<ColumnDef<z.infer<typeof schema>>[]>(
      () => [
        {
          accessorKey: "invoice",
          header: "Invoice",
          cell: ({ row }: { row: { original: z.infer<typeof schema> } }) => (
            <span className="font-medium">
              {row.original.invoice || row.original.payment_id || "-"}
            </span>
          ),
        },
        {
          accessorKey: "amount",
          header: "Amount",
          cell: ({ row }: { row: { original: z.infer<typeof schema> } }) => (
            <span className={row.original.type === 'expense' ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(row.original.amount)}
            </span>
          ),
        },
        {
          accessorKey: "date",
          header: "Date",
          cell: ({ row }: { row: { original: z.infer<typeof schema> } }) => <div>{row.original.date}</div>,
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }: { row: { original: z.infer<typeof schema> } }) => (
            <span className={
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium " +
              (row.original.status.toLowerCase() === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800")
            }>
              {row.original.status}
            </span>
          ),
        },
        {
          accessorKey: "description",
          header: "Description",
          cell: ({ row }: { row: { original: z.infer<typeof schema> } }) => (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate max-w-[200px] block">{row.original.description}</span>
                </TooltipTrigger>
                <TooltipContent>
                  {row.original.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          accessorKey: "category",
          header: "Category",
          cell: ({ row }: { row: { original: z.infer<typeof schema> } }) => {
            const color = categoryColors[row.original.category] || "#A3A3A3"; // fallback gray
            return (
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-medium border"
                style={{
                  color,
                  borderColor: color,
                  background: color + "22", // 22 for light bg
                }}
              >
                {row.original.category}
              </span>
            );
          },
        },
        {
          id: "actions",
          cell: ({ row }: { row: { original: z.infer<typeof schema> } }) => (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTransactionToEdit(row.original)}
                className="h-8 w-8 p-0"
              >
                <IconPencil className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                    size="icon"
                  >
                    <IconDotsVertical />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedTransaction(row.original);
                      setIsDrawerOpen(true);
                    }}
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    variant="destructive"
                    onClick={() => setTransactionToDelete(row.original)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        },
      ],
      []
    ),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="w-full flex-col justify-start gap-10">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger 
              value="all"
              onClick={() => table.getColumn("status")?.setFilterValue(undefined)}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              onClick={() => table.getColumn("status")?.setFilterValue("Completed")}
            >
              Completed
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              onClick={() => table.getColumn("status")?.setFilterValue("Pending")}
            >
              Pending
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsNewTransactionFormOpen(true)}>
            <IconPlus className="h-4 w-4" />
            <span>New Transaction</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            setSelectedTransaction(null);
          }
        }}
      />
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              {transactionToDelete && ` for ${transactionToDelete.description}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => transactionToDelete && handleDelete(transactionToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {transactionToEdit && (
        <TransactionForm
          transaction={transactionToEdit}
          mode="edit"
          onSuccess={() => {
            setTransactionToEdit(null);
            handleEditSuccess();
          }}
          open={!!transactionToEdit}
          onOpenChange={(open) => !open && setTransactionToEdit(null)}
        />
      )}
      <TransactionForm
        mode="create"
        onSuccess={() => {
          setIsNewTransactionFormOpen(false);
          handleEditSuccess();
        }}
        open={isNewTransactionFormOpen}
        onOpenChange={setIsNewTransactionFormOpen}
      />
    </div>
  )
}
