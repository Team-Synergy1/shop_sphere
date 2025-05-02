"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Loader2,
	Plus,
	Percent,
	Trash2,
	Edit,
	Tag,
	Calendar,
} from "lucide-react";

export default function CouponManagement() {
	const router = useRouter();
	const [coupons, setCoupons] = useState([]);
	const [loading, setLoading] = useState(true);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [processingAction, setProcessingAction] = useState(false);
	const [selectedCoupon, setSelectedCoupon] = useState(null);

	const [formData, setFormData] = useState({
		code: "",
		discountType: "percentage",
		discountValue: "",
		minPurchase: 0,
		maxDiscount: "",
		startDate: "",
		endDate: "",
		usageLimit: "",
		description: "",
	});

	const fetchCoupons = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/admin/coupons");
			setCoupons(response.data);
		} catch (error) {
			console.error("Error fetching coupons:", error);
			toast.error("Failed to load coupons");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCoupons();
	}, []);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSelectChange = (name, value) => {
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const resetForm = () => {
		setFormData({
			code: "",
			discountType: "percentage",
			discountValue: "",
			minPurchase: 0,
			maxDiscount: "",
			startDate: "",
			endDate: "",
			usageLimit: "",
			description: "",
		});
	};

	const handleEditCoupon = (coupon) => {
		// Convert dates to YYYY-MM-DD format for input fields
		const startDate = new Date(coupon.startDate).toISOString().split("T")[0];
		const endDate = new Date(coupon.endDate).toISOString().split("T")[0];

		setSelectedCoupon(coupon);
		setFormData({
			code: coupon.code,
			discountType: coupon.discountType,
			discountValue: coupon.discountValue,
			minPurchase: coupon.minPurchase || 0,
			maxDiscount: coupon.maxDiscount || "",
			startDate: startDate,
			endDate: endDate,
			usageLimit: coupon.usageLimit || "",
			description: coupon.description || "",
		});
		setEditDialogOpen(true);
	};

	const handleDeleteCoupon = (coupon) => {
		setSelectedCoupon(coupon);
		setDeleteDialogOpen(true);
	};

	const createCoupon = async () => {
		try {
			setProcessingAction(true);

			// Validation
			if (!formData.code || !formData.discountValue || !formData.endDate) {
				toast.error("Please fill in all required fields");
				return;
			}

			const response = await axios.post("/api/admin/coupons", formData);
			toast.success("Coupon created successfully");
			fetchCoupons();
			setCreateDialogOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error creating coupon:", error);
			toast.error(error.response?.data?.message || "Failed to create coupon");
		} finally {
			setProcessingAction(false);
		}
	};

	const updateCoupon = async () => {
		try {
			setProcessingAction(true);

			// Validation
			if (!formData.code || !formData.discountValue || !formData.endDate) {
				toast.error("Please fill in all required fields");
				return;
			}

			const response = await axios.put(
				`/api/admin/coupons/${selectedCoupon.id}`,
				formData
			);
			toast.success("Coupon updated successfully");
			fetchCoupons();
			setEditDialogOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error updating coupon:", error);
			toast.error(error.response?.data?.message || "Failed to update coupon");
		} finally {
			setProcessingAction(false);
		}
	};

	const deleteCoupon = async () => {
		try {
			setProcessingAction(true);
			const response = await axios.delete(
				`/api/admin/coupons/${selectedCoupon.id}`
			);
			toast.success("Coupon deleted successfully");
			fetchCoupons();
			setDeleteDialogOpen(false);
		} catch (error) {
			console.error("Error deleting coupon:", error);
			toast.error("Failed to delete coupon");
		} finally {
			setProcessingAction(false);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const isExpired = (endDate) => {
		return new Date(endDate) < new Date();
	};

	const isActive = (startDate, endDate) => {
		const now = new Date();
		return new Date(startDate) <= now && new Date(endDate) >= now;
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-orange-500" />
				<span className="ml-2">Loading coupons...</span>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Coupon Management</h1>
				<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-orange-500 hover:bg-orange-600">
							<Plus className="h-4 w-4 mr-2" /> Create Coupon
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Create New Coupon</DialogTitle>
							<DialogDescription>
								Add a new discount coupon to your store.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="code" className="text-right">
									Code*
								</Label>
								<Input
									id="code"
									name="code"
									value={formData.code}
									onChange={handleInputChange}
									placeholder="SUMMER25"
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="discountType" className="text-right">
									Type*
								</Label>
								<Select
									value={formData.discountType}
									onValueChange={(value) =>
										handleSelectChange("discountType", value)
									}
								>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="Select discount type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="percentage">Percentage (%)</SelectItem>
										<SelectItem value="fixed">Fixed Amount</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="discountValue" className="text-right">
									Value*
								</Label>
								<Input
									id="discountValue"
									name="discountValue"
									type="number"
									value={formData.discountValue}
									onChange={handleInputChange}
									placeholder={
										formData.discountType === "percentage" ? "25" : "20.00"
									}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="minPurchase" className="text-right">
									Min Purchase
								</Label>
								<Input
									id="minPurchase"
									name="minPurchase"
									type="number"
									value={formData.minPurchase}
									onChange={handleInputChange}
									placeholder="0.00"
									className="col-span-3"
								/>
							</div>
							{formData.discountType === "percentage" && (
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="maxDiscount" className="text-right">
										Max Discount
									</Label>
									<Input
										id="maxDiscount"
										name="maxDiscount"
										type="number"
										value={formData.maxDiscount}
										onChange={handleInputChange}
										placeholder="100.00"
										className="col-span-3"
									/>
								</div>
							)}
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="startDate" className="text-right">
									Start Date
								</Label>
								<Input
									id="startDate"
									name="startDate"
									type="date"
									value={formData.startDate}
									onChange={handleInputChange}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="endDate" className="text-right">
									End Date*
								</Label>
								<Input
									id="endDate"
									name="endDate"
									type="date"
									value={formData.endDate}
									onChange={handleInputChange}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="usageLimit" className="text-right">
									Usage Limit
								</Label>
								<Input
									id="usageLimit"
									name="usageLimit"
									type="number"
									value={formData.usageLimit}
									onChange={handleInputChange}
									placeholder="100"
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="description" className="text-right">
									Description
								</Label>
								<Input
									id="description"
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									placeholder="Summer sale discount"
									className="col-span-3"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="secondary"
								onClick={() => setCreateDialogOpen(false)}
								disabled={processingAction}
							>
								Cancel
							</Button>
							<Button
								type="button"
								className="bg-orange-500 hover:bg-orange-600"
								onClick={createCoupon}
								disabled={processingAction}
							>
								{processingAction ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									"Create Coupon"
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{coupons.length === 0 ? (
				<Alert className="mb-6">
					<AlertDescription>
						No coupons found. Create your first coupon to start offering
						discounts to your customers.
					</AlertDescription>
				</Alert>
			) : (
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Code</TableHead>
								<TableHead>Discount</TableHead>
								<TableHead>Requirements</TableHead>
								<TableHead>Validity</TableHead>
								<TableHead>Usage</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{coupons.map((coupon) => (
								<TableRow key={coupon.id}>
									<TableCell className="font-medium">{coupon.code}</TableCell>
									<TableCell>
										<div className="flex items-center">
											{coupon.discountType === "percentage" ? (
												<Percent className="h-4 w-4 mr-1 text-green-600" />
											) : (
												<Tag className="h-4 w-4 mr-1 text-blue-600" />
											)}
											<span>
												{coupon.discountType === "percentage"
													? `${coupon.discountValue}%`
													: `৳${coupon.discountValue}`}
											</span>
										</div>
										{coupon.description && (
											<span className="text-xs text-gray-500 block mt-1">
												{coupon.description}
											</span>
										)}
									</TableCell>
									<TableCell>
										{coupon.minPurchase > 0 && (
											<span className="text-xs block">
												Min: ৳{coupon.minPurchase}
											</span>
										)}
										{coupon.maxDiscount && (
											<span className="text-xs block">
												Max: ৳{coupon.maxDiscount}
											</span>
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center">
											<Calendar className="h-4 w-4 mr-1 text-gray-500" />
											<span className="text-xs">
												{formatDate(coupon.startDate)} -{" "}
												{formatDate(coupon.endDate)}
											</span>
										</div>
									</TableCell>
									<TableCell>
										{coupon.usageLimit ? (
											<span>
												{coupon.currentUsage} / {coupon.usageLimit}
											</span>
										) : (
											<span>{coupon.currentUsage} / ∞</span>
										)}
									</TableCell>
									<TableCell>
										{isExpired(coupon.endDate) ? (
											<Badge
												variant="outline"
												className="bg-gray-100 text-gray-800"
											>
												Expired
											</Badge>
										) : isActive(coupon.startDate, coupon.endDate) ? (
											<Badge
												variant="outline"
												className="bg-green-100 text-green-800"
											>
												Active
											</Badge>
										) : (
											<Badge
												variant="outline"
												className="bg-yellow-100 text-yellow-800"
											>
												Scheduled
											</Badge>
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEditCoupon(coupon)}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDeleteCoupon(coupon)}
												className="text-red-500 hover:text-red-700 hover:bg-red-50"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Edit Coupon Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Coupon</DialogTitle>
						<DialogDescription>
							Update the details for coupon code{" "}
							<span className="font-medium">{selectedCoupon?.code}</span>.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-code" className="text-right">
								Code*
							</Label>
							<Input
								id="edit-code"
								name="code"
								value={formData.code}
								onChange={handleInputChange}
								placeholder="SUMMER25"
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-discountType" className="text-right">
								Type*
							</Label>
							<Select
								value={formData.discountType}
								onValueChange={(value) =>
									handleSelectChange("discountType", value)
								}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Select discount type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="percentage">Percentage (%)</SelectItem>
									<SelectItem value="fixed">Fixed Amount</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-discountValue" className="text-right">
								Value*
							</Label>
							<Input
								id="edit-discountValue"
								name="discountValue"
								type="number"
								value={formData.discountValue}
								onChange={handleInputChange}
								placeholder={
									formData.discountType === "percentage" ? "25" : "20.00"
								}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-minPurchase" className="text-right">
								Min Purchase
							</Label>
							<Input
								id="edit-minPurchase"
								name="minPurchase"
								type="number"
								value={formData.minPurchase}
								onChange={handleInputChange}
								placeholder="0.00"
								className="col-span-3"
							/>
						</div>
						{formData.discountType === "percentage" && (
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="edit-maxDiscount" className="text-right">
									Max Discount
								</Label>
								<Input
									id="edit-maxDiscount"
									name="maxDiscount"
									type="number"
									value={formData.maxDiscount}
									onChange={handleInputChange}
									placeholder="100.00"
									className="col-span-3"
								/>
							</div>
						)}
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-startDate" className="text-right">
								Start Date
							</Label>
							<Input
								id="edit-startDate"
								name="startDate"
								type="date"
								value={formData.startDate}
								onChange={handleInputChange}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-endDate" className="text-right">
								End Date*
							</Label>
							<Input
								id="edit-endDate"
								name="endDate"
								type="date"
								value={formData.endDate}
								onChange={handleInputChange}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-usageLimit" className="text-right">
								Usage Limit
							</Label>
							<Input
								id="edit-usageLimit"
								name="usageLimit"
								type="number"
								value={formData.usageLimit}
								onChange={handleInputChange}
								placeholder="100"
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-description" className="text-right">
								Description
							</Label>
							<Input
								id="edit-description"
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								placeholder="Summer sale discount"
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="secondary"
							onClick={() => setEditDialogOpen(false)}
							disabled={processingAction}
						>
							Cancel
						</Button>
						<Button
							type="button"
							className="bg-orange-500 hover:bg-orange-600"
							onClick={updateCoupon}
							disabled={processingAction}
						>
							{processingAction ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Updating...
								</>
							) : (
								"Update Coupon"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Coupon</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the coupon code{" "}
							<span className="font-medium">{selectedCoupon?.code}</span>? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="secondary"
							onClick={() => setDeleteDialogOpen(false)}
							disabled={processingAction}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={deleteCoupon}
							disabled={processingAction}
						>
							{processingAction ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete Coupon"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
