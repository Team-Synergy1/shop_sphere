"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  PlusCircle, 
  Filter, 
  MoreHorizontal,
  UserPlus,
  Mail,
  Download,
  CheckCircle,
  XCircle,
  Edit,
  Trash
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for users
const usersData = [
  {
    id: 'USR-001',
    name: 'Emma Thompson',
    email: 'emma.t@example.com',
    joinDate: '2025-03-18',
    status: 'active',
    role: 'customer',
    orders: 12,
    spent: 1243.50,
    lastLogin: '2025-04-15'
  },
  {
    id: 'USR-002',
    name: 'Michael Scott',
    email: 'michael.s@example.com',
    joinDate: '2025-03-17',
    status: 'active',
    role: 'customer',
    orders: 3,
    spent: 345.75,
    lastLogin: '2025-04-14'
  },
  {
    id: 'USR-003',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    joinDate: '2025-03-16',
    status: 'active',
    role: 'customer',
    orders: 27,
    spent: 3245.20,
    lastLogin: '2025-04-16'
  },
  {
    id: 'USR-004',
    name: 'David Wilson',
    email: 'david.w@example.com',
    joinDate: '2025-03-15',
    status: 'inactive',
    role: 'customer',
    orders: 5,
    spent: 730.45,
    lastLogin: '2025-04-02'
  },
  {
    id: 'USR-005',
    name: 'Jennifer Lee',
    email: 'jennifer.l@example.com',
    joinDate: '2025-03-14',
    status: 'active',
    role: 'customer',
    orders: 18,
    spent: 2154.30,
    lastLogin: '2025-04-15'
  },
  {
    id: 'USR-006',
    name: 'Robert Brown',
    email: 'robert.b@example.com',
    joinDate: '2025-03-13',
    status: 'suspended',
    role: 'customer',
    orders: 8,
    spent: 967.85,
    lastLogin: '2025-03-30'
  },
  {
    id: 'USR-007',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    joinDate: '2025-03-12',
    status: 'active',
    role: 'customer',
    orders: 15,
    spent: 1876.25,
    lastLogin: '2025-04-14'
  },
  {
    id: 'USR-008',
    name: 'James Martinez',
    email: 'james.m@example.com',
    joinDate: '2025-03-11',
    status: 'active',
    role: 'customer',
    orders: 7,
    spent: 823.50,
    lastLogin: '2025-04-12'
  },
];

// User statistics
const userStats = {
  total: 3854,
  active: 3542,
  inactive: 267,
  suspended: 45,
  newThisMonth: 181
};

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Filter users based on search, tab, and status
  const filteredUsers = usersData.filter(user => {
    // Search filter
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    const matchesTab = 
      currentTab === 'all' || 
      (currentTab === 'active' && user.status === 'active') ||
      (currentTab === 'inactive' && user.status === 'inactive') ||
      (currentTab === 'suspended' && user.status === 'suspended');
    
    // Status dropdown filter
    const matchesStatus = 
      selectedStatus === '' || 
      user.status === selectedStatus;
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all platform users and their access
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button asChild>
            <Link href="/dashboard/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{userStats.newThisMonth} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((userStats.active / userStats.total) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.inactive.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              No login in 30+ days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.suspended.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Access temporarily revoked
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage platform users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <UsersTable users={filteredUsers} />
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              <UsersTable users={filteredUsers} />
            </TabsContent>
            <TabsContent value="inactive" className="mt-4">
              <UsersTable users={filteredUsers} />
            </TabsContent>
            <TabsContent value="suspended" className="mt-4">
              <UsersTable users={filteredUsers} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTable({ users }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead className="hidden md:table-cell">Orders</TableHead>
            <TableHead className="hidden md:table-cell">Total Spent</TableHead>
            <TableHead className="hidden md:table-cell">Last Login</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{user.id}</TableCell>
                <TableCell>
                  <Badge variant={
                    user.status === 'active' ? 'default' : 
                    user.status === 'inactive' ? 'outline' : 
                    'destructive'
                  }>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                <TableCell className="hidden md:table-cell">{user.orders}</TableCell>
                <TableCell className="hidden md:table-cell">${user.spent.toFixed(2)}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/dashboard/admin/users/${user.id}`}>
                        <Search className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/admin/users/${user.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/admin/users/${user.id}/edit`}>Edit User</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/admin/users/${user.id}/orders`}>View Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" /> Email User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
                          <DropdownMenuItem className="text-amber-600">Deactivate Account</DropdownMenuItem>
                        ) : user.status === 'inactive' ? (
                          <DropdownMenuItem className="text-green-600">Activate Account</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">Unsuspend Account</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">Delete Account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// File: /app/dashboard/admin/users/page.jsx
// "use client";

// import React from "react";
// import { 
//   Table, 
//   TableBody, 
//   TableCell, 
//   TableHead, 
//   TableHeader, 
//   TableRow 
// } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { 
//   Search, 
//   Plus, 
//   MoreHorizontal,
//   Mail,
//   Phone,
//   User,
//   Calendar
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export default function UsersPage() {
//   // Mock data for user list
//   const users = [
//     { id: 1, name: "John Doe", email: "john@example.com", role: "Customer", status: "Active", date: "2023-10-05" },
//     { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Customer", status: "Active", date: "2023-09-15" },
//     { id: 3, name: "Robert Johnson", email: "robert@example.com", role: "Customer", status: "Inactive", date: "2023-08-22" },
//     { id: 4, name: "Emily Davis", email: "emily@example.com", role: "Customer", status: "Active", date: "2023-10-01" },
//     { id: 5, name: "Michael Brown", email: "michael@example.com", role: "Customer", status: "Active", date: "2023-09-28" },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold">Users</h1>
//         <Button>
//           <Plus className="mr-2 h-4 w-4" />
//           Add User
//         </Button>
//       </div>
      
//       <div className="flex items-center gap-2">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search users..." className="pl-8" />
//         </div>
//         <Button variant="outline">Filter</Button>
//       </div>
      
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>User</TableHead>
//               <TableHead>Role</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Joined Date</TableHead>
//               <TableHead className="w-[80px]"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {users.map((user) => (
//               <TableRow key={user.id}>
//                 <TableCell>
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
//                       <User className="h-5 w-5 text-muted-foreground" />
//                     </div>
//                     <div>
//                       <div className="font-medium">{user.name}</div>
//                       <div className="text-sm text-muted-foreground">{user.email}</div>
//                     </div>
//                   </div>
//                 </TableCell>
//                 <TableCell>{user.role}</TableCell>
//                 <TableCell>
//                   <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                     user.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
//                   }`}>
//                     {user.status}
//                   </div>
//                 </TableCell>
//                 <TableCell>{user.date}</TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <MoreHorizontal className="h-4 w-4" />
//                         <span className="sr-only">More</span>
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem>View Details</DropdownMenuItem>
//                       <DropdownMenuItem>Edit User</DropdownMenuItem>
//                       <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }

// 