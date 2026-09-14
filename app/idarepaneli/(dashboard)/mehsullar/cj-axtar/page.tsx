import type { Metadata } from "next";
import CjSearchView from "./CjSearchView";

export const metadata: Metadata = { title: "CJ-dən Məhsul Axtar — İdarəetmə Paneli" };

export default function CjSearchPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">CJ-dən Məhsul Axtar</h1>
        <p className="mt-1 text-sm text-neutral-500">
          CJ Dropshipping kataloqunda axtarış edib məhsulları birbaşa saytına idxal et.
        </p>
      </div>
      <CjSearchView />
    </div>
  );
}
