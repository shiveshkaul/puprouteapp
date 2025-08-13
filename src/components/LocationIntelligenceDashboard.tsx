import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FaMapMarkerAlt, 
  FaRoute, 
  FaShieldAlt, 
  FaDollarSign,
  FaChartLine,
  FaClock,
  FaThermometerHalf,
  FaExclamationTriangle,
  FaStar,
  FaBrain,
  FaEye,
  FaCamera,
  FaHeart
} from 'react-icons/fa';
import { 
  useEmergencyFeatures,
  useGeofencing,
  useServiceAreaAnalytics,
  useMultiPetRouteOptimization,
  useDynamicLocationPricing,
  useWeatherOptimizedRoutes
} from '@/hooks/useAdvancedLocationFeatures';
import { 
  useWalkerEfficiencyDashboard,
  useCustomerInsights,
  useARWalkingExperience
} from '@/hooks/useBusinessIntelligence';
import LiveWalkMap from './LiveWalkMap';

interface LocationIntelligenceDashboardProps {
  userType: 'customer' | 'walker' | 'admin';
  currentLocation?: { lat: number; lng: number };
}

const LocationIntelligenceDashboard: React.FC<LocationIntelligenceDashboardProps> = ({
  userType,
  currentLocation = { lat: 40.7128, lng: -74.0060 }
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Hook usage based on user type
  const emergencyFeatures = useEmergencyFeatures();
  const walkerDashboard = useWalkerEfficiencyDashboard();
  const customerInsightsQueries = useCustomerInsights();
  const serviceAreaQueries = useServiceAreaAnalytics();
  
  const walkerMetrics = walkerDashboard.getWalkerMetrics.data;
  const customerInsights = customerInsightsQueries.getCustomerDensityMapping.data;
  const marketGaps = customerInsightsQueries.getMarketGapAnalysis.data;
  const walkerDensity = serviceAreaQueries.getWalkerDensityHeatmap.data;
  const demandHeatmap = serviceAreaQueries.getDemandHeatmap.data;

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAlY5Q1LZkbXGsz-BO0amHcceQpa_HeaCo';

  const getTabsForUserType = () => {
    switch (userType) {
      case 'customer':
        return [
          { id: 'overview', label: 'Smart Features', icon: FaBrain },
          { id: 'safety', label: 'Safety & Emergency', icon: FaShieldAlt },
          { id: 'pricing', label: 'Dynamic Pricing', icon: FaDollarSign },
          { id: 'ar', label: 'AR Experience', icon: FaEye },
        ];
      case 'walker':
        return [
          { id: 'efficiency', label: 'Efficiency Dashboard', icon: FaChartLine },
          { id: 'routes', label: 'Route Optimization', icon: FaRoute },
          { id: 'earnings', label: 'Earnings Analytics', icon: FaDollarSign },
          { id: 'insights', label: 'Customer Insights', icon: FaBrain },
        ];
      case 'admin':
        return [
          { id: 'analytics', label: 'Market Analytics', icon: FaChartLine },
          { id: 'coverage', label: 'Service Coverage', icon: FaMapMarkerAlt },
          { id: 'demand', label: 'Demand Analysis', icon: FaHeart },
          { id: 'expansion', label: 'Growth Opportunities', icon: FaStar },
        ];
      default:
        return [];
    }
  };

  const renderCustomerDashboard = () => (
    <div className="space-y-6">
      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Route Suggestions */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaBrain className="text-2xl text-purple-600" />
              <h3 className="text-lg font-semibold">AI Route Suggestions</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-green-600">Perfect Route Found!</div>
                <div className="text-sm text-muted-foreground">
                  Best route for your Golden Retriever based on weather and energy level
                </div>
                <Badge className="mt-2">30 min • Low Traffic</Badge>
              </div>
              <Button className="w-full" size="sm">View AI Recommendations</Button>
            </div>
          </Card>

          {/* Weather-Optimized Walking */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaThermometerHalf className="text-2xl text-blue-600" />
              <h3 className="text-lg font-semibold">Weather Intelligence</h3>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold">72°F</div>
                <div className="text-sm text-muted-foreground">Perfect walking weather</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  🌞 Ideal conditions for outdoor walks. Park routes recommended!
                </div>
              </div>
            </div>
          </Card>

          {/* Smart Walker Matching */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaStar className="text-2xl text-yellow-600" />
              <h3 className="text-lg font-semibold">Perfect Match Found</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white">
                  S
                </div>
                <div>
                  <div className="font-medium">Sarah Johnson</div>
                  <div className="text-sm text-muted-foreground">95% compatibility</div>
                </div>
              </div>
              <div className="text-sm text-green-600">
                ✓ Specializes in large breeds ✓ Knows your neighborhood ✓ Available now
              </div>
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="safety">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Features */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-2xl text-red-600" />
              <h3 className="text-lg font-semibold">Emergency Features</h3>
            </div>
            <div className="space-y-4">
              <Button 
                variant={emergencyMode ? "destructive" : "outline"}
                className="w-full"
                onClick={() => setEmergencyMode(!emergencyMode)}
              >
                <FaExclamationTriangle className="mr-2" />
                {emergencyMode ? "Emergency Active" : "Panic Button"}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  Find Nearest Vet
                </Button>
                <Button variant="outline" size="sm">
                  Share Location
                </Button>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  🏥 3 veterinary clinics within 2 miles
                </div>
              </div>
            </div>
          </Card>

          {/* Safe Zones */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaMapMarkerAlt className="text-2xl text-green-600" />
              <h3 className="text-lg font-semibold">Safe Zones</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Central Park Zone</span>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground">0.5 mile radius</div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Neighborhood Safe Area</span>
                  <Badge variant="outline" className="text-green-600">Active</Badge>
                </div>
                <div className="text-sm text-muted-foreground">0.3 mile radius</div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                Add New Safe Zone
              </Button>
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="ar">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaEye className="text-2xl text-purple-600" />
            <h3 className="text-xl font-semibold">AR Walking Experience</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">AR Features Available</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FaCamera className="text-blue-600" />
                  <div>
                    <div className="font-medium">Photo Waypoints</div>
                    <div className="text-sm text-muted-foreground">
                      AI suggests perfect photo spots
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FaBrain className="text-purple-600" />
                  <div>
                    <div className="font-medium">Behavior Tips</div>
                    <div className="text-sm text-muted-foreground">
                      Real-time walking guidance
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FaMapMarkerAlt className="text-green-600" />
                  <div>
                    <div className="font-medium">POI Highlights</div>
                    <div className="text-sm text-muted-foreground">
                      Discover pet-friendly spots
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Upcoming AR Features</h4>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="font-medium text-purple-800">3D Route Visualization</div>
                  <div className="text-sm text-purple-600">
                    See your walk path in augmented reality
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-800">Pet Health Tracking</div>
                  <div className="text-sm text-blue-600">
                    AR overlay showing pet vitals and mood
                  </div>
                </div>
              </div>
              
              <Button className="w-full">
                Enable AR Experience
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>
    </div>
  );

  const renderWalkerDashboard = () => (
    <div className="space-y-6">
      <TabsContent value="efficiency">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <FaDollarSign className="text-3xl text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold">${walkerMetrics?.overview.totalEarnings?.toFixed(0) || '0'}</div>
            <div className="text-sm text-muted-foreground">Monthly Earnings</div>
          </Card>
          
          <Card className="p-6 text-center">
            <FaRoute className="text-3xl text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold">{walkerMetrics?.overview.totalWalks || 0}</div>
            <div className="text-sm text-muted-foreground">Walks Completed</div>
          </Card>
          
          <Card className="p-6 text-center">
            <FaClock className="text-3xl text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold">{walkerMetrics?.overview.avgTravelTime?.toFixed(0) || '0'}m</div>
            <div className="text-sm text-muted-foreground">Avg Travel Time</div>
          </Card>
          
          <Card className="p-6 text-center">
            <FaChartLine className="text-3xl text-orange-600 mx-auto mb-3" />
            <div className="text-2xl font-bold">{walkerMetrics?.efficiency.earningsPerHour?.toFixed(0) || '0'}</div>
            <div className="text-sm text-muted-foreground">$/Hour Efficiency</div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top Earning Areas</h4>
              <div className="space-y-2">
                {Object.entries(walkerMetrics?.geographic.earningsByArea || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([area, earnings], index) => (
                    <div key={area} className="flex justify-between p-2 border rounded">
                      <span className="text-sm">Area {index + 1}</span>
                      <span className="font-medium">${(earnings as number).toFixed(0)}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Time Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 border rounded">
                  <span className="text-sm">Peak Hour</span>
                  <span className="font-medium">{walkerMetrics?.temporal.peakHour || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 border rounded">
                  <span className="text-sm">Weekday Earnings</span>
                  <span className="font-medium">${walkerMetrics?.temporal.weekdayVsWeekend?.weekday.earnings?.toFixed(0) || '0'}</span>
                </div>
                <div className="flex justify-between p-2 border rounded">
                  <span className="text-sm">Weekend Earnings</span>
                  <span className="font-medium">${walkerMetrics?.temporal.weekdayVsWeekend?.weekend.earnings?.toFixed(0) || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <TabsContent value="analytics">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{walkerDensity?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Walker Clusters</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">{demandHeatmap?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Demand Hotspots</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Expansion Opportunities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Growth Opportunities</h3>
            <div className="space-y-3">
              {marketGaps?.expansionOpportunities?.slice(0, 3).map((opportunity, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Opportunity #{index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        Demand: {opportunity.demandLevel} customers
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      ${opportunity.estimatedRevenue}/mo
                    </Badge>
                  </div>
                </div>
              )) || <div className="text-muted-foreground">Analyzing market data...</div>}
            </div>
          </Card>
        </div>

        {/* Heatmap */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Service Coverage Map</h3>
          <div className="h-96 rounded-lg overflow-hidden">
            <LiveWalkMap
              apiKey={GOOGLE_MAPS_API_KEY}
              route={[]}
              walkerLocation={currentLocation}
              height="100%"
            />
          </div>
        </Card>
      </TabsContent>
    </div>
  );

  const tabs = getTabsForUserType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-primary mb-2">
            Location Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground">
            Powered by Google Maps + Gemini AI • {userType.charAt(0).toUpperCase() + userType.slice(1)} View
          </p>
        </motion.div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {userType === 'customer' && renderCustomerDashboard()}
          {userType === 'walker' && renderWalkerDashboard()}
          {userType === 'admin' && renderAdminDashboard()}
        </Tabs>
      </div>
    </div>
  );
};

export default LocationIntelligenceDashboard;
