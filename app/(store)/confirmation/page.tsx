"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuPrinter, LuCircleCheck, LuShoppingBag } from "react-icons/lu";
import type { OrderResult } from "@/lib/types";

const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ConfirmationPage() {
  const [order] = useState<OrderResult | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("orderResult");
    if (stored) {
      try {
        return JSON.parse(stored) as OrderResult;
      } catch {
        return null;
      }
    }
    return null;
  });

  if (!order) {
    return (
      <main className="grow bg-[#f4f7ee] w-full min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-stone-200 max-w-md">
          <p className="text-stone-600 font-gotham text-base mb-6">No recent order details found.</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#4a9e2f] text-white font-gotham text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#3d8626] transition-colors"
          >
            <LuShoppingBag className="w-4 h-4" />
            Go To Shop
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? order.total;
  const deliveryCharge = order.total > subtotal ? order.total - subtotal : 0;
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="grow bg-[#f4f4f4] w-full min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Top Success Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm border border-stone-200 text-center">
          <div className="w-16 h-16 bg-[#4a9e2f]/10 text-[#4a9e2f] rounded-full flex items-center justify-center mx-auto mb-4">
            <LuCircleCheck className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1f2a17] font-bold mb-2">
            Thank You For Your Order!
          </h1>
          <p className="font-gotham text-stone-600 text-sm max-w-lg mx-auto">
            Your order <span className="font-bold text-[#1f2a17]">#{order.orderNumber}</span> has been confirmed. A summary invoice is provided below for your records.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3 bg-white border border-[#4a9e2f] text-[#4a9e2f] hover:bg-[#4a9e2f] hover:text-white font-gotham text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <LuPrinter className="w-4 h-4" />
              Print Invoice
            </button>
            <Link
              href="/shop"
              className="px-6 py-3 bg-[#4a9e2f] hover:bg-[#3d8626] text-white font-gotham text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <LuShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="bg-white rounded-2xl shadow-md border border-stone-200 overflow-hidden p-6 sm:p-10 print:shadow-none print:border-none print:p-0">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-stone-200 gap-4">
            <div>
              <Image
                src="/assets/Logo-English.png"
                alt="Organishi"
                width={150}
                height={48}
                className="h-10 w-auto object-contain mb-2"
                priority
              />
              <p className="font-gotham text-xs text-stone-500">Pure Organic Food, Straight From the Farm</p>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="font-display text-2xl font-bold text-[#1f2a17] uppercase tracking-wider">INVOICE</h2>
              <p className="font-gotham text-sm font-semibold text-[#4a9e2f] mt-0.5">#{order.orderNumber}</p>
              <p className="font-gotham text-xs text-stone-500 mt-0.5">Date: {orderDate}</p>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 bg-[#f4f7ee]/50 rounded-xl border border-[#4a9e2f]/20">
            <div>
              <p className="font-gotham text-xs uppercase tracking-wider font-bold text-[#4a9e2f] mb-2">
                Customer Details
              </p>
              <p className="font-gotham text-sm font-semibold text-stone-800">{order.address.fullName}</p>
              <p className="font-gotham text-xs text-stone-600 mt-1">{order.address.phone}</p>
              <p className="font-gotham text-xs text-stone-600">{order.address.email}</p>
            </div>
            <div>
              <p className="font-gotham text-xs uppercase tracking-wider font-bold text-[#4a9e2f] mb-2">
                Delivery Address
              </p>
              <p className="font-gotham text-xs text-stone-700 leading-relaxed">
                {order.address.addressLine1}
                {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}
                <br />
                {order.address.city}, {order.address.state} - {order.address.postalCode}
                <br />
                {order.address.country}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#4a9e2f]/30 rounded text-[11px] font-semibold text-[#1f2a17]">
                <span>Payment:</span>
                <span className="text-[#4a9e2f]">Cash on Delivery (COD)</span>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[#1f2a17] font-gotham text-xs font-bold uppercase tracking-wider bg-stone-50">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-gotham text-xs text-stone-800">
                {order.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <div className="relative w-12 h-12 rounded bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                        ) : null}
                        <div>
                          <p className="font-semibold text-stone-900">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold">{item.quantity}</td>
                    <td className="py-3 px-3 text-right">{money(item.price)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-[#1f2a17]">
                      {money(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="border-t border-stone-200 pt-4 flex flex-col items-end">
            <div className="w-full sm:w-64 space-y-2 font-gotham text-xs text-stone-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{deliveryCharge > 0 ? money(deliveryCharge) : "Free"}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-[#1f2a17]">
                <span>Grand Total</span>
                <span className="text-[#4a9e2f]">{money(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-stone-100 text-center font-gotham text-xs text-stone-400">
            Thank you for choosing Organishi! For any queries regarding this order, please contact support@organishi.com or call +880 1811 000111.
          </div>

        </div>

      </div>
    </main>
  );
}
