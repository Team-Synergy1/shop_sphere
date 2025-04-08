"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MoreHorizontal,
  Search,
  ArrowUpDown,
  Edit,
  Trash,
  Eye,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Filter,
} from "lucide-react";
import useProduct from "@/hooks/useProduct";
import { toast } from "sonner";
import Link from "next/link";

const ProductsManager = () => {
  const [productData, loading, refetch] = useProduct();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (productData) {
      setProducts(productData);
    }
  }, [productData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const image_host_key = process.env.NEXT_PUBLIC_IMAGE;
  const image_host_Api = `https://api.imgbb.com/1/upload?key=${image_host_key}`;
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const API_BASE_URL = "/api/products";

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
  }, [image_host_key]);

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(image_host_Api, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        return data.data.url;
      } else {
        console.error("Image upload failed:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const filteredProducts = products
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (inStock) => {
    return inStock === true
      ? "bg-green-500 text-white"
      : "bg-red-500 text-white";
  };

  const getStatusText = (inStock) => {
    return inStock === true ? "In Stock" : "Out of Stock";
  };

  const toggleDropdown = (id) => {
    if (dropdownOpen === id) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(id);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct({ ...product });
    setDropdownOpen(null);
  };

  const handleViewClick = (product) => {
    setViewingProduct(product);
    setDropdownOpen(null);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
    setDropdownOpen(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Convert number inputs
    if (name === "price" || name === "stock") {
      updatedValue = parseFloat(value) || 0;
    }

    setEditingProduct({ ...editingProduct, [name]: updatedValue });
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    let stock = editingProduct.stock;
    let inStock = true;

    if (status === "Out of Stock") {
      stock = 0;
      inStock = false;
    } else if (status === "In Stock" && stock === 0) {
      stock = 1;
      inStock = true;
    }

    setEditingProduct({ ...editingProduct, status, stock, inStock });
  };

  const handleImageChange = (index, url) => {
    const updatedImages = [...editingProduct.images];
    updatedImages[index] = url;
    setEditingProduct({ ...editingProduct, images: updatedImages });
  };

  const addNewImage = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);

      try {
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
          const updatedImages = [...editingProduct.images, imageUrl];
          setEditingProduct({ ...editingProduct, images: updatedImages });
          setCurrentImageIndex(updatedImages.length - 1);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    };

    fileInput.click();
  };

  const removeImage = (index) => {
    const updatedImages = [...editingProduct.images];
    updatedImages.splice(index, 1);
    setEditingProduct({ ...editingProduct, images: updatedImages });
  };

  const updateProduct = async (productData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      if (productData._id && typeof productData._id === "string") {
        const response = await axios.put(
          `${API_BASE_URL}/${productData._id}`,
          productData
        );

        if (response.status === 200) {
          const updatedProducts = products.map((product) =>
            product._id === productData._id ? response.data : product
          );
          setProducts(updatedProducts);
          toast.success("Update product successfully");
          return response.data;
        }
      } else {
        const response = await axios.post(API_BASE_URL, productData);

        if (response.status === 201) {
          setProducts([...products, response.data]);
          return response.data;
        }
      }
    } catch (error) {
      toast.error("Failed to update product");
      console.error("Error updating product:", error);
      setApiError(error.response?.data?.message || "Failed to update product");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (productId) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await axios.delete(`${API_BASE_URL}/${productId}`);

      if (response.status === 200) {
        const updatedProducts = products.filter(
          (product) => product._id !== productId
        );
        setProducts(updatedProducts);
        toast.success("Delete product successfully");
        return response.data;
      }
    } catch (error) {
      toast.error("Failed to delete product");
      console.error("Error deleting product:", error);
      setApiError(error.response?.data?.message || "Failed to delete product");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveChanges = async () => {
    try {
      await updateProduct(editingProduct);
      setEditingProduct(null);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(productToDelete._id);
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  // Mobile product card component
  const MobileProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-12 w-12 rounded-md object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900 truncate max-w-xs">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
        </div>
        <button
          onClick={() => toggleDropdown(product._id)}
          className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 rounded-full"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="flex justify-between mt-3">
        <div className="text-gray-600">${product.price.toFixed(2)}</div>
        <div className="text-gray-600">Stock: {product.stock}</div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            product.inStock
          )}`}
        >
          {getStatusText(product.inStock)}
        </span>
      </div>

      {dropdownOpen === product._id && (
        <div className="absolute right-4 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-xs text-gray-500">Actions</div>
            <div className="border-t border-gray-100"></div>
            <button
              onClick={() => handleViewClick(product)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </button>
            <button
              onClick={() => handleEditClick(product)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </button>
            <button
              onClick={() => handleDeleteClick(product)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Product
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Tablet product card component (simplified version of the table but more compact)
  const TabletProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <div className="flex items-center p-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-16 w-16 rounded-md object-cover mr-4"
        />
        <div className="flex-grow">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                product.inStock
              )}`}
            >
              {getStatusText(product.inStock)}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewClick(product)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleEditClick(product)}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded-full"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(product)}
                className="p-1 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductsTable = () => (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center">
                <span className="whitespace-nowrap">Product Name</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </td>
                <td className="px-4 py-4 whitespace-normal font-medium text-gray-900 max-w-xs">
                  <div className="truncate">{product.name}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                  {product.category}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-gray-500">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-gray-500">
                  {product.stock}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      product.inStock
                    )}`}
                  >
                    {getStatusText(product.inStock)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <button
                    onClick={() => toggleDropdown(product._id)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 rounded-full"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {dropdownOpen === product._id && (
                    <div className="absolute right-2 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        <div className="px-4 py-2 text-xs text-gray-500">
                          Actions
                        </div>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={() => handleViewClick(product)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          role="menuitem"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          role="menuitem"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                          role="menuitem"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Product
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-500">
                No products found. Try adjusting your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
	const EditProductForm = () => {
		const [isUploading, setIsUploading] = useState(false);
		const [showImageLinkInput, setShowImageLinkInput] = useState(false);
		const [imageLink, setImageLink] = useState("");

		const nextImage = () => {
			setCurrentImageIndex((prevIndex) =>
				prevIndex === editingProduct.images.length - 1 ? 0 : prevIndex + 1
			);
		};

		const prevImage = () => {
			setCurrentImageIndex((prevIndex) =>
				prevIndex === 0 ? editingProduct.images.length - 1 : prevIndex - 1
			);
		};

		const handleFileUpload = async (e) => {
			const file = e.target.files[0];
			if (!file) return;

			setIsUploading(true);

			const imageUrl = await uploadImage(file);
			if (imageUrl) {
				handleImageChange(currentImageIndex, imageUrl);
			}

			setIsUploading(false);
		};

		const handleImageLinkSubmit = () => {
			if (imageLink.trim()) {
				handleImageChange(currentImageIndex, imageLink);
				setShowImageLinkInput(false);
				setImageLink("");
			}
		};

		const toggleImageLinkInput = () => {
			if (showImageLinkInput) {
				setShowImageLinkInput(false);
				setImageLink("");
			} else {
				setShowImageLinkInput(true);
				setImageLink(editingProduct.images[currentImageIndex] || "");
			}
		};

		return (
			<div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl md:text-2xl font-bold">Edit Product</h2>
					<button
						onClick={() => setEditingProduct(null)}
						className="p-2 rounded-full hover:bg-gray-100"
					>
						<X className="h-5 w-5 text-gray-500" />
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Product Images
						</label>

						<div className="relative h-48 md:h-64 mb-4">
							<img
								src={editingProduct.images[currentImageIndex]}
								alt={editingProduct.name}
								className="h-48 md:h-64 w-full md:w-64 object-cover rounded-lg mx-auto"
							/>

							{editingProduct.images.length > 1 && (
								<>
									<button
										onClick={prevImage}
										className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
									>
										<ChevronLeft className="h-5 w-5 text-gray-700" />
									</button>
									<button
										onClick={nextImage}
										className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
									>
										<ChevronRight className="h-5 w-5 text-gray-700" />
									</button>
								</>
							)}
						</div>

						{/* Image indicators */}
						{editingProduct.images.length > 0 && (
							<div className="flex justify-center mt-2 space-x-2">
								{editingProduct.images.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentImageIndex(index)}
										className={`h-2 w-2 rounded-full ${
											currentImageIndex === index
												? "bg-blue-600"
												: "bg-gray-300"
										}`}
										aria-label={`View image ${index + 1}`}
									/>
								))}
							</div>
						)}

						<div className="mt-4 space-y-2">
							{/* Image Link Input */}
							{showImageLinkInput && (
								<div className="flex items-center space-x-2 mb-2">
									<input
										type="text"
										value={imageLink}
										onChange={(e) => setImageLink(e.target.value)}
										placeholder="Enter image URL"
										className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<button
										onClick={handleImageLinkSubmit}
										className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
									>
										<Save className="h-4 w-4" />
									</button>
								</div>
							)}

							<div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
								<div className="w-full sm:flex-1 relative">
									<input
										type="file"
										accept="image/*"
										onChange={handleFileUpload}
										className="w-full"
										disabled={isUploading}
									/>
									{isUploading && (
										<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
											<p className="text-sm text-gray-600">Uploading...</p>
										</div>
									)}
								</div>
								<div className="flex space-x-2">
									<button
										onClick={toggleImageLinkInput}
										className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
										title={showImageLinkInput ? "Cancel" : "Edit Image Link"}
									>
										{showImageLinkInput ? (
											<X className="h-4 w-4" />
										) : (
											<Edit className="h-4 w-4" />
										)}
									</button>
									<button
										onClick={() => removeImage(currentImageIndex)}
										disabled={editingProduct.images.length <= 1}
										className={`p-2 rounded-md ${
											editingProduct.images.length <= 1
												? "bg-gray-200 text-gray-400 cursor-not-allowed"
												: "bg-red-100 text-red-600 hover:bg-red-200"
										}`}
									>
										<Trash className="h-4 w-4" />
									</button>
								</div>
							</div>

							<button
								onClick={addNewImage}
								className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center mt-2"
							>
								<Upload className="mr-2 h-4 w-4" />
								Add New Image
							</button>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Product Name
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={editingProduct.name}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Category
							</label>
							<input
								type="text"
								id="category"
								name="category"
								value={editingProduct.category}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="price"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Price ($)
								</label>
								<input
									type="number"
									id="price"
									name="price"
									min="0"
									step="0.01"
									value={editingProduct.price}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label
									htmlFor="stock"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Stock
								</label>
								<input
									type="number"
									id="stock"
									name="stock"
									min="0"
									value={editingProduct.stock}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Description
							</label>
							<textarea
								id="description"
								name="description"
								rows="3"
								value={editingProduct.description}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							></textarea>
						</div>

						<div>
							<label
								htmlFor="status"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Status
							</label>
							<select
								id="status"
								name="status"
								value={editingProduct.inStock ? "In Stock" : "Out of Stock"}
								onChange={handleStatusChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="In Stock">In Stock</option>
								<option value="Out of Stock">Out of Stock</option>
							</select>
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
					<button
						onClick={() => setEditingProduct(null)}
						className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						Cancel
					</button>
					<button
						onClick={saveChanges}
						className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							"Saving..."
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Save Changes
							</>
						)}
					</button>
				</div>
			</div>
		);
	};

	const ProductDetails = () => {
		const [currentImageIndex, setCurrentImageIndex] = useState(0);

		const nextImage = () => {
			setCurrentImageIndex((prevIndex) =>
				prevIndex === viewingProduct.images.length - 1 ? 0 : prevIndex + 1
			);
		};

		const prevImage = () => {
			setCurrentImageIndex((prevIndex) =>
				prevIndex === 0 ? viewingProduct.images.length - 1 : prevIndex - 1
			);
		};

		return (
			<div className="bg-white p-6 rounded-lg shadow-lg">
				<div className="flex justify-between items-center mb-6">
					<div className="flex items-center">
						<button
							onClick={() => setViewingProduct(null)}
							className="p-2 mr-2 rounded-full hover:bg-gray-100"
						>
							<ChevronLeft className="h-5 w-5 text-gray-500" />
						</button>
						<h2 className="text-2xl font-bold">Product Details</h2>
					</div>
					<button
						onClick={() => {
							setEditingProduct({ ...viewingProduct });
							setViewingProduct(null);
						}}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
					>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="relative">
						<div className="flex justify-center">
							<div className="relative h-64 w-full">
								<img
									src={viewingProduct.images[currentImageIndex]}
									alt={`${viewingProduct.name}`}
									className="h-64 w-64 object-cover rounded-lg mx-auto"
								/>
							</div>
						</div>

						{viewingProduct.images.length > 1 && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
								>
									<ChevronLeft className="h-5 w-5 text-gray-700" />
								</button>
								<button
									onClick={nextImage}
									className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
								>
									<ChevronRight className="h-5 w-5 text-gray-700" />
								</button>
							</>
						)}

						{viewingProduct.images.length > 1 && (
							<div className="flex justify-center mt-4 space-x-2">
								{viewingProduct.images.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentImageIndex(index)}
										className={`h-2 w-2 rounded-full ${
											currentImageIndex === index
												? "bg-blue-600"
												: "bg-gray-300"
										}`}
										aria-label={`View image ${index + 1}`}
									/>
								))}
							</div>
						)}
					</div>

					<div>
						<h3 className="text-xl font-semibold mb-2">
							{viewingProduct.name}
						</h3>
						<div className="mb-4">
							<span
								className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
									viewingProduct.inStock
								)}`}
							>
								{getStatusText(viewingProduct.inStock)}
							</span>
						</div>

						<div className="space-y-3">
							<p className="text-2xl font-bold text-blue-600">
								${viewingProduct.price.toFixed(2)}
							</p>
							<p className="text-gray-600">{viewingProduct.description}</p>

							<div className="flex justify-between border-t border-b border-gray-200 py-3 my-4">
								<span className="text-gray-500">Category</span>
								<span className="font-medium">{viewingProduct.category}</span>
							</div>

							<div className="flex justify-between">
								<span className="text-gray-500">Stock</span>
								<span className="font-medium">
									{viewingProduct.stock} units
								</span>
							</div>

							<div className="flex justify-between">
								<span className="text-gray-500">Product ID</span>
								<span className="font-medium text-gray-600">
									{viewingProduct._id}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};
	const DeleteConfirmationModal = () => (
		<div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md">
				<h3 className="text-lg font-bold text-gray-900 mb-4">
					Confirm Deletion
				</h3>
				<p className="text-gray-600 mb-6">
					Are you sure you want to delete{" "}
					<span className="font-semibold">{productToDelete.name}</span>? This
					action cannot be undone.
				</p>
				<div className="flex justify-end space-x-4">
					<button
						onClick={() => setShowDeleteModal(false)}
						className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
					>
						Cancel
					</button>
					<button
						onClick={confirmDelete}
						className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="w-full p-4">
		  {loading ? (
			<div className="flex justify-center items-center h-64">
			  <p>Loading products...</p>
			</div>
		  ) : (
			<>
			  {!editingProduct && !viewingProduct && (
				<>
				  <div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold hidden sm:block">Products</h2>
					<div className="flex items-center gap-4">
					  <div className="relative -ml-4 md:-ml-0">
						<div className="absolute left-2 top-2.5">
						  <Search className="h-4 w-4 text-gray-500" />
						</div>
						<input
						  type="text"
						  placeholder="Search products..."
						  className="pl-8 w-64 h-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						  value={searchTerm}
						  onChange={(e) => setSearchTerm(e.target.value)}
						/>
					  </div>
					  <Link href="/dashboard/vendor/product/add">
						<button className="px-2 md:px-4 py-2 text-sm w-24 md:w-36  md:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ">
						  Add Product
						</button>
					  </Link>
					</div>
				  </div>
				  
				  {/* Hide table on small screens */}
				  <div className="hidden md:block">
					<ProductsTable />
				  </div>
				  
				  {/* Show mobile cards on small screens */}
				  <div className="md:hidden">
					{filteredProducts && filteredProducts.length > 0 ? (
					  filteredProducts.map((product) => (
						<TabletProductCard key={product._id} product={product} />
					  ))
					) : (
					  <div className="text-center py-6 text-gray-500">
						No products found. Try adjusting your search.
					  </div>
					)}
				  </div>
				</>
			  )}
	  
			  {editingProduct && <EditProductForm />}
			  {viewingProduct && <ProductDetails />}
			  {showDeleteModal && <DeleteConfirmationModal />}
			</>
		  )}
		</div>
	  );
};

export default ProductsManager;
