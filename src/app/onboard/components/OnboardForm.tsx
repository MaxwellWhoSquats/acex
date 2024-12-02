"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const OnboardForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      const body = JSON.stringify({ email, password });

      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (res.ok) {
        setError("");
        setEmail("");
        setPassword("");
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-16 py-24 border border-gray-300 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-8">Sign Up</h2>
      <div className="mb-8">
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-black placeholder-opacity-100"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-8">
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-black placeholder-opacity-100"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Sign Up
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </form>
  );
};

export default OnboardForm;
