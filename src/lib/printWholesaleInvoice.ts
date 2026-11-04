import { format } from "date-fns";
import { ISiteSetting } from "@/types/siteSetting.types";
import { escapeHtml, money, printHtml, wrapDocument } from "./printOrderInvoice";

// What the invoice needs; the admin editor passes its current (possibly
// unsaved) lines and charges
export interface IWholesaleInvoiceData {
  invoiceNo: number;
  date: string;
  name: string;
  phone: string;
  email?: string | null;
  businessName?: string | null;
  location?: string | null;
  lines: {
    name: string;
    code: string;
    image?: string | null;
    color?: string | null;
    quantity: number;
    unitPrice: number;
  }[];
  deliveryCharge: number;
  paidAmount: number;
  completed: boolean;
}

export const wholesaleInvoiceNo = (n: number) => `WS-${String(n).padStart(4, "0")}`;

// A4 wholesale invoice, in the same layout as the order invoice
export const printWholesaleInvoice = (data: IWholesaleInvoiceData, site?: ISiteSetting | null) => {
  const siteName = site?.siteName || "Shoe Mart";
  const invoiceNo = wholesaleInvoiceNo(data.invoiceNo);
  const pairs = data.lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = data.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const total = subtotal + data.deliveryCharge;
  const due = total - data.paidAmount;
  const website = typeof window !== "undefined" ? window.location.host : "";

  const rows = data.lines
    .map(
      (l, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            ${
              l.image
                ? `<img src="${escapeHtml(l.image)}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:4px;border:1px solid #ddd;flex-shrink:0" />`
                : ""
            }
            <div>
              <div>${escapeHtml(l.name)}</div>
              <div class="muted">(Code: ${escapeHtml(l.code)})</div>
              ${l.color ? `<div class="muted">Colour: ${escapeHtml(l.color)}</div>` : ""}
            </div>
          </div>
        </td>
        <td class="center">${l.quantity}</td>
        <td>${money(l.unitPrice)}</td>
        <td>${money(l.quantity * l.unitPrice)}</td>
      </tr>`,
    )
    .join("");

  const page = `<div class="page">
  <div class="header">
    <div>
      ${site?.logo ? `<img class="logo" src="${escapeHtml(site.logo)}" alt="${escapeHtml(siteName)}" />` : `<div class="logo-text">${escapeHtml(siteName)}</div>`}
    </div>
    <div class="company">
      <div class="name">${escapeHtml(siteName)}</div>
      ${site?.address ? `<div>${escapeHtml(site.address)}</div>` : ""}
      ${site?.phone ? `<div>Phone: ${escapeHtml(site.phone)}</div>` : ""}
      ${site?.email ? `<div>${escapeHtml(site.email)}</div>` : ""}
    </div>
  </div>

  <h1>WHOLESALE INVOICE</h1>

  <div class="info">
    <div>
      <div><b>Bill To</b></div>
      <div class="customer-name">${escapeHtml(data.businessName || data.name)}</div>
      ${data.businessName ? `<div>${escapeHtml(data.name)}</div>` : ""}
      ${data.location ? `<div>${escapeHtml(data.location)}</div>` : ""}
      <div>Phone: ${escapeHtml(data.phone)}</div>
      ${data.email ? `<div>Email: ${escapeHtml(data.email)}</div>` : ""}
    </div>
    <div>
      <div><b>Invoice No:</b> ${escapeHtml(invoiceNo)}</div>
      <div><b>Date:</b> ${escapeHtml(format(new Date(data.date), "d/M/yyyy"))}</div>
      <div><b>Status:</b> ${data.completed ? "Sale Complete" : "Quotation"}</div>
      <div><b>Total Pairs:</b> ${pairs}</div>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th class="center" style="width:36px">#</th>
        <th>Product</th>
        <th class="center" style="width:70px">Pairs</th>
        <th style="width:90px">Price / Pair</th>
        <th style="width:100px">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="bottom">
    <div></div>
    <table class="totals">
      <tr><td>Subtotal</td><td>${money(subtotal)}</td></tr>
      <tr><td>Delivery Charge</td><td>${money(data.deliveryCharge)}</td></tr>
      <tr class="grand"><td>Grand Total</td><td>${money(total)}</td></tr>
      <tr><td>Paid</td><td>${money(data.paidAmount)}</td></tr>
      <tr><td><b>Due</b></td><td><b>${money(due)}</b></td></tr>
    </table>
  </div>

  <div class="received">
    <div class="received-note">Received the above goods in good condition.</div>
    <div class="sign-row">
      <div class="sign"><div class="sign-line"></div>Received By (Name)</div>
      <div class="sign"><div class="sign-line"></div>Receiver's Signature &amp; Date</div>
      <div class="sign"><div class="sign-line"></div>Authorized Signature</div>
    </div>
  </div>

  <div class="footer">
    <div>Thank you for your business with ${escapeHtml(siteName.toUpperCase())} <span class="heart">&#10084;</span></div>
    ${website ? `<div>${escapeHtml(website)}</div>` : ""}
  </div>
</div>`;

  printHtml(wrapDocument(`Invoice ${invoiceNo}`, [page]));
};
