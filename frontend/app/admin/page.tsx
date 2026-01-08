"use client";

import { useState, useEffect, useRef } from "react";
import { Gift } from "@/types/gift";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchGifts, addGift, deleteGift, getImageUrl } from "@/lib/api";

const GiftSchema = z
  .object({
    name: z.string().min(1, "Gift name is required"),
    description: z.string().min(1, "Description is required"),
    price: z
      .number({ invalid_type_error: "Price must be a number" })
      .positive("Price must be positive"),
    image: z.string().optional(),
    gender: z.string().optional(),
    ageMin: z.number().optional(),
    ageMax: z.number().optional(),
    nationalities: z.string().optional(),
    jobs: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.ageMin && data.ageMax) {
        return data.ageMin <= data.ageMax;
      }
      return true;
    },
    {
      message: "Age min must be less than or equal to age max",
      path: ["ageMax"],
    }
  );

type GiftForm = z.infer<typeof GiftSchema>;

export default function AdminPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<GiftForm>({
    resolver: zodResolver(GiftSchema),
  });

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      const data = await fetchGifts();
      setGifts(data.gifts || []);
    } catch (error) {
      console.error("Error loading gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: GiftForm) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("description", data.description);
      formDataToSend.append("price", data.price.toString());

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (data.image) {
        formDataToSend.append("imageUrl", data.image);
      }

      if (data.gender) {
        formDataToSend.append("gender", data.gender);
      }
      if (data.ageMin !== undefined) {
        formDataToSend.append("ageMin", data.ageMin.toString());
      }
      if (data.ageMax !== undefined) {
        formDataToSend.append("ageMax", data.ageMax.toString());
      }
      if (data.nationalities) {
        formDataToSend.append("nationalities", data.nationalities);
      }
      if (data.jobs) {
        formDataToSend.append("jobs", data.jobs);
      }

      await addGift(formDataToSend);

      reset();
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setShowForm(false);
      loadGifts();
    } catch (error) {
      console.error("Error adding gift:", error);
      alert("Failed to add gift");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gift?")) return;

    try {
      await deleteGift(id);
      loadGifts();
    } catch (error) {
      console.error("Error deleting gift:", error);
      alert("Failed to delete gift");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-valentine-light via-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-valentine-pink mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-valentine-light via-pink-50 to-red-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <Link
                href="/"
                className="text-valentine-red hover:text-valentine-pink font-medium mb-4 inline-block"
              >
                ← Back to home
              </Link>
              <h1 className="text-4xl font-bold text-valentine-red mb-2">
                Gift Management
              </h1>
              <p className="text-gray-700">
                Manage your store's gift inventory ({gifts.length}{" "}
                {gifts.length === 1 ? "gift" : "gifts"})
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-valentine-pink to-valentine-red text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {showForm ? "Cancel" : "+ Add New Gift"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Add New Gift
              </h2>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gift Name *
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price * ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image (optional)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setValue("image", "");
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-valentine-pink"
                  />
                  {imageFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {imageFile.name}
                    </p>
                  )}
                  <div className="text-sm text-gray-500">OR</div>
                  <input
                    type="url"
                    {...register("image")}
                    placeholder="Enter image URL"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                      errors.image ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.image.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender (comma-separated, optional)
                    </label>
                    <input
                      type="text"
                      {...register("gender")}
                      placeholder="e.g., male, female"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Min
                      </label>
                      <input
                        type="number"
                        {...register("ageMin", { valueAsNumber: true })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                          errors.ageMin ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.ageMin && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ageMin.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Max
                      </label>
                      <input
                        type="number"
                        {...register("ageMax", { valueAsNumber: true })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                          errors.ageMax ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.ageMax && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ageMax.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationalities (comma-separated, optional)
                  </label>
                  <input
                    type="text"
                    {...register("nationalities")}
                    placeholder="e.g., American, Japanese"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                      errors.nationalities
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.nationalities && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nationalities.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jobs (comma-separated, optional)
                  </label>
                  <input
                    type="text"
                    {...register("jobs")}
                    placeholder="e.g., Engineer, Teacher, Student"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-valentine-pink ${
                      errors.jobs ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.jobs && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.jobs.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-valentine-pink to-valentine-red text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding Gift..." : "Add Gift"}
                </button>
              </form>
            </div>
          )}

          {gifts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No gifts in store
              </h2>
              <p className="text-gray-600 mb-6">
                Start by adding your first gift to the store!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-valentine-pink to-valentine-red text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Add First Gift
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  {gift.image ? (
                    <div className="h-48 relative bg-gray-200 overflow-hidden">
                      <img
                        src={getImageUrl(gift.image)}
                        alt={gift.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-valentine-pink to-valentine-red flex items-center justify-center">
                      <span className="text-6xl">🎁</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {gift.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {gift.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-valentine-red">
                        ${gift.price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(gift.id)}
                      className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
