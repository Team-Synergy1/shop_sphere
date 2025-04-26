// "use client"

// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger 
// } from '@/components/ui/dropdown-menu';
// import { 
//   Table, 
//   TableBody, 
//   TableCell, 
//   TableHead, 
//   TableHeader, 
//   TableRow 
// } from '@/components/ui/table';
// import { 
//   ChevronLeft, 
//   ChevronRight, 
//   MoreHorizontal, 
//   Search, 
//   Filter, 
//   Store, 
//   DownloadCloud,
//   UserPlus,
//   CheckCircle,
//   XCircle,
//   ShoppingBag,
//   BarChart2,
//   DollarSign
// } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress';

// // Mock data for vendors
// const vendors = [
//   {
//     id: 'VND-142',
//     name: 'ElectroTech Store',
//     ownerName: 'James Wilson',
//     email: 'contact@electrotech.com',
//     joinDate: '2024-09-15',
//     products: 125,
//     orders: 1458,
//     sales: 135280.45,
//     commissionRate: 17,
//     commissions: 22997.68,
//     status: 'active'
//   },
//   {
//     id: 'VND-141',
//     name: 'Fashion World',
//     ownerName: 'Emily Rodriguez',
//     email: 'emily@fashionworld.com',
//     joinDate: '2024-09-22',
//     products: 215,
//     orders: 987,
//     sales: 98760.32,
//     commissionRate: 17,
//     commissions: 16789.25,
//     status: 'active'
//   },
//   {
//     id: 'VND-140',
//     name: 'Home Essentials',
//     ownerName: 'Robert Chen',
//     email: 'info@homeessentials.com',
//     joinDate: '2024-10-03',
//     products: 87,
//     orders: 654,
//     sales: 87430.19,
//     commissionRate: 17,
//     commissions: 14863.13,
//     status: 'active'
//   },
//   {
//     id: 'VND-139',
//     name: 'Gourmet Kitchen',
//     ownerName: 'Sarah Miller',
//     email: 'sarah@gourmetkitchen.com',
//     joinDate: '2024-10-10',
//     products: 56,
//     orders: 432,
//     sales: 54320.75,
//     commissionRate: 16,
//     commissions: 8691.32,
//     status: 'active'
//   },
//   {
//     id: 'VND-138',
//     name: 'FitLife Sports',
//     ownerName: 'Michael Johnson',
//     email: 'michael@fitlifesports.com',
//     joinDate: '2024-10-15',
//     products: 78,
//     orders: 321,
//     sales: 45678.90,
//     commissionRate: 17,
//     commissions: 7765.41,
//     status: 'active'
//   },
//   {
//     id: 'VND-137',
//     name: 'Beauty Corner',
//     ownerName: 'Lisa Wang',
//     email: 'lisa@beautycorner.com',
//     joinDate: '2024-10-18',
//     products: 94,
//     orders: 276,
//     sales: 32450.60,
//     commissionRate: 18,
//     commissions: 5841.11,
//     status: 'active'
//   },
//   {
//     id: 'VND-136',
//     name: 'Tech Gadgets Pro',
//     ownerName: 'David Kim',
//     email: 'info@techgadgetspro.com',
//     joinDate: '2024-10-22',
//     products: 112,
//     orders: 198,
//     sales: 58740.25,
//     commissionRate: 17,
//     commissions: 9985.84,
//     status: 'inactive'
//   },
//   {
//     id: 'VND-135',
//     name: 'Organic Delights',
//     ownerName: 'Anna Martinez',
//     email: 'anna@organicdelights.com',
//     joinDate: '2025-03-05',
//     products: 42,
//     orders: 165,
//     sales: 24870.35,
//     commissionRate: 16,
//     commissions: 3979.26,
//     status: 'active'
//   },
//   {
//     id: 'VND-134',
//     name: 'Bookworm Paradise',
//     ownerName: 'Thomas Brown',
//     email: 'thomas@bookworm.com',
//     joinDate: '2025-03-12',
//     products: 310,
//     orders: 132,
//     sales: 15430.80,
//     commissionRate: 15,
//     commissions: 2314.62,
//     status: 'active'
//   },
//   {
//     id: 'VND-133',
//     name: 'Pet Lovers Store',
//     ownerName: 'Grace Taylor',
//     email: 'grace@petlovers.com',
//     joinDate: '2025-03-20',
//     products: 67,
//     orders: 89,
//     sales: 12540.95,
//     commissionRate: 16,
//     commissions: 2006.55,
//     status: 'active'
//   }
// ];

// // Mock data for pending vendors
// const pendingVendors = [
//   {
//     id: 'PVND-12',
//     name: 'Artisan Crafts',
//     ownerName: 'Daniel Cooper',
//     email: 'daniel@artisancrafts.com',
//     applicationDate: '2025-04-10',
//     productsPlanned: 45,
//     status: 'pending'
//   },
//   {
//     id: 'PVND-11',
//     name: 'Vintage Collections',
//     ownerName: 'Sophia Lee',
//     email: 'sophia@vintagecollections.com',
//     applicationDate: '2025-04-09',
//     productsPlanned: 78,
//     status: 'pending'
//   },
//   {
//     id: 'PVND-10',
//     name: 'Music World',
//     ownerName: 'Jason Richards',
//     email: 'jason@musicworld.com',
//     applicationDate: '2025-04-08',
//     productsPlanned: 120,
//     status: 'pending'
//   },
//   {
//     id: 'PVND-09',
//     name: 'Green Garden Supplies',
//     ownerName: 'Olivia Green',
//     email: 'olivia@greengarden.com',
//     applicationDate: '2025-04-07',
//     productsPlanned: 65,
//     status: 'pending'
//   }
// ];

// export default function AdminVendorsPage() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [activeTab, setActiveTab] = useState('all');
  
//   const itemsPerPage = 7;
  
//   // Filter vendors based on search term and active tab
//   const filteredVendors = vendors.filter(vendor => {
//     const matchesSearch = 
//       vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       vendor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       vendor.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
//     if (activeTab === 'all') return matchesSearch;
//     if (activeTab === 'active') return matchesSearch && vendor.status === 'active';
//     if (activeTab === 'inactive') return matchesSearch && vendor.status === 'inactive';
//     if (activeTab === 'pending') return false; // Handled separately
    
//     return matchesSearch;
//   });
  
//   // Calculate pagination
//   const totalPages = Math.ceil(
//     (activeTab === 'pending' ? pendingVendors.length : filteredVendors.length) / itemsPerPage
//   );
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedVendors = activeTab === 'pending' 
//     ? pendingVendors.slice(startIndex, startIndex + itemsPerPage)
//     : filteredVendors.slice(startIndex, startIndex + itemsPerPage);
  
//   // Handle search
//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1);
//   };
  
//   // Handle pagination
//   const goToPage = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };
  
//   // Calculate total values
//   const totalSales = vendors.reduce((sum, vendor) => sum + vendor.sales, 0);
//   const totalCommissions = vendors.reduce((sum, vendor) => sum + vendor.commissions, 0);
//   const averageCommissionRate = vendors.reduce((sum, vendor) => sum + vendor.commissionRate, 0) / vendors.length;
  
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Vendors Management</h1>
//           <p className="text-muted-foreground">
//             Manage and monitor all vendors on the platform
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm">
//             <DownloadCloud className="mr-2 h-4 w-4" />
//             Export
//           </Button>
//           <Button size="sm">
//             <UserPlus className="mr-2 h-4 w-4" />
//             Add Vendor
//           </Button>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
//             <Store className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">142</div>
//             <p className="text-xs text-muted-foreground">
//               +7 this month
//             </p>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
//             <Store className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">12</div>
//             <p className="text-xs text-muted-foreground">
//               +4 this week
//             </p>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
//             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${(totalSales / 1000).toFixed(1)}K</div>
//             <p className="text-xs text-muted-foreground">
//               +14.2% from last month
//             </p>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${(totalCommissions / 1000).toFixed(1)}K</div>
//             <p className="text-xs text-muted-foreground">
//               Avg. rate: {averageCommissionRate.toFixed(1)}%
//             </p>
//           </CardContent>
//         </Card>
//       </div>
      
//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle>Vendors</CardTitle>
//           <CardDescription>
//             Manage vendor accounts and performance
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="mb-4 flex flex-col sm:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search vendors by name, owner, email or ID..."
//                 className="pl-8"
//                 value={searchTerm}
//                 onChange={handleSearch}
//               />
//             </div>
//             <Button variant="outline" size="icon">
//               <Filter className="h-4 w-4" />
//               <span className="sr-only">Filter</span>
//             </Button>
//           </div>
          
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
//             <TabsList>
//               <TabsTrigger value="all">All Vendors</TabsTrigger>
//               <TabsTrigger value="active">Active</TabsTrigger>
//               <TabsTrigger value="inactive">Inactive</TabsTrigger>
//               <TabsTrigger value="pending">Pending ({pendingVendors.length})</TabsTrigger>
//             </TabsList>
//           </Tabs>
          
//           <div className="rounded-md border overflow-x-auto">
//             {activeTab !== 'pending' ? (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Vendor</TableHead>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Join Date</TableHead>
//                     <TableHead>Products</TableHead>
//                     <TableHead>Sales</TableHead>
//                     <TableHead>Commission</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead></TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {paginatedVendors.map((vendor) => (
//                     <TableRow key={vendor.id}>
//                       <TableCell>
//                         <div>
//                           <p className="font-medium">{vendor.name}</p>
//                           <p className="text-xs text-muted-foreground">{vendor.ownerName}</p>
//                         </div>
//                       </TableCell>
//                       <TableCell>{vendor.id}</TableCell>
//                       <TableCell>{new Date(vendor.joinDate).toLocaleDateString()}</TableCell>
//                       <TableCell>{vendor.products}</TableCell>
//                       <TableCell>${vendor.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
//                       <TableCell>
//                         <div>
//                           <p>${vendor.commissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
//                           <p className="text-xs text-muted-foreground">Rate: {vendor.commissionRate}%</p>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant={vendor.status === 'active' ? 'success' : 'secondary'}>
//                           {vendor.status === 'active' ? (
//                             <CheckCircle className="mr-1 h-3 w-3" />
//                           ) : (
//                             <XCircle className="mr-1 h-3 w-3" />
//                           )}
//                           {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon">
//                               <MoreHorizontal className="h-4 w-4" />
//                               <span className="sr-only">Actions</span>
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem>View Details</DropdownMenuItem>
//                             <DropdownMenuItem>Edit Vendor</DropdownMenuItem>
//                             <DropdownMenuItem>View Products</DropdownMenuItem>
//                             <DropdownMenuItem>View Orders</DropdownMenuItem>
//                             <DropdownMenuItem className={vendor.status === 'active' ? 'text-destructive' : 'text-green-600'}>
//                               {vendor.status === 'active' ? 'Deactivate' : 'Activate'}
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Vendor</TableHead>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Applied Date</TableHead>
//                     <TableHead>Products Planned</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {paginatedVendors.map((vendor) => (
//                     <TableRow key={vendor.id}>
//                       <TableCell>
//                         <div>
//                           <p className="font-medium">{vendor.name}</p>
//                           <p className="text-xs text-muted-foreground">{vendor.ownerName}</p>
//                           <p className="text-xs text-muted-foreground">{vendor.email}</p>
//                         </div>
//                       </TableCell>
//                       <TableCell>{vendor.id}</TableCell>
//                       <TableCell>{new Date(vendor.applicationDate).toLocaleDateString()}</TableCell>
//                       <TableCell>{vendor.productsPlanned}</TableCell>
//                       <TableCell>
//                         <div className="flex space-x-2">
//                           <Button size="sm" variant="outline" className="text-green-600">
//                             <CheckCircle className="mr-1 h-3 w-3" />
//                             Approve
//                           </Button>
//                           <Button size="sm" variant="outline" className="text-destructive">
//                             <XCircle className="mr-1 h-3 w-3" />
//                             Reject
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </div>
          
//           {/* Pagination */}
//           <div className="flex items-center justify-between mt-4">
//             <div className="text-sm text-muted-foreground">
//               Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, 
//                 activeTab === 'pending' ? pendingVendors.length : filteredVendors.length)} of {
//                 activeTab === 'pending' ? pendingVendors.length : filteredVendors.length
//               }
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={() => goToPage(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 <ChevronLeft className="h-4 w-4" />
//                 <span className="sr-only">Previous page</span>
//               </Button>
//               <div className="text-sm">
//                 Page {currentPage} of {totalPages}
//               </div>
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={() => goToPage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 <ChevronRight className="h-4 w-4" />
//                 <span className="sr-only">Next page</span>
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
      
//       <Card>
//         <CardHeader>
//           <CardTitle>Vendor Performance</CardTitle>
//           <CardDescription>
//             Overview of vendor performance metrics
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div>
//               <div className="flex items-center justify-between mb-1">
//                 <div className="text-sm font-medium">ElectroTech Store</div>
//                 <div className="text-sm text-muted-foreground">${vendors[0].sales.toLocaleString()}</div>
//               </div>
//               <Progress value={80} className="h-2" />
//             </div>
            
//             <div>
//               <div className="flex items-center justify-between mb-1">
//                 <div className="text-sm font-medium">Fashion World</div>
//                 <div className="text-sm text-muted-foreground">${vendors[1].sales.toLocaleString()}</div>
//               </div>
//               <Progress value={65} className="h-2" />
//             </div>
            
//             <div>
//               <div className="flex items-center justify-between mb-1">
//                 <div className="text-sm font-medium">Home Essentials</div>
//                 <div className="text-sm text-muted-foreground">${vendors[2].sales.toLocaleString()}</div>
//               </div>
//               <Progress value={55} className="h-2" />
//             </div>
            
//             <div>
//               <div className="flex items-center justify-between mb-1">
//                 <div className="text-sm font-medium">Gourmet Kitchen</div>
//                 <div className="text-sm text-muted-foreground">${vendors[3].sales.toLocaleString()}</div>
//               </div>
//               <Progress value={40} className="h-2" />
//             </div>
            
//             <div>
//               <div className="flex items-center justify-between mb-1">
//                 <div className="text-sm font-medium">FitLife Sports</div>
//                 <div className="text-sm text-muted-foreground">${vendors[4].sales.toLocaleString()}</div>
//               </div>
//               <Progress value={35} className="h-2" />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



// File: /app/dashboard/admin/vendors/page.jsx
"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MoreHorizontal,
  Store,
  Star,
  MapPin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VendorsPage() {
  // Mock data for vendors list
  const vendors = [
    { id: 1, name: "Tech Gadgets Store", email: "contact@techgadgets.com", products: 45, rating: 4.7, location: "New York, USA", status: "Active" },
    { id: 2, name: "Fashion Hub", email: "info@fashionhub.com", products: 120, rating: 4.2, location: "Los Angeles, USA", status: "Active" },
    { id: 3, name: "Home Decor Plus", email: "sales@homedecorplus.com", products: 78, rating: 4.5, location: "Chicago, USA", status: "Active" },
    { id: 4, name: "Organic Foods", email: "hello@organicfoods.com", products: 35, rating: 4.9, location: "Seattle, USA", status: "Active" },
    { id: 5, name: "Sports Outlet", email: "contact@sportsoutlet.com", products: 62, rating: 3.8, location: "Miami, USA", status: "Suspended" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <Button>Approve Requests (3)</Button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vendors..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Store className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-muted-foreground">{vendor.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{vendor.products}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {vendor.rating}
                    <Star className="ml-1 h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                    {vendor.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    vendor.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {vendor.status}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Store</DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>View Products</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Suspend</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}






// "use client"

// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { 
//   Search, 
//   Store, 
//   Filter, 
//   MoreHorizontal,
//   Download,
//   ShoppingBag,
//   DollarSign,
//   CheckCircle,
//   XCircle,
//   Clock,
//   UserPlus,
//   Mail,
//   Star,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';
// import Link from 'next/link';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';

// // Mock data for vendors
// const vendorsData = [
//   {
//     id: 'VND-001',
//     name: 'ElectroTech Store',
//     owner: 'Robert Chen',
//     email: 'robert@electrotech.com',
//     joinDate: '2024-11-12',
//     status: 'active',
//     products: 125,
//     orders: 852,
//     sales: 135280,
//     commission: 22997.60,
//     rating: 4.8
//   },
//   {
//     id: 'VND-002',
//     name: 'Fashion World',
//     owner: 'Emily Parker',
//     email: 'emily@fashionworld.com',
//     joinDate: '2024-12-05',
//     status: 'active',
//     products: 215,
//     orders: 723,
//     sales: 98760,
//     commission: 16789.20,
//     rating: 4.6
//   },
//   {
//     id: 'VND-003',
//     name: 'Home Essentials',
//     owner: 'Daniel Lewis',
//     email: 'daniel@homeessentials.com',
//     joinDate: '2025-01-18',
//     status: 'active',
//     products: 87,
//     orders: 641,
//     sales: 87430,
//     commission: 14863.10,
//     rating: 4.7
//   },
//   {
//     id: 'VND-004',
//     name: 'Garden Paradise',
//     owner: 'Sofia Martinez',
//     email: 'sofia@gardenparadise.com',
//     joinDate: '2025-02-23',
//     status: 'active',
//     products: 63,
//     orders: 327,
//     sales: 45920,
//     commission: 7806.40,
//     rating: 4.4
//   },
//   {
//     id: 'VND-005',
//     name: 'Tech Gadgets Plus',
//     owner: 'James Wilson',
//     email: 'james@techgadgets.com',
//     joinDate: '2025-01-05',
//     status: 'inactive',
//     products: 95,
//     orders: 152,
//     sales: 28750,
//     commission: 4887.50,
//     rating: 4.2
//   },
//   {
//     id: 'VND-006',
//     name: 'Organic Foods Co.',
//     owner: 'Maria Rodriguez',
//     email: 'maria@organicfoods.com',
//     joinDate: '2025-02-14',
//     status: 'pending',
//     products: 0,
//     orders: 0,
//     sales: 0,
//     commission: 0,
//     rating: 0
//   },
//   {
//     id: 'VND-007',
//     name: 'Luxury Watches',
//     owner: 'Thomas Brown',
//     email: 'thomas@luxurywatches.com',
//     joinDate: '2025-03-01',
//     status: 'pending',
//     products: 0,
//     orders: 0,
//     sales: 0,
//     commission: 0,
//     rating: 0
//   },
//   {
//     id: 'VND-008',
//     name: 'Sports Equipment Pro',
//     owner: 'Lisa Johnson',
//     email: 'lisa@sportsequipment.com',
//     joinDate: '2025-03-10',
//     status: 'suspended',
//     products: 42,
//     orders: 85,
//     sales: 12460,
//     commission: 2118.20,
//     rating: 3.8
//   },
// ];

// // Vendor statistics
// const vendorStats = {
//   total: 142,
//   active: 130,
//   inactive: 5,
//   pending: 12,
//   suspended: 7,
//   newThisMonth: 7,
//   averageCommission: 17,
//   totalCommissions: 187232.5,
//   totalSales: 1235480.58
// };

// export default function AdminVendors() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentTab, setCurrentTab] = useState('all');
//   const [selectedStatus, setSelectedStatus] = useState('');
  
//   // Filter vendors based on search, tab, and status
//   const filteredVendors = vendorsData.filter(vendor => {
//     // Search filter
//     const matchesSearch = 
//       vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       vendor.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       vendor.id.toLowerCase().includes(searchQuery.toLowerCase());
    
//     // Tab filter
//     const matchesTab = 
//       currentTab === 'all' || 
//       (currentTab === 'active' && vendor.status === 'active') ||
//       (currentTab === 'inactive' && vendor.status === 'inactive') ||
//       (currentTab === 'pending' && vendor.status === 'pending') ||
//       (currentTab === 'suspended' && vendor.status === 'suspended');
    
//     // Status dropdown filter
//     const matchesStatus = 
//       selectedStatus === '' || 
//       vendor.status === selectedStatus;
    
//     return matchesSearch && matchesTab && matchesStatus;
//   });

//   return (
//     <div>
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Vendor Management</h1>
//           <p className="text-muted-foreground">
//             Manage platform vendors and their stores
//           </p>
//         </div>
//         <div className="flex mt-4 md:mt-0 space-x-2">
//           <Button asChild>
//             <Link href="/dashboard/admin/vendors/pending">
//               <Clock className="mr-2 h-4 w-4" />
//               Pending Approvals ({vendorStats.pending})
//             </Link>
//           </Button>
//           <Button variant="outline">
//             <Download className="mr-2 h-4 w-4" />
//             Export
//           </Button>
//         </div>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
//             <Store className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{vendorStats.total.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">
//               +{vendorStats.newThisMonth} this month
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
//             <CheckCircle className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{vendorStats.active.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground">
//               {((vendorStats.active / vendorStats.total) * 100).toFixed(1)}% of total vendors
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
//             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${(vendorStats.totalSales / 1000).toFixed(1)}K</div>
//             <p className="text-xs text-muted-foreground">
//               Platform lifetime sales
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Commission Revenue</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${(vendorStats.totalCommissions / 1000).toFixed(1)}K</div>
//             <p className="text-xs text-muted-foreground">
//               Avg. rate: {vendorStats.averageCommission}%
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Vendor Management</CardTitle>
//           <CardDescription>Manage platform vendors and their stores</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="mb-4 flex flex-col sm:flex-row items-center gap-2">
//             <div className="relative flex-1">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search vendors..."
//                 className="pl-8"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//               <SelectTrigger className="w-full sm:w-[180px]">
//                 <SelectValue placeholder="Filter by status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="All Statuses">All Statuses</SelectItem>
//                 <SelectItem value="active">Active</SelectItem>
//                 <SelectItem value="inactive">Inactive</SelectItem>
//                 <SelectItem value="pending">Pending</SelectItem>
//                 <SelectItem value="suspended">Suspended</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <Tabs defaultValue="all" className="w-full" onValueChange={setCurrentTab}>
//             <TabsList className="grid w-full grid-cols-5">
//               <TabsTrigger value="all">All</TabsTrigger>
//               <TabsTrigger value="active">Active</TabsTrigger>
//               <TabsTrigger value="inactive">Inactive</TabsTrigger>
//               <TabsTrigger value="pending">Pending</TabsTrigger>
//               <TabsTrigger value="suspended">Suspended</TabsTrigger>
//             </TabsList>
//             <TabsContent value="all" className="mt-4">
//               <VendorsTable vendors={filteredVendors} />
//             </TabsContent>
//             <TabsContent value="active" className="mt-4">
//               <VendorsTable vendors={filteredVendors} />
//             </TabsContent>
//             <TabsContent value="inactive" className="mt-4">
//               <VendorsTable vendors={filteredVendors} />
//             </TabsContent>
//             <TabsContent value="pending" className="mt-4">
//               <VendorsTable vendors={filteredVendors} />
//             </TabsContent>
//             <TabsContent value="suspended" className="mt-4">
//               <VendorsTable vendors={filteredVendors} />
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function VendorsTable({ vendors }) {
//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Vendor</TableHead>
//             <TableHead>ID</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead className="hidden md:table-cell">Products</TableHead>
//             <TableHead className="hidden md:table-cell">Sales</TableHead>
//             <TableHead className="hidden lg:table-cell">Commission</TableHead>
//             <TableHead className="hidden lg:table-cell">Rating</TableHead>
//             <TableHead>Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {vendors.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={8} className="text-center py-4">
//                 No vendors found
//               </TableCell>
//             </TableRow>
//           ) : (
//             vendors.map((vendor) => (
//               <TableRow key={vendor.id}>
//                 <TableCell>
//                   <div>
//                     <div className="font-medium">{vendor.name}</div>
//                     <div className="text-xs text-muted-foreground">{vendor.owner}</div>
//                   </div>
//                 </TableCell>
//                 <TableCell className="font-mono text-sm">{vendor.id}</TableCell>
//                 <TableCell>
//                   <Badge variant={
//                     vendor.status === 'active' ? 'default' : 
//                     vendor.status === 'inactive' ? 'outline' :
//                     vendor.status === 'pending' ? 'secondary' :
//                     'destructive'
//                   }>
//                     {vendor.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="hidden md:table-cell">{vendor.products}</TableCell>
//                 <TableCell className="hidden md:table-cell">
//                   {vendor.sales > 0 ? 
//                     `$${vendor.sales.toLocaleString()}` : 
//                     "-"
//                   }
//                 </TableCell>
//                 <TableCell className="hidden lg:table-cell">
//                   {vendor.commission > 0 ? 
//                     `$${vendor.commission.toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2
//                     })}` : 
//                     "-"
//                   }
//                 </TableCell>
//                 <TableCell className="hidden lg:table-cell">
//                   {vendor.rating > 0 ? (
//                     <div className="flex items-center">
//                       <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
//                       <span>{vendor.rating.toFixed(1)}</span>
//                     </div>
//                   ) : "-"}
//                 </TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon">
//                         <MoreHorizontal className="h-4 w-4" />
//                         <span className="sr-only">Actions</span>
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem asChild>
//                         <Link href={`/dashboard/admin/vendors/${vendor.id}`}>
//                           View Details
//                         </Link>
//                       </DropdownMenuItem>
//                       <DropdownMenuItem asChild>
//                         <Link href={`/dashboard/admin/vendors/${vendor.id}/edit`}>
//                           Edit Vendor
//                         </Link>
//                       </DropdownMenuItem>
//                       <DropdownMenuItem asChild>
//                         <Link href={`/dashboard/admin/vendors/${vendor.id}/products`}>
//                           Manage Products
//                         </Link>
//                       </DropdownMenuItem>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem asChild>
//                         <Link href={`/dashboard/admin/vendors/${vendor.id}/contact`}>
//                           <Mail className="h-4 w-4 mr-2" />
//                           Contact Vendor
//                         </Link>
//                       </DropdownMenuItem>
//                       {vendor.status === 'active' && (
//                         <DropdownMenuItem className="text-destructive">
//                           Suspend Vendor
//                         </DropdownMenuItem>
//                       )}
//                       {vendor.status === 'inactive' && (
//                         <DropdownMenuItem className="text-green-600">
//                           Activate Vendor
//                         </DropdownMenuItem>
//                       )}
//                       {vendor.status === 'suspended' && (
//                         <DropdownMenuItem className="text-green-600">
//                           Reinstate Vendor
//                         </DropdownMenuItem>
//                       )}
//                       {vendor.status === 'pending' && (
//                         <>
//                           <DropdownMenuItem className="text-green-600">
//                             <CheckCircle className="h-4 w-4 mr-2" />
//                             Approve Application
//                           </DropdownMenuItem>
//                           <DropdownMenuItem className="text-destructive">
//                             <XCircle className="h-4 w-4 mr-2" />
//                             Reject Application
//                           </DropdownMenuItem>
//                         </>
//                       )}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
      
//       {vendors.length > 0 && (
//         <div className="flex items-center justify-between px-4 py-4 border-t">
//           <div className="text-sm text-muted-foreground">
//             Showing <span className="font-medium">{vendors.length}</span> vendors
//           </div>
//           <div className="flex items-center space-x-6 lg:space-x-8">
//             <div className="flex items-center space-x-2">
//               <p className="text-sm font-medium">Rows per page</p>
//               <Select defaultValue="10">
//                 <SelectTrigger className="h-8 w-[70px]">
//                   <SelectValue placeholder="10" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="10">10</SelectItem>
//                   <SelectItem value="20">20</SelectItem>
//                   <SelectItem value="50">50</SelectItem>
//                   <SelectItem value="100">100</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="flex w-[100px] items-center justify-center text-sm font-medium">
//               Page 1 of 1
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button variant="outline" size="icon" disabled>
//                 <ChevronLeft className="h-4 w-4" />
//                 <span className="sr-only">Previous page</span>
//               </Button>
//               <Button variant="outline" size="icon" disabled>
//                 <ChevronRight className="h-4 w-4" />
//                 <span className="sr-only">Next page</span>
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Add Top Vendors Performance Component
// function TopVendorsPerformance() {
//   // Sort vendors by sales and get top 5
//   const topVendors = [...vendorsData]
//     .filter(vendor => vendor.status === 'active')
//     .sort((a, b) => b.sales - a.sales)
//     .slice(0, 5);
  
//   // Get max sales for percentage calculation
//   const maxSales = topVendors.length > 0 ? topVendors[0].sales : 0;
  
//   return (
//     <Card className="mt-6">
//       <CardHeader>
//         <CardTitle>Top Performing Vendors</CardTitle>
//         <CardDescription>
//           Top 5 vendors by sales volume
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {topVendors.map(vendor => (
//             <div key={vendor.id}>
//               <div className="flex items-center justify-between mb-1">
//                 <div className="text-sm font-medium">{vendor.name}</div>
//                 <div className="text-sm text-muted-foreground">${vendor.sales.toLocaleString()}</div>
//               </div>
//               <Progress value={(vendor.sales / maxSales) * 100} className="h-2" />
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }