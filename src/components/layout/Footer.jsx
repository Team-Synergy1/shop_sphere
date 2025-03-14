import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, CreditCard, Mail, MapPin, Phone, Globe } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const customerCareLinks = [
  { label: "Help Center", href: "/help-center" },
  { label: "How to Buy", href: "/how-to-buy" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms" },
];

const makeMoneyLinks = [
  { label: "Sell on ShopSphere", href: "/sell" },
  { label: "Become a Pickup Point", href: "/pickup-point" },
];

const darazLinks = [
  { label: "About ShopSphere", href: "/about" },
  { label: "Digital Payments", href: "/payments" },
  { label: "Careers", href: "/careers" },
  { label: "ShopSphere Blog", href: "/blog" },
  { label: "Privacy Policy", href: "/privacy" },
];


export default function Footer() {
  return (
    <footer className="bg-gray-100 pt-12 pb-6">
      <div className="container mx-auto px-4">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-lg mb-4">Customer Care</h4>
            <ul className="space-y-2">
              {customerCareLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Make Money with Us */}
          <div>
            <h4 className="font-bold text-lg mb-4">Make Money with Us</h4>
            <ul className="space-y-2">
              {makeMoneyLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* shopSphere */}
          <div>
            <h4 className="font-bold text-lg mb-4">ShopSphere</h4>
            <ul className="space-y-2">
              {darazLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  123 Ecommerce Street, Digital City, 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  +1 (800) 123-4567
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  support@shopsphere.com
                </span>
              </li>
              <li className="flex items-center">
                <Globe className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  www.shopsphere.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <Separator className="mb-6" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} ShopSphere. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}