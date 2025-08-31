'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { gpx } from '@tmcw/togeojson';

export default function Home() {
  const [gpxData, setGpxData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(10); // seconds
  const [trailColor, setTrailColor] = useState('#ff0000');
  const [trailWidth, setTrailWidth] = useState(3);
  const [mapType, setMapType] = useState('standard');
  const [cameraFollow, setCameraFollow] = useState(true);
  const [mapColorScheme, setMapColorScheme] = useState('dark');
  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(10); // More zoomed out by default
  const [showMarker, setShowMarker] = useState(true);
  const [markerType, setMarkerType] = useState('default');
  const [fullScreen, setFullScreen] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const animationRef = useRef(null);
  const startTime = useRef(null);
  const polylineRef = useRef(null);
  const fullCoords = useRef([]);
  const markerRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && fullScreen) {
        setFullScreen(false);
      }
    };

    if (fullScreen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [fullScreen]);

  useEffect(() => {
    if (mapInstance.current && window.mapkit && window.mapkit.Map) {
      const mapTypeMap = {
        standard: window.mapkit.Map.MapTypes.Standard,
        satellite: window.mapkit.Map.MapTypes.Satellite,
        hybrid: window.mapkit.Map.MapTypes.Hybrid
      };
      mapInstance.current.mapType = mapTypeMap[mapType];
      mapInstance.current.colorScheme = mapColorScheme;
      mapInstance.current.showsPointsOfInterest = showLabels;
      // Note: zoomLevel is controlled through region, not as a direct property
    }
  }, [mapType, mapColorScheme, showLabels]);

  useEffect(() => {
    if (mapInstance.current && fullCoords.current.length > 0) {
      // Update zoom by modifying the region span
      const currentRegion = mapInstance.current.region;
      if (currentRegion) {
        const zoomFactor = Math.pow(2, 20 - zoomLevel); // Convert zoom level to span multiplier
        const newSpan = new window.mapkit.CoordinateSpan(
          currentRegion.span.latitudeDelta * zoomFactor,
          currentRegion.span.longitudeDelta * zoomFactor
        );
        mapInstance.current.region = new window.mapkit.CoordinateRegion(
          currentRegion.center,
          newSpan
        );
      }
    }
  }, [zoomLevel]);

  // Update polyline style when trail properties change
  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.style = new window.mapkit.Style({
        strokeColor: trailColor,
        lineWidth: trailWidth,
        lineCap: 'round',
        lineJoin: 'round'
      });
    }
  }, [trailColor, trailWidth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.mapkit) {
        const script = document.createElement('script');
        script.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js';
        script.onload = () => {
          window.mapkit.init({
            authorizationCallback: (done) => {
              done(process.env.NEXT_PUBLIC_MAPS_TOKEN || 'your-token-here');
            },
          });

          const mapTypeMap = {
            standard: window.mapkit.Map.MapTypes.Standard,
            satellite: window.mapkit.Map.MapTypes.Satellite,
            hybrid: window.mapkit.Map.MapTypes.Hybrid
          };
          const map = new window.mapkit.Map(mapRef.current, {
            mapType: mapTypeMap[mapType],
            colorScheme: mapColorScheme,
            showsPointsOfInterest: showLabels
          });
          mapInstance.current = map;
        };
        document.head.appendChild(script);
      } else {
        window.mapkit.init({
          authorizationCallback: (done) => {
            done(process.env.NEXT_PUBLIC_MAPS_TOKEN || 'your-token-here');
          },
        });

        const mapTypeMap = {
          standard: window.mapkit.Map.MapTypes.Standard,
          satellite: window.mapkit.Map.MapTypes.Satellite,
          hybrid: window.mapkit.Map.MapTypes.Hybrid
        };
        const map = new window.mapkit.Map(mapRef.current, {
          mapType: mapTypeMap[mapType],
          colorScheme: mapColorScheme,
          showsPointsOfInterest: showLabels
        });
        mapInstance.current = map;
      }
    }
  }, []);

  // Trail smoothing function to reduce jaggedness
  const smoothTrail = (coords, windowSize = 3) => {
    if (coords.length < windowSize) return coords;

    const smoothed = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < coords.length; i++) {
      let latSum = 0;
      let lngSum = 0;
      let count = 0;

      // Calculate moving average within the window
      for (let j = Math.max(0, i - halfWindow); j <= Math.min(coords.length - 1, i + halfWindow); j++) {
        latSum += coords[j].latitude;
        lngSum += coords[j].longitude;
        count++;
      }

      const avgLat = latSum / count;
      const avgLng = lngSum / count;

      smoothed.push(new window.mapkit.Coordinate(avgLat, avgLng));
    }

    return smoothed;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const dom = new DOMParser().parseFromString(text, 'text/xml');
        const geoJson = gpx(dom);
        setGpxData(geoJson);
        if (mapInstance.current && geoJson.features[0]) {
          let coords = geoJson.features[0].geometry.coordinates.map(c => new window.mapkit.Coordinate(c[1], c[0]));

          // Apply trail smoothing to reduce jaggedness
          coords = smoothTrail(coords, 3); // Smooth with window size of 3

          fullCoords.current = coords;
          const region = new window.mapkit.CoordinateRegion(
            coords[0],
            new window.mapkit.CoordinateSpan(0.03, 0.03) // More zoomed out by default
          );
          mapInstance.current.region = region;

          // Add initial empty polyline
          const polyline = new window.mapkit.PolylineOverlay([], {
            style: new window.mapkit.Style({
              strokeColor: trailColor,
              lineWidth: trailWidth,
              lineCap: 'round',
              lineJoin: 'round'
            })
          });
          mapInstance.current.addOverlay(polyline);
          polylineRef.current = polyline;

          // Add marker if enabled
          if (showMarker) {
            let marker;
            if (markerType === 'square') {
              // Create a custom annotation with square image
              marker = new window.mapkit.Annotation(coords[0], {
                title: 'Trail Marker',
                glyphImage: { 1: 'data:image/svg+xml;base64,' + btoa('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="red"/></svg>') }
              });
            } else {
              marker = new window.mapkit.MarkerAnnotation(coords[0]);
            }
            mapInstance.current.addAnnotation(marker);
            markerRef.current = marker;
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const startAnimation = () => {
    if (!gpxData || !mapInstance.current) return;
    setIsPlaying(true);
    startTime.current = Date.now();
    animate();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  };

  const animate = () => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    const prog = Math.min(elapsed / duration, 1);
    setProgress(prog);

    if (polylineRef.current && fullCoords.current.length > 0) {
      // Calculate smooth fractional index for interpolation
      const totalPoints = fullCoords.current.length;
      const fractionalIndex = prog * (totalPoints - 1); // Use totalPoints - 1 for proper interpolation
      const currentIndex = Math.floor(fractionalIndex);
      const nextIndex = Math.min(currentIndex + 1, totalPoints - 1);
      const interpolationFactor = fractionalIndex - currentIndex;

      // Get all completed points
      const completedCoords = fullCoords.current.slice(0, currentIndex + 1);

      // Interpolate between current and next point for smooth drawing
      let animatedCoords = [...completedCoords];

      if (currentIndex < nextIndex && interpolationFactor > 0) {
        const currentPoint = fullCoords.current[currentIndex];
        const nextPoint = fullCoords.current[nextIndex];

        // Linear interpolation between current and next point
        const interpolatedLat = currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * interpolationFactor;
        const interpolatedLng = currentPoint.longitude + (nextPoint.longitude - currentPoint.longitude) * interpolationFactor;

        const interpolatedPoint = new window.mapkit.Coordinate(interpolatedLat, interpolatedLng);
        animatedCoords.push(interpolatedPoint);
      }

      // Update the polyline with smoothly interpolated points
      polylineRef.current.points = animatedCoords;

      // Update marker position if enabled (use the interpolated position for smoother movement)
      if (markerRef.current && animatedCoords.length > 0 && showMarker) {
        markerRef.current.coordinate = animatedCoords[animatedCoords.length - 1];
      }

      // Smooth camera follow with consistent speed
      if (cameraFollow && animatedCoords.length > 0) {
        const targetCoord = animatedCoords[animatedCoords.length - 1];
        const currentRegion = mapInstance.current.region;

        if (currentRegion) {
          // Calculate distance to target for consistent speed
          const latDiff = targetCoord.latitude - currentRegion.center.latitude;
          const lngDiff = targetCoord.longitude - currentRegion.center.longitude;
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

          // Use time-based movement for consistent speed (adjust speed factor as needed)
          const cameraSpeed = 0.002; // Lower = smoother/slower, higher = faster
          const maxMoveDistance = cameraSpeed; // Maximum distance to move per frame

          let newLat, newLng;

          if (distance > maxMoveDistance) {
            // Move towards target at consistent speed
            const ratio = maxMoveDistance / distance;
            newLat = currentRegion.center.latitude + latDiff * ratio;
            newLng = currentRegion.center.longitude + lngDiff * ratio;
          } else {
            // Close enough to target, snap to position
            newLat = targetCoord.latitude;
            newLng = targetCoord.longitude;
          }

          const newCenter = new window.mapkit.Coordinate(newLat, newLng);
          mapInstance.current.region = new window.mapkit.CoordinateRegion(
            newCenter,
            currentRegion.span // Keep the same zoom level
          );
        } else {
          // Fallback to direct positioning if no current region
          mapInstance.current.region = new window.mapkit.CoordinateRegion(
            targetCoord,
            new window.mapkit.CoordinateSpan(0.03, 0.03) // More zoomed out by default
          );
        }
      }
    }

    if (prog < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  };

  const exportMap = () => {
    if (mapInstance.current) {
      // For MapKit JS, we can use the map's canvas or create a screenshot
      // Since MapKit doesn't have a direct screenshot method, we'll use html2canvas
      // But for now, let's create a simple export by opening the map in a new window
      const mapElement = mapRef.current;
      if (mapElement) {
        // Create a new window with just the map
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head>
              <title>GPX Trail Export</title>
              <style>
                body { margin: 0; padding: 20px; background: white; }
                .export-container { max-width: 1200px; margin: 0 auto; }
                .export-header { text-align: center; margin-bottom: 20px; }
                .export-map { width: 100%; height: 600px; border: 2px solid #333; }
                .export-info { margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="export-container">
                <div class="export-header">
                  <h1>GPX Trail Animation Export</h1>
                  <p>Trail Color: ${trailColor} | Width: ${trailWidth}px | Duration: ${duration}s</p>
                </div>
                <div class="export-map" id="export-map"></div>
                <div class="export-info">
                  <p><strong>Export Details:</strong></p>
                  <ul>
                    <li>Map Type: ${mapType}</li>
                    <li>Color Scheme: ${mapColorScheme}</li>
                    <li>Labels: ${showLabels ? 'On' : 'Off'}</li>
                    <li>Zoom Level: ${zoomLevel}</li>
                    <li>Marker: ${showMarker ? markerType : 'None'}</li>
                  </ul>
                  <p><em>Use Ctrl+P (Cmd+P on Mac) to print/save as PDF, or right-click to save the page.</em></p>
                </div>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  return (
    <div className={`min-h-screen bg-background p-4 ${fullScreen ? 'fixed inset-0 z-50 p-0' : ''}`}>
      <div className={`max-w-full mx-auto ${fullScreen ? 'h-full' : ''}`}>
        {!fullScreen && (
          <h1 className="text-3xl font-bold mb-6">GPX Trail Animator</h1>
        )}
        <div className={`grid gap-6 ${fullScreen ? 'grid-cols-1 h-full' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {!fullScreen && (
            <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gpx-file">Upload GPX File</Label>
                <Input id="gpx-file" type="file" accept=".gpx" onChange={handleFileUpload} />
              </div>
              <div className="space-y-2">
                <Label>Animation Duration: {duration}s</Label>
                <Slider
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  max={1000}
                  min={1}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trail-color">Trail Color</Label>
                <Input
                  id="trail-color"
                  type="color"
                  value={trailColor}
                  onChange={(e) => setTrailColor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Trail Width: {trailWidth}px</Label>
                <Slider
                  value={[trailWidth]}
                  onValueChange={(value) => setTrailWidth(value[0])}
                  max={10}
                  min={1}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Map Type</Label>
                <Select value={mapType} onValueChange={setMapType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Map Style</Label>
                <Select value={mapColorScheme} onValueChange={setMapColorScheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Labels</Label>
                <Select value={showLabels ? 'on' : 'off'} onValueChange={(value) => setShowLabels(value === 'on')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zoom Level: {zoomLevel}</Label>
                <Slider
                  value={[zoomLevel]}
                  onValueChange={(value) => setZoomLevel(value[0])}
                  max={20}
                  min={1}
                  step={1}
                />
              </div>
              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="show-marker"
                  checked={showMarker}
                  onChange={(e) => setShowMarker(e.target.checked)}
                />
                <Label htmlFor="show-marker">Show Trail Marker</Label>
              </div>
              <div className="space-y-2">
                <Label>Marker Type</Label>
                <Select value={markerType} onValueChange={setMarkerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="camera-follow"
                  checked={cameraFollow}
                  onChange={(e) => setCameraFollow(e.target.checked)}
                />
                <Label htmlFor="camera-follow">Camera Follow</Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={startAnimation} disabled={!gpxData || isPlaying}>
                  Play
                </Button>
                <Button onClick={stopAnimation} disabled={!isPlaying}>
                  Stop
                </Button>
                <Button onClick={exportMap} variant="outline" disabled={!gpxData}>
                  Export
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Progress: {Math.round(progress * 100)}%</Label>
                <Slider value={[progress * 100]} max={100} disabled />
              </div>
            </CardContent>
          </Card>
          )}
          <Card className={`${fullScreen ? 'h-full' : 'lg:col-span-3'}`}>
            <CardHeader className={fullScreen ? 'hidden' : ''}>
              <CardTitle>Map</CardTitle>
            </CardHeader>
            <CardContent className={`p-0 ${fullScreen ? 'h-full' : ''}`}>
              <div ref={mapRef} className={`w-full bg-muted rounded ${fullScreen ? 'h-full rounded-none' : 'h-[696px]'}`}></div>
              {fullScreen && (
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button onClick={exportMap} variant="secondary" size="sm">
                    Export Map
                  </Button>
                  <Button onClick={() => setFullScreen(false)} variant="secondary" size="sm">
                    Exit Full Screen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
