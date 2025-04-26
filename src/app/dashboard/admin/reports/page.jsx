// File: /app/dashboard/admin/reports/page.jsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  BarChart, 
  BarChart2, 
  LineChart, 
  PieChart,
  Calendar,
  Users,
  ShoppingBag,
  ArrowUpRight,
  Store
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,456</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +12.3% from last period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +8.7% from last period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +1.5% from last period
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4 pt-4">
          <div className="flex h-80 w-full items-center justify-center rounded-md border bg-background">
            <div className="flex flex-col items-center text-center">
              <LineChart className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">Sales Overview</h3>
              <p className="text-sm text-muted-foreground">Detailed sales analytics and trends</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <PieChart className="h-10 w-10 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales by Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <BarChart2 className="h-10 w-10 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4 pt-4">
          <div className="flex h-80 w-full items-center justify-center rounded-md border bg-background">
            <div className="flex flex-col items-center text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">User Analytics</h3>
              <p className="text-sm text-muted-foreground">User growth and engagement metrics</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4 pt-4">
          <div className="flex h-80 w-full items-center justify-center rounded-md border bg-background">
            <div className="flex flex-col items-center text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">Product Performance</h3>
              <p className="text-sm text-muted-foreground">Best selling products and inventory analysis</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="vendors" className="space-y-4 pt-4">
          <div className="flex h-80 w-full items-center justify-center rounded-md border bg-background">
            <div className="flex flex-col items-center text-center">
              <Store className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">Vendor Performance</h3>
              <p className="text-sm text-muted-foreground">Vendor sales and activity metrics</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}