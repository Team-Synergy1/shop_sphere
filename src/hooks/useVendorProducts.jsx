"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function useVendorProducts() {
	const { data: session } = useSession();

	const {
		data: products,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["vendorProducts"],
		queryFn: async () => {
			// Make sure we're only fetching vendor's own products
			const res = await axios.get("/api/vendor/products");
			return res.data;
		},
		// Only enable this query if user is a vendor
		enabled: !!session?.user && session.user.role === "vendor",
	});

	return [products, isLoading, isError, error, refetch];
}
