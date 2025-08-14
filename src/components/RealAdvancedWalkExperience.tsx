import React, { useState } from 'react';
import LiveWalkTracking from './LiveWalkTracking';
import { Card } from '@/components/ui/card';

interface Pet {
  id: string;
  name: string;
  breed: string;
  photo_url?: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  energy_level: 'low' | 'medium' | 'high';
}

interface Walker {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  rating: number;
}

interface RealAdvancedWalkExperienceProps {
  pets: Pet[];
  walker: Walker;
  duration: number;
  startLocation: { lat: number; lng: number };
  onEndWalk: () => void;
}

export const RealAdvancedWalkExperience: React.FC<RealAdvancedWalkExperienceProps> = ({
  pets,
  walker,
  duration,
  startLocation,
  onEndWalk
}) => {
  return (
    <LiveWalkTracking
      pets={pets}
      walker={walker}
      duration={duration}
      startLocation={startLocation}
      onEndWalk={onEndWalk}
    />
  );
};
