
import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

export default function FeedbackPopup({ onClose, onSubmit }: Props) {
  const [input, setInput] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2 text-black">We'd love your feedback!</h2>
        <p className="mb-4 text-gray-700">Would you like early access to special features? Share your thoughts 🙏</p>
        <textarea
          rows={4}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your feedback here..."
          className="w-full px-3 py-2 border rounded-md mb-4 text-black"
        />
        <div className="flex gap-2">
          <button className="bg-muted/90 px-4 py-2 rounded-md text-sm"
            onClick={onClose}>Later</button>
          <button className="bg-primary px-4 py-2 rounded-md text-white text-sm"
            onClick={() => { if (input.trim()) onSubmit(input); }}>Send</button>
        </div>
      </div>
    </div>
  );
}
