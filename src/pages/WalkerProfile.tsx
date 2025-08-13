import { motion } from "framer-motion";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaHeart,
  FaCalendarAlt,
  FaCertificate,
  FaTrophy,
  FaCamera,
  FaArrowLeft,
  FaShieldAlt,
  FaClock,
  FaDollarSign,
  FaCheckCircle
} from "react-icons/fa";
import { toast } from "sonner";
import { useWalkerProfile, useWalkerReviews, useWalkerStats, useToggleFavoriteWalker, useWalkerMatchingScore } from "@/hooks/useWalkers";
import { usePets } from "@/hooks/usePets";
import { format, parseISO } from "date-fns";

const WalkerProfile = () => {
  const { walkerId } = useParams<{ walkerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  
  const { data: walker, isLoading } = useWalkerProfile(walkerId || "");
  const { data: reviews = [] } = useWalkerReviews(walkerId || "");
  const { data: stats } = useWalkerStats(walkerId || "");
  const { data: pets = [] } = usePets();
  const { data: matchScore } = useWalkerMatchingScore(walkerId || "", selectedPetId);
  const toggleFavorite = useToggleFavoriteWalker();

  if (!walkerId) {
    return <div className="min-h-screen flex items-center justify-center">Invalid walker ID</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-muted rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded-2xl"></div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="h-32 bg-muted rounded-2xl"></div>
                <div className="h-64 bg-muted rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!walker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
        <div className="container mx-auto px-6 py-8 text-center">
          <div className="text-6xl mb-4">🐕</div>
          <h2 className="text-2xl font-bold mb-4">Walker not found</h2>
          <Button onClick={() => navigate('/walkers')}>
            Back to Walkers
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite.mutateAsync({ 
        walkerId: walker.id, 
        isFavorite: false // Will be determined by the hook
      });
      toast.success("Favorite status updated!");
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const getExperienceLevel = (years: number) => {
    if (years < 2) return { label: "Novice", color: "text-blue-600", bg: "bg-blue-100" };
    if (years < 5) return { label: "Experienced", color: "text-green-600", bg: "bg-green-100" };
    return { label: "Expert", color: "text-purple-600", bg: "bg-purple-100" };
  };

  const experienceLevel = getExperienceLevel(walker.years_of_experience || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 pt-20 pb-24 md:pl-64">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate('/walkers')}>
              <FaArrowLeft className="mr-2" />
              Back to Walkers
            </Button>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1">
              <Avatar className="w-32 h-32 mx-auto md:mx-0 mb-4">
                <AvatarImage src={walker.users?.avatar_url} alt={walker.users?.first_name} />
                <AvatarFallback className="text-4xl">
                  {walker.users?.first_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-primary mb-2">
                  {walker.users?.first_name} {walker.users?.last_name}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <FaMapMarkerAlt className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {walker.users?.city}, {walker.users?.state}
                  </span>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold">{walker.average_rating?.toFixed(1) || 'New'}</span>
                    <span className="text-muted-foreground">({reviews.length} reviews)</span>
                  </div>
                  <Badge className={`${experienceLevel.bg} ${experienceLevel.color}`}>
                    {experienceLevel.label}
                  </Badge>
                </div>

                {matchScore !== undefined && selectedPetId && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTrophy className="text-yellow-500" />
                      <span className="text-sm font-medium">Match Score</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          matchScore >= 80 ? 'bg-green-500' :
                          matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${matchScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{matchScore}% compatible</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <div className="text-2xl font-bold text-primary">{stats?.totalWalks || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Walks</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <div className="text-2xl font-bold text-success">{walker.years_of_experience || 0}</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <div className="text-2xl font-bold text-secondary">${walker.hourly_rate || 0}</div>
                  <div className="text-sm text-muted-foreground">Per Hour</div>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <div className="text-2xl font-bold text-info">{stats?.thisMonthWalks || 0}</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to={`/bookings/new?walker=${walker.id}`}>
                    <FaCalendarAlt className="mr-2" />
                    Book Walk
                  </Link>
                </Button>
                <Button variant="outline" size="lg" onClick={handleToggleFavorite}>
                  <FaHeart className="mr-2" />
                  {toggleFavorite.isPending ? 'Updating...' : 'Add to Favorites'}
                </Button>
                <Button variant="outline" size="lg">
                  <FaEnvelope className="mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="lg">
                  <FaPhone className="mr-2" />
                  Call
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pet Selection for Match Score */}
        {pets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Check Compatibility</h3>
              <div className="flex flex-wrap gap-3">
                {pets.map((pet) => (
                  <Button
                    key={pet.id}
                    variant={selectedPetId === pet.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPetId(pet.id)}
                  >
                    {pet.name}
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specialties">Specialties</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* About Section */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">About {walker.users?.first_name}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {walker.bio || "This walker hasn't written a bio yet, but they're ready to give your pup an amazing walk!"}
              </p>
            </Card>

            {/* Certifications */}
            {walker.walker_certifications && walker.walker_certifications.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaCertificate className="text-blue-600" />
                  Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {walker.walker_certifications.map((cert, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{cert.certification_types?.name}</h4>
                          <p className="text-sm text-muted-foreground">{cert.certification_types?.issuer}</p>
                          {cert.certification_types?.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {cert.certification_types.description}
                            </p>
                          )}
                        </div>
                        <FaShieldAlt className="text-green-600" />
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Issued: {cert.issued_date && format(parseISO(cert.issued_date), 'MMM yyyy')}
                        {cert.expiry_date && (
                          <> • Expires: {format(parseISO(cert.expiry_date), 'MMM yyyy')}</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Emergency Contact & Safety */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-green-600" />
                Safety & Trust
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FaCheckCircle className="text-green-600" />
                  <div>
                    <div className="font-medium">Background Verified</div>
                    <div className="text-sm text-muted-foreground">Passed background check</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FaShieldAlt className="text-blue-600" />
                  <div>
                    <div className="font-medium">Insured & Bonded</div>
                    <div className="text-sm text-muted-foreground">Full coverage protection</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <FaTrophy className="text-purple-600" />
                  <div>
                    <div className="font-medium">Top Rated</div>
                    <div className="text-sm text-muted-foreground">Consistently excellent service</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="specialties" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Specialties & Services</h3>
              {walker.walker_specialties && walker.walker_specialties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {walker.walker_specialties.map((specialty, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-primary">{specialty.specialty_types?.name}</h4>
                      {specialty.specialty_types?.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {specialty.specialty_types.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specialties listed yet.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.users?.avatar_url} />
                      <AvatarFallback>{review.users?.first_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{review.users?.first_name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(review.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">Be the first to book and leave a review!</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            {walker.walker_photos && walker.walker_photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {walker.walker_photos.map((photo, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <FaCamera className="text-4xl text-muted-foreground" />
                    </div>
                    {photo.caption && (
                      <div className="p-3">
                        <p className="text-sm">{photo.caption}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
                <p className="text-muted-foreground">Photos from walks will appear here</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Weekly Availability</h3>
              {walker.walker_availability && walker.walker_availability.length > 0 ? (
                <div className="space-y-3">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                    const availability = walker.walker_availability?.find(av => av.day_of_week === index);
                    return (
                      <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{day}</span>
                        {availability?.is_available ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <FaCheckCircle />
                            <span>{availability.start_time} - {availability.end_time}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not available</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">Availability schedule not set up yet.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalkerProfile;
