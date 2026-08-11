"use client";

import { useState } from "react";
import ArticleView, { type ArticleViewData } from "@/components/blog/ArticleView";

export default function PreviewFrame({ post }: { post: ArticleViewData }) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewport("desktop")}
          className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
            viewport === "desktop" ? "bg-primary text-white" : "bg-white text-foreground hover:bg-gray-light/40"
          }`}
        >
          🖥 Desktop
        </button>
        <button
          type="button"
          onClick={() => setViewport("mobile")}
          className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
            viewport === "mobile" ? "bg-primary text-white" : "bg-white text-foreground hover:bg-gray-light/40"
          }`}
        >
          📱 Mobile
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-light/70 bg-[#e9e8e6] p-6">
        <div
          className={`mx-auto overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(32,26,26,0.15)] transition-[max-width] duration-200 ${
            viewport === "mobile" ? "max-w-[390px]" : "max-w-full"
          }`}
        >
          <div className="max-h-[75vh] overflow-y-auto px-6 py-10 md:px-10">
            <ArticleView post={post} />
          </div>
        </div>
      </div>
    </div>
  );
}
