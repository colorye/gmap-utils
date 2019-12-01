class GoogleMapSDK {
  constructor(google) {
    this.google = google;

    this.directionsDisplay = new this.google.maps.DirectionsRenderer();
    this.directionsService = new this.google.maps.DirectionsService();

    this.distanceMatrixService = new this.google.maps.DistanceMatrixService();

    this.autocompleteService = new this.google.maps.places.AutocompleteService();
    this.geocoder = new this.google.maps.Geocoder();
  }

  /**
   * render
   * - map, marker, infowindow, polyline, circle
   *
   * route: direction service + renderer
   * autocomplete: autocomplete service
   * geocoder: get full address from address/latlng
   *
   * animation
   * - route: animate path
   * - circle: animation spread
   * - init map / change route/latlng: smooth bounding
   */

  addListener = (ref, event, cb) => {
    this.google.maps.event.addListener(ref, event, cb);
  };

  addListenerOnce = (ref, event, cb) => {
    this.google.maps.event.addListenerOnce(ref, event, cb);
  };

  createGoogleMap = (ref, options) => {
    return new this.google.maps.Map(ref, options);
  };

  createMarker = options => {
    return new this.google.maps.Marker(options);
  };

  createInfoWindow = options => {
    return new this.google.maps.InfoWindow(options);
  };

  createIcon = options => {
    const { size = 8 } = options;

    return new this.google.maps.Icon({
      origin: null,
      anchor: null,
      ...options,
      size: new this.google.maps.Size(size, size),
      scaleSize: new this.google.maps.Size(size, size)
    });
  };

  createLatLng = (lat, lng) => {
    return new this.google.maps.LatLng(lat, lng);
  };

  createLatLngBounds = () => {
    return new this.google.maps.LatLngBounds();
  };

  getAutocomplete = text => {
    const sessionToken = new this.google.maps.places.AutocompleteSessionToken();
    return new Promise((resolve, reject) => {
      this.autocompleteService.getQueryPredictions(
        { input: text, sessionToken },
        (predictions, status) => {
          if (status === "OK") {
            resolve(predictions);
          } else reject(status);
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

function injectMapSDK() {
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
        scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${window.__MAP_KEY__}&libraries=places&language=vi&region=VN&callback=injectMapSDKCallBack`;
        document.body.appendChild(scriptElement);
      } else {
        resolve();
      }
    });

  return injectMapSDKPromise;
}

export async function getGoogleMap() {
  await injectMapSDK();
  if (!window.google || !window.google.maps)
    throw new Error("Cannot inject Google Map SDK!");

  let _instance = null;
  if (!_instance) _instance = new GoogleMapSDK(window.google);
  return _instance;
}
