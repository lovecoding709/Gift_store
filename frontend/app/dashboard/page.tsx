"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const FinderSchema = z.object({
  sex: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  age: z
    .number({ invalid_type_error: "Age is required" })
    .int()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be 120 or less"),
  national: z.string().min(2, "Enter a valid nationality"),
  job: z.string().min(2, "Enter a valid job/profession"),
});

type FinderForm = z.infer<typeof FinderSchema>;

export default function Home() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FinderForm>({
    resolver: zodResolver(FinderSchema),
    defaultValues: { sex: "male", age: 25, national: "", job: "" } as any,
  });

  useEffect(() => {
    // ensure age input is numeric if page loads with empty value
    setValue("age", 25 as any);
  }, [setValue]);

  const onSubmit = async (data: FinderForm) => {
    const params = new URLSearchParams({
      sex: data.sex,
      age: String(data.age),
      national: data.national,
      job: data.job,
    });

    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-valentine-light via-pink-50 to-red-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-valentine-red mb-4">
              💝 Valentine Gift Finder
            </h1>
            <p className="text-xl text-gray-700">
              Tell us about your friend and we'll suggest the perfect gift!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <div>
                <label
                  htmlFor="sex"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender *
                </label>
                <select
                  id="sex"
                  aria-invalid={errors.sex ? "true" : "false"}
                  aria-describedby={errors.sex ? "sex-error" : undefined}
                  {...register("sex")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-valentine-pink focus:border-transparent ${
                    errors.sex ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.sex && (
                  <p id="sex-error" className="mt-2 text-sm text-red-600">
                    {String(errors.sex.message)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  aria-invalid={errors.age ? "true" : "false"}
                  aria-describedby={errors.age ? "age-error" : undefined}
                  {...register("age", { valueAsNumber: true })}
                  min={1}
                  max={120}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-valentine-pink focus:border-transparent ${
                    errors.age ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter age"
                />
                {errors.age && (
                  <p id="age-error" className="mt-2 text-sm text-red-600">
                    {String(errors.age.message)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="national"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nationality *
                </label>
                <input
                  type="text"
                  id="national"
                  aria-invalid={errors.national ? "true" : "false"}
                  aria-describedby={
                    errors.national ? "national-error" : undefined
                  }
                  {...register("national")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-valentine-pink focus:border-transparent ${
                    errors.national ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., American, Japanese"
                />
                {errors.national && (
                  <p id="national-error" className="mt-2 text-sm text-red-600">
                    {String(errors.national.message)}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="job"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job/Profession *
                </label>
                <input
                  type="text"
                  id="job"
                  aria-invalid={errors.job ? "true" : "false"}
                  aria-describedby={errors.job ? "job-error" : undefined}
                  {...register("job")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-valentine-pink focus:border-transparent ${
                    errors.job ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Engineer, Teacher, Student"
                />
                {errors.job && (
                  <p id="job-error" className="mt-2 text-sm text-red-600">
                    {String(errors.job.message)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-valentine-pink to-valentine-red text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Finding Gifts..." : "Find Perfect Gifts 💝"}
              </button>
            </form>
          </div>

          <div className="text-center">
            <Link
              href="/admin"
              className="inline-block text-valentine-red hover:text-valentine-pink font-medium transition-colors"
            >
              Are you the store owner? Manage gifts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
