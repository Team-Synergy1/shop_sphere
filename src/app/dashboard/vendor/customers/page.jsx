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
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function VendorCustomersPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [customers, setCustomers] = useState([]);
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState("recent");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (session?.user?.role !== "vendor") {
			router.push("/unauthorized");
			return;
		}

		fetchCustomers();
	}, [status, session, router]);

	const fetchCustomers = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/vendor/customers");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch customers");
			}

			setCustomers(data.customers);
		} catch (error) {
			console.error("Error fetching customers:", error);
			toast.error(error.message || "Failed to load customers");
		} finally {
			setLoading(false);
		}
	};

	const filteredCustomers = customers.filter((customer) => {
		const matchesFilter =
			filter === "all" ||
			(filter === "repeat" && customer.orderCount > 1) ||
			(filter === "new" && customer.orderCount === 1);

		const matchesSearch =
			customer.name.toLowerCase().includes(search.toLowerCase()) ||
			customer.email.toLowerCase().includes(search.toLowerCase());

		return matchesFilter && matchesSearch;
	});

	const sortedCustomers = [...filteredCustomers].sort((a, b) => {
		switch (sortBy) {
			case "recent":
				return new Date(b.lastOrder) - new Date(a.lastOrder);
			case "orders":
				return b.orderCount - a.orderCount;
			case "spent":
				return b.totalSpent - a.totalSpent;
			default:
				return 0;
		}
	});

	if (loading) return <Loader />;

	return (
		<div className="container mx-auto p-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<h1 className="text-2xl font-bold mb-4 md:mb-0">Customer Management</h1>
				<div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
					<Input
						placeholder="Search customers..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="max-w-[300px]"
					/>
					<Select value={filter} onValueChange={setFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter customers" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Customers</SelectItem>
							<SelectItem value="repeat">Repeat Customers</SelectItem>
							<SelectItem value="new">New Customers</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="recent">Most Recent</SelectItem>
							<SelectItem value="orders">Most Orders</SelectItem>
							<SelectItem value="spent">Most Spent</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Card>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Customer</TableHead>
								<TableHead>Orders</TableHead>
								<TableHead>Total Spent</TableHead>
								<TableHead>Last Order</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedCustomers.map((customer) => (
								<TableRow key={customer._id}>
									<TableCell>
										<div>
											<p className="font-medium">{customer.name}</p>
											<p className="text-sm text-muted-foreground">
												{customer.email}
											</p>
										</div>
									</TableCell>
									<TableCell>{customer.orderCount}</TableCell>
									<TableCell>৳{customer.totalSpent.toFixed(2)}</TableCell>
									<TableCell>
										{new Date(customer.lastOrder).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												customer.orderCount > 1
													? "bg-green-100 text-green-800"
													: "bg-blue-100 text-blue-800"
											}`}
										>
											{customer.orderCount > 1
												? "Repeat Customer"
												: "New Customer"}
										</span>
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												router.push(
													`/dashboard/vendor/customers/${customer._id}`
												)
											}
										>
											View Details
										</Button>
									</TableCell>
								</TableRow>
							))}
							{sortedCustomers.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-6 text-muted-foreground"
									>
										No customers found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
