/**
 * Interactive 3D Threat Globe Map
 * Shows real-time cyber attacks on a 3D globe with animated arcs
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Globe2, Zap, MapPin } from 'lucide-react';
import type { ThreatData } from '../types/threat-analysis';
import ct from 'city-timezones';

// Geocoding cache for faster lookups
const geocodeCache = new Map<string, { lat: number; lng: number; country: string }>();

// Build a searchable index from the cities database
const cityIndex = new Map<string, { lat: number; lng: number; country: string }>();
let isIndexBuilt = false;

const buildCityIndex = () => {
  if (isIndexBuilt) return;
  
  console.log('🏗️ Building city index from city-timezones...');
  
  // city-timezones provides a lookupViaCity function
  // We'll build our own index for better performance
  const allCities = ct.cityMapping as any[];
  
  allCities.forEach((city: any) => {
    if (!city || !city.city || !city.lat || !city.lng) return;
    
    const cityName = city.city.toLowerCase();
    const country = city.country || 'Unknown';
    
    const coords = {
      lat: parseFloat(city.lat),
      lng: parseFloat(city.lng),
      country: country
    };
    
    // Index by city name alone
    if (!cityIndex.has(cityName)) {
      cityIndex.set(cityName, coords);
    }
    
    // Index by "city, province" if province exists
    if (city.province) {
      const withProvince = `${cityName}, ${city.province.toLowerCase()}`;
      cityIndex.set(withProvince, coords);
    }
    
    // Index by "city, country"
    const withCountry = `${cityName}, ${country.toLowerCase()}`;
    cityIndex.set(withCountry, coords);
  });
  
  isIndexBuilt = true;
  console.log(`✅ City index built with ${cityIndex.size} entries from ${allCities.length} cities`);
};

interface ThreatGlobeMapProps {
  threatData: ThreatData[];
}

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  severity: string;
  attackType: string;
  sourceIP: string;
  destIP: string;
}

interface MarkerData {
  lat: number;
  lng: number;
  size: number;
  color: string;
  count: number;
  country: string;
}

// Fast geocoding using offline city database
const geocodeLocation = (locationString: string): { lat: number; lng: number; country: string } | null => {
  if (!locationString) return null;
  
  // Build index on first call
  if (!isIndexBuilt) {
    buildCityIndex();
  }
  
  // Check cache first
  if (geocodeCache.has(locationString)) {
    return geocodeCache.get(locationString)!;
  }
  
  // Check for "Latitude: X, Longitude: Y" format
  const latMatch = locationString.match(/Latitude:\s*([-\d.]+)/);
  const lngMatch = locationString.match(/Longitude:\s*([-\d.]+)/);
  const countryMatch = locationString.match(/Country:\s*([^,]+)/);
  
  if (latMatch && latMatch[1] && lngMatch && lngMatch[1]) {
    const result = {
      lat: parseFloat(latMatch[1]),
      lng: parseFloat(lngMatch[1]),
      country: countryMatch && countryMatch[1] ? countryMatch[1].trim() : 'Unknown'
    };
    geocodeCache.set(locationString, result);
    return result;
  }
  
  // Handle "City, State/Country" format
  const normalized = locationString.toLowerCase().trim();
  
  // Try exact match first
  if (cityIndex.has(normalized)) {
    const result = cityIndex.get(normalized)!;
    geocodeCache.set(locationString, result);
    return result;
  }
  
  // Try to parse "City, State" or "City, Country"
  const parts = locationString.split(',').map(p => p.trim().toLowerCase());
  
  if (parts.length >= 1) {
    const cityName = parts[0];
    
    // Try city name alone
    if (cityName && cityIndex.has(cityName)) {
      const result = cityIndex.get(cityName)!;
      geocodeCache.set(locationString, result);
      return result;
    }
    
    // Try city with country if provided
    if (parts.length >= 2 && cityName) {
      const country = parts[parts.length - 1];
      if (country) {
        const fullName = `${cityName}, ${country}`;
        
        if (cityIndex.has(fullName)) {
          const result = cityIndex.get(fullName)!;
          geocodeCache.set(locationString, result);
          return result;
        }
        
        // Try to find any city that starts with the name
        for (const [key, value] of cityIndex.entries()) {
          if (key.startsWith(cityName) && key.includes(country)) {
            geocodeCache.set(locationString, value);
            return value;
          }
        }
      }
      
      // Try just city name match
      if (cityName) {
        for (const [key, value] of cityIndex.entries()) {
          if (key.startsWith(cityName)) {
            geocodeCache.set(locationString, value);
            return value;
          }
        }
      }
    }
  }
  
  console.warn(`⚠️ Location not found: "${locationString}"`);
  return null;
};

// Get color based on severity
const getSeverityColor = (severity: string): string => {
  const sev = severity?.toLowerCase() || 'low';
  if (sev === 'high' || sev === 'critical') return '#ef4444'; // Red
  if (sev === 'medium') return '#f59e0b'; // Orange
  return '#10b981'; // Green
};

const ThreatGlobeMap = ({ threatData }: ThreatGlobeMapProps) => {
  const globeEl = useRef<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);

  // Build city index on mount (one-time operation)
  useEffect(() => {
    buildCityIndex();
  }, []);

  // Process threat data into arcs (attack paths)
  const arcs = useMemo(() => {
    const arcData: ArcData[] = [];
    
    threatData.forEach(threat => {
      const sourceGeo = geocodeLocation(threat['Geo-location Data']);
      // For destination, we'll use a slightly offset location or random location
      // In real scenario, you'd have destination geo data too
      
      if (sourceGeo) {
        // Create arc to a common target (e.g., US for demo)
        const destLat = 37.7749 + (Math.random() - 0.5) * 10; // San Francisco area
        const destLng = -122.4194 + (Math.random() - 0.5) * 10;
        
        arcData.push({
          startLat: sourceGeo.lat,
          startLng: sourceGeo.lng,
          endLat: destLat,
          endLng: destLng,
          color: getSeverityColor(threat['Severity Level']),
          severity: threat['Severity Level'] || 'Unknown',
          attackType: threat['Attack Type'] || 'Unknown',
          sourceIP: threat['Source IP Address'],
          destIP: threat['Destination IP Address']
        });
      }
    });
    
    return arcData;
  }, [threatData]);

  // Process threat data into markers (attack origins)
  const markers = useMemo(() => {
    const markerMap = new Map<string, MarkerData>();
    
    threatData.forEach(threat => {
      const geo = geocodeLocation(threat['Geo-location Data']);
      if (geo) {
        const key = `${geo.lat.toFixed(2)},${geo.lng.toFixed(2)}`;
        
        if (markerMap.has(key)) {
          const existing = markerMap.get(key)!;
          existing.count += 1;
          existing.size = Math.min(existing.count * 0.5, 3);
        } else {
          markerMap.set(key, {
            lat: geo.lat,
            lng: geo.lng,
            size: 0.5,
            color: getSeverityColor(threat['Severity Level']),
            count: 1,
            country: geo.country
          });
        }
      }
    });
    
    return Array.from(markerMap.values());
  }, [threatData]);

  // Heat map data (attack density by location)
  const heatmapData = useMemo(() => {
    return markers.map(marker => ({
      lat: marker.lat,
      lng: marker.lng,
      weight: marker.count
    }));
  }, [markers]);

  // Initialize globe and auto-rotate
  useEffect(() => {
    if (!globeEl.current) return;
    
    // Wait for globe to be ready
    setTimeout(() => {
      setGlobeReady(true);
      if (globeEl.current && globeEl.current.controls) {
        globeEl.current.controls().autoRotate = autoRotate;
        globeEl.current.controls().autoRotateSpeed = 0.5;
      }
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update auto-rotate
  useEffect(() => {
    if (globeReady && globeEl.current && globeEl.current.controls) {
      globeEl.current.controls().autoRotate = autoRotate;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, [autoRotate, globeReady]);

  // Function to fly to a country
  const flyToCountry = (country: string) => {
    const marker = markers.find(m => m.country === country);
    if (marker && globeEl.current) {
      // Point camera to the marker location
      globeEl.current.pointOfView(
        { lat: marker.lat, lng: marker.lng, altitude: 2 },
        1000 // animation duration in ms
      );
      setSelectedCountry(country);
      setAutoRotate(false);
    }
  };

  // Get top countries for stats
  const topCountries = useMemo(() => {
    const countryMap = new Map<string, number>();
    markers.forEach(m => {
      countryMap.set(m.country, m.count);
    });
    return Array.from(countryMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [markers]);

  // Stats
  const stats = useMemo(() => {
    const countries = new Set(markers.map(m => m.country));
    const totalAttacks = markers.reduce((sum, m) => sum + m.count, 0);
    const criticalAttacks = threatData.filter(t => t['Severity Level']?.toLowerCase() === 'high').length;
    
    return {
      countries: countries.size,
      totalAttacks,
      criticalAttacks,
      activeArcs: arcs.length
    };
  }, [markers, threatData, arcs]);

  // Filter by country
  const filteredArcs = selectedCountry 
    ? arcs.filter(arc => {
        const sourceGeo = threatData.find(t => t['Source IP Address'] === arc.sourceIP);
        const geo = sourceGeo ? geocodeLocation(sourceGeo['Geo-location Data']) : null;
        return geo?.country === selectedCountry;
      })
    : arcs;

  return (
    <Card className="border-purple-500/20 bg-[#0f0f14]/50 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Globe2 className="w-7 h-7 text-purple-400" />
            Global Threat Map
            <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Live
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30">
              📍 {markers.length} Locations
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className="px-3 py-1.5 text-xs rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
              {autoRotate ? '⏸ Pause' : '▶ Rotate'}
            </button>
            
            {selectedCountry && (
              <button
                onClick={() => setSelectedCountry(null)}
                className="px-3 py-1.5 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors"
              >
                ✕ Clear Filter
              </button>
            )}
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-black/30 rounded-lg p-3 border border-purple-500/10">
            <div className="text-xs text-white/50 mb-1">Countries</div>
            <div className="text-xl font-bold text-purple-300">{stats.countries}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-purple-500/10">
            <div className="text-xs text-white/50 mb-1">Total Attacks</div>
            <div className="text-xl font-bold text-white">{stats.totalAttacks}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-red-500/10">
            <div className="text-xs text-white/50 mb-1">Critical</div>
            <div className="text-xl font-bold text-red-400">{stats.criticalAttacks}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-purple-500/10">
            <div className="text-xs text-white/50 mb-1">Active Paths</div>
            <div className="text-xl font-bold text-purple-300">{filteredArcs.length}</div>
          </div>
        </div>
        
        {/* Top Countries - Clickable */}
        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-purple-500/10">
          <div className="text-xs text-white/50 mb-3">🔥 Top Attack Sources (Click to explore)</div>
          <div className="flex flex-wrap gap-2">
            {topCountries.map(([country, count]) => (
              <button
                key={country}
                onClick={() => flyToCountry(country)}
                className="px-3 py-1.5 text-xs rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-3 h-3" />
                {country} ({count})
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-purple-500/10">
          <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            
            // Arcs (attack paths)
            arcsData={filteredArcs}
            arcColor="color"
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={2000}
            arcStroke={0.5}
            arcLabel={(d: any) => `
              <div style="background: rgba(0,0,0,0.9); padding: 8px; border-radius: 4px; border: 1px solid rgba(168, 85, 247, 0.3);">
                <div style="color: #fff; font-weight: bold; margin-bottom: 4px;">${d.attackType}</div>
                <div style="color: #a78bfa; font-size: 12px;">Severity: ${d.severity}</div>
                <div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">
                  ${d.sourceIP} → ${d.destIP}
                </div>
              </div>
            `}
            
            // Points (attack origins)
            pointsData={markers}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={0.01}
            pointRadius="size"
            pointLabel={(d: any) => `
              <div style="background: rgba(0,0,0,0.9); padding: 8px; border-radius: 4px; border: 1px solid rgba(168, 85, 247, 0.3);">
                <div style="color: #fff; font-weight: bold;">${d.country}</div>
                <div style="color: #a78bfa; font-size: 12px; margin-top: 4px;">
                  ${d.count} attacks
                </div>
              </div>
            `}
            onPointClick={(point: any) => {
              console.log('Point clicked:', point.country);
              setSelectedCountry(point.country);
              setAutoRotate(false);
            }}
            
            // Heat map - FIXED colorFn
            heatmapsData={heatmapData.length > 0 ? [heatmapData] : []}
            heatmapPointLat="lat"
            heatmapPointLng="lng"
            heatmapPointWeight="weight"
            heatmapTopAltitude={0.01}
            heatmapBandwidth={5}
            heatmapColorSaturation={2}
            heatmapColorFn={() => 'rgba(168, 85, 247, 0.5)'}
            
            // Globe styling
            atmosphereColor="rgba(168, 85, 247, 0.5)"
            atmosphereAltitude={0.15}
            
            // Controls
            width={undefined}
            height={600}
          />
          
          {selectedCountry && (
            <div className="absolute top-4 left-4 bg-black/90 px-4 py-2 rounded-lg border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Filtering: {selectedCountry}</span>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-4 right-4 bg-black/90 px-4 py-2 rounded-lg border border-purple-500/30 backdrop-blur-sm">
            <div className="text-xs text-white/70">
              Click markers to filter • Drag to rotate • Scroll to zoom
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-white/70">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-white/70">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white/70">Low</span>
          </div>
          <div className="mx-4 w-px h-4 bg-purple-500/20"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-red-500"></div>
            <span className="text-white/70">Attack Paths</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatGlobeMap;

