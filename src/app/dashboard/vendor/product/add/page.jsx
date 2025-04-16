"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Form schema
const productSchema = z.object({
	name: z
		.string()
		.min(3, { message: "Product name must be at least 3 characters" }),
	brand: z
		.string()
		.min(2, { message: "Brand name must be at least 2 characters" }),
	category: z.string({ message: "Please select a category" }),
	subcategory: z.string().optional(),
	price: z.coerce
		.number()
		.positive({ message: "Price must be a positive number" }),
	rating: z.coerce.number().min(0).max(5).optional(),
	reviewCount: z.coerce.number().int().nonnegative().optional(),
	description: z
		.string()
		.min(10, { message: "Description must be at least 10 characters" }),
	stock: z.coerce.number().int().nonnegative(),
	inStock: z.boolean().default(true),
	shipping: z.string().optional(),
	delivery: z.string().optional(),
	vendor: z.string().optional(),
});

export default function AddProductPage() {
	const router = useRouter();
	const [colors, setColors] = useState([]);
	const [features, setFeatures] = useState([]);
	const [newColor, setNewColor] = useState("");
	const [newFeature, setNewFeature] = useState("");
	const [specs, setSpecs] = useState({});
	const [newSpecKey, setNewSpecKey] = useState("");
	const [newSpecValue, setNewSpecValue] = useState("");
	const [images, setImages] = useState([]);
	const [activeTab, setActiveTab] = useState("basic");
	const [showSubcategories, setShowSubcategories] = useState(false);
	const image_host_key = process.env.NEXT_PUBLIC_IMAGE;

	const image_host_Api = `https://api.imgbb.com/1/upload?key=${image_host_key}`;
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		if (image_host_key) {
			fetch(`https://api.imgbb.com/1/upload?key=${image_host_key}`, {
				method: "HEAD",
			})
				.then((response) => {
					console.log(" response status:", response.status);
				})
				.catch((error) => {
					console.error(" test error:", error);
				});
		}
	}, []);

	const categories = [
		{
			id: "electronics",
			name: "Electronics",
			subcategories: [
				"Smartphones",
				"Laptops",
				"Audio",
				"Accessories",
				"Wearables",
			],
		},
		{
			id: "clothing",
			name: "Clothing",
			subcategories: ["Men", "Women", "Kids", "Activewear", "Shoes"],
		},
		{
			id: "home",
			name: "Home & Kitchen",
			subcategories: [
				"Furniture",
				"Appliances",
				"Cookware",
				"Decor",
				"Bedding",
			],
		},
		{
			id: "beauty",
			name: "Beauty & Personal Care",
			subcategories: [
				"Skincare",
				"Makeup",
				"Haircare",
				"Fragrance",
				"Bath & Body",
			],
		},
		{
			id: "books",
			name: "Books & Media",
			subcategories: [
				"Fiction",
				"Non-fiction",
				"Textbooks",
				"Magazines",
				"Audiobooks",
			],
		},
		{
			id: "sports",
			name: "Sports & Outdoors",
			subcategories: ["Equipment", "Clothing", "Shoes", "Camping", "Fitness"],
		},
	];

	const form = useForm({
		resolver: zodResolver(productSchema),
		defaultValues: {
			name: "",
			brand: "",
			category: "",
			subcategory: "",
			price: 0,
			rating: 0,
			reviewCount: 0,
			description: "",
			stock: 0,
			inStock: true,
			shipping: "Standard shipping",
			delivery: "3-5 business days",
		},
	});

	// Watch for category change
	const selectedCategory = form.watch("category");

	React.useEffect(() => {
		// reset subcategory
		form.setValue("subcategory", "");

		// check if selected category has subcategories
		const category = categories.find((cat) => cat.id === selectedCategory);
		setShowSubcategories(
			category && category.subcategories && category.subcategories.length > 0
		);
	}, [selectedCategory, form]);

	// add color
	const addColor = () => {
		if (newColor.trim() !== "" && !colors.includes(newColor.trim())) {
			setColors([...colors, newColor.trim()]);
			setNewColor("");
		}
	};

	// remove color
	const removeColor = (colorToRemove) => {
		setColors(colors.filter((color) => color !== colorToRemove));
	};

	// add feature
	const addFeature = () => {
		if (newFeature.trim() !== "" && !features.includes(newFeature.trim())) {
			setFeatures([...features, newFeature.trim()]);
			setNewFeature("");
		}
	};

	// remove feature
	const removeFeature = (featureToRemove) => {
		setFeatures(features.filter((feature) => feature !== featureToRemove));
	};

	// add spec
	const addSpec = () => {
		if (newSpecKey.trim() !== "" && newSpecValue.trim() !== "") {
			setSpecs({
				...specs,
				[newSpecKey.trim()]: newSpecValue.trim(),
			});
			setNewSpecKey("");
			setNewSpecValue("");
		}
	};

	// Remove spec
	const removeSpec = (specKey) => {
		const newSpecs = { ...specs };
		delete newSpecs[specKey];
		setSpecs(newSpecs);
	};
	const handleImageUpload = async (e) => {
		if (!e.target || !e.target.files) {
			console.error("No files selected or files property is undefined");
			return;
		}

		const files = Array.from(e.target.files);

		if (files.length > 0) {
			try {
				setIsUploading(true);
				console.log(`Attempting to upload ${files.length} files`);

				const uploadPromises = files.map(async (file) => {
					const formData = new FormData();
					formData.append("image", file);

					console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);

					const response = await fetch(image_host_Api, {
						method: "POST",
						body: formData,
					});

					if (!response.ok) {
						throw new Error(`Failed to upload image: ${response.statusText}`);
					}

					const data = await response.json();
					console.log("Upload response:", data);
					return data.data.url;
				});

				const newImageUrls = await Promise.all(uploadPromises);

				// add new image URLs to existing images
				setImages([...images, ...newImageUrls]);
			} catch (error) {
				console.error("Error uploading images:", error);
				alert("Failed to upload one or more images. Please try again.");
			} finally {
				setIsUploading(false);
			}
		} else {
			console.log("No files selected for upload");
		}
	};

	const removeImage = (imageToRemove) => {
		setImages(images.filter((image) => image !== imageToRemove));
	};

	// form submission
	const onSubmit = async (data) => {
		try {
			const formattedSpecs = Object.entries(specs).map(
				([key, value]) => `${key}: ${value}`
			);

			const productData = {
				...data,
				colors,
				features,
				specs: formattedSpecs,
				images,
			};
			console.log(productData);
			const response = await fetch("/api/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(productData),
			});

			if (!response.ok) {
				throw new Error("failed to create product");
			}

			const result = await response.json();
			console.log("product created:", result);

			// Reset form and related states
			form.reset(); // Reset form values to default
			setColors([]); // Clear colors
			setFeatures([]); // Clear features
			setSpecs({}); // Clear specs
			setImages([]); // Clear images
			setNewColor(""); // Reset new color input
			setNewFeature(""); // Reset new feature input
			setNewSpecKey(""); // Reset new spec key input
			setNewSpecValue(""); // Reset new spec value input
			setActiveTab("basic"); // Reset to basic tab

			toast.success("Product created successfully");
		} catch (error) {
			console.error("Error creating product:", error);
			toast.error("Failed to create product: " + error.message);
		}
	};
	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
					<p className="text-muted-foreground">
						Create a new product for your store
					</p>
				</div>
				<div className="flex gap-4">
					<Button variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
					<Button type="submit" form="product-form">
						Save Product
					</Button>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid grid-cols-4 w-full md:w-1/2">
					<TabsTrigger value="basic">Basic Info</TabsTrigger>
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="images">Images</TabsTrigger>
					<TabsTrigger value="inventory">Inventory</TabsTrigger>
				</TabsList>

				<Form {...form}>
					<form
						id="product-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<TabsContent value="basic" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Basic Information</CardTitle>
									<CardDescription>
										Enter the basic details of your product
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Product Name</FormLabel>
												<FormControl>
													<Input
														placeholder="Premium Wireless Headphones"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													A clear, descriptive name for your product.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<FormField
											control={form.control}
											name="brand"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Brand</FormLabel>
													<FormControl>
														<Input
															placeholder="Apple, Samsung, Sony"
															{...field}
														/>
													</FormControl>
													<FormDescription>
														The manufacturer or brand of the product
													</FormDescription>
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
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select a category" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{categories.map((category) => (
																<SelectItem
																	key={category.id}
																	value={category.id}
																>
																	{category.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormDescription>
														Choose the category that best fits your product
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										{showSubcategories && (
											<FormField
												control={form.control}
												name="subcategory"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Subcategory</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger>
																	<SelectValue placeholder="Select a subcategory" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{categories
																	.find((cat) => cat.id === selectedCategory)
																	?.subcategories.map((subcat) => (
																		<SelectItem key={subcat} value={subcat}>
																			{subcat}
																		</SelectItem>
																	))}
															</SelectContent>
														</Select>
														<FormDescription>
															Narrow down the product classification
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<FormField
											control={form.control}
											name="price"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Price ($)</FormLabel>
													<FormControl>
														<Input
															type="number"
															step="0.01"
															placeholder="199.99"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="inStock"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel>In Stock</FormLabel>
														<FormDescription>
															Mark whether this product is currently in stock
														</FormDescription>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</FormControl>
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
														placeholder="Experience crystal-clear sound with our premium wireless headphones..."
														className="min-h-32"
														{...field}
													/>
												</FormControl>
												<FormDescription>
													Detailed description of the product. Be specific about
													features and benefits.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="details" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Product Details</CardTitle>
									<CardDescription>
										Add specifications and features
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Colors */}
									<div className="space-y-4">
										<div>
											<h3 className="text-lg font-medium">Colors</h3>
											<p className="text-sm text-muted-foreground">
												Add available color options for this product
											</p>
										</div>

										<div className="flex flex-wrap gap-2 mb-4">
											{colors.map((color, index) => (
												<Badge
													key={index}
													variant="secondary"
													className="flex items-center gap-1"
												>
													{color}
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="h-4 w-4 p-0 ml-1"
														onClick={() => removeColor(color)}
													>
														<X className="h-3 w-3" />
													</Button>
												</Badge>
											))}
										</div>

										<div className="flex gap-2">
											<Input
												placeholder="Add a color (e.g. Black, Navy orange)"
												value={newColor}
												onChange={(e) => setNewColor(e.target.value)}
												className="flex-1"
											/>
											<Button type="button" onClick={addColor} size="sm">
												<Plus className="h-4 w-4 mr-2" /> Add
											</Button>
										</div>
									</div>

									<Separator />

									{/* Features */}
									<div className="space-y-4">
										<div>
											<h3 className="text-lg font-medium">Features</h3>
											<p className="text-sm text-muted-foreground">
												Add key features of this product
											</p>
										</div>

										<ScrollArea className="h-48 rounded-md border p-4">
											{features.length === 0 ? (
												<p className="text-sm text-muted-foreground italic">
													No features added yet
												</p>
											) : (
												<ul className="space-y-2">
													{features.map((feature, index) => (
														<li
															key={index}
															className="flex justify-between items-center gap-2"
														>
															<span>• {feature}</span>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => removeFeature(feature)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</li>
													))}
												</ul>
											)}
										</ScrollArea>

										<div className="flex gap-2">
											<Input
												placeholder="Add a feature (e.g. orangetooth 5.2)"
												value={newFeature}
												onChange={(e) => setNewFeature(e.target.value)}
												className="flex-1"
											/>
											<Button type="button" onClick={addFeature} size="sm">
												<Plus className="h-4 w-4 mr-2" /> Add
											</Button>
										</div>
									</div>

									<Separator />

									{/* Specifications */}
									<div className="space-y-4">
										<div>
											<h3 className="text-lg font-medium">
												Technical Specifications
											</h3>
											<p className="text-sm text-muted-foreground">
												Add technical details of the product
											</p>
										</div>

										<div className="rounded-md border overflow-hidden">
											<table className="w-full text-sm">
												<thead className="bg-muted">
													<tr>
														<th className="text-left p-2 border-b">
															Specification
														</th>
														<th className="text-left p-2 border-b">Value</th>
														<th className="w-16 p-2 border-b"></th>
													</tr>
												</thead>
												<tbody>
													{Object.entries(specs).length === 0 ? (
														<tr>
															<td
																colSpan={3}
																className="p-4 text-center text-muted-foreground italic"
															>
																No specifications added yet
															</td>
														</tr>
													) : (
														Object.entries(specs).map(([key, value], index) => (
															<tr
																key={index}
																className="border-b last:border-b-0"
															>
																<td className="p-2 font-medium">{key}</td>
																<td className="p-2">{value}</td>
																<td className="p-2 text-center">
																	<Button
																		type="button"
																		variant="ghost"
																		size="sm"
																		onClick={() => removeSpec(key)}
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</td>
															</tr>
														))
													)}
												</tbody>
											</table>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
											<Input
												placeholder="Specification (e.g. Weight)"
												value={newSpecKey}
												onChange={(e) => setNewSpecKey(e.target.value)}
											/>
											<Input
												placeholder="Value (e.g. 250g)"
												value={newSpecValue}
												onChange={(e) => setNewSpecValue(e.target.value)}
											/>
										</div>
										<Button type="button" onClick={addSpec} size="sm">
											<Plus className="h-4 w-4 mr-2" /> Add Specification
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
						<TabsContent value="images" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Product Images</CardTitle>
									<CardDescription>
										Add high-quality images of your product
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										{images.map((imageUrl, index) => (
											<div
												key={index}
												className="relative rounded-md overflow-hidden border aspect-square"
											>
												<img
													src={imageUrl}
													alt={`Product image ${index + 1}`}
													className="object-cover w-full h-full"
												/>
												<Button
													type="button"
													variant="destructive"
													size="icon"
													className="absolute top-2 right-2 h-8 w-8"
													onClick={() => removeImage(imageUrl)}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										))}

										<div className="flex items-center justify-center border border-dashed rounded-md aspect-square">
											<div className="flex flex-col items-center justify-center p-6 text-center">
												{isUploading ? (
													<>
														<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-2"></div>
														<p className="text-sm font-medium">
															Uploading images...
														</p>
													</>
												) : (
													<>
														<Upload className="h-10 w-10 text-muted-foreground mb-2" />
														<p className="text-sm font-medium mb-1">
															Drag and drop your images here
														</p>
														<p className="text-xs text-muted-foreground mb-3">
															PNG, JPG, GIF up to 10MB
														</p>

														<label
															htmlFor="image-upload"
															className="cursor-pointer"
														>
															<Button
																type="button"
																variant="secondary"
																size="sm"
																onClick={(e) => {
																	// Prevent the button click from submitting the form
																	e.preventDefault();
																	// Find and click the file input
																	document
																		.getElementById("image-upload")
																		.click();
																}}
															>
																Select Files
															</Button>
															<input
																id="image-upload"
																type="file"
																multiple
																accept="image/*"
																className="hidden"
																onChange={handleImageUpload}
																disabled={isUploading}
															/>
														</label>
													</>
												)}
											</div>
										</div>
									</div>
								</CardContent>
								<CardFooter className="text-xs text-muted-foreground">
									First image will be used as the product thumbnail
								</CardFooter>
							</Card>
						</TabsContent>

						<TabsContent value="inventory" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Inventory and Shipping</CardTitle>
									<CardDescription>
										Manage stock and delivery options
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<FormField
											control={form.control}
											name="stock"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Stock Quantity</FormLabel>
													<FormControl>
														<Input type="number" placeholder="15" {...field} />
													</FormControl>
													<FormDescription>
														Number of items available for purchase
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="shipping"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Shipping Method</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select shipping method" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="Free shipping">
																Free shipping
															</SelectItem>
															<SelectItem value="Standard shipping">
																Standard shipping
															</SelectItem>
															<SelectItem value="Express shipping">
																Express shipping
															</SelectItem>
															<SelectItem value="Same-day delivery">
																Same-day delivery
															</SelectItem>
														</SelectContent>
													</Select>
													<FormDescription>
														Shipping method offered for this product
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="delivery"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Estimated Delivery</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select delivery time" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="1-2 business days">
															1-2 business days
														</SelectItem>
														<SelectItem value="2-3 business days">
															2-3 business days
														</SelectItem>
														<SelectItem value="3-5 business days">
															3-5 business days
														</SelectItem>
														<SelectItem value="5-7 business days">
															5-7 business days
														</SelectItem>
														<SelectItem value="7-10 business days">
															7-10 business days
														</SelectItem>
													</SelectContent>
												</Select>
												<FormDescription>
													Expected time for delivery after purchase
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<FormField
											control={form.control}
											name="rating"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Initial Rating (0-5)</FormLabel>
													<FormControl>
														<Input
															type="number"
															step="0.1"
															min="0"
															max="5"
															placeholder="4.7"
															{...field}
														/>
													</FormControl>
													<FormDescription>
														Optional: Set an initial rating for this product
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="reviewCount"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Initial Review Count</FormLabel>
													<FormControl>
														<Input type="number" placeholder="0" {...field} />
													</FormControl>
													<FormDescription>
														Optional: Set an initial review count
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</CardContent>
								<CardFooter className="flex justify-between">
									<Button
										variant="outline"
										onClick={() => setActiveTab("details")}
									>
										Previous: Details
									</Button>
									<Button type="submit">Save Product</Button>
								</CardFooter>
							</Card>
						</TabsContent>
					</form>
				</Form>
			</Tabs>
		</div>
	);
}
