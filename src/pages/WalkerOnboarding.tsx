import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Import step components

import {
  WelcomeStep,
  BasicInfoStep,
  AddressStep,
  ContactStep,
  ExperienceStep,
  AvailabilityStep,
  RatesStep,
  PhotosStep,
  TestimonialsStep,
  VerificationStep,
  SafetyQuizStep,
  ReviewStep,
  SuccessStep
} from '@/components/walker-onboarding';

import { WalkerData } from '@/types';

// Removed local WalkerData interface, using shared type

const steps = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'basic-info', title: 'Basic Info', component: BasicInfoStep },
  { id: 'address', title: 'Address', component: AddressStep },
  { id: 'contact', title: 'Contact', component: ContactStep },
  { id: 'experience', title: 'Experience', component: ExperienceStep },
  { id: 'availability', title: 'Availability', component: AvailabilityStep },
  { id: 'rates', title: 'Rates', component: RatesStep },
  { id: 'photos', title: 'Photos', component: PhotosStep },
  { id: 'testimonials', title: 'Testimonials', component: TestimonialsStep },
  { id: 'verification', title: 'Verification', component: VerificationStep },
  { id: 'safety-quiz', title: 'Safety Quiz', component: SafetyQuizStep },
  { id: 'review', title: 'Review', component: ReviewStep },
  { id: 'success', title: 'Complete', component: SuccessStep },
];

export const WalkerOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [walkerData, setWalkerData] = useState<WalkerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    experience: '',
    bio: '',
    petTypes: [],
    services: [],
    certifications: [],
    homeType: '',
    gardenType: '',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    advanceNotice: '',
    toiletBreaks: '',
    baseRate: 0,
    walkRate: 0,
    dayRate: 0,
    profilePhoto: '',
    galleryPhotos: [],
    testimonialEmails: [],
    verificationDocuments: {
      type: '',
      front: '',
      back: '',
    },
    quizAnswers: {},
  });

  // Save walker data to Supabase
  const saveWalkerData = async (data: Partial<WalkerData>) => {
    const email = data.email || walkerData.email;
    if (!email) return; // Require email to identify walker

    // Map to SQL schema format
    const formatted = {
      first_name: data.firstName ?? walkerData.firstName,
      last_name: data.lastName ?? walkerData.lastName,
      email,
      phone: data.phone ?? walkerData.phone,
      date_of_birth: data.dateOfBirth ?? walkerData.dateOfBirth,
      address: data.address ?? walkerData.address,
      experience: data.experience ?? walkerData.experience,
      bio: data.bio ?? walkerData.bio,
      pet_types: Array.isArray(data.petTypes ?? walkerData.petTypes) ? data.petTypes ?? walkerData.petTypes : [],
      services: Array.isArray(data.services ?? walkerData.services) ? data.services ?? walkerData.services : [],
      certifications: Array.isArray(data.certifications ?? walkerData.certifications) ? data.certifications ?? walkerData.certifications : [],
      home_type: data.homeType ?? walkerData.homeType,
      garden_type: data.gardenType ?? walkerData.gardenType,
      advance_notice: data.advanceNotice ?? walkerData.advanceNotice,
      toilet_breaks: data.toiletBreaks ?? walkerData.toiletBreaks,
      base_rate: data.baseRate ?? walkerData.baseRate ?? 0,
      walk_rate: data.walkRate ?? walkerData.walkRate ?? 0,
      day_rate: data.dayRate ?? walkerData.dayRate ?? 0,
      profile_photo: data.profilePhoto ?? walkerData.profilePhoto,
      gallery_photos: Array.isArray(data.galleryPhotos ?? walkerData.galleryPhotos) ? data.galleryPhotos ?? walkerData.galleryPhotos : [],
      rating: 5.0,
      reviews: 0,
      is_verified: false,
      is_safety_certified: false,
      insurance_included: false
    };

    // First save main walker profile
    const { data: upserted, error } = await supabase
      .from('walkers')
      .upsert([formatted], { 
        onConflict: 'email'
      })
      .select();

    if (error) {
      console.error('Failed to save walker data:', error.message);
      return;
    }

    const walkerId = upserted && upserted.length > 0 ? upserted[0]?.id : null;
    if (!walkerId) {
      console.error('No walker ID returned from upsert');
      return;
    }

    // Save availability
    if (data.availability || walkerData.availability) {
      const availability = {
        walker_id: walkerId,
        monday: data.availability?.monday ?? walkerData.availability?.monday ?? true,
        tuesday: data.availability?.tuesday ?? walkerData.availability?.tuesday ?? true,
        wednesday: data.availability?.wednesday ?? walkerData.availability?.wednesday ?? true,
        thursday: data.availability?.thursday ?? walkerData.availability?.thursday ?? true,
        friday: data.availability?.friday ?? walkerData.availability?.friday ?? true,
        saturday: data.availability?.saturday ?? walkerData.availability?.saturday ?? true,
        sunday: data.availability?.sunday ?? walkerData.availability?.sunday ?? true
      };

      const { error: availError } = await supabase
        .from('walker_availability')
        .upsert([availability], { onConflict: 'walker_id' });

      if (availError) {
        console.error('Failed to save availability:', availError.message);
      }
    }

    // Save verification documents if present
    if (data.verificationDocuments?.front || data.verificationDocuments?.back) {
      const verificationDoc = {
        walker_id: walkerId,
        document_type: data.verificationDocuments.type,
        front_image: data.verificationDocuments.front,
        back_image: data.verificationDocuments.back,
        status: 'pending'
      };

      const { error: verifyError } = await supabase
        .from('walker_verification_documents')
        .upsert([verificationDoc], { onConflict: 'walker_id' });

      if (verifyError) {
        console.error('Failed to save verification documents:', verifyError.message);
      }
    }

    // Save quiz answers if present
    if (Object.keys(data.quizAnswers || {}).length > 0) {
      const quizAnswers = Object.entries(data.quizAnswers || {}).map(([questionId, answer]) => ({
        walker_id: walkerId,
        question_id: parseInt(questionId),
        answer: answer as string,
        answered_at: new Date().toISOString()
      }));

      if (quizAnswers.length > 0) {
        const { error: quizError } = await supabase
          .from('walker_quiz_answers')
          .upsert(quizAnswers, { onConflict: 'walker_id,question_id' });

        if (quizError) {
          console.error('Failed to save quiz answers:', quizError.message);
        }
      }
    }

    // Create initial empty dashboard stats
    const dashboardStats = {
      walker_id: walkerId,
      total_walks: 0,
      total_earnings: 0,
      loyalty_points: 0
    };

    const { error: statsError } = await supabase
      .from('walker_dashboard_stats')
      .upsert([dashboardStats], { onConflict: 'walker_id' });

    if (statsError) {
      console.error('Failed to initialize dashboard stats:', statsError.message);
    }

    // Log success
    console.log('Successfully saved all walker data');
  };

  const updateWalkerData = async (data: Partial<WalkerData>) => {
    setWalkerData(prev => ({ ...prev, ...data }));
    await saveWalkerData(data);
  };

  const nextStep = async () => {
    // Save data before moving to next step
    await saveWalkerData({});
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/src/assets/logo-pup.png" alt="PupRoute" className="h-8 w-8" />
              <h1 className="text-xl font-bold text-gray-900">Become a Walker</h1>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{steps[currentStep].title}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[600px]"
          >
            {steps[currentStep].id === 'welcome' && (
              <WelcomeStep onNext={nextStep} />
            )}
            {steps[currentStep].id === 'basic-info' && (
              <BasicInfoStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'address' && (
              <AddressStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'contact' && (
              <ContactStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'experience' && (
              <ExperienceStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'availability' && (
              <AvailabilityStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'rates' && (
              <RatesStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'photos' && (
              <PhotosStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'testimonials' && (
              <TestimonialsStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'verification' && (
              <VerificationStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'safety-quiz' && (
              <SafetyQuizStep data={walkerData} updateData={updateWalkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'review' && (
              <ReviewStep data={walkerData} onNext={nextStep} onPrev={prevStep} />
            )}
            {steps[currentStep].id === 'success' && (
              <SuccessStep data={walkerData} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {currentStep !== 0 && currentStep !== steps.length - 1 && (
        <div className="bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkerOnboarding;
