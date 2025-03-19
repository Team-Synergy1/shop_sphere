"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const bannerImages = [
  {
    id: 1,
    imageUrl: "/api/placeholder/1200/400",
    title: "Flash Sale",
    description: "Up to 70% off on electronics",
    link: "/flash-sale"
  },
  {
    id: 2,
    imageUrl: "/api/placeholder/1200/400",
    title: "New Collection",
    description: "Discover the latest fashion trends",
    link: "/fashion"
  },
  {
    id: 3,
    imageUrl: "/api/placeholder/1200/400",
    title: "Free Shipping",
    description: "On orders above $50",
    link: "/promotions"
  }
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
 
  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
    }, 5000);
   
    return () => clearInterval(interval);
  }, []);
 
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
  };
 
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  };
 
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
 
  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg my-4">
      {/* Main banner container */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {bannerImages.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            {/* Banner image */}
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
            />
           
            {/* Banner content */}
            <div className="absolute inset-0 flex flex-col justify-center items-start p-12 bg-gradient-to-r from-black/70 to-transparent">
              <h2 className="text-4xl font-bold text-white mb-2">{banner.title}</h2>
              <p className="text-xl text-white mb-6">{banner.description}</p>
              <Button
                variant="default"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
              >
                Shop Now
              </Button>
            </div>
          </div>
        ))}
      </div>
     
      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
     
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
     
      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {bannerImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-8 rounded-full transition-colors ${
              index === currentSlide ? "bg-orange-500" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}