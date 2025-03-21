"use client"
import { Card, CardContent,  } from "@/components/ui/card";
import axios from "axios";
// import dbConnect from "@/lib/dbConnect";
import {  
  Zap, 
} from "lucide-react";
import { useEffect, useState } from "react";


export default function Discount() {
// fetch using lib
//   const discountCollection= await dbConnect("Deals");
// const flashDeals = await discountCollection.find().toArray();

//fetch using api
const [flashDeals, setFlashDeals] = useState([]);

useEffect(() => {
  async function fetchData() {
    try {
      const response = await axios.get('/api/deals'); // Use Axios to fetch data
      setFlashDeals(response.data); // Axios stores the response data in `response.data`
    } catch (error) {
      console.log(error.message);
    } 
  }

  fetchData();
}, []);
  return (
    <div className="container mx-auto py-8">
      {/* Flash Deals */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg p-4 mb-8 text-white">
        <div className="flex items-center mb-4">
          <Zap className="h-6 w-6 mr-2" />
          <h2 className="text-lg font-bold">Flash Coupons</h2>
          <div className="ml-4 flex items-center space-x-1">
            <div className="bg-white text-pink-600 font-bold w-8 h-8 rounded flex items-center justify-center text-sm">01</div>
            <span>:</span>
            <div className="bg-white text-pink-600 font-bold w-8 h-8 rounded flex items-center justify-center text-sm">45</div>
            <span>:</span>
            <div className="bg-white text-pink-600 font-bold w-8 h-8 rounded flex items-center justify-center text-sm">32</div>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pb-2">
          {flashDeals.map((deal, index) => (
            <Card key={index} className="min-w-52 bg-white text-gray-800 shadow-md">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-pink-600">{deal.discount}</h3>
                <p className="text-xs text-gray-500 mb-2">{deal.limit}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div 
                    className="bg-pink-600 h-1.5 rounded-full" 
                    style={{ width: `${deal.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">{deal.progress}% claimed</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}