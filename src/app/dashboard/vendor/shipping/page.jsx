"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function ShippingPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [shippingMethods, setShippingMethods] = useState([]);
	const [editingMethod, setEditingMethod] = useState(null);
	const [newMethod, setNewMethod] = useState({
		name: "",
		description: "",
		price: "",
		estimatedDays: "",
		isActive: true,
		regions: [],
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (session?.user?.role !== "vendor") {
			router.push("/unauthorized");
			return;
		}

		fetchShippingMethods();
	}, [status, session, router]);

	const fetchShippingMethods = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/vendor/shipping");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch shipping methods");
			}

			setShippingMethods(data.shippingMethods);
		} catch (error) {
			console.error("Error fetching shipping methods:", error);
			toast.error(error.message || "Failed to load shipping methods");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch("/api/vendor/shipping", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newMethod),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create shipping method");
			}

			setShippingMethods([...shippingMethods, data.shippingMethod]);
			setNewMethod({
				name: "",
				description: "",
				price: "",
				estimatedDays: "",
				isActive: true,
				regions: [],
			});
			toast.success("Shipping method created successfully");
		} catch (error) {
			console.error("Error creating shipping method:", error);
			toast.error(error.message || "Failed to create shipping method");
		}
	};

	const handleUpdate = async (id) => {
		try {
			const response = await fetch(`/api/vendor/shipping/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(editingMethod),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update shipping method");
			}

			setShippingMethods(
				shippingMethods.map((method) =>
					method._id === id ? data.shippingMethod : method
				)
			);
			setEditingMethod(null);
			toast.success("Shipping method updated successfully");
		} catch (error) {
			console.error("Error updating shipping method:", error);
			toast.error(error.message || "Failed to update shipping method");
		}
	};

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`/api/vendor/shipping/${id}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to delete shipping method");
			}

			setShippingMethods(shippingMethods.filter((method) => method._id !== id));
			toast.success("Shipping method deleted successfully");
		} catch (error) {
			console.error("Error deleting shipping method:", error);
			toast.error(error.message || "Failed to delete shipping method");
		}
	};

	if (loading) return <Loader />;

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Shipping Management</h1>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Add New Shipping Method</CardTitle>
						<CardDescription>
							Create a new shipping option for your products
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<Label htmlFor="name">Method Name</Label>
								<Input
									id="name"
									value={newMethod.name}
									onChange={(e) =>
										setNewMethod({ ...newMethod, name: e.target.value })
									}
									placeholder="e.g., Standard Shipping"
									required
								/>
							</div>
							<div>
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									value={newMethod.description}
									onChange={(e) =>
										setNewMethod({ ...newMethod, description: e.target.value })
									}
									placeholder="e.g., 3-5 business days delivery"
								/>
							</div>
							<div>
								<Label htmlFor="price">Price (৳)</Label>
								<Input
									id="price"
									type="number"
									value={newMethod.price}
									onChange={(e) =>
										setNewMethod({ ...newMethod, price: e.target.value })
									}
									placeholder="0.00"
									required
								/>
							</div>
							<div>
								<Label htmlFor="estimatedDays">Estimated Delivery Days</Label>
								<Input
									id="estimatedDays"
									type="number"
									value={newMethod.estimatedDays}
									onChange={(e) =>
										setNewMethod({
											...newMethod,
											estimatedDays: e.target.value,
										})
									}
									placeholder="3-5"
									required
								/>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id="active"
									checked={newMethod.isActive}
									onCheckedChange={(checked) =>
										setNewMethod({ ...newMethod, isActive: checked })
									}
								/>
								<Label htmlFor="active">Active</Label>
							</div>
							<Button type="submit" className="w-full">
								Add Shipping Method
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Shipping Methods</CardTitle>
						<CardDescription>
							Manage your existing shipping options
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Method</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{shippingMethods.map((method) => (
										<TableRow key={method._id}>
											<TableCell>
												<div>
													<p className="font-medium">{method.name}</p>
													<p className="text-sm text-muted-foreground">
														{method.description}
													</p>
												</div>
											</TableCell>
											<TableCell>৳{method.price.toFixed(2)}</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														method.isActive
															? "bg-green-100 text-green-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{method.isActive ? "Active" : "Inactive"}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => setEditingMethod(method)}
													>
														Edit
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => handleDelete(method._id)}
													>
														Delete
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
									{shippingMethods.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={4}
												className="text-center py-6 text-muted-foreground"
											>
												No shipping methods found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
