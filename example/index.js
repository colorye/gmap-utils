import "babel-polyfill";
import "./index.scss";

import { Gmap, GmapDOM } from "../dist";
import React from "react";
import ReactDOM from "react-dom";

function App() {
  return (
    <div>
      <h2>Awesome Gmap</h2>
      <Gmap mapKey={process.env.MAP_KEY} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

// GmapDOM.render(
//   { mapKey: process.env.MAP_KEY },
//   document.getElementById("root")
// );
