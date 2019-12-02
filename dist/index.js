"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Gmap = Gmap;
exports.GmapDOM = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _lib = _interopRequireDefault(require("./lib"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function Gmap(props) {
  var _useState = (0, _react.useState)(),
      googleMap = _useState[0],
      setGoogleMap = _useState[1];

  var ref = (0, _react.useRef)();
  (0, _react.useEffect)(function () {
    (0, _lib.default)(props.mapKey).then(function (map) {
      setGoogleMap(map);
      map.createGoogleMap(ref.current, {
        zoom: 18,
        center: {
          lat: 0,
          lng: 0
        }
      });
    });
  }, []);
  return _react.default.createElement("div", {
    ref: ref,
    className: "map-container",
    style: props.style
  });
}

var nodes = [];
var GmapDOM = {
  render: function render(props, targetNode) {
    var component = _react.default.createElement(Gmap, props);

    nodes.push(component);

    _reactDom.default.render(component, targetNode);

    return component;
  }
};
exports.GmapDOM = GmapDOM;