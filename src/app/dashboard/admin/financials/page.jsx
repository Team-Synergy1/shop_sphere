// File: /app/dashboard/admin/financials/page.jsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ArrowUpRight, 
  BarChart, 
  Download,
  CreditCard,
  Store,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function FinancialsPage() {
  // Mock data for financial transactions
  const transactions = [
    { id: "TRX-001", date: "2023-10-05", store: "Tech Gadgets Store", amount: 1245.80, fee: 62.29, status: "Completed" },
    { id: "TRX-002", date: "2023-10-05", store: "Fashion Hub", amount: 876.50, fee: 43.83, status: "Completed" },
    { id: "TRX-003", date: "2023-10-04", store: "Home Decor Plus", amount: 1578.25, fee: 78.91, status: "Pending" },
    { id: "TRX-004", date: "2023-10-03", store: "Organic Foods", amount: 456.75, fee: 22.84, status: "Completed" },
    { id: "TRX-005", date: "2023-10-02", store: "Sports Outlet", amount: 982.40, fee: 49.12, status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financials</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +20.1% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,745.22</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +15.3% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendor Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$36,486.67</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +18.7% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,742.95</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="mr-1 h-4 w-4" />
              -8.4% from last month
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4 pt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {transaction.store}
                      </div>
                    </TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>${transaction.fee.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        transaction.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {transaction.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="payouts" className="space-y-4 pt-4">
          <div className="flex h-80 w-full items-center justify-center rounded-md bg-muted">
            <div className="flex flex-col items-center text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">Payout Records</h3>
              <p className="text-sm text-muted-foreground">Vendor payment history and scheduled payouts</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4 pt-4">
          <div className="flex h-80 w-full items-center justify-center rounded-md bg-muted">
            <div className="flex flex-col items-center text-center">
              <BarChart className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">Financial Reports</h3>
              <p className="text-sm text-muted-foreground">Revenue statistics and financial analytics</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}