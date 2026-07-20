import { Service, Project, PricingPlan, FAQ, Testimonial } from "./types";

export const SERVICES: Service[] = [
  {
    id: "design",
    title: "Website Design",
    description: "Bespoke user interfaces designed to build authority, trust, and premium brand perception.",
    iconName: "Palette",
    category: "Art Direction & UI/UX",
    details: [
      "Custom UI/UX interface design in Figma with infinite revision loops",
      "Typography pairing grids and unique high-contrast branding styling",
      "Interactive wireframing of user routing and conversion funnels",
      "Light and dark mode custom layout design schemas"
    ],
    benefits: [
      "Unique visual aesthetic standing out from generic templates",
      "Optimized reading rhythm and visual focus points",
      "Consistent, clean corporate design language"
    ]
  },
  {
    id: "development",
    title: "Web Development",
    description: "Pixel-perfect frontend engineering translating Figma layout files into buttery-smooth interactive code.",
    iconName: "Code",
    category: "Bespoke Engineering",
    details: [
      "Component-driven clean React or HTML5/CSS3 development",
      "Fluid layout scaling optimized for mobile-first rendering",
      "High-end micro-interactions and transitions with Framer Motion",
      "Semantic elements maximizing accessibility and SEO standards"
    ],
    benefits: [
      "Ultra-lightweight code bundles with zero styling bloat",
      "Responsive scaling perfectly fitting all displays (4K to Mobile)",
      "Maintainable, well-structured, modular codebase"
    ]
  },
  {
    id: "performance",
    title: "Performance Optimization",
    description: "Speed audits and performance tuning to achieve sub-second page loads and near-perfect PageSpeed scores.",
    iconName: "Zap",
    category: "Speed & SEO",
    details: [
      "Comprehensive Core Web Vitals diagnosis and performance tuning",
      "Eliminating layout shifts (CLS) and optimizing Input Delays (FID)",
      "Next-generation responsive image sizing and audio/video asset compression",
      "Advanced caching, script deferral, and preconnecting resources"
    ],
    benefits: [
      "Lighthouse performance scores targeted at 95+",
      "Improved search engine indexing and rankings on Google",
      "Increased user retention and lower bounce rates"
    ]
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    description: "Conversion-optimized digital commerce stores with custom catalog selectors and secure, frictionless checkouts.",
    iconName: "ShoppingBag",
    category: "Digital Commerce",
    details: [
      "Interactive digital product catalogs with live filtering",
      "Optimized checkout steps reducing cart abandonment rates",
      "Integration of payment gateways (Razorpay, Stripe, WhatsApp)",
      "Inventory tracking, tax calculations, and automatic invoice schemas"
    ],
    benefits: [
      "Seamless shopping experiences on any mobile device",
      "Accelerated path-to-purchase flow boosting sales",
      "Complete custom control of marketing & checkout layout"
    ]
  },
  {
    id: "maintenance",
    title: "Support & Maintenance",
    description: "Proactive security scans, SSL management, weekly backups, and minor layout revisions on-demand.",
    iconName: "ShieldCheck",
    category: "Continuous Support",
    details: [
      "Routine vulnerability monitoring and automatic backups",
      "Domain health diagnosis, server monitoring, and SSL updates",
      "Fast content modifications (adjusting copy, assets, prices, hours)",
      "Periodic library upgrades to maintain framework security"
    ],
    benefits: [
      "Guaranteed uptime of your critical marketing channels",
      "Hassle-free management with direct developer support",
      "Proactive protection against malware and site downfalls"
    ]
  },
  {
    id: "custom-solutions",
    title: "Custom Solutions",
    description: "Tailored databases, administrative dashboards, API integrations, and customized CRM business tooling.",
    iconName: "Cpu",
    category: "Bespoke Integrations",
    details: [
      "Connecting custom frontends to database providers (Supabase, PostgreSQL)",
      "Designing responsive admin dashboards and tracking spreadsheets",
      "RESTful API route setup proxying server-side requests securely",
      "Automated lead syncs with WhatsApp, Email, or Slack alerts"
    ],
    benefits: [
      "Fully tailored to match your specific workflow parameters",
      "Automates boring manual data sync tasks completely",
      "Secure hosting keeping sensitive client databases isolated"
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    id: "luxury-fashion-ecommerce",
    title: "Zari & Silk Luxury Boutique E-Commerce",
    description: "A luxury clothing lookup e-commerce catalog and private wardrobe consultation scheduling system designed for elite designers.",
    category: "E-Commerce",
    client: "Zari & Silk Jaipur",
    timeline: "4 Weeks",
    budget: "₹1,80,000",
    tags: ["React", "Framer Motion", "Supabase", "Tailwind CSS"],
    challenge: "The client wanted an ultra-luxurious digital layout that felt like an editorial fashion book. Heavy e-commerce templates slowed down mobile browsers and ruined high-end typography grids.",
    solution: "We engineered a static lookbook with client-side filters, employing beautiful transitions, full-screen product grids, and a lazy-loaded media pipeline. Added a private stylist appointment coordinator linked directly to their inbox.",
    results: [
      "Lighthouse performance rating rose to 98% on mobile devices",
      "Stylist consultation booking inquiries grew by 42% in month one",
      "Page load speeds slashed to 0.7 seconds worldwide"
    ],
    stats: [
      { label: "Mobile Performance", value: "98/100" },
      { label: "Booking Growth", value: "+42%" },
      { label: "Average Load Time", value: "0.7s" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "premium-specialty-cafe",
    title: "Araku Valley Coffee Pre-order Platform",
    description: "A mobile-first pickup ordering interface and roast selection timing scheduler built for artisanal coffee roasters.",
    category: "Web Application",
    client: "Araku Valley Roasters",
    timeline: "3 Weeks",
    budget: "₹85,000",
    tags: ["Next.js", "Framer Motion", "Tailwind CSS", "Local Storage"],
    challenge: "Regular food ordering apps charge heavy commission rates and clutter the screen with banners. Cafe visitors wanted to preorder their specific coffee roast and pickup on arrival with a clean interface.",
    solution: "We designed a lightweight single-page ordering app. It stores previous selections in LocalStorage, updates pickup ETA times dynamically based on checkout completion, and integrates direct WhatsApp pre-orders.",
    results: [
      "Pre-order pickups accounted for 30% of daily cafe revenue within 60 days",
      "Average checkout flow completed in under 4 taps from initial load",
      "Zero server maintenance costs utilizing client-authoritative state"
    ],
    stats: [
      { label: "Pre-order Sales", value: "30%" },
      { label: "Checkout Steps", value: "4 Taps" },
      { label: "Server Cost", value: "₹0" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "artisanal-furniture-studio",
    title: "Royal Jodhpur Teak Furniture Showcase",
    description: "An elegant collections catalog and personalized physical showroom visit coordinator designed for premium carpentry studios.",
    category: "Corporate",
    client: "Jodhpur Royal Woodworks",
    timeline: "3 Weeks",
    budget: "₹75,000",
    tags: ["Vite", "Vanilla JS", "Tailwind CSS", "Grid Layout"],
    challenge: "Teak furniture relies heavily on wood grains, tactile textures, and custom sizes. Standard catalog templates failed to represent timber specifications elegantly and looked like generic shopify themes.",
    solution: "We built a Swiss-modern grid portfolio showcasing macro high-resolution wood closeups and full timber parameters. Showroom booking CTA forms are prioritized at key interest milestones.",
    results: [
      "Physical showroom visits increased by 55% in the first quarter",
      "High-intent lead conversion rates reached a record 12.8%",
      "Fluid grid alignment looks impeccable across ultrawide monitors and tablets"
    ],
    stats: [
      { label: "Showroom Visits", value: "+55%" },
      { label: "Lead Conversion", value: "12.8%" },
      { label: "Asset Size", value: "-60%" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "educational-institution-website",
    title: "Vidya Mandir Global Academy Portal",
    description: "A secure, modern, high-performance information portal and admission query manager designed for private institutions.",
    category: "Corporate",
    client: "Vidya Mandir Academy",
    timeline: "4 Weeks",
    budget: "₹1,20,000",
    tags: ["Vite", "TypeScript", "Tailwind CSS", "JSON-LD"],
    challenge: "Educational institution sites are notorious for being dense, slow, and impossible to navigate. Parents struggled to find the admission fees and academic curriculum schedules on mobile.",
    solution: "We structured a responsive hierarchical navigation deck. Built-in instant tuition fee calculators and visual campus tour calendars let parents enroll their children and coordinate interviews instantly.",
    results: [
      "Academic inquiry submission rates increased by 70%",
      "Time spent searching for tuition info decreased by 400%",
      "Page accessibility scored a flawless 100 on WCAG compliance"
    ],
    stats: [
      { label: "Admissions Form", value: "+70%" },
      { label: "Nav Latency", value: "-75%" },
      { label: "WCAG Rating", value: "100%" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "healthcare-booking-platform",
    title: "Healthcare Diagnostics Platform",
    description: "A HIPAA-compliant secure patient diagnostics booking portal designed to look up reports and coordinate diagnostic pickups.",
    category: "Web Application",
    client: "Arogya Diagnostics Lab",
    timeline: "5 Weeks",
    budget: "₹2,50,000",
    tags: ["React", "Express", "PostgreSQL", "Tailwind CSS"],
    challenge: "Patients dread picking up physical clinical reports and navigating cluttered web portals. Arogya Lab needed a highly secure way to deliver test report PDF files online.",
    solution: "We implemented a server-side route checking clinical test ID matching and proxying encrypted PDF streams. Added an elegant, easy-to-read dashboard detailing diagnostic test metrics.",
    results: [
      "Physical pickup lines reduced by 80%, saving receptionist hours",
      "PDF medical report retrievals reached 5,000 files in week three",
      "Zero report leaks thanks to strict parameter lookup checks"
    ],
    stats: [
      { label: "Lab Queue Save", value: "-80%" },
      { label: "Downloads", value: "5,000+" },
      { label: "Audit Result", value: "Passed" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "real-estate-sales-platform",
    title: "DLF Signature Realty Platform",
    description: "A premium real estate listing portal featuring property specifications, floor plans, and interactive tour booking coordinates.",
    category: "Corporate",
    client: "DLF Signature Builders",
    timeline: "4 Weeks",
    budget: "₹1,40,000",
    tags: ["Vite", "Tailwind CSS", "Framer Motion", "Leaflet"],
    challenge: "Real estate websites often feel cluttered with overlapping interactive maps, slow loading photos, and annoying tracking cookies that scare high-end investors.",
    solution: "We created an elegant luxury showcase. We focused on massive typographic elements, smooth visual carousel sliders, and a clear budget calculator form linking directly to premium sales agents.",
    results: [
      "Bespoke tour bookings grew by 48% within 30 days of release",
      "Visitor retention on property list pages increased from 40s to 3.2m",
      "Perfect responsive display scaling on luxury tablets and notebooks"
    ],
    stats: [
      { label: "Tour Bookings", value: "+48%" },
      { label: "Session Duration", value: "3.2m" },
      { label: "Load Time", value: "0.5s" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₹5,999",
    period: "project",
    description: "Perfect for local startups, independent creators, and high-converting single-page landing architectures.",
    features: [
      "Single bespoke landing page design",
      "100% responsive architecture",
      "Light/dark mode premium visual toggle",
      "Basic Google SEO tag parameters",
      "Direct WhatsApp click integration",
      "30 days launch support & debugging"
    ],
    popular: false,
    buttonText: "Select Starter",
    packageType: "Starter"
  },
  {
    id: "business",
    name: "Business",
    price: "₹14,999",
    period: "project",
    description: "Ideal for expanding brands, service practitioners, and established business platforms demanding premium authority.",
    features: [
      "Up to 5 custom high-fidelity pages",
      "Fluid layout animations & transitions",
      "Advanced technical SEO schema tags",
      "Sub-second page loading speed tuning",
      "Interactive contact form validations",
      "90 days priority developer support"
    ],
    popular: true,
    badge: "Most Popular",
    buttonText: "Select Business",
    packageType: "Business"
  },
  {
    id: "custom",
    name: "Custom Quote",
    price: "Custom",
    period: "flexible",
    description: "Tailored for complex e-commerce catalogues, SaaS startup software, database applications, and bespoke agency portals.",
    features: [
      "Unlimited premium custom pages",
      "Custom E-Commerce store setups",
      "API integrations & server-side endpoints",
      "Dedicated client admin dashboard options",
      "Supabase / PostgreSQL secure databases",
      "1 year VIP developer priority support"
    ],
    popular: false,
    buttonText: "Inquire Custom",
    packageType: "Custom"
  }
];

export const FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "What justifies the pricing tiers?",
    answer: "Every website we build is hand-coded from scratch. We write clean semantic markup, design custom layouts in Figma, and tune assets for sub-second speeds. You are investing in high-converting, durable business assets built to scale—not cheap, bloated, generic templates."
  },
  {
    id: "faq-2",
    question: "How long does a website project take?",
    answer: "A single-page Starter site typically launches in 1 to 2 weeks. A comprehensive Business website with up to 5 custom pages takes 3 to 4 weeks. Custom web applications and complex e-commerce systems range from 6 to 12 weeks depending on scope."
  },
  {
    id: "faq-3",
    question: "Do you provide revisions during the process?",
    answer: "Absolutely. We partition projects into checkpoints. First, we design high-fidelity layouts in Figma where we collect feedback and make layout edits. Once the visuals are approved and locked, we write clean code and provide a staging link for final functionality sweeps."
  },
  {
    id: "faq-4",
    question: "Will my website be mobile responsive?",
    answer: "Yes, 100%. Over 60% of web traffic is mobile. Every page we build is tested across modern mobile, tablet, laptop, and ultrawide displays to ensure fluid scaling, perfect readability, and fast loading over mobile networks."
  },
  {
    id: "faq-5",
    question: "Can I upgrade my package at a later stage?",
    answer: "Yes. Because our codebases are modular and engineered using standard modern standards, adding services, new pages, database structures, or complex checkout forms later is extremely simple and clean."
  },
  {
    id: "faq-6",
    question: "Do you provide ongoing support after launch?",
    answer: "Every package includes a standard launch support window. After that, you can opt for our monthly priority maintenance sweeps covering server monitoring, weekly snapshots, fast content updates, and framework security checks."
  },
  {
    id: "faq-7",
    question: "Is SEO included in the build?",
    answer: "Yes. Standard search engine optimization is baked into our development. We write valid semantic HTML tags, preconnect external assets, configure meta descriptions, set canonical pointers, and write structured JSON-LD schemas so Google indexes your site correctly."
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Dr. Ananya Roy",
    role: "Director",
    company: "Arogya Diagnostics",
    content: "Our physical pickup queues reduced by 80% thanks to Suman's secure report lookup dashboard. The speed is absolutely incredible, and our patients love how simple it is on their phones. Brilliant engineering and transparent process throughout.",
    rating: 5
  },
  {
    id: "test-2",
    name: "Vikram Mehta",
    role: "Founder",
    company: "Jodhpur Royal Woodworks",
    content: "We were tired of generic templates that looked cheap. Suman built a breathtaking, Swiss-modern furniture showcase that presents our premium solid teak Jodhpur woodcraft with pure class. Showroom visits went up 55% in the first quarter alone!",
    rating: 5
  },
  {
    id: "test-3",
    name: "Chef Rajat Sen",
    role: "Owner",
    company: "Araku Valley Roasters",
    content: "The WhatsApp ordering pre-checkout flow has been a game changer. Customers pre-order their specialty Araku Valley roast and pick it up hot on arrival. The UI is clean, extremely fast, and has saved us thousands in food app delivery commissions.",
    rating: 5
  }
];
