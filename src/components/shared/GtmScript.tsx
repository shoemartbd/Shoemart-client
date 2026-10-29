import Script from "next/script";
import { getPublicGtmSettings } from "@/services/gtmSetting.services";

const GOOGLE_DOMAIN = "https://www.googletagmanager.com";

// Loads the Google Tag Manager web container set in Dashboard → GTM
// Settings. Renders nothing while GTM is off. Used by the storefront layout
// and the landing pages; the admin dashboard is left out on purpose so staff
// visits don't land in Analytics / Meta.
export default async function GtmScript() {
  const settings = await getPublicGtmSettings();
  if (!settings?.containerId) return null;

  const id = settings.containerId;
  // A server-side container (sGTM) can serve gtm.js from the site's own
  // domain, which fewer ad blockers stop
  const domain = settings.scriptDomain || GOOGLE_DOMAIN;

  // Google's standard snippet. Values go through JSON.stringify so nothing
  // from the settings can break out of the script.
  const snippet = `(function(w,d,s,l,i,u){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
u+'/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(id)},${JSON.stringify(domain)});`;

  return (
    <>
      <Script id="gtm-loader" strategy="afterInteractive">
        {snippet}
      </Script>
      <noscript>
        <iframe
          src={`${GOOGLE_DOMAIN}/ns.html?id=${encodeURIComponent(id)}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
