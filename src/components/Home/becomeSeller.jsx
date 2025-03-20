'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function BecomeASeller() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12 px-4 md:px-0">
        {/* Left Side - Image */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <Image
            src="/become-seller.png"
            alt="Become a Seller"
            width={500}
            height={500}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* Right Side - Content */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Enjoy The Freedom Of Selling Products On Your Own Terms!
          </h2>
          <p className="text-gray-600 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="text-green-500" /> Selective Pricing Range
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="text-green-500" /> Low Commission Cost
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="text-green-500" /> Changeable Pricing Plans
            </li>
          </ul>

          <Button className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-orange-500 transition">
            Become A Seller
          </Button>
        </div>
      </div>
    </section>
  );
}
