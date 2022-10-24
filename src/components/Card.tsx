import React from "react";
import { v4 } from "uuid";
import { TAtom, useBusState } from "../StateBus";

export const Card: React.FC<unknown> = () => {
  const [isActive, publish, atom] = useBusState("cards", false);

  const handleClick = () => {
    atom().setState(true);
    publish((channel: Record<string, TAtom<boolean>>) => {
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
      key={v4()}
      onClick={handleClick}
    ></div>
  );
};
