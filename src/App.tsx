import React from "react";
import "./App.css";
import { Card } from "./components/Card";
import { useBusState } from "./StateBus";

function App() {
  const [root, publish] = useBusState("root", "");
  const handleClick = () => {
    publish((channel: Record<string, any>) => {
      Object.keys(channel).forEach((key) => {
        if (channel[key].state === true) {
          channel[key].setState(false);
        }
      });
    }, "cards");
  };
  return (
    <div className="App">
      <Card />
      <Card />
      <Card />
      <Card />
      <button onClick={handleClick}>Erase</button>
    </div>
  );
}

export default App;
