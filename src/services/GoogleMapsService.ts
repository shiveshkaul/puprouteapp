// Comprehensive Google Maps API Service - ALL APIs Integrated
class GoogleMapsService {
  private apiKey = 'AIzaSyAlY5Q1LZkbXGsz-BO0amHcceQpa_HeaCo';

  // 1. GEOLOCATION API - Get real device location
  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // 2. GEOCODING API - Convert coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
    );
    const data = await response.json();
    return data.results[0]?.formatted_address || 'Unknown location';
  }

  // 3. DIRECTIONS API - Get walking routes
  async getWalkingDirections(start: { lat: number; lng: number }, end: { lat: number; lng: number }) {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&mode=walking&key=${this.apiKey}`
    );
    return await response.json();
  }

  // 4. PLACES API - Find dog-friendly places
  async findNearbyDogPlaces(location: { lat: number; lng: number }, radius: number = 1000) {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=park&keyword=dog&key=${this.apiKey}`
    );
    return await response.json();
  }

  // 5. ROUTES API - Optimized walking routes
  async getOptimizedWalkRoute(waypoints: { lat: number; lng: number }[]) {
    const waypointsStr = waypoints.map(p => `${p.lat},${p.lng}`).join('|');
    const response = await fetch(
      `https://routes.googleapis.com/directions/v2:computeRoutes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
        },
        body: JSON.stringify({
          origin: { location: { latLng: waypoints[0] } },
          destination: { location: { latLng: waypoints[waypoints.length - 1] } },
          intermediates: waypoints.slice(1, -1).map(p => ({ location: { latLng: p } })),
          travelMode: 'WALK',
          routingPreference: 'TRAFFIC_UNAWARE',
          computeAlternativeRoutes: false
        })
      }
    );
    return await response.json();
  }

  // 6. AIR QUALITY API
  async getAirQuality(location: { lat: number; lng: number }) {
    const response = await fetch(
      `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            latitude: location.lat,
            longitude: location.lng
          }
        })
      }
    );
    return await response.json();
  }

  // 7. WEATHER API
  async getWeatherData(location: { lat: number; lng: number }) {
    // Note: Weather API might need different endpoint
    const response = await fetch(
      `https://weather.googleapis.com/v1/currentConditions:lookup?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            latitude: location.lat,
            longitude: location.lng
          }
        })
      }
    );
    return await response.json();
  }

  // 8. POLLEN API
  async getPollenData(location: { lat: number; lng: number }) {
    const response = await fetch(
      `https://pollen.googleapis.com/v1/forecast:lookup?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            latitude: location.lat,
            longitude: location.lng
          },
          days: 1
        })
      }
    );
    return await response.json();
  }

  // 9. STREET VIEW STATIC API
  getStreetViewImage(location: { lat: number; lng: number }, heading: number = 0) {
    return `https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${location.lat},${location.lng}&heading=${heading}&pitch=0&key=${this.apiKey}`;
  }

  // 10. TIME ZONE API
  async getTimeZone(location: { lat: number; lng: number }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=${timestamp}&key=${this.apiKey}`
    );
    return await response.json();
  }

  // 11. ROADS API - Snap GPS points to roads
  async snapToRoads(path: { lat: number; lng: number }[]) {
    const pathStr = path.map(p => `${p.lat},${p.lng}`).join('|');
    const response = await fetch(
      `https://roads.googleapis.com/v1/snapToRoads?path=${pathStr}&interpolate=true&key=${this.apiKey}`
    );
    return await response.json();
  }

  // 12. DISTANCE MATRIX API
  async getDistanceMatrix(origins: { lat: number; lng: number }[], destinations: { lat: number; lng: number }[]) {
    const originsStr = origins.map(p => `${p.lat},${p.lng}`).join('|');
    const destinationsStr = destinations.map(p => `${p.lat},${p.lng}`).join('|');
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&mode=walking&key=${this.apiKey}`
    );
    return await response.json();
  }
}

export const googleMapsService = new GoogleMapsService();
