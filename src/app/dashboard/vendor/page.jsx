"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 8000 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 7000 },
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    date: '2025-03-20',
    amount: 129.99,
    status: 'Pending',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    date: '2025-03-19',
    amount: 79.50,
    status: 'Processing',
  },
  {
    id: 'ORD-003',
    customer: 'Robert Johnson',
    date: '2025-03-18',
    amount: 249.99,
    status: 'Shipped',
  },
];

const topProducts = [
  {
    id: 'PRD-001',
    name: 'Wireless Headphones',
    sold: 42,
    revenue: 3779.58,
    stock: 28,
  },
  {
    id: 'PRD-002',
    name: 'Smartphone Case',
    sold: 38,
    revenue: 759.62,
    stock: 65,
  },
  {
    id: 'PRD-003',
    name: 'Bluetooth Speaker',
    sold: 27,
    revenue: 2699.73,
    stock: 14,
  },
];

export default function VendorDashboard() {


  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,429.20</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              +12.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              4 products low in stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">
              +4.6% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="md:col-span-3 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Your store's sales performance over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest incoming orders for your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full px-3 py-1 text-xs ${order.status === 'Shipped'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'Processing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {order.status}
                    </div>
                    <p className="text-sm font-medium">${order.amount.toFixed(2)}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/vendor/orders/${order.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/vendor/orders">
                  View All Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Your best performing products this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="p-2 text-left font-medium">Product</th>
                  <th className="p-2 text-center font-medium">Units Sold</th>
                  <th className="p-2 text-center font-medium">Revenue</th>
                  <th className="p-2 text-center font-medium">In Stock</th>
                  <th className="p-2 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.id}</div>
                    </td>
                    <td className="p-2 text-center">{product.sold}</td>
                    <td className="p-2 text-center">${product.revenue.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <span className={`rounded-full px-2 py-1 text-xs ${product.stock <= 15
                          ? 'bg-red-100 text-red-700'
                          : product.stock <= 30
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/vendor/products/${product.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/vendor/products">
                View All Products
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-10">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Order Fulfillment</CardTitle>
            <CardDescription>Order processing efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <Progress value={12} max={100} className="mt-2 h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processing</span>
                  <span className="text-sm font-medium">18</span>
                </div>
                <Progress value={18} max={100} className="mt-2 h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Shipped</span>
                  <span className="text-sm font-medium">32</span>
                </div>
                <Progress value={32} max={100} className="mt-2 h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delivered</span>
                  <span className="text-sm font-medium">80</span>
                </div>
                <Progress value={80} max={100} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Stock</span>
                  <span className="text-sm font-medium">24 products</span>
                </div>
                <Progress value={24} max={28} className="mt-2 h-2 bg-green-100" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Stock</span>
                  <span className="text-sm font-medium">4 products</span>
                </div>
                <Progress value={4} max={28} className="mt-2 h-2 bg-yellow-100" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Out of Stock</span>
                  <span className="text-sm font-medium">0 products</span>
                </div>
                <Progress value={0} max={28} className="mt-2 h-2 bg-red-100" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/dashboard/vendor/inventory">
                Manage Inventory
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" size="sm" asChild>
                <Link href="/dashboard/vendor/product">
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </Link>
              </Button>
              <Button className="w-full justify-start" size="sm" variant="outline" asChild>
                <Link href="/dashboard/vendor/orders?status=pending">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Pending Orders
                </Link>
              </Button>
              <Button className="w-full justify-start" size="sm" variant="outline" asChild>
                <Link href="/dashboard/vendor/products?stock=low">
                  <Package className="mr-2 h-4 w-4" />
                  Check Low Stock Items
                </Link>
              </Button>
              <Button className="w-full justify-start" size="sm" variant="outline" asChild>
                <Link href="/dashboard/vendor/analytics">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button className="w-full justify-start" size="sm" variant="outline" asChild>
                <Link href="/dashboard/vendor/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Update Store Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}