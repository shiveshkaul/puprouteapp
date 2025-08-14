// Mock Google Maps for demo purposes
// This provides a working demo without requiring real API keys

interface MockLatLng {
  lat: number;
  lng: number;
}

interface MockMapOptions {
  center: MockLatLng;
  zoom: number;
  mapId?: string;
  gestureHandling?: string;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  fullscreenControl?: boolean;
  streetViewControl?: boolean;
  styles?: any[];
}

interface MockMarkerOptions {
  position: MockLatLng;
  map: MockMap;
  title?: string;
  icon?: any;
  zIndex?: number;
}

interface MockPolylineOptions {
  path: MockLatLng[];
  geodesic?: boolean;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  icons?: any[];
}

interface MockCircleOptions {
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  map: MockMap;
  center: MockLatLng;
  radius: number;
}

class MockMarker {
  private position: MockLatLng;
  private map: MockMap | null;
  private element: HTMLDivElement;
  
  constructor(options: MockMarkerOptions) {
    this.position = options.position;
    this.map = options.map;
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.transform = 'translate(-50%, -50%)';
    this.element.style.zIndex = (options.zIndex || 100).toString();
    
    if (options.icon && options.icon.url) {
      if (options.icon.url.startsWith('data:image/svg')) {
        this.element.innerHTML = decodeURIComponent(options.icon.url.split(',')[1]);
      } else {
        const img = document.createElement('img');
        img.src = options.icon.url;
        img.style.width = '24px';
        img.style.height = '24px';
        this.element.appendChild(img);
      }
    } else {
      this.element.innerHTML = '📍';
      this.element.style.fontSize = '20px';
    }
    
    if (this.map) {
      this.updatePosition();
      this.map.container.appendChild(this.element);
    }
  }
  
  setMap(map: MockMap | null) {
    if (this.map && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.map = map;
    
    if (this.map) {
      this.updatePosition();
      this.map.container.appendChild(this.element);
    }
  }
  
  private updatePosition() {
    if (!this.map) return;
    
    const containerRect = this.map.container.getBoundingClientRect();
    const centerLat = this.map.center.lat;
    const centerLng = this.map.center.lng;
    
    // Simple projection - in a real app you'd use proper map projection
    const x = ((this.position.lng - centerLng) * 100000) + (containerRect.width / 2);
    const y = ((centerLat - this.position.lat) * 100000) + (containerRect.height / 2);
    
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }
}

class MockPolyline {
  private path: MockLatLng[];
  private map: MockMap | null = null;
  private element: SVGElement;
  
  constructor(options: MockPolylineOptions) {
    this.path = options.path;
    
    // Create SVG polyline
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.element.style.position = 'absolute';
    this.element.style.top = '0';
    this.element.style.left = '0';
    this.element.style.width = '100%';
    this.element.style.height = '100%';
    this.element.style.pointerEvents = 'none';
    this.element.style.zIndex = '50';
    
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.style.fill = 'none';
    polyline.style.stroke = options.strokeColor || '#3B82F6';
    polyline.style.strokeWidth = (options.strokeWeight || 3).toString();
    polyline.style.strokeOpacity = (options.strokeOpacity || 1).toString();
    
    this.element.appendChild(polyline);
  }
  
  setMap(map: MockMap | null) {
    if (this.map && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.map = map;
    
    if (this.map) {
      this.updatePath();
      this.map.container.appendChild(this.element);
    }
  }
  
  private updatePath() {
    if (!this.map || this.path.length === 0) return;
    
    const polyline = this.element.querySelector('polyline');
    if (!polyline) return;
    
    const containerRect = this.map.container.getBoundingClientRect();
    const centerLat = this.map.center.lat;
    const centerLng = this.map.center.lng;
    
    const points = this.path.map(point => {
      const x = ((point.lng - centerLng) * 100000) + (containerRect.width / 2);
      const y = ((centerLat - point.lat) * 100000) + (containerRect.height / 2);
      return `${x},${y}`;
    }).join(' ');
    
    polyline.setAttribute('points', points);
  }
}

class MockCircle {
  constructor(options: MockCircleOptions) {
    // For demo purposes, we'll skip the circle implementation
    // In a real app, this would create a visual circle on the map
  }
  
  setMap(map: MockMap | null) {
    // Mock implementation
  }
}

class MockStreetViewPanorama {
  constructor(container: HTMLElement, options: any) {
    // Mock street view implementation
  }
  
  setPosition(position: MockLatLng) {
    // Mock implementation
  }
  
  setVisible(visible: boolean) {
    // Mock implementation
  }
}

class MockMap {
  public container: HTMLElement;
  public center: MockLatLng;
  public zoom: number;
  
  constructor(container: HTMLElement, options: MockMapOptions) {
    this.container = container;
    this.center = options.center;
    this.zoom = options.zoom;
    
    // Style the container to look like a map
    this.container.style.background = `
      linear-gradient(45deg, #f0f9ff 25%, #e0f2fe 25%),
      linear-gradient(-45deg, #f0f9ff 25%, #e0f2fe 25%),
      linear-gradient(45deg, #e0f2fe 75%, #f0f9ff 75%),
      linear-gradient(-45deg, #e0f2fe 75%, #f0f9ff 75%)
    `;
    this.container.style.backgroundSize = '20px 20px';
    this.container.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    
    // Add a demo overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.background = 'rgba(255, 255, 255, 0.9)';
    overlay.style.padding = '20px';
    overlay.style.borderRadius = '10px';
    overlay.style.textAlign = 'center';
    overlay.style.zIndex = '1000';
    overlay.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">🗺️</div>
      <div style="font-weight: bold; margin-bottom: 10px;">Interactive Map Demo</div>
      <div style="font-size: 14px; color: #666;">
        This is a demo map showing your current location<br>
        Latitude: ${this.center.lat.toFixed(6)}<br>
        Longitude: ${this.center.lng.toFixed(6)}
      </div>
    `;
    
    // Remove overlay after 3 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 3000);
    
    this.container.appendChild(overlay);
  }
  
  panTo(latLng: MockLatLng) {
    this.center = latLng;
    this.updateMarkers();
  }
  
  setStreetView(streetView: MockStreetViewPanorama) {
    // Mock implementation
  }
  
  private updateMarkers() {
    // Update all marker positions
    const markers = this.container.querySelectorAll('[data-marker]');
    markers.forEach(marker => {
      // Update marker positions based on new center
    });
  }
}

// Mock Google Maps API
const mockGoogle = {
  maps: {
    Map: MockMap,
    Marker: MockMarker,
    Polyline: MockPolyline,
    Circle: MockCircle,
    StreetViewPanorama: MockStreetViewPanorama,
    Size: class MockSize {
      constructor(public width: number, public height: number) {}
    },
    Point: class MockPoint {
      constructor(public x: number, public y: number) {}
    }
  }
};

// Export for use in components
export default mockGoogle;

// Also attach to window for global access
declare global {
  interface Window {
    google: any; // Use any to avoid complex type matching
  }
}

if (typeof window !== 'undefined') {
  (window as any).google = mockGoogle;
}
