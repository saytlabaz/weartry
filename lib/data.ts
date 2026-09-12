export interface Product {
  id: string;
  slug: string;
  nameKey: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  category: "jacket" | "hoodie" | "pants" | "tshirt" | "sweater" | "cardigan";
  /** Who the piece is merchandised for — drives /category/[slug] */
  audience: "men" | "women" | "kids";
  isNew?: boolean;
  colors: string[];
  gradient: string;
}

// Placeholder catalogue — swap in real product photography and copy before launch.
export const newArrivals: Product[] = [
  { id: "na-1", slug: "everyday-hoodie", nameKey: "everydayHoodie", name: "Everyday Hoodie", price: 95, compareAtPrice: 120, category: "hoodie", audience: "men", isNew: true, colors: ["#e8a0a0", "#c9a7e0", "#e8d6a0"], gradient: "from-rose-200 to-rose-300" },
  { id: "na-2", slug: "lightweight-jacket", nameKey: "lightweightJacket", name: "Lightweight Jacket", price: 189, compareAtPrice: 219, category: "jacket", audience: "women", isNew: true, colors: ["#d8cdb8", "#8a8a8a"], gradient: "from-stone-200 to-stone-300" },
  { id: "na-3", slug: "oversized-graphic-tee", nameKey: "oversizedGraphicTee", name: "Oversized Graphic Tee", price: 69, compareAtPrice: 89, category: "tshirt", audience: "men", isNew: true, colors: ["#1a1a1a", "#2b4c8c", "#e8d6a0"], gradient: "from-neutral-300 to-neutral-400" },
  { id: "na-4", slug: "classic-denim-jacket", nameKey: "classicDenimJacket", name: "Classic Denim Jacket", price: 139, compareAtPrice: 169, category: "jacket", audience: "men", isNew: true, colors: ["#4a6b8a", "#1a1a1a"], gradient: "from-sky-200 to-blue-300" },
];

export const seasonalDrop: Product[] = [
  { id: "sd-1", slug: "zipper-jacket", nameKey: "zipperJacket", name: "Zipper Jacket", price: 99, compareAtPrice: 129, category: "jacket", audience: "men", colors: ["#1a1a1a"], gradient: "from-slate-200 to-slate-300" },
  { id: "sd-2", slug: "relaxed-fit-cardigan", nameKey: "relaxedFitCardigan", name: "Relaxed Fit Cardigan", price: 119, compareAtPrice: 149, category: "cardigan", audience: "women", colors: ["#e8e0d0"], gradient: "from-amber-100 to-amber-200" },
  { id: "sd-3", slug: "kids-puffer-jacket", nameKey: "kidsPufferJacket", name: "Kids Puffer Jacket", price: 89, compareAtPrice: 119, category: "jacket", audience: "kids", colors: ["#e8a0a0", "#8ab4e8"], gradient: "from-sky-100 to-sky-200" },
  { id: "sd-4", slug: "kids-everyday-hoodie", nameKey: "kidsEverydayHoodie", name: "Kids Everyday Hoodie", price: 59, compareAtPrice: 79, category: "hoodie", audience: "kids", colors: ["#e8d6a0"], gradient: "from-yellow-100 to-yellow-200" },
];

export const bestSellers: Product[] = [
  { id: "bs-1", slug: "everyday-hoodie", nameKey: "everydayHoodie", name: "Everyday Hoodie", price: 95, compareAtPrice: 120, category: "hoodie", audience: "men", colors: ["#e8a0a0"], gradient: "from-rose-200 to-rose-300" },
  { id: "bs-2", slug: "lightweight-jacket-2", nameKey: "lightweightJacket", name: "Lightweight Jacket", price: 189, compareAtPrice: 219, category: "jacket", audience: "women", colors: ["#d8cdb8"], gradient: "from-stone-200 to-stone-300" },
  { id: "bs-3", slug: "zipper-jacket-2", nameKey: "zipperJacket", name: "Zipper Jacket", price: 99, compareAtPrice: 129, category: "jacket", audience: "men", colors: ["#1a1a1a"], gradient: "from-slate-200 to-slate-300" },
  { id: "bs-4", slug: "relaxed-fit-cardigan-2", nameKey: "relaxedFitCardigan", name: "Relaxed Fit Cardigan", price: 119, compareAtPrice: 149, category: "cardigan", audience: "women", colors: ["#e8e0d0"], gradient: "from-amber-100 to-amber-200" },
  { id: "bs-5", slug: "classic-hoodie", nameKey: "classicHoodie", name: "Classic Hoodie", price: 99, compareAtPrice: 129, category: "hoodie", audience: "men", colors: ["#1a1a1a", "#8a8a8a"], gradient: "from-zinc-200 to-zinc-300" },
  { id: "bs-6", slug: "oversized-graphic-tee-2", nameKey: "oversizedGraphicTee", name: "Oversized Graphic Tee", price: 69, compareAtPrice: 89, category: "tshirt", audience: "men", colors: ["#1a1a1a", "#2b4c8c"], gradient: "from-neutral-300 to-neutral-400" },
  { id: "bs-7", slug: "soft-knit-sweater", nameKey: "softKnitSweater", name: "Soft Knit Sweater", price: 129, compareAtPrice: 159, category: "sweater", audience: "women", colors: ["#c9b8a0"], gradient: "from-orange-100 to-orange-200" },
  { id: "bs-8", slug: "utility-cargo-pants", nameKey: "utilityCargoPants", name: "Utility Cargo Pants", price: 149, compareAtPrice: 179, category: "pants", audience: "men", colors: ["#8a8060", "#1a1a1a"], gradient: "from-lime-100 to-lime-200" },
];

export const allProducts: Product[] = [...newArrivals, ...seasonalDrop, ...bestSellers];

export function findProductById(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export function findProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function findProductsByAudience(audience: Product["audience"]): Product[] {
  return allProducts.filter((p) => p.audience === audience);
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  country: string;
  flag: string;
  rating: 4 | 5;
  relatedPrice: number;
  gradient: string;
}

export const testimonials: Testimonial[] = [
  { id: "t1", quote: "The quality exceeded my expectations. Every piece feels premium and fits perfectly.", name: "Elena Rossi", country: "Italy", flag: "🇮🇹", rating: 5, relatedPrice: 95, gradient: "from-rose-200 to-rose-300" },
  { id: "t2", quote: "The fabric feels amazing and the fit is effortless. I wear it every week.", name: "Marcus Weber", country: "Germany", flag: "🇩🇪", rating: 4, relatedPrice: 189, gradient: "from-stone-200 to-stone-300" },
  { id: "t3", quote: "Modern, comfortable, and easy to style. Every order has been worth it.", name: "Aisha Khan", country: "Pakistan", flag: "🇵🇰", rating: 5, relatedPrice: 69, gradient: "from-neutral-300 to-neutral-400" },
  { id: "t4", quote: "Great everyday essentials with a premium feel. I've already ordered again.", name: "Tomás García", country: "Spain", flag: "🇪🇸", rating: 5, relatedPrice: 99, gradient: "from-slate-200 to-slate-300" },
  { id: "t5", quote: "Simple designs, great comfort, and fast delivery. Exactly what I was looking for.", name: "Freya Andersen", country: "Sweden", flag: "🇸🇪", rating: 4, relatedPrice: 119, gradient: "from-amber-100 to-amber-200" },
  { id: "t6", quote: "Clean styles that work anywhere. The quality and attention to detail stand out.", name: "Kenji Sato", country: "Japan", flag: "🇯🇵", rating: 5, relatedPrice: 129, gradient: "from-orange-100 to-orange-200" },
];

export const journalPosts = [
  { id: "j1", slug: "capsule-wardrobe", titleKey: "capsuleWardrobe", title: "Building A Capsule Wardrobe", excerptKey: "capsuleWardrobeExcerpt", excerpt: "Discover versatile essentials that make getting dressed effortless every day.", gradient: "from-stone-200 to-stone-300" },
  { id: "j2", slug: "summer-layering", titleKey: "summerLayering", title: "Summer Layering Made Easy", excerptKey: "summerLayeringExcerpt", excerpt: "Lightweight pieces that add depth without sacrificing comfort.", gradient: "from-sky-100 to-sky-200" },
  { id: "j3", slug: "denim-fit-guide", titleKey: "denimFitGuide", title: "The Denim Fit Guide", excerptKey: "denimFitGuideExcerpt", excerpt: "Find the perfect fit with our guide to modern denim styles.", gradient: "from-indigo-100 to-indigo-200" },
];
