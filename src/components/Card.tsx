import React from "react";
import { useBusState } from "../StateBus";

export const Card: React.FC<unknown> = () => {
  const [isActive, publish, atom] = useBusState("cards", false);

  const handleClick = () => {
    atom().setState(true);
    publish((channel: Record<string, any>) => {
      Object.keys(channel).forEach((issuer) => {
        if (channel[issuer].state === true) {
          channel[issuer].setState(false);
        }
      });
    }, "cards");
  };

  return (
    <div
      className={`card ${isActive && "active"}`}
      key={atom().key}
      onClick={handleClick}
    ></div>
  );
};
