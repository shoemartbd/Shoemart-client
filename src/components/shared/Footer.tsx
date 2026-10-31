import { Mail, Phone, MapPin, ArrowRight, FileDown } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { ISiteSetting } from "@/types/siteSetting.types";
import { getSampleWorks } from "@/services/sampleWork.services";
import { sampleWorkViewUrl } from "@/lib/sampleWork";

interface FooterProps {
  siteSettings?: ISiteSetting | null;
}

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact Us", href: "/contact" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
  support: [
    { name: "Shipping Policy", href: "/refund-policy" },
    { name: "Return & Refund", href: "/refund-policy" },
    { name: "FAQ", href: "/faq" },
  ],
};

export default async function Footer({ siteSettings }: FooterProps) {
  // Company profile PDF (first visible one in Dashboard → Sample Works)
  const profilePdf = (await getSampleWorks())[0];

  const siteName = siteSettings?.siteName || "Shoe Mart";
  const logo = siteSettings?.logo || "/mainlogo.jpeg";
  const description =
    siteSettings?.description ||
    "Your ultimate online store. Discover premium, hand-picked products delivered across the nation.";
  const email = siteSettings?.email || "contact.rizbi123@gmail.com";
  const phone = siteSettings?.phone || "+880 1700-000000";
  const address = siteSettings?.address?.trim();
  const copyrightText = siteSettings?.copyrightText || "All rights reserved.";

  const socialLinks = [
    {
      icon: FaFacebook,
      href: siteSettings?.facebook,
      color: "hover:bg-[#1877F2]",
    },
    {
      icon: FaInstagram,
      href: siteSettings?.instagram,
      color: "hover:bg-[#E4405F]",
    },
    {
      icon: FaYoutube,
      href: siteSettings?.youtube,
      color: "hover:bg-[#FF0000]",
    },
    {
      icon: FaLinkedin,
      href: siteSettings?.linkedin,
      color: "hover:bg-[#0A66C2]",
    },
    {
      icon: FaTiktok,
      href: siteSettings?.tiktok,
      color: "hover:bg-[#000000]",
    },
    {
      icon: FaWhatsapp,
      href: siteSettings?.whatsapp
        ? `https://wa.me/${siteSettings.whatsapp.replace(/[^\d]/g, "")}`
        : undefined,
      color: "hover:bg-[#25D366]",
    },
  ].filter((social) => Boolean(social.href));

  return (
    <footer className="bg-[#000000] pt-16 pb-8 mt-10 rounded-t-[3.5rem] relative overflow-hidden border-t border-white/5">
      {/* Subtle Glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#ef3340]/10 rounded-full blur-[80px] -translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-8">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              {/* White tile, since the logo has a white background */}
              <Image
                src={logo}
                alt={siteName}
                width={1293}
                height={854}
                sizes="130px"
                className="h-20 w-auto rounded-xl bg-white object-contain p-1.5 shadow-lg"
              />
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              {description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6 text-slate-500">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 text-sm font-bold hover:text-[#ef3340] transition-colors inline-flex items-center group"
                    >
                      <ArrowRight
                        size={12}
                        className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      />
                      {link.name}
                    </Link>
                  </li>
                ))}
                {profilePdf && (
                  <li>
                    <a
                      href={sampleWorkViewUrl(profilePdf)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={profilePdf.title}
                      className="text-slate-400 text-sm font-bold hover:text-[#ef3340] transition-colors inline-flex items-center gap-2"
                    >
                      <FileDown size={14} className="shrink-0" />
                      Company Profile
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6 text-slate-500">
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 text-sm font-bold hover:text-[#ef3340] transition-colors inline-flex items-center group"
                    >
                      <ArrowRight
                        size={12}
                        className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ef3340]/10 flex items-center justify-center">
                  <Mail size={14} className="text-[#ef3340]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="text-slate-300 text-xs font-bold truncate block"
                  >
                    {email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ef3340]/10 flex items-center justify-center">
                  <Phone size={14} className="text-[#ef3340]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Call Us
                  </p>
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="text-slate-300 text-xs font-bold"
                  >
                    {phone}
                  </a>
                </div>
              </div>
              {address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-[#ef3340]/10 flex items-center justify-center">
                    <MapPin size={14} className="text-[#ef3340]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Address
                    </p>
                    <p className="text-slate-300 text-xs font-bold leading-relaxed whitespace-pre-line">
                      {address}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <Link
                  key={i}
                  href={social.href as string}
                  target="_blank"
                  className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:scale-110 transition-all duration-300 ${social.color}`}
                >
                  <social.icon size={16} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 w-full mb-5" />

        {/* Footer Bottom */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-slate-400 font-semibold text-xs">
            © {new Date().getFullYear()} {siteName}. {copyrightText}
          </p>
          <p className="text-xs text-slate-500">
            Powered by{" "}
            <a
              href="https://bangladeshiit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-300 underline-offset-4 transition-colors hover:text-[#ef3340] hover:underline"
            >
              Bangladeshi IT
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
