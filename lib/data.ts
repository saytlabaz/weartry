export interface Product {
  id: string;
  slug: string;
  nameKey: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  category: "jacket" | "hoodie" | "pants" | "tshirt" | "sweater" | "cardigan";
  isNew?: boolean;
  colors: string[];
  gradient: string;
}

// Placeholder catalogue — swap in real product photography and copy before launch.
export const newArrivals: Product[] = [
  { id: "na-1", slug: "everyday-hoodie", nameKey: "everydayHoodie", name: "Everyday Hoodie", price: 95, compareAtPrice: 120, category: "hoodie", isNew: true, colors: ["#e8a0a0", "#c9a7e0", "#e8d6a0"], gradient: "from-rose-200 to-rose-300" },
  { id: "na-2", slug: "lightweight-jacket", nameKey: "lightweightJacket", name: "Lightweight Jacket", price: 189, compareAtPrice: 219, category: "jacket", isNew: true, colors: ["#d8cdb8", "#8a8a8a"], gradient: "from-stone-200 to-stone-300" },
  { id: "na-3", slug: "oversized-graphic-tee", nameKey: "oversizedGraphicTee", name: "Oversized Graphic Tee", price: 69, compareAtPrice: 89, category: "tshirt", isNew: true, colors: ["#1a1a1a", "#2b4c8c", "#e8d6a0"], gradient: "from-neutral-300 to-neutral-400" },
];

export const seasonalDrop: Product[] = [
  { id: "sd-1", slug: "zipper-jacket", nameKey: "zipperJacket", name: "Zipper Jacket", price: 99, compareAtPrice: 129, category: "jacket", colors: ["#1a1a1a"], gradient: "from-slate-200 to-slate-300" },
  { id: "sd-2", slug: "relaxed-fit-cardigan", nameKey: "relaxedFitCardigan", name: "Relaxed Fit Cardigan", price: 119, compareAtPrice: 149, category: "cardigan", colors: ["#e8e0d0"], gradient: "from-amber-100 to-amber-200" },
  { id: "sd-3", slug: "kids-puffer-jacket", nameKey: "kidsPufferJacket", name: "Kids Puffer Jacket", price: 89, compareAtPrice: 119, category: "jacket", colors: ["#e8a0a0", "#8ab4e8"], gradient: "from-sky-100 to-sky-200" },
  { id: "sd-4", slug: "kids-everyday-hoodie", nameKey: "kidsEverydayHoodie", name: "Kids Everyday Hoodie", price: 59, compareAtPrice: 79, category: "hoodie", colors: ["#e8d6a0"], gradient: "from-yellow-100 to-yellow-200" },
];

export const bestSellers: Product[] = [
  { id: "bs-1", slug: "everyday-hoodie", nameKey: "everydayHoodie", name: "Everyday Hoodie", price: 95, compareAtPrice: 120, category: "hoodie", colors: ["#e8a0a0"], gradient: "from-rose-200 to-rose-300" },
  { id: "bs-2", slug: "lightweight-jacket-2", nameKey: "lightweightJacket", name: "Lightweight Jacket", price: 189, compareAtPrice: 219, category: "jacket", colors: ["#d8cdb8"], gradient: "from-stone-200 to-stone-300" },
  { id: "bs-3", slug: "zipper-jacket-2", nameKey: "zipperJacket", name: "Zipper Jacket", price: 99, compareAtPrice: 129, category: "jacket", colors: ["#1a1a1a"], gradient: "from-slate-200 to-slate-300" },
  { id: "bs-4", slug: "relaxed-fit-cardigan-2", nameKey: "relaxedFitCardigan", name: "Relaxed Fit Cardigan", price: 119, compareAtPrice: 149, category: "cardigan", colors: ["#e8e0d0"], gradient: "from-amber-100 to-amber-200" },
  { id: "bs-5", slug: "classic-hoodie", nameKey: "classicHoodie", name: "Classic Hoodie", price: 99, compareAtPrice: 129, category: "hoodie", colors: ["#1a1a1a", "#8a8a8a"], gradient: "from-zinc-200 to-zinc-300" },
  { id: "bs-6", slug: "oversized-graphic-tee-2", nameKey: "oversizedGraphicTee", name: "Oversized Graphic Tee", price: 69, compareAtPrice: 89, category: "tshirt", colors: ["#1a1a1a", "#2b4c8c"], gradient: "from-neutral-300 to-neutral-400" },
  { id: "bs-7", slug: "soft-knit-sweater", nameKey: "softKnitSweater", name: "Soft Knit Sweater", price: 129, compareAtPrice: 159, category: "sweater", colors: ["#c9b8a0"], gradient: "from-orange-100 to-orange-200" },
  { id: "bs-8", slug: "utility-cargo-pants", nameKey: "utilityCargoPants", name: "Utility Cargo Pants", price: 149, compareAtPrice: 179, category: "pants", colors: ["#8a8060", "#1a1a1a"], gradient: "from-lime-100 to-lime-200" },
];

export const allProducts: Product[] = [...newArrivals, ...seasonalDrop, ...bestSellers];

export function findProductById(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export function findProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export const testimonials = [
  { id: "t1", quote: "The quality exceeded my expectations. Every piece feels premium and fits perfectly.", author: "Olivia" },
  { id: "t2", quote: "The fabric feels amazing and the fit is effortless. I wear it every week.", author: "Sophia" },
  { id: "t3", quote: "Modern, comfortable, and easy to style. Every order has been worth it.", author: "Mason" },
  { id: "t4", quote: "Great everyday essentials with a premium feel. I've already ordered again.", author: "Liam" },
  { id: "t5", quote: "Simple designs, great comfort, and fast delivery. Exactly what I was looking for.", author: "Ethan" },
  { id: "t6", quote: "Clean styles that work anywhere. The quality and attention to detail stand out.", author: "Noah" },
];

export const journalPosts = [
  { id: "j1", slug: "capsule-wardrobe", titleKey: "capsuleWardrobe", title: "Building A Capsule Wardrobe", excerptKey: "capsuleWardrobeExcerpt", excerpt: "Discover versatile essentials that make getting dressed effortless every day.", gradient: "from-stone-200 to-stone-300" },
  { id: "j2", slug: "summer-layering", titleKey: "summerLayering", title: "Summer Layering Made Easy", excerptKey: "summerLayeringExcerpt", excerpt: "Lightweight pieces that add depth without sacrificing comfort.", gradient: "from-sky-100 to-sky-200" },
  { id: "j3", slug: "denim-fit-guide", titleKey: "denimFitGuide", title: "The Denim Fit Guide", excerptKey: "denimFitGuideExcerpt", excerpt: "Find the perfect fit with our guide to modern denim styles.", gradient: "from-indigo-100 to-indigo-200" },
];
