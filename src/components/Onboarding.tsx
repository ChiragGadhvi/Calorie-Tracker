
import React, { useState } from "react";

const pages = [
  {
    emoji: "🍔",
    title: "Snap a Photo",
    desc: "Take a picture of your meal to analyze nutrition."
  },
  {
    emoji: "📊",
    title: "Track Your Progress",
    desc: "See calories and protein instantly. Stay motivated!"
  },
  {
    emoji: "🥕🍎🍰",
    title: "Stay Healthy!",
    desc: "Get insights and keep moving towards your goals."
  },
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [page, setPage] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="w-[90vw] max-w-sm bg-white rounded-2xl p-8 text-center shadow-xl">
        <div className="text-5xl mb-4">{pages[page].emoji}</div>
        <h2 className="text-xl font-semibold mb-2">{pages[page].title}</h2>
        <div className="text-gray-500 mb-6">{pages[page].desc}</div>
        <button
          className="bg-primary w-full py-3 rounded-lg text-white font-bold"
          onClick={() => {
            if (page === pages.length - 1) onComplete();
            else setPage((p) => p + 1);
          }}
        >
          {page === pages.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}
