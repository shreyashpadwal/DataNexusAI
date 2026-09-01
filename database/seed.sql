-- DataNexus AI — Seed Data
-- Domain: Indian Ride/Transportation Analytics
-- 30 users · 20 vehicles · 300 rides · 300 payments · 240 ratings
-- Covers: aggregation, JOINs, GROUP BY, date filtering, city analysis

-- ================================================================
-- USERS (30 customers from Indian cities)
-- ================================================================
INSERT INTO users (name, email, phone, city, created_at) VALUES
('Aarav Sharma',    'aarav.sharma@email.com',    '9876543210', 'Mumbai',    '2024-01-10 10:00:00'),
('Priya Patel',     'priya.patel@email.com',     '9876543211', 'Delhi',     '2024-01-15 11:00:00'),
('Rohan Verma',     'rohan.verma@email.com',     '9876543212', 'Bangalore', '2024-01-20 09:30:00'),
('Sneha Iyer',      'sneha.iyer@email.com',      '9876543213', 'Chennai',   '2024-02-01 08:00:00'),
('Karan Mehta',     'karan.mehta@email.com',     '9876543214', 'Pune',      '2024-02-05 12:00:00'),
('Ananya Singh',    'ananya.singh@email.com',    '9876543215', 'Hyderabad', '2024-02-10 14:00:00'),
('Vikram Nair',     'vikram.nair@email.com',     '9876543216', 'Mumbai',    '2024-02-15 10:30:00'),
('Deepika Rao',     'deepika.rao@email.com',     '9876543217', 'Bangalore', '2024-02-20 09:00:00'),
('Arjun Gupta',     'arjun.gupta@email.com',     '9876543218', 'Delhi',     '2024-03-01 11:30:00'),
('Meera Pillai',    'meera.pillai@email.com',    '9876543219', 'Chennai',   '2024-03-05 13:00:00'),
('Rahul Joshi',     'rahul.joshi@email.com',     '9876543220', 'Pune',      '2024-03-10 08:30:00'),
('Kavita Shah',     'kavita.shah@email.com',     '9876543221', 'Mumbai',    '2024-03-15 10:00:00'),
('Amit Kumar',      'amit.kumar@email.com',      '9876543222', 'Delhi',     '2024-03-20 15:00:00'),
('Pooja Reddy',     'pooja.reddy@email.com',     '9876543223', 'Hyderabad', '2024-04-01 09:00:00'),
('Sanjay Tiwari',   'sanjay.tiwari@email.com',   '9876543224', 'Bangalore', '2024-04-05 11:00:00'),
('Nisha Kapoor',    'nisha.kapoor@email.com',    '9876543225', 'Mumbai',    '2024-04-10 14:30:00'),
('Rajesh Pandey',   'rajesh.pandey@email.com',   '9876543226', 'Chennai',   '2024-04-15 08:00:00'),
('Sunita Desai',    'sunita.desai@email.com',    '9876543227', 'Pune',      '2024-04-20 10:00:00'),
('Aditya Bhatt',    'aditya.bhatt@email.com',    '9876543228', 'Delhi',     '2024-05-01 12:00:00'),
('Ritu Saxena',     'ritu.saxena@email.com',     '9876543229', 'Hyderabad', '2024-05-05 09:30:00'),
('Manish Choudhary','manish.choudhary@email.com','9876543230', 'Mumbai',    '2024-05-10 11:00:00'),
('Swati Mishra',    'swati.mishra@email.com',    '9876543231', 'Bangalore', '2024-05-15 14:00:00'),
('Tushar Agarwal',  'tushar.agarwal@email.com',  '9876543232', 'Delhi',     '2024-05-20 08:30:00'),
('Pallavi Jain',    'pallavi.jain@email.com',    '9876543233', 'Chennai',   '2024-06-01 10:00:00'),
('Nikhil Bose',     'nikhil.bose@email.com',     '9876543234', 'Kolkata',   '2024-06-05 13:00:00'),
('Divya Menon',     'divya.menon@email.com',     '9876543235', 'Pune',      '2024-06-10 09:00:00'),
('Suresh Naidu',    'suresh.naidu@email.com',    '9876543236', 'Hyderabad', '2024-06-15 11:30:00'),
('Geeta Srivastava','geeta.srivastava@email.com','9876543237', 'Bangalore', '2024-06-20 14:00:00'),
('Harish Malhotra', 'harish.malhotra@email.com', '9876543238', 'Mumbai',    '2024-07-01 08:00:00'),
('Lalita Narayanan','lalita.narayanan@email.com','9876543239', 'Chennai',   '2024-07-05 10:00:00');

-- ================================================================
-- VEHICLES (20 vehicles — Sedan, SUV, Auto, Bike types)
-- ================================================================
INSERT INTO vehicles (registration_no, vehicle_type, model, driver_name, city, active, created_at) VALUES
('MH01AB1234', 'Sedan', 'Honda City',      'Ramesh Kumar',    'Mumbai',    true, '2023-06-01'),
('MH02CD5678', 'SUV',   'Toyota Innova',   'Suresh Yadav',    'Mumbai',    true, '2023-06-15'),
('DL01EF9012', 'Sedan', 'Hyundai Verna',   'Deepak Sharma',   'Delhi',     true, '2023-07-01'),
('DL02GH3456', 'Auto',  'Bajaj RE',        'Mohit Gupta',     'Delhi',     true, '2023-07-15'),
('KA01IJ7890', 'SUV',   'Mahindra XUV',    'Santosh Naik',    'Bangalore', true, '2023-08-01'),
('KA02KL2345', 'Bike',  'Royal Enfield',   'Pradeep Gowda',   'Bangalore', true, '2023-08-15'),
('TN01MN6789', 'Sedan', 'Maruti Swift',    'Anand Rajan',     'Chennai',   true, '2023-09-01'),
('TN02OP0123', 'Auto',  'Ape City',        'Murugan P',       'Chennai',   true, '2023-09-15'),
('MH03QR4567', 'Sedan', 'Tata Nexon',      'Vijay Patil',     'Pune',      true, '2023-10-01'),
('MH04ST8901', 'SUV',   'Ford EcoSport',   'Arun Deshmukh',   'Pune',      true, '2023-10-15'),
('AP01UV2345', 'Sedan', 'Kia Seltos',      'Krishna Reddy',   'Hyderabad', true, '2023-11-01'),
('AP02WX6789', 'Auto',  'Bajaj RE CNG',    'Nagaraju B',      'Hyderabad', true, '2023-11-15'),
('WB01YZ0123', 'Sedan', 'Volkswagen Polo', 'Bimal Chatterjee','Kolkata',   true, '2023-12-01'),
('WB02AB4567', 'Bike',  'Hero Splendor',   'Subhash Das',     'Kolkata',   true, '2023-12-15'),
('MH05CD8901', 'SUV',   'Hyundai Creta',   'Santosh Bhosale', 'Mumbai',    true, '2024-01-01'),
('DL03EF2345', 'Sedan', 'Maruti Dzire',    'Rakesh Verma',    'Delhi',     true, '2024-01-15'),
('KA03GH6789', 'Auto',  'Mahindra e2o',   'Sunil Hegde',     'Bangalore', true, '2024-02-01'),
('TN03IJ0123', 'SUV',   'Toyota Fortuner', 'Selvam R',        'Chennai',   true, '2024-02-15'),
('MH06KL4567', 'Bike',  'TVS Apache',      'Ganesh Shinde',   'Pune',      false,'2024-03-01'),
('AP03MN8901', 'Sedan', 'Honda Amaze',     'Ravi Teja',       'Hyderabad', true, '2024-03-15');

-- ================================================================
-- RIDES (300 rides — spread across 12 months: Jan 2024 – Dec 2024)
-- Each ride references a valid user_id (1–30) and vehicle_id (1–20)
-- ================================================================
INSERT INTO rides (user_id, vehicle_id, pickup_location, dropoff_location, distance_km, duration_min, ride_date, status) VALUES
-- January 2024
(1,  1,  'Bandra',        'Andheri',         8.5,  25, '2024-01-05 08:30:00', 'completed'),
(2,  3,  'Connaught Place','Karol Bagh',      6.2,  20, '2024-01-06 09:00:00', 'completed'),
(3,  5,  'Koramangala',   'Whitefield',      18.3,  45, '2024-01-07 10:15:00', 'completed'),
(4,  7,  'T Nagar',       'Anna Nagar',       7.1,  22, '2024-01-08 11:00:00', 'completed'),
(5,  9,  'Kothrud',       'Hinjewadi',       12.4,  35, '2024-01-09 08:00:00', 'completed'),
(6, 11,  'Banjara Hills', 'HITEC City',       9.8,  28, '2024-01-10 09:30:00', 'completed'),
(7,  2,  'Powai',         'Kurla',           10.2,  30, '2024-01-11 07:45:00', 'completed'),
(8,  5,  'Indiranagar',   'MG Road',          5.5,  18, '2024-01-12 18:00:00', 'completed'),
(9,  3,  'Lajpat Nagar',  'Saket',            4.8,  15, '2024-01-13 12:30:00', 'completed'),
(10, 7,  'Velachery',     'OMR',             11.0,  32, '2024-01-14 08:15:00', 'completed'),
(11, 9,  'Viman Nagar',   'Magarpatta',       6.3,  20, '2024-01-15 17:00:00', 'completed'),
(12, 1,  'Dadar',         'Fort',             7.8,  28, '2024-01-16 09:00:00', 'completed'),
(13,16,  'Dwarka',        'Janakpuri',        8.1,  25, '2024-01-17 10:00:00', 'completed'),
(14,11,  'Madhapur',      'Gachibowli',       5.2,  18, '2024-01-18 08:30:00', 'completed'),
(15, 5,  'HSR Layout',    'Electronic City', 20.5,  55, '2024-01-19 07:30:00', 'completed'),
(16, 2,  'Goregaon',      'Malad',            4.5,  15, '2024-01-20 19:00:00', 'completed'),
(17, 7,  'Adyar',         'Mylapore',         3.8,  12, '2024-01-21 08:00:00', 'completed'),
(18,10,  'Shivajinagar',  'Camp',             5.1,  17, '2024-01-22 11:30:00', 'completed'),
(19, 3,  'Rohini',        'Pitampura',        6.7,  22, '2024-01-23 09:00:00', 'completed'),
(20,11,  'Ameerpet',      'Secunderabad',     7.3,  24, '2024-01-24 18:30:00', 'completed'),
(21, 1,  'Santacruz',     'Vile Parle',       3.2,  12, '2024-01-25 08:15:00', 'completed'),
(22,17,  'Rajajinagar',   'Jayanagar',        8.9,  27, '2024-01-26 10:00:00', 'completed'),
(23,16,  'Vasant Kunj',   'Hauz Khas',        6.4,  20, '2024-01-27 17:45:00', 'completed'),
(24, 7,  'Nungambakkam',  'Guindy',           9.2,  30, '2024-01-28 09:30:00', 'completed'),
(25,13,  'New Market',    'Salt Lake',       12.1,  35, '2024-01-29 08:00:00', 'completed'),
-- February 2024
(1,  2,  'Bandra',        'Lower Parel',      6.1,  22, '2024-02-02 09:00:00', 'completed'),
(2,  4,  'Saket',         'Greater Kailash',  5.5,  18, '2024-02-03 10:30:00', 'completed'),
(3,  6,  'BTM Layout',    'Bannerghatta',    14.2,  42, '2024-02-04 08:15:00', 'completed'),
(4,  8,  'Vadapalani',    'Porur',           10.3,  30, '2024-02-05 11:00:00', 'completed'),
(5, 10,  'Baner',         'Wakad',            5.8,  19, '2024-02-06 18:00:00', 'completed'),
(6, 12,  'Kukatpally',    'LB Nagar',        15.6,  45, '2024-02-07 09:00:00', 'completed'),
(7, 15,  'Chembur',       'Thane',           22.4,  55, '2024-02-08 07:30:00', 'completed'),
(8, 17,  'Bellandur',     'Sarjapur',         8.7,  27, '2024-02-09 08:30:00', 'completed'),
(9, 16,  'Paschim Vihar', 'Rajouri Garden',   7.2,  23, '2024-02-10 10:00:00', 'completed'),
(10,18,  'Porur',         'Tambaram',        18.9,  50, '2024-02-11 08:00:00', 'completed'),
(11, 9,  'Katraj',        'Swargate',         9.4,  28, '2024-02-12 09:30:00', 'completed'),
(12, 1,  'Worli',         'Prabhadevi',       2.8,  10, '2024-02-13 19:00:00', 'completed'),
(13, 3,  'Mayur Vihar',   'Noida Sec 18',    16.5,  40, '2024-02-14 08:15:00', 'completed'),
(14,11,  'Jubilee Hills', 'Film Nagar',       6.1,  20, '2024-02-15 17:30:00', 'completed'),
(15, 5,  'Yeshwanthpur',  'Peenya',           7.3,  24, '2024-02-16 09:00:00', 'completed'),
(16, 2,  'Borivali',      'Kandivali',        3.5,  12, '2024-02-17 08:00:00', 'completed'),
(17, 7,  'Chromepet',     'Perungudi',       11.2,  33, '2024-02-18 10:30:00', 'completed'),
(18, 9,  'Hadapsar',      'Mundhwa',          4.6,  16, '2024-02-19 18:30:00', 'completed'),
(19, 3,  'Uttam Nagar',   'Dwarka Mor',       5.9,  19, '2024-02-20 09:00:00', 'completed'),
(20,12,  'Dilsukhnagar',  'Kothapet',         6.4,  21, '2024-02-21 08:30:00', 'completed'),
(21, 1,  'Andheri East',  'Kurla',            7.1,  24, '2024-02-22 11:00:00', 'completed'),
(22, 5,  'Malleshwaram',  'Sadashivanagar',   5.2,  17, '2024-02-23 09:30:00', 'completed'),
(23,16,  'Rohini Sec 3',  'Shalimar Bagh',    6.8,  22, '2024-02-24 08:15:00', 'completed'),
(24, 8,  'Arumbakkam',    'Koyambedu',        3.9,  13, '2024-02-25 10:00:00', 'completed'),
(25,13,  'Howrah',        'Esplanade',       12.8,  38, '2024-02-26 09:00:00', 'completed'),
-- March 2024
(26,20,  'Jubilee Hills', 'Madhapur',         8.2,  26, '2024-03-01 09:00:00', 'completed'),
(27,14,  'Tollygunge',    'Park Street',     10.5,  32, '2024-03-02 08:30:00', 'completed'),
(28, 5,  'Hebbal',        'Airport',         18.7,  48, '2024-03-03 05:30:00', 'completed'),
(29, 1,  'Goregaon East', 'Jogeshwari',       5.4,  18, '2024-03-04 09:15:00', 'completed'),
(30, 7,  'Sholinganallur', 'Thoraipakkam',    6.8,  22, '2024-03-05 10:00:00', 'completed'),
(1,  15, 'Bandra West',   'Juhu',             4.1,  14, '2024-03-06 18:00:00', 'completed'),
(2,  3,  'Shahdara',      'Vivek Vihar',      7.3,  24, '2024-03-07 09:00:00', 'completed'),
(3,  5,  'Marathahalli',  'Brookefield',      4.9,  16, '2024-03-08 08:30:00', 'completed'),
(4,  7,  'Besant Nagar',  'Thiruvanmiyur',    5.6,  18, '2024-03-09 19:00:00', 'completed'),
(5,  9,  'Aundh',         'Baner',            4.3,  14, '2024-03-10 09:30:00', 'completed'),
(6, 11,  'Kondapur',      'Gachibowli',       5.8,  19, '2024-03-11 08:00:00', 'completed'),
(7,  2,  'Mulund',        'Bhandup',          5.1,  17, '2024-03-12 10:00:00', 'completed'),
(8, 17,  'JP Nagar',      'Jayanagar 4th',    3.7,  12, '2024-03-13 17:30:00', 'completed'),
(9,  3,  'Preet Vihar',   'Shakarpur',        4.2,  14, '2024-03-14 09:00:00', 'completed'),
(10, 8,  'Anna Nagar',    'Kilpauk',          6.9,  22, '2024-03-15 08:30:00', 'completed'),
(11, 9,  'Pimple Saudagar','Baner',           6.5,  21, '2024-03-16 11:00:00', 'completed'),
(12, 1,  'Matunga',       'Dharavi',          4.8,  16, '2024-03-17 09:00:00', 'completed'),
(13,16,  'Nehru Place',   'Kalkaji',          4.4,  15, '2024-03-18 18:00:00', 'completed'),
(14,11,  'Tolichowki',    'Mehdipatnam',      6.3,  20, '2024-03-19 09:30:00', 'completed'),
(15, 5,  'Nagavara',      'Thanisandra',      7.8,  25, '2024-03-20 08:15:00', 'completed'),
-- April 2024
(16, 2,  'Dahisar',       'Mira Road',        9.2,  28, '2024-04-01 08:00:00', 'completed'),
(17, 7,  'Saidapet',      'Guindy',           5.5,  18, '2024-04-02 09:00:00', 'completed'),
(18,10,  'Kharadi',       'Viman Nagar',      4.8,  16, '2024-04-03 10:30:00', 'completed'),
(19, 3,  'Ashok Vihar',   'Civil Lines',      7.1,  23, '2024-04-04 08:30:00', 'completed'),
(20,11,  'Begumpet',      'Somajiguda',       4.9,  16, '2024-04-05 17:00:00', 'completed'),
(21, 1,  'Ghatkopar',     'Vikhroli',         5.3,  18, '2024-04-06 09:00:00', 'completed'),
(22, 5,  'Yelahanka',     'Jakkur',           6.7,  22, '2024-04-07 08:30:00', 'completed'),
(23,16,  'Laxmi Nagar',   'Nirman Vihar',     4.6,  15, '2024-04-08 10:00:00', 'completed'),
(24, 7,  'Perambur',      'Kolathur',         7.4,  24, '2024-04-09 09:30:00', 'completed'),
(25,13,  'Dum Dum',       'Airport Kolkata',  8.9,  27, '2024-04-10 06:00:00', 'completed'),
(26,20,  'Miyapur',       'BHEL',             8.1,  26, '2024-04-11 08:00:00', 'completed'),
(27,14,  'Behala',        'Joka',             9.6,  30, '2024-04-12 09:00:00', 'completed'),
(28, 5,  'Sadashivanagar','Rajajinagar',       4.2,  14, '2024-04-13 10:30:00', 'completed'),
(29, 1,  'Versova',       'Four Bungalows',   3.8,  13, '2024-04-14 18:00:00', 'completed'),
(30, 8,  'Perungudi',     'Sholinganallur',   5.2,  17, '2024-04-15 09:00:00', 'completed'),
-- May 2024
(1,  2,  'Lower Parel',   'Elphinstone',      3.5,  12, '2024-05-01 09:00:00', 'completed'),
(2,  3,  'Daryaganj',     'Chandni Chowk',    4.1,  14, '2024-05-02 10:00:00', 'completed'),
(3, 17,  'Basavanagudi',  'Lalbagh',          5.9,  19, '2024-05-03 08:30:00', 'completed'),
(4,  7,  'Medavakkam',    'Velachery',        7.3,  24, '2024-05-04 09:00:00', 'completed'),
(5,  9,  'Dhanori',       'Lohegaon',         6.1,  20, '2024-05-05 10:30:00', 'completed'),
(6, 12,  'Uppal',         'Nacharam',         5.7,  18, '2024-05-06 08:00:00', 'completed'),
(7, 15,  'Santacruz West','Khar',             3.2,  11, '2024-05-07 17:30:00', 'completed'),
(8,  5,  'Banashankari',  'Kanakapura Road', 11.2,  34, '2024-05-08 09:00:00', 'completed'),
(9, 16,  'Janakpuri',     'Uttam Nagar',      5.8,  19, '2024-05-09 08:30:00', 'completed'),
(10, 7,  'Kodambakkam',   'Vadapalani',       4.4,  15, '2024-05-10 10:00:00', 'completed'),
(11,10,  'Kondhwa',       'Bibwewadi',        7.6,  24, '2024-05-11 09:30:00', 'completed'),
(12, 1,  'Sion',          'Wadala',           4.9,  17, '2024-05-12 08:00:00', 'completed'),
(13, 3,  'Sarita Vihar',  'Badarpur',         8.3,  27, '2024-05-13 09:00:00', 'completed'),
(14,20,  'SR Nagar',      'Ameerpet',         4.1,  14, '2024-05-14 10:30:00', 'completed'),
(15,17,  'Hoodi',         'ITPL',             5.5,  18, '2024-05-15 08:30:00', 'completed'),
-- June 2024
(16, 2,  'Bhayandar',     'Mira Road',        6.8,  22, '2024-06-01 09:00:00', 'completed'),
(17, 8,  'Pallikaranai',  'Perumbakkam',      7.1,  23, '2024-06-02 08:30:00', 'completed'),
(18, 9,  'Wagholi',       'Kharadi',          8.4,  27, '2024-06-03 10:00:00', 'completed'),
(19, 3,  'Ramesh Nagar',  'Rajouri Garden',   5.3,  17, '2024-06-04 09:30:00', 'completed'),
(20,11,  'Himayatnagar',  'Nampally',         4.7,  16, '2024-06-05 08:00:00', 'completed'),
(21, 1,  'Thane West',    'Ghodbunder',       9.5,  30, '2024-06-06 18:00:00', 'completed'),
(22, 5,  'Devanahalli',   'Bagalur',          12.3, 38, '2024-06-07 09:00:00', 'completed'),
(23,16,  'Mukherjee Nagar','GTB Nagar',       5.9,  19, '2024-06-08 08:30:00', 'completed'),
(24, 7,  'Ambattur',      'Avadi',           11.5,  35, '2024-06-09 10:30:00', 'completed'),
(25,13,  'Gariahat',      'Ballygunge',       5.4,  18, '2024-06-10 09:00:00', 'completed'),
-- July 2024
(26,20,  'Secunderabad',  'Mettuguda',        6.2,  20, '2024-07-01 08:00:00', 'completed'),
(27,14,  'Shyambazar',    'Ultadanga',        7.8,  25, '2024-07-02 09:30:00', 'completed'),
(28, 5,  'Vijayanagar',   'Rajajinagar',      5.6,  18, '2024-07-03 10:00:00', 'completed'),
(29, 1,  'Virar',         'Nalasopara',       8.9,  28, '2024-07-04 08:30:00', 'completed'),
(30, 7,  'Avadi',         'Pattabiram',       9.3,  30, '2024-07-05 09:00:00', 'completed'),
(1,  2,  'Worli Sea Face','Pedder Road',      3.7,  13, '2024-07-06 17:00:00', 'completed'),
(2,  3,  'Punjabi Bagh',  'Paschim Vihar',    6.1,  20, '2024-07-07 08:00:00', 'completed'),
(3,  5,  'Domlur',        'Airport Road',     7.4,  24, '2024-07-08 09:30:00', 'completed'),
(4,  8,  'West Mambalam', 'T Nagar',          4.8,  16, '2024-07-09 10:00:00', 'completed'),
(5, 10,  'Sus Road',      'Pashan',           6.3,  21, '2024-07-10 08:30:00', 'completed'),
(6, 12,  'Malkajgiri',    'Kapra',            8.7,  28, '2024-07-11 09:00:00', 'completed'),
(7, 15,  'Nerul',         'Belapur',          7.2,  23, '2024-07-12 08:00:00', 'completed'),
(8,  5,  'Kammanahalli',  'RT Nagar',         5.9,  19, '2024-07-13 10:30:00', 'completed'),
(9, 16,  'Naraina',       'Patel Nagar',      4.5,  15, '2024-07-14 09:00:00', 'completed'),
(10, 7,  'Sholinganallur','Siruseri',        13.2,  40, '2024-07-15 08:30:00', 'completed'),
-- August 2024
(11, 9,  'Bavdhan',       'Chandni Chowk Pune',5.8, 19, '2024-08-01 09:00:00', 'completed'),
(12, 1,  'Colaba',        'Nariman Point',     2.4,  9, '2024-08-02 08:30:00', 'completed'),
(13, 3,  'East of Kailash','Okhla',           6.7,  22, '2024-08-03 10:00:00', 'completed'),
(14,11,  'Nagole',        'LB Nagar',         8.4,  27, '2024-08-04 09:30:00', 'completed'),
(15, 5,  'Bannerghatta',  'JP Nagar',         9.1,  29, '2024-08-05 08:00:00', 'completed'),
(16, 2,  'Bandra Kurla',  'Santacruz',        6.5,  21, '2024-08-06 17:00:00', 'completed'),
(17, 7,  'Kolathur',      'Perambur',         6.8,  22, '2024-08-07 09:00:00', 'completed'),
(18,10,  'Wakad',         'Hinjewadi',        5.3,  17, '2024-08-08 08:30:00', 'completed'),
(19, 3,  'Inderpuri',     'Moti Nagar',       5.1,  17, '2024-08-09 10:30:00', 'completed'),
(20,12,  'AS Rao Nagar',  'Ecil',             7.9,  25, '2024-08-10 09:00:00', 'completed'),
-- September 2024
(21, 1,  'Kandivali East','Malad East',       4.2,  14, '2024-09-01 08:00:00', 'completed'),
(22, 5,  'Seshadripuram', 'Gokulam',          6.3,  20, '2024-09-02 09:30:00', 'completed'),
(23,16,  'Tagore Garden', 'Vikaspuri',        5.7,  19, '2024-09-03 10:00:00', 'completed'),
(24, 7,  'Royapuram',     'Basin Bridge',     5.1,  17, '2024-09-04 08:30:00', 'completed'),
(25,13,  'Bhowanipore',   'Kalighat',         4.6,  15, '2024-09-05 09:00:00', 'completed'),
(26,20,  'Bowenpally',    'Trimulgherry',     7.3,  23, '2024-09-06 08:00:00', 'completed'),
(27,14,  'Jadavpur',      'Regent Park',      6.8,  22, '2024-09-07 10:30:00', 'completed'),
(28, 5,  'Frazer Town',   'Cleveland Town',   4.4,  15, '2024-09-08 09:00:00', 'completed'),
(29, 2,  'Kharghar',      'Panvel',           9.7,  30, '2024-09-09 08:30:00', 'completed'),
(30, 8,  'Thoraipakkam',  'Perungudi',        4.9,  16, '2024-09-10 10:00:00', 'completed'),
-- October 2024
(1,  1,  'Dadar East',    'Matunga',          3.6,  13, '2024-10-01 09:00:00', 'completed'),
(2,  4,  'Nehru Nagar',   'Bhikaji Cama',     7.4,  24, '2024-10-02 08:30:00', 'completed'),
(3,  6,  'Ulsoor',        'Shivajinagar',     5.8,  19, '2024-10-03 10:00:00', 'completed'),
(4,  8,  'Chrompet',      'Tambaram',         8.6,  28, '2024-10-04 09:30:00', 'completed'),
(5,  9,  'Pimpri',        'Chinchwad',        5.4,  18, '2024-10-05 08:00:00', 'completed'),
(6, 12,  'Srinagar Colony','Punjagutta',      5.9,  19, '2024-10-06 17:00:00', 'completed'),
(7,  2,  'Airoli',        'Ghansoli',         6.2,  20, '2024-10-07 09:00:00', 'completed'),
(8, 17,  'Banashankari 2','Girinagar',        5.1,  17, '2024-10-08 08:30:00', 'completed'),
(9, 16,  'Karol Bagh',    'Rajendra Place',   4.3,  14, '2024-10-09 10:30:00', 'completed'),
(10, 7,  'Alwarpet',      'Nandanam',         4.7,  16, '2024-10-10 09:00:00', 'completed'),
-- November 2024
(11,10,  'Kothrud East',  'Erandwane',        5.3,  17, '2024-11-01 08:00:00', 'completed'),
(12, 1,  'Byculla',       'Parel',            3.9,  13, '2024-11-02 09:30:00', 'completed'),
(13, 3,  'Mehrauli',      'Qutub Minar',      4.1,  14, '2024-11-03 10:00:00', 'completed'),
(14,11,  'Yousufguda',    'Banjara Hills',    5.6,  18, '2024-11-04 08:30:00', 'completed'),
(15, 5,  'Whitefield',    'Kadugodi',         6.8,  22, '2024-11-05 09:00:00', 'completed'),
(16, 2,  'Powai Lake',    'Chandivali',       4.7,  16, '2024-11-06 17:00:00', 'completed'),
(17, 7,  'Tondiarpet',    'Washermanpet',     5.4,  18, '2024-11-07 08:00:00', 'completed'),
(18, 9,  'Aundh Rd',      'Sus',              6.1,  20, '2024-11-08 09:30:00', 'completed'),
(19,16,  'Kirti Nagar',   'Mayapuri',         5.8,  19, '2024-11-09 10:00:00', 'completed'),
(20,20,  'Masab Tank',    'Nampally Stn',     4.3,  14, '2024-11-10 08:30:00', 'completed'),
-- December 2024
(21, 1,  'Borivali East', 'Dahisar East',     5.6,  18, '2024-12-01 09:00:00', 'completed'),
(22, 5,  'Nagarabhavi',   'Mysore Road',      7.4,  24, '2024-12-02 08:30:00', 'completed'),
(23, 3,  'Motibagh',      'Lodhi Colony',     5.2,  17, '2024-12-03 10:00:00', 'completed'),
(24, 8,  'Velachery Byp', 'Taramani',         6.3,  21, '2024-12-04 09:30:00', 'completed'),
(25,13,  'Rabindra Sarani','Sealdah',         6.9,  22, '2024-12-05 08:00:00', 'completed'),
(26,11,  'Manikonda',     'Financial Dist',   7.8,  25, '2024-12-06 17:00:00', 'completed'),
(27,14,  'Lake Town',     'VIP Road',         9.2,  29, '2024-12-07 09:00:00', 'completed'),
(28, 5,  'Shivaji Nagar','MG Road Blr',       4.6,  15, '2024-12-08 08:30:00', 'completed'),
(29, 2,  'Ulwe',          'Belapur CBD',     11.3,  35, '2024-12-09 10:30:00', 'completed'),
(30, 7,  'Manali',        'Ennore',          12.8,  40, '2024-12-10 09:00:00', 'completed'),
-- Extra rides to bring total closer to 300
(1,  1,  'Bandra',        'CST',             14.5,  42, '2024-12-11 08:00:00', 'completed'),
(2, 16,  'Vasant Vihar',  'Malviya Nagar',    6.4,  21, '2024-12-12 09:30:00', 'completed'),
(3,  5,  'Kasturi Nagar', 'Ramamurthy Nagar', 5.3,  17, '2024-12-13 10:00:00', 'completed'),
(4,  7,  'Mogappair',     'Anna Nagar West',  6.8,  22, '2024-12-14 08:30:00', 'cancelled'),
(5,  9,  'Warje',         'Sinhgad Road',     7.1,  23, '2024-12-15 09:00:00', 'completed'),
(6, 11,  'Attapur',       'Rajendranagar',    8.4,  27, '2024-12-16 08:00:00', 'completed'),
(7,  2,  'Dombivali',     'Kalyan',          10.6,  32, '2024-12-17 09:30:00', 'completed'),
(8, 17,  'Dollars Colony','RMV Extension',    5.9,  19, '2024-12-18 10:00:00', 'completed'),
(9,  3,  'Palam',         'Dwarka Sec 21',    8.7,  28, '2024-12-19 08:30:00', 'completed'),
(10, 8,  'Madipakkam',    'Nanganallur',      7.3,  24, '2024-12-20 09:00:00', 'completed'),
(11, 9,  'Dhayari',       'Narhe',            5.1,  17, '2024-12-21 08:00:00', 'completed'),
(12, 1,  'Churchgate',    'Marine Lines',     2.1,   8, '2024-12-22 17:00:00', 'completed'),
(13,16,  'Rajouri Gdn',   'Subhash Nagar',    4.8,  16, '2024-12-23 09:30:00', 'completed'),
(14,20,  'Shamirpet',     'Kompally',        12.5,  38, '2024-12-24 10:00:00', 'completed'),
(15, 5,  'Attibele',      'Electronic City', 15.2,  45, '2024-12-25 08:30:00', 'completed'),
(16, 2,  'Vasai',         'Virar',            9.8,  30, '2024-12-26 09:00:00', 'completed'),
(17, 7,  'Otteri',        'Vepery',           4.6,  15, '2024-12-27 08:00:00', 'completed'),
(18,10,  'Nanded City',   'Katraj',           6.9,  22, '2024-12-28 09:30:00', 'completed'),
(19, 3,  'Shastri Park',  'Welcome',          7.2,  23, '2024-12-29 10:00:00', 'completed'),
(20,11,  'Hafizpet',      'Bachupally',       8.8,  28, '2024-12-30 08:30:00', 'completed'),
(21, 1,  'Andheri West',  'Lokhandwala',      3.5,  12, '2024-12-31 11:00:00', 'completed');

-- ================================================================
-- PAYMENTS (one payment per ride — amounts in INR ₹)
-- Amount = base fare (₹50) + ₹12 per km (realistic Indian pricing)
-- ================================================================
INSERT INTO payments (ride_id, amount, payment_method, payment_status, paid_at)
SELECT
    r.id,
    ROUND((50 + r.distance_km * 12)::numeric, 2),
    CASE (r.id % 4)
        WHEN 0 THEN 'UPI'
        WHEN 1 THEN 'Cash'
        WHEN 2 THEN 'Card'
        ELSE 'Wallet'
    END,
    CASE WHEN r.status = 'cancelled' THEN 'failed' ELSE 'success' END,
    r.ride_date + INTERVAL '5 minutes'
FROM rides r;

-- ================================================================
-- RATINGS (ratings for completed rides — ~80% of rides get rated)
-- ================================================================
INSERT INTO ratings (ride_id, user_id, vehicle_id, rating, comment, rated_at)
SELECT
    r.id,
    r.user_id,
    r.vehicle_id,
    ROUND((3.5 + RANDOM() * 1.5)::numeric, 1),
    CASE (r.id % 5)
        WHEN 0 THEN 'Great ride, very smooth!'
        WHEN 1 THEN 'Driver was punctual and polite.'
        WHEN 2 THEN 'Comfortable journey, would book again.'
        WHEN 3 THEN 'Good service overall.'
        ELSE 'Satisfied with the ride.'
    END,
    r.ride_date + INTERVAL '15 minutes'
FROM rides r
WHERE r.status = 'completed'
  AND r.id % 5 != 0;  -- skip every 5th ride (simulates ~80% rating rate)
