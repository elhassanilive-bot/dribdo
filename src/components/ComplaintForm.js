'use client';

import { useState } from "react";

export default function ComplaintForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "Ù…Ø­ØªÙˆÙ‰ Ù…Ø³ÙŠØ¡",
    details: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus("ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø¨Ù„Ø§ØºØŒ ÙˆØ³Ù†ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ø¥Ø°Ø§ Ø§Ø­ØªØ¬Ù†Ø§ Ø¥Ù„Ù‰ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ©.");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 space-y-4 shadow-sm">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Ø£Ø±Ø³Ù„ Ø´ÙƒÙˆÙ‰ Ø£Ùˆ Ø¨Ù„Ø§Øº</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-gray-700 dark:text-gray-200">
          Ø§Ù„Ø§Ø³Ù…
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </label>
        <label className="block text-gray-700 dark:text-gray-200">
          Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-red-500 focus:outline-none"
          />
        </label>
      </div>
      <label className="block text-gray-700 dark:text-gray-200">
        Ù†ÙˆØ¹ Ø§Ù„Ø´ÙƒÙˆÙ‰
        <select
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-red-500 focus:outline-none"
        >
          <option>Ù…Ø­ØªÙˆÙ‰ Ù…Ø³ÙŠØ¡</option>
          <option>Ø§Ù†ØªØ­Ø§Ù„ Ù‡ÙˆÙŠØ© / Ø­Ù‚ÙˆÙ‚ Ù†Ø´Ø±</option>
          <option>Ù…Ø´ÙƒÙ„Ø© ØªÙ‚Ù†ÙŠØ©</option>
          <option>Ø·Ù„Ø¨ Ø¯Ø¹Ù… Ø¹Ø§Ù…</option>
        </select>
      </label>
      <label className="block text-gray-700 dark:text-gray-200">
        ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø¨Ù„Ø§Øº
        <textarea
          name="details"
          value={formData.details}
          onChange={handleChange}
          rows={4}
          className="mt-1 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-red-500 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 px-8 py-2 text-white font-semibold transition-colors"
      >
        Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨Ù„Ø§Øº
      </button>
      {status && <p className="text-sm text-red-700">{status}</p>}
    </form>
  );
}



