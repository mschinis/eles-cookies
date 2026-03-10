"use client";
import { useSearchParams } from "next/navigation";

export default function CanceledNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("canceled") !== "1") return null;
  return (
    <div className="mb-8 rounded-xl border border-caramel/30 bg-caramel/10 px-6 py-4 text-sm text-cocoa">
      Your payment was cancelled. No charge was made — feel free to try again.
    </div>
  );
}
