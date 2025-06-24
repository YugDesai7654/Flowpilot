"use client"

import { useState, useEffect } from "react"
import { IconPlus, IconBuilding } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BankForm } from "@/components/admin/bank-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

interface Bank {
  _id: string
  bankName: string
  ifscCode: string
  accountNumber: string
  accountType: 'saving' | 'current'
  currentAmount: number
  createdAt: string
  updatedAt: string
}

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null)

  const fetchBanks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/banks")
      const data = await response.json()

      if (response.ok) {
        setBanks(data)
      } else {
        setError(data.error || "Failed to fetch banks.")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError("Network error or failed to load banks: " + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanks()
  }, [])

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
    fetchBanks()
  }

  const handleDeleteClick = (bank: Bank) => {
    setBankToDelete(bank)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bankToDelete) return

    try {
      const response = await fetch(`/api/banks/${bankToDelete._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBanks(banks.filter(bank => bank._id !== bankToDelete._id))
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete bank.")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError("Network error or failed to delete bank: " + errorMessage)
    } finally {
      setDeleteDialogOpen(false)
      setBankToDelete(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading banks...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-8 lg:px-16">
        <div className="text-red-500 text-center">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-8 lg:px-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Management</h1>
          <p className="text-gray-600 mt-2">Manage your company&apos;s bank accounts and track balances</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2 mt-2 md:mt-0 px-6 py-3 text-base">
          <IconPlus size={20} />
          Add New Bank
        </Button>
      </div>

      {banks.length === 0 ? (
        <Card className="text-center py-16 px-4 md:px-8">
          <CardContent>
            <IconBuilding size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No banks added yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first bank account to manage transactions</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="px-6 py-2 text-base">
              Add Your First Bank
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {banks.map((bank) => (
            <Card key={bank._id} className="hover:shadow-lg transition-shadow p-6">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{bank.bankName}</CardTitle>
                    <CardDescription className="text-sm">
                      {bank.accountType.charAt(0).toUpperCase() + bank.accountType.slice(1)} Account
                    </CardDescription>
                  </div>
                  <Badge variant={bank.accountType === 'saving' ? 'default' : 'secondary'}>
                    {bank.accountType.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-mono font-medium">{bank.accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IFSC Code:</span>
                    <span className="font-mono font-medium">{bank.ifscCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className={`font-semibold ${bank.currentAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(bank.currentAmount)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Added: {formatDate(bank.createdAt)}</span>
                    <span>Updated: {formatDate(bank.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log("Edit bank:", bank.bankName)
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDeleteClick(bank)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Bank Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Bank Account</DialogTitle>
          </DialogHeader>
          <BankForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bank account &quot;{bankToDelete?.bankName}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 