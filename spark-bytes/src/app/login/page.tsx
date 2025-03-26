// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div>
      {/* Main Content */}
      <main
        style={{
          backgroundColor: "#fff",
          color: "#000",
          padding: "2rem",
          fontFamily: "Arial, sans-serif",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            marginBottom: "1rem",
            color: "#c00",
          }}
        >
          Login
        </h1>
      </main>

      {/* Google Sign In Button */}
      <button onClick={() => signIn("google")}>
        Sign in with Google
      </button>
    </div>
  );
}
