// "use client"

// import { useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Users,
//   Store,
//   ShoppingBag,
//   Settings,
//   FileText,
//   DollarSign,
//   Layers
// } from 'lucide-react';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
// } from 'recharts';
// import axios from 'axios';

// const platformOverview = {
//   totalUsers: 3854,
//   totalVendors: 142,
//   totalProducts: 4283,
//   totalOrders: 18395,
//   totalRevenue: 1235480.58,
//   pendingVendors: 12,
//   activeVendors: 130,
// };

// const revenueData = [
//   { month: 'Jan', revenue: 84250, commissions: 14322.5 },
//   { month: 'Feb', revenue: 96420, commissions: 16391.4 },
//   { month: 'Mar', revenue: 118670, commissions: 20174.9 },
//   { month: 'Apr', revenue: 132480, commissions: 22521.6 },
//   { month: 'May', revenue: 126950, commissions: 21581.5 },
//   { month: 'Jun', revenue: 143520, commissions: 24398.4 },
// ];

// const userGrowthData = [
//   { month: 'Jan', users: 2857, vendors: 95 },
//   { month: 'Feb', users: 3128, vendors: 106 },
//   { month: 'Mar', users: 3326, vendors: 118 },
//   { month: 'Apr', users: 3542, vendors: 127 },
//   { month: 'May', users: 3673, vendors: 135 },
//   { month: 'Jun', users: 3854, vendors: 142 },
// ];

// const topVendors = [
//   {
//     id: 'VND-001',
//     name: 'ElectroTech Store',
//     sales: 135280,
//     commissions: 22997.6,
//     products: 125,
//     status: 'Active',
//   },
//   {
//     id: 'VND-002',
//     name: 'Fashion World',
//     sales: 98760,
//     commissions: 16789.2,
//     products: 215,
//     status: 'Active',
//   },
//   {
//     id: 'VND-003',
//     name: 'Home Essentials',
//     sales: 87430,
//     commissions: 14863.1,
//     products: 87,
//     status: 'Active',
//   },
// ];



// export default function AdminDashboard() {
//   const [recentUsers, setResentUsers] = useState([]);

//   useEffect(() => {
//     fetchUsers();
//   }, [])

//   const fetchUsers = async () => {
//     try {
//       const { data } = await axios.get('/api/auth/register');
//       const users = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
//       setResentUsers(users);
//     } catch (error) {
//       console.log(error.message);
//     }
//   }

//   return (
//     <div>
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Users</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{platformOverview.totalUsers.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">
//               +181 this month
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
//             <Store className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{platformOverview.totalVendors.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">
//               +7 this month
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Products</CardTitle>
//             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{platformOverview.totalProducts.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">
//               +124 this month
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${(platformOverview.totalRevenue / 1000).toFixed(1)}K</div>
//             <p className="text-xs text-muted-foreground">
//               +12.8% from last month
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//         <Card className="lg:col-span-4">
//           <CardHeader>
//             <CardTitle>Revenue & Commissions</CardTitle>
//             <CardDescription>Platform financial performance</CardDescription>
//           </CardHeader>
//           <CardContent className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={revenueData}
//                 margin={{
//                   top: 5,
//                   right: 30,
//                   left: 20,
//                   bottom: 5,
//                 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
//                 <Legend />
//                 <Bar dataKey="revenue" fill="#8884d8" name="Total Revenue" />
//                 <Bar dataKey="commissions" fill="#82ca9d" name="Platform Commissions" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//         <Card className="lg:col-span-3">
//           <CardHeader>
//             <CardTitle>User Growth</CardTitle>
//             <CardDescription>Users and vendors over time</CardDescription>
//           </CardHeader>
//           <CardContent className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart
//                 data={userGrowthData}
//                 margin={{
//                   top: 5,
//                   right: 30,
//                   left: 20,
//                   bottom: 5,
//                 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis yAxisId="left" />
//                 <YAxis yAxisId="right" orientation="right" />
//                 <Tooltip />
//                 <Legend />
//                 <Line yAxisId="left" type="monotone" dataKey="users" stroke="#8884d8" name="Users" />
//                 <Line yAxisId="right" type="monotone" dataKey="vendors" stroke="#82ca9d" name="Vendors" />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Top Performing Vendors</CardTitle>
//             <CardDescription>Vendors with highest sales</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b text-sm text-muted-foreground">
//                     <th className="p-2 text-left font-medium">Vendor</th>
//                     <th className="p-2 text-center font-medium">Total Sales</th>
//                     <th className="p-2 text-center font-medium">Commissions</th>
//                     <th className="p-2 text-center font-medium">Products</th>
//                     <th className="p-2 text-center font-medium">Status</th>
//                     <th className="p-2 text-center font-medium">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {topVendors.map((vendor) => (
//                     <tr key={vendor.id} className="border-b">
//                       <td className="p-2">
//                         <div className="font-medium">{vendor.name}</div>
//                         <div className="text-xs text-muted-foreground">{vendor.id}</div>
//                       </td>
//                       <td className="p-2 text-center">${vendor.sales.toLocaleString()}</td>
//                       <td className="p-2 text-center">${vendor.commissions.toLocaleString()}</td>
//                       <td className="p-2 text-center">{vendor.products}</td>
//                       <td className="p-2 text-center">
//                         <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
//                           {vendor.status}
//                         </span>
//                       </td>
//                       <td className="p-2 text-center">
//                         <Button variant="outline" size="sm" asChild>
//                           <Link href={`/dashboard/admin/vendors/${vendor.id}`}>
//                             View
//                           </Link>
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="mt-4 flex justify-end">
//               <Button variant="outline" size="sm" asChild>
//                 <Link href="/dashboard/admin/vendors">
//                   View All Vendors
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Users</CardTitle>
//             <CardDescription>Latest platform registrations</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {recentUsers?.map((user) => (
//                 <div key={user._id} className="flex items-center gap-3">
//                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
//                     {user.name.charAt(0)}
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-medium">{user.name}</p>
//                     <p className="text-xs text-muted-foreground">{user.email}</p>
//                   </div>
//                   <Button variant="ghost" size="sm" asChild>
//                     <Link href={`/dashboard/admin/users/${user._id}`}>
//                       View
//                     </Link>
//                   </Button>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-4 flex justify-end">
//               <Button variant="outline" size="sm" asChild>
//                 <Link href="/dashboard/admin/users">
//                   View All Users
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <Card>
//           <CardHeader>
//             <CardTitle>Vendor Statistics</CardTitle>
//             <CardDescription>Platform vendor overview</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Active Vendors</span>
//                   <span className="text-sm font-medium">{platformOverview.activeVendors}</span>
//                 </div>
//                 <Progress
//                   value={(platformOverview.activeVendors / platformOverview.totalVendors) * 100}
//                   className="mt-2 h-2"
//                 />
//               </div>
//               <div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Pending Approval</span>
//                   <span className="text-sm font-medium">{platformOverview.pendingVendors}</span>
//                 </div>
//                 <Progress
//                   value={(platformOverview.pendingVendors / platformOverview.totalVendors) * 100}
//                   className="mt-2 h-2"
//                 />
//               </div>
//               <div className="rounded-lg border p-3">
//                 <div className="text-sm font-medium">Commission Rate</div>
//                 <div className="flex items-center">
//                   <span className="text-2xl font-bold">17%</span>
//                   <span className="ml-2 text-xs text-muted-foreground">Platform average</span>
//                 </div>
//               </div>
//               <Button size="sm" asChild>
//                 <Link href="/dashboard/admin/vendors/pending">
//                   Review Pending Vendors
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Category Performance</CardTitle>
//             <CardDescription>Sales by category</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Electronics</span>
//                   <span className="text-sm font-medium">$342,580</span>
//                 </div>
//                 <Progress value={65} className="mt-2 h-2" />
//               </div>
//               <div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Fashion</span>
//                   <span className="text-sm font-medium">$287,430</span>
//                 </div>
//                 <Progress value={52} className="mt-2 h-2" />
//               </div>
//               <div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Home & Garden</span>
//                   <span className="text-sm font-medium">$156,780</span>
//                 </div>
//                 <Progress value={28} className="mt-2 h-2" />
//               </div>
//               <div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm">Beauty</span>
//                   <span className="text-sm font-medium">$128,450</span>
//                 </div>
//                 <Progress value={23} className="mt-2 h-2" />
//               </div>
//             </div>
//             <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
//               <Link href="/dashboard/admin/categories">
//                 Manage Categories
//               </Link>
//             </Button>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//             <CardDescription>Common administrative tasks</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               <Button className="w-full justify-start" size="sm" asChild>
//                 <Link href="/dashboard/admin/vendors/pending">
//                   <Store className="mr-2 h-4 w-4" />
//                   Approve Vendors ({platformOverview.pendingVendors})
//                 </Link>
//               </Button>
//               <Button className="w-full justify-start" size="sm" variant="outline" asChild>
//                 <Link href="/dashboard/admin/products/reported">
//                   <ShoppingBag className="mr-2 h-4 w-4" />
//                   Review Reported Products
//                 </Link>
//               </Button>
//               <Button className="w-full justify-start" size="sm" variant="outline" asChild>
//                 <Link href="/dashboard/admin/categories/new">
//                   <Layers className="mr-2 h-4 w-4" />
//                   Add New Category
//                 </Link>
//               </Button>
//               <Button className="w-full justify-start" size="sm" variant="outline" asChild>
//                 <Link href="/dashboard/admin/reports/generate">
//                   <FileText className="mr-2 h-4 w-4" />
//                   Generate Reports
//                 </Link>
//               </Button>
//               <Button className="w-full justify-start" size="sm" variant="outline" asChild>
//                 <Link href="/dashboard/admin/settings">
//                   <Settings className="mr-2 h-4 w-4" />
//                   Platform Settings
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

const fetchDashboardData = async () => {
  const response = await axios.get('/api/admin/dashboard');
  return response.data;
};

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          {/* <Button variant="outline">Export Report</Button>
          <Button>Add Product</Button> */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${data?.totalRevenue?.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  +{data?.totalSales}
                </div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  +5 since last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">+{data?.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  +30 since last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
        {/* Sales Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <SalesChart data={data?.salesData || []} />
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[70px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <RecentSales data={data?.recentSales || []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm">
              <Link href={"/dashboard/admin/orders"}>
              View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[70px]" />
                  <Skeleton className="h-4 w-[50px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </div>
          ) : (
            <RecentOrders data={data?.recentOrders || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}




export  function SalesChart({ data }) {
  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
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
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


export  function RecentSales({ data }) {
  return (
    <div className="space-y-8">
      {data.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={sale.image} alt="Avatar" />
            <AvatarFallback>
              {sale.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">
            +${sale.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}


export  function RecentOrders({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.date}</TableCell>
            <TableCell className="text-right">
              ${order.amount.toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  order.status === 'delivered'
                    ? 'default'
                    : order.status === 'processing'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {order.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}