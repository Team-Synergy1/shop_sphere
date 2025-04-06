import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
	try {
		await connectDB();

		const id = params.id;

		const body = await req.json();
		const product = await Product.findByIdAndUpdate(id, body, { new: true });

		if (!product) {
			return NextResponse.json(
				{ message: "Product not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(product, { status: 200 });
	} catch (error) {
		console.error("Error updating product:", error.message);
		return NextResponse.json(
			{ message: "Error updating product", error: error.message },
			{ status: 500 }
		);
	}
}

export async function DELETE(req, { params }) {
	try {
		await connectDB();
		const id = params.id;

		const deletedProduct = await Product.findByIdAndDelete(id);

		if (!deletedProduct) {
			return NextResponse.json(
				{ message: "Product not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: "Product deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting product:", error.message);
		return NextResponse.json(
			{ message: "Error deleting product", error: error.message },
			{ status: 500 }
		);
	}
}
