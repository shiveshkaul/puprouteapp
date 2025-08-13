import React, { useEffect, useRef } from 'react';

interface LatLng {
  lat: number;
  lng: number;
}

interface LiveWalkMapProps {
  apiKey: string;
  route: LatLng[];
  walkerLocation?: LatLng;
  petLocation?: LatLng;
  height?: string;
  width?: string;
}

const LiveWalkMap: React.FC<LiveWalkMapProps> = ({
  apiKey,
  route,
  walkerLocation,
  petLocation,
  height = '400px',
  width = '100%'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const routePolyline = useRef<google.maps.Polyline | null>(null);
  const walkerMarker = useRef<google.maps.Marker | null>(null);
  const petMarker = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = () => {
        initializeMap();
      };
      document.body.appendChild(script);
    } else {
      initializeMap();
    }
    // eslint-disable-next-line
  }, [apiKey]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: route.length > 0 ? route[0] : { lat: 40.7128, lng: -74.006 },
      zoom: 15,
      mapTypeId: 'roadmap',
    });
    drawRoute();
    addMarkers();
  };

  useEffect(() => {
    if (mapInstance.current) {
      drawRoute();
      addMarkers();
    }
    // eslint-disable-next-line
  }, [route, walkerLocation, petLocation]);

  const drawRoute = () => {
    if (!mapInstance.current || route.length === 0) return;
    if (routePolyline.current) {
      routePolyline.current.setMap(null);
    }
    routePolyline.current = new window.google.maps.Polyline({
      path: route,
      geodesic: true,
      strokeColor: '#4285F4',
      strokeOpacity: 0.8,
      strokeWeight: 5,
    });
    routePolyline.current.setMap(mapInstance.current);
    mapInstance.current.setCenter(route[route.length - 1]);
  };

  const addMarkers = () => {
    if (!mapInstance.current) return;
    if (walkerLocation) {
      if (walkerMarker.current) walkerMarker.current.setMap(null);
      walkerMarker.current = new window.google.maps.Marker({
        position: walkerLocation,
        map: mapInstance.current,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        title: 'Walker',
      });
    }
    if (petLocation) {
      if (petMarker.current) petMarker.current.setMap(null);
      petMarker.current = new window.google.maps.Marker({
        position: petLocation,
        map: mapInstance.current,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        title: 'Pet',
      });
    }
  };

  return <div ref={mapRef} style={{ height, width, borderRadius: '1rem', overflow: 'hidden' }} />;
};

export default LiveWalkMap;
