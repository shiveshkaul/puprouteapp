import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Check, MapPin, Calendar, DollarSign, Star, Clock } from 'lucide-react';
import { WalkerData } from '../../types/index';

interface ReviewStepProps {
  data: WalkerData;
  onNext: () => void;
  onPrev: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onNext, onPrev }) => {
  const handleSubmit = () => {
    // Here you would submit the data to your backend
    console.log('Submitting walker application:', data);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Your Application</h2>
        <p className="text-gray-600">
          Please review all your information before submitting your walker application.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Name:</span> {data.firstName} {data.lastName}
            </div>
            <div>
              <span className="font-medium">Email:</span> {data.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {data.phone}
            </div>
            <div>
              <span className="font-medium">Address:</span> {data.address}
            </div>
            <div>
              <span className="font-medium">Date of Birth:</span> {data.dateOfBirth}
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-green-600" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Years of Experience:</span> {data.experience}
            </div>
            <div>
              <span className="font-medium">Pet Types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.petTypes.map((type) => (
                  <Badge key={type} variant="secondary">{type}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Certifications:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.certifications.map((cert) => (
                  <Badge key={cert} variant="outline">{cert}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Available Days:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(data.availability).map(([day, available]) => 
                  available && (
                    <Badge key={day} variant="secondary">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Badge>
                  )
                )}
              </div>
            </div>
            <div>
              <span className="font-medium">Advance Notice:</span> {data.advanceNotice}
            </div>
            <div>
              <span className="font-medium">Toilet Breaks:</span> {data.toiletBreaks}
            </div>
          </CardContent>
        </Card>

        {/* Services & Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Services & Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Services:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.services.map((service) => (
                  <Badge key={service} variant="secondary">{service}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Base Rate:</span> €{data.baseRate}/night
            </div>
            <div>
              <span className="font-medium">Walk Rate:</span> €{data.walkRate}/walk
            </div>
            <div>
              <span className="font-medium">Day Rate:</span> €{data.dayRate}/day
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2 text-green-800">
            <Check className="h-5 w-5" />
            <span className="font-medium">Ready to Submit</span>
          </div>
          <p className="text-center text-green-700 mt-2">
            Your application looks complete! Once submitted, we'll review it within 24-48 hours.
          </p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onPrev}>
          Back to Edit
        </Button>
        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
          Submit Application
        </Button>
      </div>
    </div>
  );
};
