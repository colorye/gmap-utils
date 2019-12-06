"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Gmap = Gmap;
exports.GmapDOM = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _geoIcon = _interopRequireDefault(require("./assets/images/geo-icon.png"));

var _lib = _interopRequireDefault(require("./lib"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

function updateMarkers(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
    googleMap = _ref.googleMap,
    _ref$markers = _ref.markers,
    markers = _ref$markers === void 0 ? [] : _ref$markers,
    _ref$propsMarkers = _ref.propsMarkers,
    propsMarkers = _ref$propsMarkers === void 0 ? [] : _ref$propsMarkers;

  if (!googleMap) return markers;
  markers.forEach(function(srcMarker) {
    srcMarker.marker.setMap(null);
  });
  propsMarkers.forEach(function(srcMarker, index) {
    var marker = markers[index];

    if (marker) {
      marker.marker.setPosition({
        lat: srcMarker.lat,
        lng: srcMarker.lng
      });
      marker.marker.setMap(googleMap.getMap());
    } else {
      markers.push({
        marker: googleMap.createMarker({
          icon: srcMarker.icon,
          position: {
            lat: srcMarker.lat,
            lng: srcMarker.lng
          }
        }),
        info: googleMap.createInfoWindow({
          content: "<div>" + srcMarker.info + "</div>"
        }) // circle: googleMap.createCircle(),
      });
    }
  });
  return markers;
}

function useGeoPosition(highAccuracy) {
  if (highAccuracy === void 0) {
    highAccuracy = false;
  }

  var _useState = (0, _react.useState)(),
    position = _useState[0],
    setPosition = _useState[1];

  var _useState2 = (0, _react.useState)(),
    error = _useState2[0],
    setError = _useState2[1];

  (0, _react.useEffect)(function() {
    var watch = navigator.geolocation.watchPosition(setPosition, setError, {
      enableHighAccuracy: highAccuracy,
      timeout: 5000
    });
    return function() {
      return navigator.geolocation.clearWatch(watch);
    };
  }, []);
  return [position, error];
}

function Gmap(props) {
  var _useState3 = (0, _react.useState)(),
    googleMap = _useState3[0],
    setGoogleMap = _useState3[1];

  var _useState4 = (0, _react.useState)([]),
    markers = _useState4[0],
    setMarkers = _useState4[1];

  var _useGeoPosition = useGeoPosition(true),
    geoLocation = _useGeoPosition[0],
    geoLocationError = _useGeoPosition[1];

  var _useState5 = (0, _react.useState)({}),
    geoMarker = _useState5[0],
    setGeoMarker = _useState5[1];

  var ref = (0, _react.useRef)(); // Get googleMap

  (0, _react.useEffect)(function() {
    (0, _lib.default)(props.mapKey).then(function(map) {
      map.createMap(ref.current, {
        zoom: 18,
        center: props.center || {
          lat: 0,
          lng: 0
        },
        clickableIcons: false,
        disableDefaultUI: true
      });
      setGoogleMap(map);
    });
  }, []); // Render marker

  (0, _react.useEffect)(
    function() {
      if (googleMap) {
        var newMarkers = updateMarkers({
          googleMap: googleMap,
          markers: markers,
          propsMarkers: props.markers
        });
        setMarkers(newMarkers);
        googleMap.createBound(props.markers);
      }
    },
    [googleMap, props.markers]
  ); // Render info

  (0, _react.useEffect)(
    function() {
      if (googleMap) {
        markers.map(function(srcMarker, index) {
          if (props.markers[index] && props.markers[index].showInfo)
            srcMarker.info.open(googleMap, srcMarker.marker);
          else srcMarker.info.close();
        });
      }
    },
    [googleMap, props.markers, markers]
  ); // Render current location

  (0, _react.useEffect)(
    function() {
      (function() {
        if (
          !googleMap ||
          !props.showGeoLocation ||
          !geoLocation ||
          !!geoLocationError
        ) {
          console.log("HELLO 1", geoLocation, geoLocationError);
          if (geoMarker.marker) geoMarker.marker.setMap(null);
          return;
        }

        console.log("HELLO 2");
        geoMarker.marker =
          geoMarker.marker ||
          googleMap.createMarker({
            position: {
              lat: 0,
              lng: 0
            }
          });
        geoMarker.marker.setMap(googleMap.getMap());
        geoMarker.marker.setPosition({
          lat: geoLocation.coords.latitude,
          lng: geoLocation.coords.longitude
        });
        setGeoMarker(geoMarker);
      })();
    },
    [googleMap, props.showGeoLocation, geoLocation, geoLocationError]
  );
  var onReCenter = (0, _react.useCallback)(
    function() {
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
    },
    [googleMap, props.showGeoLocation, geoLocation, geoLocationError]
  );
  return _react.default.createElement(
    "div",
    {
      className: "map-container",
      style: _extends({}, props.style, {
        position: "relative"
      })
    },
    _react.default.createElement("div", {
      ref: ref,
      id: "map",
      style: {
        width: "100%",
        height: "100%"
      }
    }),
    props.showGeoLocation &&
      _react.default.createElement(
        "span",
        {
          id: "geo-btn",
          style: {
            position: "absolute",
            top: 8,
            right: 8,
            lineHeight: 0,
            padding: 8
          },
          onClick: onReCenter
        },
        _react.default.createElement("img", {
          src: _geoIcon.default,
          width: 32
        })
      )
  );
}

Gmap.defaultProps = {
  markers: [],
  routes: []
};
var nodes = [];
var GmapDOM = {
  render: function render(props, targetNode) {
    var component = _react.default.createElement(Gmap, props);

    nodes.push(component);

    _reactDom.default.render(component, targetNode);

    return component;
  },
  unmount: function unmount(node) {
    _reactDom.default.unmountComponentAtNode(node);
  },
  unmountAll: function unmountAll() {
    nodes.forEach(function(node) {
      return _reactDom.default.unmountComponentAtNode(node);
    });
    nodes = [];
  }
};
exports.GmapDOM = GmapDOM;
