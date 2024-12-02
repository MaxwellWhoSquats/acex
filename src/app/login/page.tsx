"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import ViewCanvas from "./components/ViewCanvas";
import LoginForm from "./components/LoginForm";
import Navbar from "../components/Navbar";

const Onboard = () => {
  useEffect(() => {
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
  }, []);

  return (
    <>
      <nav className="mt-6 mx-6 md:mx-9 topBar flex items-center opacity-0">
        <img src="/logo.png" alt="Logo" className="w-20" />
        <div className="p-2 px-4 flex w-full rounded-lg shadow-lg justify-between items-center">
          <h2 className="font-bold text-2xl">Ace-X</h2>
        </div>
      </nav>
      <div className="px-6 md:px-16">
        <div className="restContent grid min-h-[80vh] grid-cols-1 md:grid-cols-2 items-center opacity-0">
          <ViewCanvas />
          <section className="col-start-2 md:row-start-1">
            <LoginForm />
          </section>
        </div>
      </div>
    </>
  );
};

export default Onboard;
