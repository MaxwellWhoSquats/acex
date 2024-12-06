import React, { useEffect, useState } from "react";
import { gsap } from "gsap";

interface CardProps {
  cardName: string;
  person: string;
  index: number;
  animate?: boolean;
  boardSize: {
    width: number;
    height: number;
  };
}

const Card = ({ cardName, person, index, animate, boardSize }: CardProps) => {
  const [face, setFace] = useState("/textures/faces/cardback.png");

  useEffect(() => {
    if (animate && boardSize.width && boardSize.height) {
      const cardSelector = `#${person}-card-${index}`;

      // Percentage offsets depending on person type
      const percentageOffsets: { [key: string]: number } = {
        player: 0.1,
        dealer: -0.4,
      };

      const offsetPercentage = percentageOffsets[person] || 0;

      // Calculate targetY based on the center plus the percentage offset
      const targetY =
        boardSize.height / 2 + boardSize.height * offsetPercentage;

      const targetX = -(boardSize.width / 2 - 64);

      const timeline = gsap.timeline({
        onComplete: () => {},
      });

      timeline
        .fromTo(
          cardSelector,
          { x: 0, y: 0, opacity: 0 },
          { x: targetX, y: targetY, opacity: 1, duration: 0.5 }
        )
        .to(cardSelector, { rotateY: 90, duration: 0.2, ease: "power3.out" })
        .add(() => {
          setFace(`/textures/faces/${cardName}.png`);
        })
        .to(cardSelector, { rotateY: 0, duration: 0.2, ease: "power3.out" });
    }
  }, [animate, cardName, person, index, boardSize]);

  return (
    <div id={`${person}-card-${index}`} className="top-0 right-0 absolute">
      <img src={face} alt={cardName} className="w-32 transform" />
    </div>
  );
};

export default Card;
