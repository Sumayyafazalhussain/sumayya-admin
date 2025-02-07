"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    discountPercentage: "",
    image: "", // Stores the image URL after uploading
    category: "",
    description: "",
    stockLevel: "",
    isFeaturedProduct: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("file", imageFile);

        const uploadResponse = await fetch("/api/products/uploadImage", {
          method: "POST",
          body: formDataToSend,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok) {
          imageUrl = uploadData.imageUrl;
        } else {
          throw new Error("Image upload failed.");
        }
      }

      const productPayload = {
        name: formData.title,
        details: formData.description,
        price: parseFloat(formData.price) || 0,
        priceWithoutDiscount: parseFloat(formData.discountPercentage) || 0,
        category: formData.category,
        inventory: parseInt(formData.stockLevel) || 0,
        image: imageUrl,
      };

      const productResponse = await fetch("/api/products/addProducts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productPayload),
      });

      const productData = await productResponse.json();
      if (productResponse.ok) {
        alert("Product added successfully!");
        router.push("/admin/product");
      } else {
        alert(`Error: ${productData.message}`);
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("An error occurred while adding the product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white text-gray-900 p-6 flex flex-col items-center space-y-6 shadow-md border-r">
        <h1 className="text-3xl font-semibold text-blue-600 mb-8">Admin Panel</h1>
        <button
          onClick={() => router.push("/")}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Logout
        </button>
        <nav className="mt-8 space-y-4 w-full text-center">
          <a href="#" className="block text-lg font-medium text-gray-700 hover:text-blue-500">Dashboard</a>
          <a href="#" className="block text-lg font-medium text-gray-700 hover:text-blue-500">Categories</a>
          <a href="#" className="block text-lg font-medium text-gray-700 hover:text-blue-500">Products</a>
        </nav>
      </aside>

      <main className="flex-1 p-10 bg-white text-gray-900 flex justify-center items-center shadow-md">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold mb-6 text-blue-600">Add Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium">Price</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium">Price Without Discount</label>
              <input type="number" name="priceWithoutDiscount" value={formData.discountPercentage} onChange={handleChange} className="w-full p-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={4} />
            </div>

            <div>
              <label className="block text-sm font-medium">Image Upload</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="mt-4">
              <button type="submit" disabled={loading} className={`w-full p-3 bg-blue-600 text-white rounded-lg ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}>
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
