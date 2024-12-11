"use client";
import { useLayoutEffect, useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import ViewCanvas from "./components/ViewCanvas";
import OnboardForm from "./components/OnboardForm";
import debounce from "lodash.debounce";

const Onboard = () => {
  const [isLargeScreen, setIsLargeScreen] = useState<boolean | null>(null);
  const [showTagline1, setShowTagline1] = useState(true);
  const [showTagline2, setShowTagline2] = useState(true);
  const [showRest, setShowRest] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to check screen width
  const checkScreenSize = () => {
    if (typeof window !== "undefined") {
      setIsLargeScreen(window.innerWidth >= 1024);
    }
  };

  // Monitor screen size on mount and resize with debouncing
  useEffect(() => {
    const debouncedCheck = debounce(checkScreenSize, 200);
    debouncedCheck(); // Initial check

    window.addEventListener("resize", debouncedCheck);
    return () => {
      window.removeEventListener("resize", debouncedCheck);
      debouncedCheck.cancel();
    };
  }, []);

  // Animate Taglines Only on Large Screens
  useLayoutEffect(() => {
    if (!isLargeScreen) return; // Do not run animations on small screens

    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Animate tagline_1
      tl.fromTo(
        ".tagline1 span",
        { opacity: 0, y: 250 },
        {
          opacity: 1,
          stagger: 0.02,
          delay: 1,
        }
      );

      // Vanish tagline_1
      tl.to(
        ".tagline1 span",
        {
          opacity: 0,
          stagger: 0.02,
          onComplete: () => setShowTagline1(false),
        },
        "+=0.5"
      );

      // Animate tagline_2
      tl.fromTo(
        ".tagline2 span",
        { opacity: 0, y: 280 },
        {
          opacity: 1,
          y: 250,
          duration: 1,
          stagger: {
            each: 0.05,
            from: "random",
          },
        },
        "+=0.5"
      );

      // Vanish tagline_2
      tl.to(
        ".tagline2 span",
        {
          opacity: 0,
          stagger: {
            each: 0.05,
            from: "random",
          },
          onComplete: () => {
            setShowTagline2(false);
            setShowRest(true);
          },
        },
        "+=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLargeScreen]);

  // Animate the rest of the content Only on Large Screens
  useLayoutEffect(() => {
    if (!isLargeScreen) return; // Do not run animations on small screens

    if (showRest) {
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
  }, [showRest, isLargeScreen]);

  // Function to render letters individually for animation
  const renderLetters = (name: string) => {
    if (!name) return null;

    return name.split("").map((char, index) => (
      <span key={index} className="inline-block opacity-0">
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  // Fallback for Small Screens
  if (isLargeScreen === false) {
    return (
      <div
        className="w-full h-screen bg-slate-900 flex items-center justify-center"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-white text-lg text-center px-4">
          Please view on a larger screen.
        </p>
      </div>
    );
  }

  // While screen size is being determined, render nothing or a loader
  if (isLargeScreen === null) {
    return null;
  }

  return (
    <div ref={containerRef}>
      {showRest && (
        <nav className="mt-6 mx-6 md:mx-9 topBar flex items-center opacity-0">
          <img src="/logo.png" alt="Logo" className="w-20" />
          <div className="p-2 px-4 flex rounded-lg shadow-lg justify-between items-center">
            <h2 className="font-bold text-2xl">Ace-X</h2>
          </div>
        </nav>
      )}
      <div className="px-6 md:px-16">
        <h1 className="text-center text-[clamp(2rem,10vmin,10rem)] font-bold leading-none">
          {showTagline1 && (
            <span className="tagline1 block italic">
              {renderLetters("Rise Above the Rest")}
            </span>
          )}
          {showTagline2 && (
            <span className="tagline2 italic tracking-wider">
              {renderLetters("Defy Gravity")}
            </span>
          )}
        </h1>
        {showRest && (
          <div className="restContent grid min-h-[80vh] grid-cols-1 md:grid-cols-2 items-center opacity-0">
            <ViewCanvas />
            <section className="col-start-1 md:row-start-1">
              <OnboardForm />
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboard;
