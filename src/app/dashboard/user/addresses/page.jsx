"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loader from "@/app/loading";

const addressSchema = z.object({
	street: z.string().min(1, "Street is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	postalCode: z.string().min(1, "Postal code is required"),
	country: z.string().min(1, "Country is required"),
	isDefault: z.boolean().default(false),
});

export default function AddressesPage() {
	const [addresses, setAddresses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingAddress, setEditingAddress] = useState(null);

	const form = useForm({
		resolver: zodResolver(addressSchema),
		defaultValues: {
			street: "",
			city: "",
			state: "",
			postalCode: "",
			country: "",
			isDefault: false,
		},
	});

	useEffect(() => {
		fetchAddresses();
	}, []);

	const fetchAddresses = async () => {
		try {
			const response = await fetch("/api/user/addresses");
			const data = await response.json();

			if (!response.ok) throw new Error(data.error);
			setAddresses(data.addresses);
		} catch (error) {
			toast.error(error.message || "Failed to load addresses");
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (data) => {
		setSaving(true);
		try {
			const url = editingAddress
				? `/api/user/address/${editingAddress._id}`
				: "/api/user/address";

			const response = await fetch(url, {
				method: editingAddress ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const result = await response.json();
			if (!response.ok) throw new Error(result.error);

			toast.success(
				editingAddress
					? "Address updated successfully"
					: "Address added successfully"
			);
			setDialogOpen(false);
			form.reset();
			setEditingAddress(null);
			fetchAddresses();
		} catch (error) {
			toast.error(
				error.message ||
					`Failed to ${editingAddress ? "update" : "add"} address`
			);
		} finally {
			setSaving(false);
		}
	};

	const deleteAddress = async (addressId) => {
		try {
			const response = await fetch(`/api/user/address/${addressId}`, {
				method: "DELETE",
			});

			const result = await response.json();
			if (!response.ok) throw new Error(result.error);

			toast.success("Address removed successfully");
			fetchAddresses();
		} catch (error) {
			toast.error(error.message || "Failed to remove address");
		}
	};

	const editAddress = (address) => {
		form.reset({
			street: address.street,
			city: address.city,
			state: address.state,
			postalCode: address.postalCode,
			country: address.country,
			isDefault: address.isDefault,
		});
		setEditingAddress(address);
		setDialogOpen(true);
	};

	const handleEdit = (address) => {
		editAddress(address);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader />
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Shipping Addresses</h1>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add New Address
						</Button>
					</DialogTrigger>
					<DialogContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)}>
								<DialogHeader>
									<DialogTitle>
										{editingAddress ? "Edit Address" : "Add New Address"}
									</DialogTitle>
									<DialogDescription>
										{editingAddress
											? "Update your shipping address details"
											: "Add a new shipping address to your account"}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<FormField
										control={form.control}
										name="street"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Street Address</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="city"
											render={({ field }) => (
												<FormItem>
													<FormLabel>City</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="state"
											render={({ field }) => (
												<FormItem>
													<FormLabel>State</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="postalCode"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Postal Code</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="country"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Country</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<FormField
										control={form.control}
										name="isDefault"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Set as default shipping address</FormLabel>
												</div>
											</FormItem>
										)}
									/>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setDialogOpen(false);
											form.reset();
											setEditingAddress(null);
										}}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={saving}>
										{saving && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										{editingAddress ? "Update" : "Add"} Address
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			{addresses.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center p-6">
						<MapPin className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-lg font-medium">No addresses found</p>
						<p className="text-sm text-muted-foreground">
							Add a shipping address to get started
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2">
					{addresses.map((address) => (
						<Card key={address._id}>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>
										{address.isDefault && (
											<span className="text-sm font-normal text-primary">
												Default Address
											</span>
										)}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-1">
									<p>{address.street}</p>
									<p>{`${address.city}, ${address.state} ${address.postalCode}`}</p>
									<p>{address.country}</p>
								</div>
							</CardContent>
							<CardFooter className="flex justify-end space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleEdit(address)}
								>
									<Pencil className="h-4 w-4 mr-2" />
									Edit
								</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="destructive" size="sm">
											<Trash2 className="h-4 w-4 mr-2" />
											Remove
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Are you sure?</AlertDialogTitle>
											<AlertDialogDescription>
												This will permanently delete this address from your
												account.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => deleteAddress(address._id)}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												Delete
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
