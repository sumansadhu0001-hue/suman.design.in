import { useEffect } from "react";
import { SERVICES, FAQS } from "../data";

interface HelmetProps {
  title: string;
  description: string;
  keywords?: string;
  activePage: string;
}

export default function Helmet({ title, description, keywords, activePage }: HelmetProps) {
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sumanwebdesign.com";
    const currentUrl = typeof window !== "undefined" ? window.location.href : origin;
    const canonicalUrl = origin + (activePage === "home" ? "" : `#${activePage}`);

    // Helper to easily create/update meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper to easily create/update link tags
    const setLinkTag = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Helper to easily create/update/remove JSON-LD scripts
    const setJsonLdScript = (id: string, data: object | null) => {
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!data) {
        if (el) el.remove();
        return;
      }
      if (!el) {
        el = document.createElement("script");
        el.id = id;
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data, null, 2);
    };

    // 1. Manage Document Title
    document.title = title;

    // 2. Core Search Engine Meta Tags
    setMetaTag("description", description);
    if (keywords) {
      setMetaTag("keywords", keywords);
    }
    setMetaTag("author", "Suman Web Design Agency");
    setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMetaTag("theme-color", "#7c3aed");

    // 3. Open Graph Metadata for Social Media (Facebook, LinkedIn, Slack, etc.)
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", "website", true);
    setMetaTag("og:url", currentUrl, true);
    setMetaTag("og:site_name", "Suman Web Design Agency", true);
    setMetaTag("og:image", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80", true);
    setMetaTag("og:image:alt", "Suman Web Design Agency - Premium Hand-coded Website Architecture", true);

    // 4. Twitter Card Metadata
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80");
    setMetaTag("twitter:site", "@SumanWebDesign");
    setMetaTag("twitter:creator", "@SumanWebDesign");

    // 5. Canonical Link
    setLinkTag("canonical", canonicalUrl);
    setLinkTag("icon", "/favicon.ico");
    setLinkTag("apple-touch-icon", "/apple-touch-icon.png");

    // 6. Enterprise JSON-LD Structured Data (Schemas)

    // A. Organization & ProfessionalService Local Business Schema
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${origin}/#agency`,
      "name": "Suman Web Design Agency",
      "url": origin,
      "logo": `${origin}/logo.png`,
      "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      "description": "Premium hand-coded bespoke websites designed to build high-converting authority for businesses, startups, and professionals.",
      "telephone": "+919883581298",
      "priceRange": "₹5,999 - ₹30,000+",
      "currenciesAccepted": "INR, USD",
      "paymentAccepted": "Credit Card, UPI, Wire Transfer, PayPal",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kolkata",
        "addressRegion": "West Bengal",
        "postalCode": "700001",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "22.5726",
        "longitude": "88.3639"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "21:00"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+919883581298",
        "contactType": "sales",
        "areaServed": "Worldwide",
        "availableLanguage": ["English", "Hindi", "Bengali"]
      },
      "sameAs": [
        "https://wa.me/919883581298"
      ]
    };
    setJsonLdScript("schema-organization", orgSchema);

    // B. WebSite Schema (with Sitelinks Searchbox)
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      "name": "Suman Web Design Agency",
      "url": origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${origin}/#work?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };
    setJsonLdScript("schema-website", websiteSchema);

    // C. WebPage & BreadcrumbList Schema
    const pageTitle = activePage.charAt(0).toUpperCase() + activePage.slice(1);
    const webpageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${origin}/#webpage`,
      "name": title,
      "description": description,
      "url": canonicalUrl,
      "isPartOf": {
        "@id": `${origin}/#website`
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": origin
          },
          ...(activePage !== "home" ? [{
            "@type": "ListItem",
            "position": 2,
            "name": pageTitle,
            "item": canonicalUrl
          }] : [])
        ]
      }
    };
    setJsonLdScript("schema-webpage", webpageSchema);

    // D. Service OfferCatalog Schema (Enterprise Service List)
    const servicesSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Bespoke Web Design & Development Services",
      "provider": {
        "@id": `${origin}/#agency`
      },
      "areaServed": {
        "@type": "Country",
        "name": "Worldwide"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Professional Digital Services Catalog",
        "itemListElement": SERVICES.map((service, index) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service.title,
            "description": service.description,
            "category": service.category
          },
          "position": index + 1
        }))
      }
    };
    setJsonLdScript("schema-services", servicesSchema);

    // E. FAQPage Schema (Conditionally loaded on 'home' and 'pricing' pages)
    if (activePage === "home" || activePage === "pricing") {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
      setJsonLdScript("schema-faq", faqSchema);
    } else {
      setJsonLdScript("schema-faq", null);
    }

    // Cleanup schemas on unmount to prevent duplicate entries
    return () => {
      // We keep static schemas (Org, WebSite, Services) but can clean up dynamic page ones or just let them overwrite
    };
  }, [title, description, keywords, activePage]);

  return null;
}
