'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from 'sonner';


const fetchProducts = async ({ queryKey }) => {
  const [_, { page, limit, category, sort, order, search }] = queryKey;
  const params = new URLSearchParams({
    page,
    limit,
    ...(category && category !== 'all' && { category }),
    sort,
    order,
    ...(search && { search }),
  }).toString();

  const response = await axios.get(`/api/admin/products?${params}`);
  return response.data;
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', { page, limit, category, sort, order, search }],
    queryFn: fetchProducts,
    keepPreviousData: true,
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) => axios.delete(`/api/admin/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to delete product', {
        description: error.response?.data?.message || error.message,
      });
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/admin/products/categories');
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSort = (column) => {
    if (sort === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setOrder('asc');
    }
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1"
        />
        
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('name')}
              >
                Name {sort === 'name' && (order === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('brand')}
              >
                Brand {sort === 'brand' && (order === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead 
                className="cursor-pointer text-right" 
                onClick={() => handleSort('price')}
              >
                Price {sort === 'price' && (order === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right" 
                onClick={() => handleSort('stock')}
              >
                Stock {sort === 'stock' && (order === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right" 
                onClick={() => handleSort('rating')}
              >
                Rating {sort === 'rating' && (order === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (
              data?.products?.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell className="text-right">{product.rating || '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleView(product)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(product)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product)}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Product Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Name</span>
                <span className="col-span-3">{selectedProduct.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Brand</span>
                <span className="col-span-3">{selectedProduct.brand}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Category</span>
                <span className="col-span-3">{selectedProduct.category}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Price</span>
                <span className="col-span-3">${selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Stock</span>
                <span className="col-span-3">{selectedProduct.stock}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium">Rating</span>
                <span className="col-span-3">{selectedProduct.rating || '-'}</span>
              </div>
              {selectedProduct.description && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <span className="text-sm font-medium">Description</span>
                  <p className="col-span-3 text-sm">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm 
            categories={categories}
              product={selectedProduct} 
              onSuccess={() => {
                setEditDialogOpen(false);
                queryClient.invalidateQueries(['products']);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{selectedProduct?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductMutation.mutate(selectedProduct?._id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {data?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * limit, data.pagination.totalProducts)}
            </span>{' '}
            of <span className="font-medium">{data.pagination.totalProducts}</span> products
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((old) => old + 1)}
              disabled={!data.pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}



export function ProductForm({ product, onSuccess, categories }) {
  const queryClient = useQueryClient();
  const formSchema = z.object({
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters.',
    }),
    brand: z.string().min(2, {
      message: 'Brand must be at least 2 characters.',
    }),
    category: z.string().min(1, {
      message: 'Category is required.',
    }),
    price: z.coerce.number().min(0.01, {
      message: 'Price must be at least 0.01',
    }),
    stock: z.coerce.number().min(0, {
      message: 'Stock cannot be negative',
    }),
    description: z.string().optional(),
  });
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      brand: product?.brand || '',
      category: product?.category || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      description: product?.description || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values) => 
      product?._id 
        ? axios.put(`/api/admin/products/${product._id}`, values)
        : axios.post('/api/admin/products', values),
    onSuccess: () => {
      toast.success(`Product ${product?._id ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries(['products']);
      onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to save product', {
        description: error.response?.data?.message || error.message,
      });
    }
  });

  function onSubmit(values) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="Brand name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {categories?.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
}