"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["Completed", "Pending"]),
  account: z.string().min(1, "Account is required"),
  date: z.string().min(1, "Date is required"),
  client: z.string().optional(),
  vendor: z.string().optional(),
  invoice: z.string().optional(),
  department: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Bank {
  _id: string
  bankName: string
  currentAmount: number
}

interface TransactionFormProps {
  transaction?: {
    _id: string
    description: string
    amount: number
    type: "income" | "expense"
    category: string
    status: "Completed" | "Pending"
    account: string
    date: string
    client?: string | null
    vendor?: string | null
    invoice?: string | null
    department?: string | null
  }
  onSuccess?: () => void
  mode?: 'create' | 'edit'
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransactionForm({ transaction, onSuccess, mode = 'create', open, onOpenChange }: TransactionFormProps) {
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [banks, setBanks] = React.useState<Bank[]>([])
  const [loadingBanks, setLoadingBanks] = React.useState(true)

  // Helper to get a valid account value
  const getValidAccount = (account: string | undefined, banks: Bank[]) => {
    if (!account) return banks[0]?.bankName || ''
    const found = banks.find(b => b.bankName === account)
    return found ? account : (banks[0]?.bankName || '')
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: transaction ? {
      ...transaction,
      amount: transaction.amount != null ? transaction.amount.toString() : '',
      client: transaction.client || '',
      vendor: transaction.vendor || '',
      invoice: transaction.invoice || '',
      department: transaction.department || '',
      // account will be set after banks are loaded
    } : {
      description: "",
      amount: "",
      type: "expense",
      category: "",
      status: "Pending",
      account: "",
      date: new Date().toISOString().split('T')[0],
      client: "",
      vendor: "",
      invoice: "",
      department: "",
    },
  })

  // Fetch banks when component mounts
  React.useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoadingBanks(true)
        const response = await fetch("/api/banks")
        if (response.ok) {
          const banksData = await response.json()
          setBanks(banksData)
          // Set account field if editing and value is not valid
          if (transaction) {
            const validAccount = getValidAccount(transaction.account, banksData)
            form.setValue('account', validAccount)
          }
        } else {
          console.error("Failed to fetch banks")
        }
      } catch (error) {
        console.error("Error fetching banks:", error)
      } finally {
        setLoadingBanks(false)
      }
    }
    fetchBanks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (transaction) {
      form.reset({
        ...transaction,
        amount: transaction.amount != null ? transaction.amount.toString() : '',
        client: transaction.client || '',
        vendor: transaction.vendor || '',
        invoice: transaction.invoice || '',
        department: transaction.department || '',
        account: getValidAccount(transaction.account, banks),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction, banks])

  async function onSubmit(values: FormData) {
    try {
      setError(null)
      setIsSubmitting(true)
      
      // Check if it's an expense and validate against bank balance
      if (values.type === 'expense') {
        const selectedBank = banks.find(bank => bank.bankName === values.account)
        if (selectedBank && parseFloat(values.amount) > selectedBank.currentAmount) {
          setError(`Transaction failed: Demanded amount (${parseFloat(values.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}) is bigger than current amount (${selectedBank.currentAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}) in ${selectedBank.bankName}`)
          return
        }
      }

      const url = mode === 'edit' && transaction 
        ? `/api/transactions/${transaction._id}`
        : '/api/transactions'
      
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          amount: parseFloat(values.amount),
          department: values.department === '' ? undefined : values.department,
          client: values.client === '' ? undefined : values.client,
          vendor: values.vendor === '' ? undefined : values.vendor,
          invoice: values.invoice === '' ? undefined : values.invoice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || `Failed to ${mode} transaction`)
      }

      // Close the dialog and reset the form
      onOpenChange?.(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting form:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Revenue">Revenue</SelectItem>
                        <SelectItem value="Payroll">Payroll</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="IT Expenses">IT Expenses</SelectItem>
                        <SelectItem value="Facilities">Facilities</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Tax">Tax</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => {
                  // Ensure field.value is always a string
                  const safeValue = typeof field.value === 'string' ? field.value : '';
                  
                  return (
                    <FormItem>
                      <FormLabel>Account</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={safeValue} 
                        disabled={loadingBanks}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingBanks ? "Loading banks..." : "Select account"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {banks.length === 0 ? (
                            <SelectItem value="no-banks" disabled>
                              {loadingBanks ? "Loading banks..." : "No banks available"}
                            </SelectItem>
                          ) : (
                            banks.map((bank) => (
                              <SelectItem key={bank._id} value={bank.bankName || 'unknown-bank'}>
                                {bank.bankName} ({bank.currentAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter invoice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="All">All</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Transaction' : 'Save Transaction')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 