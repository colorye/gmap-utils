import React, { useCallback, useEffect, useRef, useState } from "react";

import ReactDOM from "react-dom";
import geoIcon from "./assets/images/geo-icon.png";
import getGoogleMap from "./lib";

function updateMarkers({ googleMap, markers = [], propsMarkers = [] } = {}) {
  if (!googleMap) return markers;

  markers.forEach(srcMarker => srcMarker.marker.setMap(null));
  propsMarkers.forEach((srcMarker, index) => {
    const marker = markers[index];
    if (marker) {
      marker.marker.setPosition({ lat: srcMarker.lat, lng: srcMarker.lng });
      marker.marker.setMap(googleMap.getMap());
      return;
    }

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
  });

  return markers;
}

function useGeoPosition(highAccuracy = false) {
  const [position, setPosition] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(setPosition, setError, {
      enableHighAccuracy: highAccuracy,
      timeout: 5000
    });
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  return [position, error];
}

export function Gmap(props) {
  const [googleMap, setGoogleMap] = useState();
  const [markers, setMarkers] = useState([]);

  const [geoLocation, geoLocationError] = useGeoPosition(true);
  const [geoMarker, setGeoMarker] = useState({});

  const ref = useRef();

  // Get googleMap
  useEffect(() => {
    getGoogleMap(props.mapKey).then(map => {
      map.createMap(ref.current, {
        zoom: 18,
        center: props.center || { lat: 0, lng: 0 },
        clickableIcons: false,
        disableDefaultUI: true
      });
      setGoogleMap(map);
    });
  }, []);

  // Render marker
  useEffect(() => {
    if (googleMap) {
      const newMarkers = updateMarkers({
        googleMap,
        markers,
        propsMarkers: props.markers
      });
      setMarkers(newMarkers);

      googleMap.createBound(props.markers);
    }
  }, [googleMap, props.markers]);

  // Render info
  useEffect(() => {
    if (googleMap) {
      markers.map((srcMarker, index) => {
        if (props.markers[index] && props.markers[index].showInfo)
          srcMarker.info.open(googleMap, srcMarker.marker);
        else srcMarker.info.close();
      });
    }
  }, [googleMap, props.markers, markers]);

  // Render current location
  useEffect(() => {
    (function() {
      if (
        !googleMap ||
        !props.showGeoLocation ||
        !geoLocation ||
        !!geoLocationError
      ) {
        if (geoMarker.marker) geoMarker.marker.setMap(null);
        return;
      }

      geoMarker.marker =
        geoMarker.marker ||
        googleMap.createMarker({ position: { lat: 0, lng: 0 } });
      geoMarker.marker.setMap(googleMap.getMap());
      geoMarker.marker.setPosition({
        lat: geoLocation.coords.latitude,
        lng: geoLocation.coords.longitude
      });
      setGeoMarker(geoMarker);
    })();
  }, [googleMap, props.showGeoLocation, geoLocation, geoLocationError]);

  const onReCenter = useCallback(() => {
    if (
      !googleMap ||
      !props.showGeoLocation ||
      !geoLocation ||
      !!geoLocationError
    )
      return;

    googleMap.getMap().panTo({
      lat: geoLocation.coords.latitude,
      lng: geoLocation.coords.longitude
    });
  }, [googleMap, props.showGeoLocation, geoLocation, geoLocationError]);

  return (
    <div
      className="map-container"
      style={{ ...props.style, position: "relative" }}
    >
      <div ref={ref} id="map" style={{ width: "100%", height: "100%" }}></div>
      {props.showGeoLocation && (
        <span
          id="geo-btn"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            lineHeight: 0,
            padding: 8
          }}
          onClick={onReCenter}
        >
          <img src={geoIcon} width={32} />
        </span>
      )}
    </div>
  );
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
