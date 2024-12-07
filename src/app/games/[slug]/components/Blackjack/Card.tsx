// Card.tsx
import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

interface CardProps {
  card: {
    id: string;
    name: string;
  };
  person: "player" | "dealer";
  index: number;
  boardSize: {
    width: number;
    height: number;
  };
  delay?: number;
  flipDealerCard?: boolean;
}

const Card = React.memo(
  ({
    card,
    person,
    index,
    boardSize,
    delay = 0,
    flipDealerCard,
  }: CardProps) => {
    const [face, setFace] = useState("/textures/faces/cardback.png");
    const cardRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
      if (
        !hasAnimated.current &&
        boardSize.width &&
        boardSize.height &&
        cardRef.current
      ) {
        hasAnimated.current = true;

        setFace("/textures/faces/cardback.png");

        // Percentage offsets depending on person type
        const percentageOffsets: { [key: string]: number } = {
          player: 0.1,
          dealer: -0.4,
        };

        const VERTICAL_OFFSET_PERCENTAGE = percentageOffsets[person] || 0;

        const INDEX_OFFSET_X = 0.03;
        const INDEX_OFFSET_Y = 0.03;

        // Calculate target positions based on board size and index
        const targetY =
          boardSize.height / 2 +
          boardSize.height * VERTICAL_OFFSET_PERCENTAGE +
          index * boardSize.height * INDEX_OFFSET_Y;

        const targetX =
          -(boardSize.width / 2 - 24) +
          index * boardSize.width * INDEX_OFFSET_X;

        const isDealerFaceDownCard = person === "dealer" && index === 1;

        // ANIMATION -----------------------------------------------------------
        const timeline = gsap.timeline({
          delay,
          onStart: () => {
            const dealSound = new Audio("/sounds/dealSound.ogg");
            dealSound.volume = 0.2;
            dealSound.play().catch((error: any) => {
              console.error("Error playing deal sound", error);
            });
          },
          onComplete: () => {},
        });

        timeline.fromTo(
          cardRef.current,
          { x: 0, y: 0, opacity: 0 },
          { x: targetX, y: targetY, opacity: 1, duration: 0.5 }
        );

        if (!isDealerFaceDownCard) {
          // If not the dealer's second card, perform the flip animation
          timeline
            .to(cardRef.current, {
              rotateY: 90,
              duration: 0.2,
              ease: "power3.out",
            })
            .add(() => {
              setFace(`/textures/faces/${card.name}.png`); // Reveal card face
            })
            .to(cardRef.current, {
              rotateY: 0,
              duration: 0.2,
              ease: "power3.out",
            });
        }
      }
    }, [boardSize, card.name, person, index, delay]);

    useEffect(() => {
      if (flipDealerCard) {
        const flipSound = new Audio("/sounds/dealSound.ogg");
        flipSound.volume = 0.2;
        const timeline = gsap.timeline({
          onStart: () => {
            flipSound.play().catch((error: any) => {
              console.error("Error playing flip sound", error);
            });
          },
        });

        timeline
          .to(cardRef.current, {
            rotateY: 90,
            duration: 0.2,
            ease: "power3.out",
          })
          .add(() => {
            setFace(`/textures/faces/${card.name}.png`);
          })
          .to(cardRef.current, {
            rotateY: 0,
            duration: 0.2,
            ease: "power3.out",
          });
      }
    }, [flipDealerCard, card.name]);

    return (
      <div ref={cardRef} className="absolute top-0 right-0">
        <img src={face} alt={card.name} className="w-24 transform" />
      </div>
    );
  }
);

export default Card;
