-- Insert some sample data for development and testing

-- First, ensure we have a default loyalty program
INSERT INTO public.loyalty_programs (name, description, points_per_dollar, signup_bonus_points) 
VALUES ('PupRoute Rewards', 'Earn points for every walk and redeem for amazing rewards!', 1.00, 100)
ON CONFLICT (name) DO NOTHING;

-- Insert sample pet breeds (if they don't exist)
INSERT INTO public.pet_breeds (name, size_category, exercise_needs, typical_weight_min, typical_weight_max, temperament) VALUES
('Golden Retriever', 'large', 'high', 55, 75, '{"friendly", "intelligent", "devoted"}'),
('French Bulldog', 'small', 'moderate', 20, 28, '{"adaptable", "playful", "smart"}'),
('Border Collie', 'medium', 'very_high', 30, 55, '{"energetic", "intelligent", "alert"}'),
('Labrador Retriever', 'large', 'high', 55, 80, '{"friendly", "outgoing", "active"}'),
('German Shepherd', 'large', 'high', 50, 90, '{"confident", "courageous", "smart"}'),
('Bulldog', 'medium', 'low', 40, 50, '{"friendly", "courageous", "calm"}'),
('Poodle', 'medium', 'moderate', 45, 70, '{"intelligent", "active", "elegant"}'),
('Beagle', 'medium', 'moderate', 20, 30, '{"friendly", "curious", "merry"}'),
('Rottweiler', 'large', 'moderate', 80, 135, '{"confident", "fearless", "good-natured"}'),
('Yorkshire Terrier', 'toy', 'moderate', 4, 7, '{"affectionate", "sprightly", "tomboyish"}')
ON CONFLICT (name) DO NOTHING;

-- Function to create sample walker profiles (run this after users sign up)
CREATE OR REPLACE FUNCTION create_sample_walker_profiles()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    breed_ids UUID[];
BEGIN
    -- Get some breed IDs for specialties
    SELECT ARRAY(SELECT id FROM public.pet_breeds LIMIT 5) INTO breed_ids;
    
    -- Create walker profiles for existing users (if they don't have one)
    FOR user_record IN 
        SELECT id, first_name, last_name, email 
        FROM public.users 
        WHERE user_type = 'customer' 
        AND id NOT IN (SELECT user_id FROM public.walker_profiles)
        LIMIT 5
    LOOP
        -- Create walker profile
        INSERT INTO public.walker_profiles (
            user_id,
            bio,
            experience_years,
            hourly_rate,
            service_radius,
            is_available_now,
            max_dogs_per_walk,
            accepts_group_walks,
            accepts_puppies,
            accepts_senior_dogs,
            accepts_large_dogs,
            accepts_reactive_dogs,
            specialties,
            languages_spoken,
            has_own_transportation,
            total_walks_completed,
            average_rating,
            total_reviews,
            response_time_minutes,
            profile_status,
            is_featured
        ) VALUES (
            user_record.id,
            'Experienced dog walker who loves spending time with furry friends! I provide personalized care and attention to each pup.',
            FLOOR(RANDOM() * 5) + 1, -- 1-6 years experience
            (FLOOR(RANDOM() * 15) + 20)::decimal, -- $20-35/hour
            5.0,
            RANDOM() > 0.3, -- 70% chance available now
            CASE WHEN RANDOM() > 0.5 THEN 2 ELSE 1 END,
            RANDOM() > 0.6,
            RANDOM() > 0.2,
            RANDOM() > 0.3,
            RANDOM() > 0.4,
            RANDOM() > 0.8,
            ARRAY['Puppies', 'Training', 'Senior Dogs', 'Active Dogs']::text[],
            ARRAY['English']::text[],
            RANDOM() > 0.2,
            FLOOR(RANDOM() * 100) + 10, -- 10-110 walks
            (RANDOM() * 1.0 + 4.0)::decimal, -- 4.0-5.0 rating
            FLOOR(RANDOM() * 50) + 5, -- 5-55 reviews
            FLOOR(RANDOM() * 60) + 15, -- 15-75 minutes response time
            'approved',
            RANDOM() > 0.7 -- 30% chance featured
        );
    END LOOP;
END;
$$;

-- Function to create sample bookings
CREATE OR REPLACE FUNCTION create_sample_bookings()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    customer_record RECORD;
    pet_record RECORD;
    walker_record RECORD;
    service_record RECORD;
BEGIN
    -- Get a sample service type
    SELECT id, base_price, duration_minutes INTO service_record
    FROM public.service_types 
    WHERE name = '60 Minute Walk' 
    LIMIT 1;
    
    IF service_record.id IS NULL THEN
        RETURN; -- No service types available
    END IF;
    
    -- Create sample bookings for customers who have pets
    FOR customer_record IN 
        SELECT DISTINCT u.id as customer_id 
        FROM public.users u
        INNER JOIN public.pets p ON u.id = p.owner_id
        WHERE u.user_type = 'customer'
        LIMIT 3
    LOOP
        -- Get a pet for this customer
        SELECT id INTO pet_record
        FROM public.pets 
        WHERE owner_id = customer_record.customer_id 
        LIMIT 1;
        
        -- Get a random walker
        SELECT id INTO walker_record
        FROM public.walker_profiles 
        WHERE profile_status = 'approved'
        ORDER BY RANDOM()
        LIMIT 1;
        
        IF pet_record.id IS NOT NULL AND walker_record.id IS NOT NULL THEN
            -- Create a booking
            INSERT INTO public.bookings (
                customer_id,
                walker_id,
                pet_id,
                service_type_id,
                scheduled_date,
                scheduled_time,
                duration_minutes,
                pickup_address,
                base_price,
                total_amount,
                status,
                special_instructions
            ) VALUES (
                customer_record.customer_id,
                walker_record.id,
                pet_record.id,
                service_record.id,
                CURRENT_DATE + INTERVAL '1 day',
                '14:00:00',
                service_record.duration_minutes,
                '123 Main St, Sample City, ST 12345',
                service_record.base_price,
                service_record.base_price,
                CASE 
                    WHEN RANDOM() > 0.7 THEN 'completed'
                    WHEN RANDOM() > 0.4 THEN 'confirmed'
                    ELSE 'pending'
                END,
                'Please be gentle, my pup is a bit shy at first but warms up quickly!'
            );
        END IF;
    END LOOP;
END;
$$;

-- Run the functions to create sample data
-- Note: These will only work after users sign up and create pets
-- SELECT create_sample_walker_profiles();
-- SELECT create_sample_bookings();
