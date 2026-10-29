"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, User, MapPin, Phone, Printer, Store, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { createPosOrder } from "@/services/pos.services";
import { BD_MOBILE_MESSAGE, getPhoneHint, isValidBdPhone, sanitizePhoneInput } from "@/lib/phone";
import { getSiteSettings } from "@/services/siteSetting.services";

type PaymentMethod = "cash" | "card" | "mfs" | "other";

const PAYMENT_METHODS: { id: PaymentMethod; emoji: string; label: string }[] = [
  { id: "cash", emoji: "💵", label: "Cash" },
  { id: "card", emoji: "💳", label: "Card" },
  { id: "mfs", emoji: "📱", label: "MFS" },
  { id: "other", emoji: "🧾", label: "Other" },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mfs: "MFS",
  other: "Other",
};

const fmt = (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type ReceiptData = {
  invoiceNo: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string | null;
    address: string | null;
    note: string | null;
  };
  payment: { method: PaymentMethod; amount: number; change: number };
  cartItems: any[];
  subtotal: number;
  discount: number;
  vatAmount: number;
  shippingCharge: number;
  total: number;
};

export default function PosCheckoutModal({
  subtotal,
  discount,
  vatAmount,
  shippingCharge,
  total,
  cartItems,
  onClose,
  onSuccess,
}: {
  subtotal: number;
  discount: number;
  vatAmount: number;
  shippingCharge: number;
  total: number;
  cartItems: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"customer" | "payment">("customer");

  // Customer info
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [inputAmount, setInputAmount] = useState("");

  // Shop branding for the receipt header
  const [shopInfo, setShopInfo] = useState<{ name?: string; logo?: string } | null>(null);

  // Set once the sale is confirmed — switches this modal into receipt mode
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((res) =>
        setShopInfo(
          res.data
            ? { name: res.data.siteName, logo: res.data.logo ?? undefined }
            : null,
        ),
      )
      .catch(() => setShopInfo(null));
  }, []);

  // Change: only for cash
  const paid = parseFloat(inputAmount || "0");
  const change = paymentMethod === "cash" ? Math.max(0, paid - total) : 0;

  // Numpad
  const handleNumpad = (key: string) => {
    if (key === "⌫") {
      setInputAmount((prev) => prev.slice(0, -1));
    } else if (key === "Clear") {
      setInputAmount("");
    } else if (key === "." && inputAmount.includes(".")) {
      return; // prevent double dot
    } else {
      setInputAmount((prev) => prev + key);
    }
  };

  const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", ".", "⌫", "Clear"];

  const handleSubmit = async () => {
    if (!isValidBdPhone(customer.phone)) {
      toast.error(BD_MOBILE_MESSAGE);
      return;
    }

    if (paymentMethod === "cash" && paid < total) {
      toast.error("Cash received is less than total amount!");
      return;
    }

    setIsProcessing(true);
    const payload = {
      subtotal,
      discount,
      tax: vatAmount,
      shippingCharge,
      total,
      customer: {
        name: customer.name || "Walk-in Customer",
        phone: customer.phone.trim(),
        address: customer.address || null,
        note: customer.note.trim() || null,
      },
      payment: {
        method: paymentMethod,
        amount: paid,
        change,
      },
    };

    const res = await createPosOrder(payload);
    setIsProcessing(false);

    if (res?.success) {
      toast.success("Order completed successfully!");
      setReceipt({
        invoiceNo: res.data?.orderNumber || res.data?.id,
        createdAt: res.data?.createdAt || new Date().toISOString(),
        customer: payload.customer,
        payment: payload.payment,
        cartItems,
        subtotal,
        discount,
        vatAmount,
        shippingCharge,
        total,
      });
    } else {
      toast.error(res?.message || "Failed to create order");
    }
  };

  // Called after the receipt is dismissed — resets the cart & closes checkout
  const handleFinish = () => {
    setReceipt(null);
    onSuccess();
  };

  const handlePrint = () => window.print();

  if (receipt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]" data-lenis-prevent>

          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-bold text-gray-800">Sale Complete</h2>
            </div>
            <button onClick={handleFinish} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Printable receipt */}
          <div className="overflow-y-auto bg-gray-100 p-4">
            <div id="pos-invoice-print" className="bg-white mx-auto max-w-[320px] rounded-xl shadow-sm border border-gray-100 p-5 text-gray-800">
              <div className="flex flex-col items-center text-center gap-1 mb-3">
                {shopInfo?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shopInfo.logo} alt={shopInfo?.name || "Shop logo"} className="w-14 h-14 object-cover rounded-full mb-1" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                )}
                <h3 className="font-bold text-base">{shopInfo?.name || "Shoe Mart POS"}</h3>
                <p className="text-[11px] text-gray-500">Sales Receipt</p>
              </div>

              <hr className="border-dashed border-gray-300 my-2" />

              <div className="flex justify-between text-xs text-gray-600">
                <span>{receipt.invoiceNo}</span>
                <span>
                  {new Date(receipt.createdAt).toLocaleDateString()}{" "}
                  {new Date(receipt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <hr className="border-dashed border-gray-300 my-2" />

              <div className="text-xs space-y-0.5">
                <p><span className="text-gray-500">Customer:</span> {receipt.customer.name}</p>
                {receipt.customer.phone && <p><span className="text-gray-500">Phone:</span> {receipt.customer.phone}</p>}
                {receipt.customer.address && <p><span className="text-gray-500">Address:</span> {receipt.customer.address}</p>}
                {receipt.customer.note && <p><span className="text-gray-500">Note:</span> {receipt.customer.note}</p>}
              </div>

              <hr className="border-dashed border-gray-300 my-2" />

              <div className="space-y-1.5">
                {receipt.cartItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs gap-2">
                    <div className="flex-1">
                      <p className="font-medium leading-tight">{item.productName}</p>
                      {item.combination && <p className="text-gray-400 text-[10px]">{item.combination}</p>}
                      <p className="text-gray-500 text-[10px]">৳{fmt(item.price)} × {item.quantity}</p>
                    </div>
                    <span className="font-medium whitespace-nowrap">৳{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-dashed border-gray-300 my-2" />

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>৳{fmt(receipt.subtotal)}</span>
                </div>
                {receipt.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{fmt(receipt.discount)}</span>
                  </div>
                )}
                {receipt.vatAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">VAT</span>
                    <span>+৳{fmt(receipt.vatAmount)}</span>
                  </div>
                )}
                {receipt.shippingCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>+৳{fmt(receipt.shippingCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span>৳{fmt(receipt.total)}</span>
                </div>
              </div>

              <hr className="border-dashed border-gray-300 my-2" />

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid via</span>
                  <span className="font-medium">{PAYMENT_LABELS[receipt.payment.method]}</span>
                </div>
                {receipt.payment.method === "cash" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cash Received</span>
                      <span>৳{fmt(receipt.payment.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Change</span>
                      <span>৳{fmt(receipt.payment.change)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <span>{receipt.payment.amount}</span>
                  </div>
                )}
              </div>

              <hr className="border-dashed border-gray-300 my-2" />

              <p className="text-center text-xs mt-3">Thank you for shopping with us!</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50/80">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]" data-lenis-prevent>

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Complete Payment</h2>
            <p className="text-xs text-gray-400">
              {step === "customer" ? "Step 1 — Customer Details" : "Step 2 — Select Payment"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden divide-x divide-gray-100">

          {/* ─── LEFT PANEL ─── */}
          <div className="flex-1 overflow-y-auto flex flex-col">

            {/* Step 1: Customer Info */}
            <div className="p-5 space-y-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Customer Details
              </h3>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-sm"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX *"
                  required
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-sm"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: sanitizePhoneInput(e.target.value) })}
                />
                {getPhoneHint(customer.phone) && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {getPhoneHint(customer.phone)}
                  </p>
                )}
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Address (optional)"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-sm"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                />
              </div>
              <div className="relative">
                <StickyNote className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <textarea
                  rows={2}
                  placeholder="Note (optional)"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-sm resize-none"
                  value={customer.note}
                  onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="px-5">
              <hr className="border-gray-100" />
            </div>

            {/* Step 2: Payment Method */}
            <div className="p-5 space-y-3">
              <h3 className="font-semibold text-gray-700">Select Payment Method</h3>
              <div className="grid grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setPaymentMethod(m.id); setInputAmount(""); }}
                    className={`py-2.5 px-1 rounded-xl text-sm font-semibold border-2 transition-all flex flex-col items-center gap-1 ${
                      paymentMethod === m.id
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Method-specific input label */}
              <div className="mt-2">
                {paymentMethod === "cash" && <p className="text-xs text-gray-500 mb-1">Enter cash received amount:</p>}
                {paymentMethod === "card" && <p className="text-xs text-gray-500 mb-1">Last 4 digits of card:</p>}
                {paymentMethod === "mfs" && <p className="text-xs text-gray-500 mb-1">Mobile number used:</p>}
                {paymentMethod === "other" && <p className="text-xs text-gray-500 mb-1">Reference / note:</p>}

                {paymentMethod === "other" ? (
                  <textarea
                    rows={2}
                    placeholder="Write reference..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all resize-none"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                  />
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-gray-400">৳</span>
                    <input
                      type={paymentMethod === "cash" ? "number" : "text"}
                      maxLength={paymentMethod === "card" ? 4 : undefined}
                      placeholder={
                        paymentMethod === "cash" ? "0.00"
                        : paymentMethod === "card" ? "1234"
                        : "01XXXXXXXXX"
                      }
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Cash numpad */}
              {paymentMethod === "cash" && (
                <div className="grid grid-cols-3 gap-2">
                  {numpadKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleNumpad(key)}
                      className={`py-3 rounded-xl text-base font-semibold border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                        key === "Clear" ? "col-span-2 text-red-500 hover:bg-red-50" : ""
                      } ${key === "⌫" ? "text-orange-500 hover:bg-orange-50" : ""}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT PANEL: Order Summary ─── */}
          <div className="w-72 bg-gray-50 flex flex-col p-5 gap-4">
            <h3 className="font-semibold text-gray-700 text-sm">Order Summary</h3>

            {/* Items */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-48 pr-1">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs text-gray-600">
                  <span className="truncate pr-2 flex-1">{item.productName} ×{item.quantity}</span>
                  <span className="font-medium flex-shrink-0">৳{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200 space-y-2 pt-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳{fmt(discount)}</span>
                </div>
              )}
              {vatAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>VAT</span>
                  <span>+৳{fmt(vatAmount)}</span>
                </div>
              )}
              {shippingCharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>+৳{fmt(shippingCharge)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary">৳{fmt(total)}</span>
              </div>
            </div>

            {/* Change (cash only) */}
            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <div className={`p-3 rounded-xl text-sm flex justify-between ${paid >= total && paid > 0 ? "bg-green-50 border border-green-100" : "bg-gray-100"}`}>
                  <span className="text-gray-600">Cash Received</span>
                  <span className="font-bold">৳{fmt(paid)}</span>
                </div>
                <div className={`p-3 rounded-xl text-sm flex justify-between ${change > 0 ? "bg-blue-50 border border-blue-100" : "bg-gray-100"}`}>
                  <span className="text-gray-600">Change Due</span>
                  <span className="font-bold text-blue-700">৳{fmt(change)}</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isProcessing ||
                (paymentMethod === "cash" && paid < total) ||
                !isValidBdPhone(customer.phone)
              }
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
