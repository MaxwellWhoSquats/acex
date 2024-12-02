import React, { useState } from "react";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-16 py-24 border border-gray-300 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-8">Sign In</h2>
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
        Sign In
      </button>
    </form>
  );
};

export default SignInForm;
