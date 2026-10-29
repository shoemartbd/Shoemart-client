import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import MobileBottomNav from "@/components/shared/navbar/MobileBottomNav";
import SitePopup from "@/components/shared/SitePopup";
import GtmScript from "@/components/shared/GtmScript";
import { getUserInfo } from "@/services/auth.services";
import { getSiteSettings } from "@/services/siteSetting.services";

export default async function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Independent requests, fetched together
  const [userInfo, siteSettingsRes] = await Promise.all([
    getUserInfo(),
    getSiteSettings(),
  ]);
  const siteSettings = siteSettingsRes.data;

  return (
    <>
      <GtmScript />
      <Navbar userInfo={userInfo} siteSettings={siteSettings} />
      <main className="min-h-screen">{children}</main>
      <Footer siteSettings={siteSettings} />
      <MobileBottomNav userInfo={userInfo} />
      <SitePopup />
    </>
  );
}

