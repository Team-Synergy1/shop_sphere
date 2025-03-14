"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would implement your login logic
    console.log("Login attempt with:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/">
          <div className="text-3xl font-bold text-orange-500">ShopSphere</div>
          {/* You can replace with an actual logo:
          <Image src="/logo.png" alt="logo" width={150} height={50} /> */}
        </Link>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to ShopSphere! Please Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Enter your Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Please enter your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Please enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-orange-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <LogIn className="mr-2 h-4 w-4" /> LOGIN
            </Button>
          </div>
        </form>

        {/* Separator */}
        <div className="relative mt-6 mb-6">
          <Separator />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
            OR
          </span>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => console.log("Login with Facebook")}
          >
            <div className="mr-2 text-blue-600">f</div> Continue with Facebook
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => console.log("Login with Google")}
          >
            <div className="mr-2 text-red-500">G</div> Continue with Google
          </Button>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">New to ShopSphere? </span>
          <Link
            href="/register"
            className="text-sm text-orange-500 hover:underline font-medium"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}