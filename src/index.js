import React, { useEffect, useRef, useState } from "react";

import ReactDOM from "react-dom";
import getGoogleMap from "./lib";

export function Gmap(props) {
  const [googleMap, setGoogleMap] = useState();
  const ref = useRef();
  useEffect(() => {
    getGoogleMap(props.mapKey).then(map => {
      setGoogleMap(map);
      map.createGoogleMap(ref.current, {
        zoom: 18,
        center: { lat: 0, lng: 0 }
      });
    });
  }, []);

  useEffect(() => {}, [googleMap]);

  return <div ref={ref} className="map-container" style={props.style}></div>;
}

let nodes = [];
export const GmapDOM = {
  render: (props, targetNode) => {
    const component = <Gmap {...props} />;
    nodes.push(component);
    ReactDOM.render(component, targetNode);
    return component;
  },
  unmount: node => {
    ReactDOM.unmountComponentAtNode(node);
  },
  unmountAll: () => {
    nodes.forEach(node => ReactDOM.unmountComponentAtNode(node));
    nodes = [];
  }
};
