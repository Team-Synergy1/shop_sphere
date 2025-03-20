'use client';

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const teamMembers = [
  {
    name: "Md. Ayub ",
    role: "General Manager",
    image:  "/sabbirvai.jpg",
  },
  {
    name: "Md. Zohir Hossen",
    role: "Customer Support",
    image: "/zhoirvai.jpg",
  },
  {
    name: "NH Mizan",
    role: "Delivery Supervisor",
    image: "/nahid.jpg",
  },
  {
    name: "Sabbir Hossain Semanto",
    role: "CEO",
    // image: "https://i.ibb.co.com/7xX89vD3/1742216408452-1.jpg",
    image:"/ayubvai.jpg",
  },
];

export default function OurTeam() {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold text-orange-500 mb-6">Our Team</h2>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet The Executive Panel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
          {teamMembers.map((member, index) => (
            <Card key={index} className="shadow-lg rounded-lg overflow-hidden p-2 hover:bg-orange-500">
              <Image
                src={member.image}
                alt={member.name}
                width={300}
                height={400}
                className="w-full h-80 rounded-lg object-cover "
              />
              <CardContent className="p-4 text-center">
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
