"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import ViewCanvas from "./components/ViewCanvas";
import LoginForm from "./components/LoginForm";

const Login = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  // Function to check screen width
  const checkScreenSize = () => {
    if (typeof window !== "undefined") {
      setIsLargeScreen(window.innerWidth >= 1024);
    }
  };

  useEffect(() => {
    checkScreenSize(); // Initial check

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isLargeScreen) {
      gsap.to(".restContent", {
        opacity: 1,
        duration: 2,
        delay: 0.7,
      });

      gsap.fromTo(
        ".topBar",
        {
          y: -100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 2,
          delay: 1,
        }
      );
    }
  }, [isLargeScreen]);

  if (!isLargeScreen) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white text-lg text-center px-4">
          Please view on a larger screen.
        </p>
      </div>
    );
  }

  return (
    <>
      <nav className="mt-6 mx-6 md:mx-9 topBar flex items-center opacity-0">
        <img src="/logo.png" alt="Logo" className="w-20" />
        <div className="p-2 px-4 flex w-full rounded-lg shadow-lg justify-between items-center">
          <h2 className="font-bold text-2xl">Ace-X</h2>
        </div>
      </nav>
      <div className="px-6 md:px-16">
        <div className="restContent lg:grid min-h-[80vh] grid-cols-1 lg:grid-cols-2 items-center opacity-0">
          <ViewCanvas />
          <section className="col-start-2 md:row-start-1">
            <LoginForm />
          </section>
        </div>
      </div>
    </>
  );
};

export default Login;
