class GoogleMapSDK {
  constructor(google) {
    this.google = google;

    this.directionsDisplay = new this.google.maps.DirectionsRenderer();
    this.directionsService = new this.google.maps.DirectionsService();
    this.distanceMatrixService = new this.google.maps.DistanceMatrixService();
    this.autocompleteService = new this.google.maps.places.AutocompleteService();
    this.geocoder = new this.google.maps.Geocoder();
  }

  addListener = (ref, event, cb) => {
    this.google.maps.event.addListener(ref, event, cb);
  };

  addListenerOnce = (ref, event, cb) => {
    this.google.maps.event.addListenerOnce(ref, event, cb);
  };

  createMap = (ref, options) => {
    const map = new this.google.maps.Map(ref, options);
    this.map = map;
    return map;
  };

  getMap = () => {
    return this.map;
  };

  createMarker = options => {
    return new this.google.maps.Marker({ ...options, map: this.getMap() });
  };

  createInfoWindow = options => {
    return new this.google.maps.InfoWindow({ ...options, map: this.getMap() });
  };

  createLatLng = (lat, lng) => {
    return new this.google.maps.LatLng(lat, lng);
  };

  createBound = (latlngList = []) => {
    const bounds = new this.google.maps.LatLngBounds();
    latlngList.forEach(latlng => {
      bounds.extend(this.createLatLng(latlng.lat, latlng.lng));
    });

    this.getMap().fitBounds(bounds);
  };

  getAutocomplete = input => {
    const sessionToken = new this.google.maps.places.AutocompleteSessionToken();
    return new Promise((resolve, reject) => {
      this.autocompleteService.getQueryPredictions(
        { input, sessionToken },
        (predictions, status) => {
          if (status === "OK") resolve(predictions);
          else reject(status);
        }
      );
    });
  };

  getRoute = options => {
    return new Promise((resolve, reject) => {
      this.directionsService.route(options, res => {
        if (res && res.status === "OK") {
          resolve(res);
        } else reject(status);
      });
    });
  };

  renderRoute = (map, route) => {
    this.directionsDisplay.setMap(map);
    this.directionsDisplay.setDirections(route);
  };
  clearRoute = () => {
    this.directionsDisplay.setMap(null);
  };
  getDistanceMatrix = options => {
    return new Promise((resolve, reject) => {
      this.distanceMatrixService.getDistanceMatrix(options, (res, status) => {
        if (status === "OK") resolve(res);
        else reject(status);
      });
    });
  };

  getAddressComponent = (addressComponents, type) => {
    const ac = addressComponents.find(ac => {
      return ac.types.findIndex(t => t === type) !== -1;
    });
    if (ac) return ac.short_name;
    return null;
  };

  getFullAddress = options => {
    return new Promise((resolve, reject) => {
      if (!options.componentRestrictions) options.componentRestrictions = {};

      this.geocoder.geocode(options, (res, status) => {
        if (status === "OK") {
          resolve(
            res.map(route => {
              const streetNumber = this.getAddressComponent(
                route.address_components,
                "street_number"
              );
              const street = this.getAddressComponent(
                route.address_components,
                "route"
              );
              const district = this.getAddressComponent(
                route.address_components,
                "administrative_area_level_2"
              );
              const city = this.getAddressComponent(
                route.address_components,
                "administrative_area_level_1"
              );
              let formattedAddress = "";

              if (streetNumber) formattedAddress = streetNumber;
              if (street) formattedAddress += " " + street;
              // if (city) formattedAddress += (', ' + city);

              let geometry = null;
              if (route.geometry && route.geometry.location) {
                geometry = {
                  location: {
                    lng: route.geometry.location.lng,
                    lat: route.geometry.location.lat
                  }
                };
              }
              return {
                streetNumber,
                street,
                district,
                city,
                geometry,
                formattedAddress
              };
            })
          );
        }
        reject();
      });
    });
  };
}

function injectMapSDK(MAP_KEY) {
  let injectMapSDKPromise = null;

  if (!injectMapSDKPromise)
    injectMapSDKPromise = new Promise(resolve => {
      if (!window.google || !window.google.maps) {
        window.injectMapSDKCallBack = () => {
          delete window.injectMapSDKCallBack;
          resolve();
        };
        const scriptElement = document.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.async = true;
        scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_KEY}&libraries=places&language=vi&region=VN&callback=injectMapSDKCallBack`;
        document.body.appendChild(scriptElement);
      } else {
        resolve();
      }
    });

  return injectMapSDKPromise;
}

export default async function getGoogleMap(MAP_KEY) {
  await injectMapSDK(MAP_KEY);
  if (!window.google || !window.google.maps)
    throw new Error("Cannot inject Google Map SDK!");

  let _instance = null;
  if (!_instance) _instance = new GoogleMapSDK(window.google);
  return _instance;
}
