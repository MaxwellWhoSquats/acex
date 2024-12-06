import React, { useEffect, useState } from "react";
import { gsap } from "gsap";

interface CardProps {
  cardName: string;
  person: "player" | "dealer";
  index: number;
  animate?: boolean;
  boardSize: {
    width: number;
    height: number;
  };
  delay?: number;
}

const Card = ({
  cardName,
  person,
  index,
  animate,
  boardSize,
  delay,
}: CardProps) => {
  const [face, setFace] = useState("/textures/faces/cardback.png");

  useEffect(() => {
    if (animate && boardSize.width && boardSize.height) {
      const cardSelector = `#${person}-card-${index}`;
      setFace("/textures/faces/cardback.png");

      // Percentage offsets depending on person type
      const percentageOffsets: { [key: string]: number } = {
        player: 0.1,
        dealer: -0.4,
      };

      const VERTICAL_OFFSET_PERCENTAGE = percentageOffsets[person] || 0;

      const INDEX_OFFSET_X = 0.03;
      const INDEX_OFFSET_Y = 0.03;

      // Calculate targetY based on the center plus the percentage offset
      const targetY =
        boardSize.height / 2 +
        boardSize.height * VERTICAL_OFFSET_PERCENTAGE +
        index * boardSize.height * INDEX_OFFSET_Y;

      const targetX =
        -(boardSize.width / 2 - 24) + index * boardSize.width * INDEX_OFFSET_X;

      const isDealerFaceDownCard = person === "dealer" && index === 1;

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
        cardSelector,
        { x: 0, y: 0, opacity: 0 },
        { x: targetX, y: targetY, opacity: 1, duration: 0.5 }
      );

      if (!isDealerFaceDownCard) {
        // If not the dealer's second card, perform the flip animation
        timeline
          .to(cardSelector, { rotateY: 90, duration: 0.2, ease: "power3.out" })
          .add(() => {
            setFace(`/textures/faces/${cardName}.png`); // Reveal card face
          })
          .to(cardSelector, { rotateY: 0, duration: 0.2, ease: "power3.out" });
      }
    }
  }, [animate, cardName, person, index, delay]);

  return (
    <div id={`${person}-card-${index}`} className="top-0 right-0 absolute">
      <img src={face} alt={cardName} className="w-24 transform" />
    </div>
  );
};

export default Card;
