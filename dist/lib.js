"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getGoogleMap;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var GoogleMapSDK = function GoogleMapSDK(google) {
  var _this = this;

  _defineProperty(this, "addListener", function (ref, event, cb) {
    _this.google.maps.event.addListener(ref, event, cb);
  });

  _defineProperty(this, "addListenerOnce", function (ref, event, cb) {
    _this.google.maps.event.addListenerOnce(ref, event, cb);
  });

  _defineProperty(this, "createMap", function (ref, options) {
    var map = new _this.google.maps.Map(ref, options);
    _this.map = map;
    return map;
  });

  _defineProperty(this, "getMap", function () {
    return _this.map;
  });

  _defineProperty(this, "createMarker", function (options) {
    return new _this.google.maps.Marker(_extends({}, options, {
      map: _this.getMap()
    }));
  });

  _defineProperty(this, "createInfoWindow", function (options) {
    return new _this.google.maps.InfoWindow(_extends({}, options, {
      map: _this.getMap()
    }));
  });

  _defineProperty(this, "createLatLng", function (lat, lng) {
    return new _this.google.maps.LatLng(lat, lng);
  });

  _defineProperty(this, "createBound", function (latlngList) {
    if (latlngList === void 0) {
      latlngList = [];
    }

    var bounds = new _this.google.maps.LatLngBounds();
    latlngList.forEach(function (latlng) {
      bounds.extend(_this.createLatLng(latlng.lat, latlng.lng));
    });

    _this.getMap().fitBounds(bounds);
  });

  _defineProperty(this, "getAutocomplete", function (input) {
    var sessionToken = new _this.google.maps.places.AutocompleteSessionToken();
    return new Promise(function (resolve, reject) {
      _this.autocompleteService.getQueryPredictions({
        input: input,
        sessionToken: sessionToken
      }, function (predictions, status) {
        if (status === "OK") resolve(predictions);else reject(status);
      });
    });
  });

  _defineProperty(this, "getRoute", function (options) {
    return new Promise(function (resolve, reject) {
      _this.directionsService.route(options, function (res) {
        if (res && res.status === "OK") {
          resolve(res);
        } else reject(status);
      });
    });
  });

  _defineProperty(this, "renderRoute", function (map, route) {
    _this.directionsDisplay.setMap(map);

    _this.directionsDisplay.setDirections(route);
  });

  _defineProperty(this, "clearRoute", function () {
    _this.directionsDisplay.setMap(null);
  });

  _defineProperty(this, "getDistanceMatrix", function (options) {
    return new Promise(function (resolve, reject) {
      _this.distanceMatrixService.getDistanceMatrix(options, function (res, status) {
        if (status === "OK") resolve(res);else reject(status);
      });
    });
  });

  _defineProperty(this, "getAddressComponent", function (addressComponents, type) {
    var ac = addressComponents.find(function (ac) {
      return ac.types.findIndex(function (t) {
        return t === type;
      }) !== -1;
    });
    if (ac) return ac.short_name;
    return null;
  });

  _defineProperty(this, "getFullAddress", function (options) {
    return new Promise(function (resolve, reject) {
      if (!options.componentRestrictions) options.componentRestrictions = {};

      _this.geocoder.geocode(options, function (res, status) {
        if (status === "OK") {
          resolve(res.map(function (route) {
            var streetNumber = _this.getAddressComponent(route.address_components, "street_number");

            var street = _this.getAddressComponent(route.address_components, "route");

            var district = _this.getAddressComponent(route.address_components, "administrative_area_level_2");

            var city = _this.getAddressComponent(route.address_components, "administrative_area_level_1");

            var formattedAddress = "";
            if (streetNumber) formattedAddress = streetNumber;
            if (street) formattedAddress += " " + street; // if (city) formattedAddress += (', ' + city);

            var geometry = null;

            if (route.geometry && route.geometry.location) {
              geometry = {
                location: {
                  lng: route.geometry.location.lng,
                  lat: route.geometry.location.lat
                }
              };
            }

            return {
              streetNumber: streetNumber,
              street: street,
              district: district,
              city: city,
              geometry: geometry,
              formattedAddress: formattedAddress
            };
          }));
        }

        reject();
      });
    });
  });

  this.google = google;
  this.directionsDisplay = new this.google.maps.DirectionsRenderer();
  this.directionsService = new this.google.maps.DirectionsService();
  this.distanceMatrixService = new this.google.maps.DistanceMatrixService();
  this.autocompleteService = new this.google.maps.places.AutocompleteService();
  this.geocoder = new this.google.maps.Geocoder();
};

function injectMapSDK(MAP_KEY) {
  var injectMapSDKPromise = null;
  if (!injectMapSDKPromise) injectMapSDKPromise = new Promise(function (resolve) {
    if (!window.google || !window.google.maps) {
      window.injectMapSDKCallBack = function () {
        delete window.injectMapSDKCallBack;
        resolve();
      };

      var scriptElement = document.createElement("script");
      scriptElement.type = "text/javascript";
      scriptElement.async = true;
      scriptElement.src = "https://maps.googleapis.com/maps/api/js?key=" + MAP_KEY + "&libraries=places&language=vi&region=VN&callback=injectMapSDKCallBack";
      document.body.appendChild(scriptElement);
    } else {
      resolve();
    }
  });
  return injectMapSDKPromise;
}

function getGoogleMap(MAP_KEY) {
  var _instance;

  return regeneratorRuntime.async(function getGoogleMap$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(injectMapSDK(MAP_KEY));

        case 2:
          if (!(!window.google || !window.google.maps)) {
            _context.next = 4;
            break;
          }

          throw new Error("Cannot inject Google Map SDK!");

        case 4:
          _instance = null;
          if (!_instance) _instance = new GoogleMapSDK(window.google);
          return _context.abrupt("return", _instance);

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
}