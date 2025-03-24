"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useProduct() {
  const { data: products, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get("/api/products");

      return res.data;
    },
  });

  return [ products, isLoading, isError, error, refetch ];
}
