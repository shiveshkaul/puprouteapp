-- Test data for PupRoute booking system
-- Run this in your Supabase SQL editor to test the booking functionality

-- Insert sample service types if they don't exist
INSERT INTO service_types (name, description, base_price, duration_minutes, is_active) VALUES
('Quick Walk', 'A 30-minute neighborhood walk perfect for daily exercise', 25.00, 30, true),
('Adventure Walk', 'A 60-minute exciting walk with exploration and playtime', 45.00, 60, true),
('Extended Adventure', 'A 90-minute comprehensive walk with training and socialization', 65.00, 90, true),
('Puppy Special', 'A gentle 20-minute walk designed for puppies under 6 months', 20.00, 20, true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample pet breeds if they don't exist
INSERT INTO pet_breeds (name, size_category, typical_temperament, exercise_needs) VALUES
('Golden Retriever', 'large', 'friendly', 'high'),
('Labrador Retriever', 'large', 'friendly', 'high'),
('French Bulldog', 'small', 'playful', 'moderate'),
('German Shepherd', 'large', 'loyal', 'high'),
('Poodle', 'medium', 'intelligent', 'moderate'),
('Chihuahua', 'small', 'alert', 'low'),
('Border Collie', 'medium', 'energetic', 'very_high'),
('Bulldog', 'medium', 'calm', 'low')
ON CONFLICT (name) DO NOTHING;

-- Note: You can test the booking system by:
-- 1. Creating an account and logging in
-- 2. Adding a pet in the Pets section
-- 3. Going to "Book a Walk" and creating a booking
-- 4. The booking will appear in your Dashboard and Schedule

-- To view your bookings:
-- SELECT * FROM bookings WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- To view available service types:
-- SELECT * FROM service_types WHERE is_active = true;

-- To view available walkers:
-- SELECT w.*, u.first_name, u.last_name FROM walkers w 
-- JOIN users u ON w.user_id = u.id 
-- WHERE w.is_active = true;
