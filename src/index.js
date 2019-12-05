import React, { useEffect, useRef, useState } from "react";

import ReactDOM from "react-dom";
import getGoogleMap from "./lib";

export function Gmap(props) {
  const [googleMap, setGoogleMap] = useState();
  const [markers, setMarkers] = useState([]);

  const ref = useRef();
  useEffect(() => {
    getGoogleMap(props.mapKey).then(map => {
      map.createMap(ref.current, {
        zoom: 18,
        center: props.center || { lat: 0, lng: 0 }
      });
      setGoogleMap(map);
    });
  }, []);

  useEffect(() => {
    if (googleMap) {
      markers.forEach(srcMarker => {
        srcMarker.marker.setMap(null);
      });

      props.markers.forEach((srcMarker, index) => {
        const marker = markers[index];
        if (marker) {
          marker.marker.setPosition({ lat: srcMarker.lat, lng: srcMarker.lng });
          marker.marker.setMap(googleMap.getMap());
        } else {
          markers.push({
            marker: googleMap.createMarker({
              icon: srcMarker.icon,
              position: { lat: srcMarker.lat, lng: srcMarker.lng }
            }),
            info: googleMap.createInfoWindow({
              content: `<div>${srcMarker.info}</div>`
            })
            // circle: googleMap.createCircle(),
          });
        }
      });

      setMarkers(markers);
      googleMap.createBound(props.markers);
    }
  }, [googleMap, props.markers]);

  // useEffect(() => {
  //   if (googleMap) {
  //     markers.map((srcMarker, index) => {
  //       if (props.markers[index].showInfo) srcMarker.info.close();
  //       else srcMarker.info.open(googleMap, srcMarker.marker);
  //     });
  //   }
  // }, [googleMap, props.markers, markers]);

  return <div ref={ref} className="map-container" style={props.style}></div>;
}
Gmap.defaultProps = {
  markers: [],
  routes: []
};

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
