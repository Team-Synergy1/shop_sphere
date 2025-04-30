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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function PaymentsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [paymentInfo, setPaymentInfo] = useState({
		bankAccountName: "",
		bankAccountNumber: "",
		bankName: "",
		branchName: "",
		routingNumber: "",
		paypalEmail: "",
	});
	const [transactions, setTransactions] = useState([]);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (session?.user?.role !== "vendor") {
			router.push("/unauthorized");
			return;
		}

		fetchPaymentInfo();
		fetchTransactions();
	}, [status, session, router]);

	const fetchPaymentInfo = async () => {
		try {
			const response = await fetch("/api/vendor/payments/info");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch payment information");
			}

			setPaymentInfo(data.paymentInfo);
		} catch (error) {
			console.error("Error fetching payment info:", error);
			toast.error(error.message || "Failed to load payment information");
		}
	};

	const fetchTransactions = async () => {
		try {
			const response = await fetch("/api/vendor/payments/transactions");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch transactions");
			}

			setTransactions(data.transactions);
		} catch (error) {
			console.error("Error fetching transactions:", error);
			toast.error(error.message || "Failed to load transactions");
		} finally {
			setLoading(false);
		}
	};

	const handlePaymentInfoUpdate = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch("/api/vendor/payments/info", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(paymentInfo),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update payment information");
			}

			toast.success("Payment information updated successfully");
		} catch (error) {
			console.error("Error updating payment info:", error);
			toast.error(error.message || "Failed to update payment information");
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) return <Loader />;

	return (
		<div className="container mx-auto p-6">
			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Payment Information</CardTitle>
						<CardDescription>
							Update your payment receiving methods
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handlePaymentInfoUpdate} className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="bankAccountName">Account Holder Name</Label>
									<Input
										id="bankAccountName"
										value={paymentInfo.bankAccountName}
										onChange={(e) =>
											setPaymentInfo({
												...paymentInfo,
												bankAccountName: e.target.value,
											})
										}
										placeholder="John Doe"
									/>
								</div>
								<div>
									<Label htmlFor="bankAccountNumber">Account Number</Label>
									<Input
										id="bankAccountNumber"
										value={paymentInfo.bankAccountNumber}
										onChange={(e) =>
											setPaymentInfo({
												...paymentInfo,
												bankAccountNumber: e.target.value,
											})
										}
										placeholder="XXXX-XXXX-XXXX-XXXX"
									/>
								</div>
								<div>
									<Label htmlFor="bankName">Bank Name</Label>
									<Input
										id="bankName"
										value={paymentInfo.bankName}
										onChange={(e) =>
											setPaymentInfo({
												...paymentInfo,
												bankName: e.target.value,
											})
										}
										placeholder="Bank Name"
									/>
								</div>
								<div>
									<Label htmlFor="branchName">Branch Name</Label>
									<Input
										id="branchName"
										value={paymentInfo.branchName}
										onChange={(e) =>
											setPaymentInfo({
												...paymentInfo,
												branchName: e.target.value,
											})
										}
										placeholder="Branch Name"
									/>
								</div>
								<div>
									<Label htmlFor="routingNumber">Routing Number</Label>
									<Input
										id="routingNumber"
										value={paymentInfo.routingNumber}
										onChange={(e) =>
											setPaymentInfo({
												...paymentInfo,
												routingNumber: e.target.value,
											})
										}
										placeholder="Routing Number"
									/>
								</div>
								<div>
									<Label htmlFor="paypalEmail">PayPal Email (Optional)</Label>
									<Input
										id="paypalEmail"
										type="email"
										value={paymentInfo.paypalEmail}
										onChange={(e) =>
											setPaymentInfo({
												...paymentInfo,
												paypalEmail: e.target.value,
											})
										}
										placeholder="email@example.com"
									/>
								</div>
							</div>
							<Button type="submit" className="w-full">
								Update Payment Information
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Transaction History</CardTitle>
						<CardDescription>Your recent payouts and earnings</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{transactions.map((transaction) => (
										<TableRow key={transaction._id}>
											<TableCell>{formatDate(transaction.date)}</TableCell>
											<TableCell>{transaction.description}</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														transaction.type === "payout"
															? "bg-blue-100 text-blue-800"
															: "bg-green-100 text-green-800"
													}`}
												>
													{transaction.type.charAt(0).toUpperCase() +
														transaction.type.slice(1)}
												</span>
											</TableCell>
											<TableCell>৳{transaction.amount.toFixed(2)}</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														transaction.status === "completed"
															? "bg-green-100 text-green-800"
															: transaction.status === "pending"
															? "bg-yellow-100 text-yellow-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{transaction.status.charAt(0).toUpperCase() +
														transaction.status.slice(1)}
												</span>
											</TableCell>
										</TableRow>
									))}
									{transactions.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={5}
												className="text-center py-6 text-muted-foreground"
											>
												No transactions found
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
