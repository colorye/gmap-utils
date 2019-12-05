import "babel-polyfill";
import "./index.scss";

import { Gmap, GmapDOM } from "../dist";
import React, { useState } from "react";
import ReactDOM from "react-dom";

function App() {
  const [markers, setMarkers] = useState([
    { lat: 10.7880001, lng: 106.673132, info: "Ship here" }
  ]);

  const random = () => {
    const num = Math.floor(Math.random() * 10);
    const newMarkers = [...Array(num).keys()].map(i => ({
      lat: 10 + Math.random(),
      lng: 106 + Math.random(),
      info: "Ship here"
    }));

    setMarkers(newMarkers);
  };

  return (
    <div>
      <h2>Awesome Gmap</h2>
      <button onClick={random}>Click me to random position</button>
      <Gmap mapKey={process.env.MAP_KEY} markers={markers} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

// GmapDOM.render(
//   { mapKey: process.env.MAP_KEY },
//   document.getElementById("root")
// );
