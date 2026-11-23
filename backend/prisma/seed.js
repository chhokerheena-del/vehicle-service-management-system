const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const staffPassword = await bcrypt.hash('Staff@123', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);

  // 1. Seed Users
  console.log('Seeding Users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@autocare.com' },
    update: { password: adminPassword, role: 'ADMIN' },
    create: {
      name: 'System Administrator',
      email: 'admin@autocare.com',
      password: adminPassword,
      phone: '+91 99999 00001',
      role: 'ADMIN',
      address: 'AutoCare Headquarters, Barakhamba Road',
      city: 'New Delhi'
    }
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@autocare.com' },
    update: { password: staffPassword, role: 'STAFF' },
    create: {
      name: 'Rohan Sharma (Service Advisor)',
      email: 'staff@autocare.com',
      password: staffPassword,
      phone: '+91 99999 00002',
      role: 'STAFF',
      address: 'Workshop Bay 4, AutoCare Central Hub',
      city: 'New Delhi'
    }
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@autocare.com' },
    update: { password: customerPassword, role: 'CUSTOMER' },
    create: {
      name: 'Arun Kumar',
      email: 'customer@autocare.com',
      password: customerPassword,
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      address: 'C-42, Hauz Khas Enclave',
      city: 'New Delhi'
    }
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'vikram.sharma@example.com' },
    update: { password: customerPassword, role: 'CUSTOMER' },
    create: {
      name: 'Vikram Sharma',
      email: 'vikram.sharma@example.com',
      password: customerPassword,
      phone: '+91 98450 11223',
      role: 'CUSTOMER',
      address: '74, Indiranagar 100ft Road',
      city: 'Bengaluru'
    }
  });

  const customer3 = await prisma.user.upsert({
    where: { email: 'priya.patel@example.com' },
    update: { password: customerPassword, role: 'CUSTOMER' },
    create: {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      password: customerPassword,
      phone: '+91 98200 33445',
      role: 'CUSTOMER',
      address: '1202, Sea Green Towers, Bandra West',
      city: 'Mumbai'
    }
  });

  // 2. Seed Service Centers
  console.log('Seeding Service Centers...');
  const centerDelhi = await prisma.serviceCenter.upsert({
    where: { code: 'SC-DEL-01' },
    update: {},
    create: {
      name: 'AutoCare Hub - South Delhi',
      code: 'SC-DEL-01',
      address: 'Plot 18, Okhla Industrial Area Phase-III',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110020',
      phone: '+91 98110 12345',
      email: 'delhi.south@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:00 PM'
    }
  });

  const centerBlr = await prisma.serviceCenter.upsert({
    where: { code: 'SC-BLR-01' },
    update: {},
    create: {
      name: 'AutoCare Tech Hub - Koramangala',
      code: 'SC-BLR-01',
      address: '88, 80 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      phone: '+91 98450 67890',
      email: 'blr.koramangala@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    }
  });

  const centerMum = await prisma.serviceCenter.upsert({
    where: { code: 'SC-MUM-01' },
    update: {},
    create: {
      name: 'AutoCare Express - Andheri East',
      code: 'SC-MUM-01',
      address: 'Saki Vihar Road, Near Metro Junction, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400072',
      phone: '+91 98200 54321',
      email: 'mumbai.andheri@autocare.com',
      openingHours: 'Mon - Sat: 8:30 AM - 7:30 PM'
    }
  });

  const centerPun = await prisma.serviceCenter.upsert({
    where: { code: 'SC-PUN-01' },
    update: {},
    create: {
      name: 'AutoCare Prime - Baner',
      code: 'SC-PUN-01',
      address: 'Survey No. 45, Baner Highway Bypass',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
      phone: '+91 98900 11223',
      email: 'pune.baner@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:00 PM'
    }
  });
    // Additional major-city service centers
  const additionalCenters = [
    {
      name: 'AutoCare Metro Hub - Hyderabad',
      code: 'SC-HYD-01',
      address: 'Road No. 36, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      phone: '+91 98490 11223',
      email: 'hyderabad@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    },
    {
      name: 'AutoCare Chennai Central - OMR',
      code: 'SC-CHN-01',
      address: 'Rajiv Gandhi Salai, Sholinganallur',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600119',
      phone: '+91 98400 22334',
      email: 'chennai@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:30 PM'
    },
    {
      name: 'AutoCare East Hub - Kolkata',
      code: 'SC-KOL-01',
      address: 'EM Bypass, Kasba',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700042',
      phone: '+91 98300 33445',
      email: 'kolkata@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    },
    {
      name: 'AutoCare Capital Hub - Lucknow',
      code: 'SC-LKO-01',
      address: 'Shaheed Path, Gomti Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
      phone: '+91 98390 44556',
      email: 'lucknow@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:00 PM'
    },
    {
      name: 'AutoCare Pink City - Jaipur',
      code: 'SC-JAI-01',
      address: 'Tonk Road, Durgapura',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302018',
      phone: '+91 98290 55667',
      email: 'jaipur@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    },
    {
      name: 'AutoCare Chandigarh Hub',
      code: 'SC-CHD-01',
      address: 'Industrial Area Phase 2',
      city: 'Chandigarh',
      state: 'Chandigarh',
      pincode: '160002',
      phone: '+91 98150 66778',
      email: 'chandigarh@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:00 PM'
    },
    {
      name: 'AutoCare NCR Hub - Noida',
      code: 'SC-NOI-01',
      address: 'Sector 62, Industrial Area',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      phone: '+91 98100 77889',
      email: 'noida@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    },
    {
      name: 'AutoCare NCR Hub - Gurugram',
      code: 'SC-GGN-01',
      address: 'Golf Course Extension Road',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122018',
      phone: '+91 98100 88990',
      email: 'gurugram@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    },
    {
      name: 'AutoCare NCR Hub - Faridabad',
      code: 'SC-FBD-01',
      address: 'Mathura Road, Sector 37',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121003',
      phone: '+91 98100 99001',
      email: 'faridabad@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:00 PM'
    },
    {
      name: 'AutoCare Gujarat Hub - Ahmedabad',
      code: 'SC-AHM-01',
      address: 'SG Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054',
      phone: '+91 98250 11223',
      email: 'ahmedabad@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    },
    {
      name: 'AutoCare Gujarat Hub - Surat',
      code: 'SC-SRT-01',
      address: 'Ring Road, Adajan',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395009',
      phone: '+91 98250 22334',
      email: 'surat@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:30 PM'
    },
    {
      name: 'AutoCare Central Hub - Indore',
      code: 'SC-IDR-01',
      address: 'AB Road, Vijay Nagar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452010',
      phone: '+91 98260 33445',
      email: 'indore@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    },
    {
      name: 'AutoCare MP Hub - Bhopal',
      code: 'SC-BHO-01',
      address: 'Hoshangabad Road, Misrod',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      pincode: '462026',
      phone: '+91 98260 44556',
      email: 'bhopal@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:00 PM'
    },
    {
      name: 'AutoCare Maharashtra Hub - Nagpur',
      code: 'SC-NGP-01',
      address: 'Wardha Road, Somalwada',
      city: 'Nagpur',
      state: 'Maharashtra',
      pincode: '440015',
      phone: '+91 98220 55667',
      email: 'nagpur@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    },
    {
      name: 'AutoCare Kerala Hub - Kochi',
      code: 'SC-KOC-01',
      address: 'NH 66, Edappally',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682024',
      phone: '+91 98470 66778',
      email: 'kochi@autocare.com',
      openingHours: 'Mon - Sat: 8:00 AM - 7:00 PM'
    },
    {
      name: 'AutoCare Punjab Hub - Ludhiana',
      code: 'SC-LDH-01',
      address: 'Ferozepur Road, Ludhiana',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      phone: '+91 98140 77889',
      email: 'ludhiana@autocare.com',
      openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM'
    }
  ];

  for (const center of additionalCenters) {
    await prisma.serviceCenter.upsert({
      where: { code: center.code },
      update: {},
      create: center
    });
  }

  // 3. Seed Services
  console.log('Seeding Services Catalog...');
  const servicesData = [
    {
      name: 'General Service',
      category: 'Periodic Maintenance',
      description: 'Comprehensive multi-point maintenance including engine fluid inspection, air filter cleaning, battery health analysis, brake inspection, suspension check, spark plug inspection, and chassis lubrication.',
      price: 1999.00,
      estimatedHours: 3.5
    },
    {
      name: 'Synthetic Oil Change & Lube',
      category: 'Periodic Maintenance',
      description: 'Drain and refill premium 5W-30 synthetic engine oil up to 4 liters, replace OEM spin-on oil filter, inspect engine seals, and lubricate steering ball joints.',
      price: 1299.00,
      estimatedHours: 1.5
    },
    {
      name: 'Brake System Overhaul',
      category: 'Repair',
      description: 'Front and rear brake disc pad inspection/replacement, rotor resurfacing check, caliper slide pin greasing, and high-performance DOT4 brake fluid hydraulic bleeding.',
      price: 1850.00,
      estimatedHours: 2.5
    },
    {
      name: 'AC Sanitization & Refrigerant Recharge',
      category: 'Periodic Maintenance',
      description: 'Evaporator coil antimicrobial foam wash, blower fan cleaning, cabin pollen filter replacement, and precision R134a/R1234yf refrigerant gas pressure top-up.',
      price: 2200.00,
      estimatedHours: 2.0
    },
    {
      name: 'Battery Health & Alternator Diagnostics',
      category: 'Diagnostic',
      description: 'Digital cold cranking amps (CCA) test, alternator diode ripple analysis, starter motor current draw test, terminal corrosion removal, and dielectric grease application.',
      price: 899.00,
      estimatedHours: 1.0
    },
    {
      name: '3D Computerized Wheel Alignment & Balancing',
      category: 'Repair',
      description: 'High-precision 3D digital camera alignment for camber, caster, toe angles, plus computerized dynamic wheel balancing with precision adhesive weights.',
      price: 1150.00,
      estimatedHours: 1.5
    },
    {
      name: 'Tyre Rotation & Tread Inspection',
      category: 'Repair',
      description: '5-tyre cross rotation, tread depth laser measurement across inner/center/outer shoulders, TPMS sensor recalibration, and nitrogen inflation.',
      price: 650.00,
      estimatedHours: 1.0
    },
    {
      name: 'Engine ECU Scan & OBD-II Diagnostics',
      category: 'Diagnostic',
      description: 'Professional OEM-level OBD-II powertrain diagnostic scanning, freeze frame trouble code evaluation, live oxygen and MAF sensor graphing, and fault code reset.',
      price: 1599.00,
      estimatedHours: 2.0
    },
    {
      name: 'Comprehensive 60-Point Vehicle Inspection',
      category: 'Inspection',
      description: 'Bumper-to-bumper pre-trip/resale inspection covering engine compression, transmission shifting, suspension bushings, underbody rust, paint thickness, and electricals.',
      price: 1499.00,
      estimatedHours: 2.0
    }
  ];

  const services = [];
  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (existing) {
      services.push(existing);
    } else {
      const created = await prisma.service.create({ data: s });
      services.push(created);
    }
  }

  // 4. Seed Vehicles
  console.log('Seeding Vehicles...');
  const v1 = await prisma.vehicle.upsert({
    where: { regNumber: 'DL-01-AB-1234' },
    update: {},
    create: {
      userId: customerUser.id,
      regNumber: 'DL-01-AB-1234',
      make: 'Maruti Suzuki',
      model: 'Swift',
      variant: 'VXI DualJet',
      year: 2021,
      fuelType: 'PETROL',
      mileage: 32500,
      color: 'Pearl Arctic White'
    }
  });

  const v2 = await prisma.vehicle.upsert({
    where: { regNumber: 'DL-03-EV-5678' },
    update: {},
    create: {
      userId: customerUser.id,
      regNumber: 'DL-03-EV-5678',
      make: 'Tata',
      model: 'Nexon EV',
      variant: 'XZ+ Lux Max',
      year: 2023,
      fuelType: 'ELECTRIC',
      mileage: 14200,
      color: 'Daytona Grey'
    }
  });

  const v3 = await prisma.vehicle.upsert({
    where: { regNumber: 'KA-05-MN-9988' },
    update: {},
    create: {
      userId: customer2.id,
      regNumber: 'KA-05-MN-9988',
      make: 'Hyundai',
      model: 'Creta',
      variant: '1.5 SX(O) CRDi',
      year: 2022,
      fuelType: 'DIESEL',
      mileage: 41000,
      color: 'Titan Grey'
    }
  });

  const v4 = await prisma.vehicle.upsert({
    where: { regNumber: 'KA-01-TR-4455' },
    update: {},
    create: {
      userId: customer2.id,
      regNumber: 'KA-01-TR-4455',
      make: 'Mahindra',
      model: 'Thar',
      variant: 'LX 4x4 Hard Top',
      year: 2022,
      fuelType: 'DIESEL',
      mileage: 28500,
      color: 'Napoli Black'
    }
  });

  const v5 = await prisma.vehicle.upsert({
    where: { regNumber: 'MH-02-CD-4321' },
    update: {},
    create: {
      userId: customer3.id,
      regNumber: 'MH-02-CD-4321',
      make: 'Honda',
      model: 'City',
      variant: 'ZX 1.5 i-VTEC CVT',
      year: 2020,
      fuelType: 'PETROL',
      mileage: 38700,
      color: 'Radiant Red Metallic'
    }
  });

  // 5. Seed Mechanics
  console.log('Seeding Mechanics...');
  const m1 = await prisma.mechanic.upsert({
    where: { employeeId: 'MEC-DEL-001' },
    update: {},
    create: {
      serviceCenterId: centerDelhi.id,
      name: 'Rajesh Verma',
      employeeId: 'MEC-DEL-001',
      phone: '+91 97110 33445',
      email: 'rajesh.verma@autocare.com',
      specialization: 'Engine Diagnostics & Powertrain',
      experienceYears: 8,
      status: 'AVAILABLE'
    }
  });

  const m2 = await prisma.mechanic.upsert({
    where: { employeeId: 'MEC-DEL-002' },
    update: {},
    create: {
      serviceCenterId: centerDelhi.id,
      name: 'Amit Deshmukh',
      employeeId: 'MEC-DEL-002',
      phone: '+91 97110 33446',
      email: 'amit.deshmukh@autocare.com',
      specialization: 'Suspension, Brakes & Alignment',
      experienceYears: 5,
      status: 'BUSY'
    }
  });

  const m3 = await prisma.mechanic.upsert({
    where: { employeeId: 'MEC-BLR-001' },
    update: {},
    create: {
      serviceCenterId: centerBlr.id,
      name: 'Suresh Nair',
      employeeId: 'MEC-BLR-001',
      phone: '+91 98450 44556',
      email: 'suresh.nair@autocare.com',
      specialization: 'EV Systems & Electrical Diagnostics',
      experienceYears: 6,
      status: 'AVAILABLE'
    }
  });

  const m4 = await prisma.mechanic.upsert({
    where: { employeeId: 'MEC-MUM-001' },
    update: {},
    create: {
      serviceCenterId: centerMum.id,
      name: 'Vinod Patil',
      employeeId: 'MEC-MUM-001',
      phone: '+91 98200 66778',
      email: 'vinod.patil@autocare.com',
      specialization: 'Periodic Maintenance & HVAC',
      experienceYears: 7,
      status: 'AVAILABLE'
    }
  });

  const m5 = await prisma.mechanic.upsert({
    where: { employeeId: 'MEC-PUN-001' },
    update: {},
    create: {
      serviceCenterId: centerPun.id,
      name: 'Deepak Joshi',
      employeeId: 'MEC-PUN-001',
      phone: '+91 98900 88990',
      email: 'deepak.joshi@autocare.com',
      specialization: 'Transmission & Heavy Repairs',
      experienceYears: 9,
      status: 'AVAILABLE'
    }
  });

  // 6. Seed Spare Parts Inventory
  console.log('Seeding Parts Inventory...');
  const partsList = [
    {
      name: 'Fully Synthetic Engine Oil 5W-30 (3.5L Can)',
      partNumber: 'PART-OIL-5W30',
      category: 'Engine Oils',
      unitPrice: 1450.00,
      stockQuantity: 42,
      minStockLevel: 10,
      status: 'IN_STOCK'
    },
    {
      name: 'Genuine Engine Oil Filter - Spin-on',
      partNumber: 'PART-FLT-OIL01',
      category: 'Filters',
      unitPrice: 350.00,
      stockQuantity: 58,
      minStockLevel: 15,
      status: 'IN_STOCK'
    },
    {
      name: 'High Flow Engine Air Filter',
      partNumber: 'PART-FLT-AIR01',
      category: 'Filters',
      unitPrice: 480.00,
      stockQuantity: 30,
      minStockLevel: 10,
      status: 'IN_STOCK'
    },
    {
      name: 'Activated Carbon AC Cabin Filter',
      partNumber: 'PART-FLT-AC01',
      category: 'Filters',
      unitPrice: 550.00,
      stockQuantity: 24,
      minStockLevel: 8,
      status: 'IN_STOCK'
    },
    {
      name: 'Front Ceramic Brake Pads (Set of 4)',
      partNumber: 'PART-BRK-FR01',
      category: 'Brake Systems',
      unitPrice: 1850.00,
      stockQuantity: 16,
      minStockLevel: 6,
      status: 'IN_STOCK'
    },
    {
      name: 'DOT 4 High Performance Brake Fluid (500ml)',
      partNumber: 'PART-FLD-BRK01',
      category: 'Fluids',
      unitPrice: 380.00,
      stockQuantity: 34,
      minStockLevel: 10,
      status: 'IN_STOCK'
    },
    {
      name: 'Iridium Spark Plugs (Set of 4)',
      partNumber: 'PART-IGN-SPK04',
      category: 'Electrical',
      unitPrice: 1200.00,
      stockQuantity: 14,
      minStockLevel: 5,
      status: 'IN_STOCK'
    },
    {
      name: 'Pre-mixed Long-Life Organic Coolant (1L)',
      partNumber: 'PART-FLD-CLN01',
      category: 'Fluids',
      unitPrice: 420.00,
      stockQuantity: 45,
      minStockLevel: 12,
      status: 'IN_STOCK'
    },
    {
      name: 'Aerodynamic Frameless Wiper Blades (Pair)',
      partNumber: 'PART-WIP-AER01',
      category: 'Body & Wipers',
      unitPrice: 750.00,
      stockQuantity: 4,
      minStockLevel: 5,
      status: 'LOW_STOCK'
    },
    {
      name: '12V 60Ah Maintenance-Free Automotive Battery',
      partNumber: 'PART-BAT-12V60',
      category: 'Electrical',
      unitPrice: 4800.00,
      stockQuantity: 3,
      minStockLevel: 5,
      status: 'LOW_STOCK'
    },
    {
      name: 'Front Ventilated Brake Rotors (Pair)',
      partNumber: 'PART-BRK-ROTOR',
      category: 'Brake Systems',
      unitPrice: 3200.00,
      stockQuantity: 0,
      minStockLevel: 4,
      status: 'OUT_OF_STOCK'
    }
  ];

  const parts = [];
  for (const p of partsList) {
    const existing = await prisma.part.findUnique({ where: { partNumber: p.partNumber } });
    if (existing) {
      parts.push(existing);
    } else {
      const created = await prisma.part.create({ data: p });
      parts.push(created);
    }
  }

  // 7. Seed Complete Appointments Lifecycle
  console.log('Seeding Sample Appointments, Service Records, Invoices, and Payments...');

  // Appointment 1: COMPLETED (Swift - General Service)
  const generalService = services.find(s => s.name === 'General Service') || services[0];
  const apt1 = await prisma.appointment.upsert({
    where: { appointmentNumber: 'APT-2026-0001' },
    update: {},
    create: {
      appointmentNumber: 'APT-2026-0001',
      userId: customerUser.id,
      vehicleId: v1.id,
      serviceCenterId: centerDelhi.id,
      serviceId: generalService.id,
      preferredDate: new Date('2026-11-15'),
      preferredTimeSlot: '09:00 AM - 11:00 AM',
      status: 'COMPLETED',
      notes: '30,000 km scheduled periodic maintenance. Slight vibration on idling.'
    }
  });

  const record1 = await prisma.serviceRecord.upsert({
    where: { appointmentId: apt1.id },
    update: {},
    create: {
      appointmentId: apt1.id,
      mechanicId: m1.id,
      inspectionNotes: 'All safety belts, lights, and horn operational. Coolant level optimal. Brake pad thickness at 7mm (good). Engine oil viscosity degraded as expected.',
      workPerformed: 'Full synthetic oil replaced with 5W-30. Spin-on oil filter installed. Air filter cleaned with pressurized air. Throttle body decarbonized to resolve idle vibration. All fluid levels topped up.',
      currentMileage: 32500,
      status: 'COMPLETED',
      completionDate: new Date('2026-11-15T15:30:00Z')
    }
  });

  // Consumed Parts for record1: Synthetic Oil + Oil Filter
  const oilPart = parts.find(p => p.partNumber === 'PART-OIL-5W30') || parts[0];
  const filterPart = parts.find(p => p.partNumber === 'PART-FLT-OIL01') || parts[1];

  const existingSP1 = await prisma.servicePart.findFirst({
    where: { serviceRecordId: record1.id, partId: oilPart.id }
  });
  if (!existingSP1) {
    await prisma.servicePart.create({
      data: {
        serviceRecordId: record1.id,
        partId: oilPart.id,
        quantity: 1,
        unitPrice: 1450.00,
        totalCost: 1450.00
      }
    });
  }

  const existingSP2 = await prisma.servicePart.findFirst({
    where: { serviceRecordId: record1.id, partId: filterPart.id }
  });
  if (!existingSP2) {
    await prisma.servicePart.create({
      data: {
        serviceRecordId: record1.id,
        partId: filterPart.id,
        quantity: 1,
        unitPrice: 350.00,
        totalCost: 350.00
      }
    });
  }

  // Invoice 1:
  // Service: 1999.00, Parts: 1800.00 -> Subtotal: 3799.00
  // Tax 18%: 683.82, Discount: 200.00 -> Total: 4282.82
  const inv1 = await prisma.invoice.upsert({
    where: { appointmentId: apt1.id },
    update: {},
    create: {
      invoiceNumber: 'INV-2026-0001',
      appointmentId: apt1.id,
      serviceCharges: 1999.00,
      partsCharges: 1800.00,
      subtotal: 3799.00,
      taxRate: 18.00,
      taxAmount: 683.82,
      discountAmount: 200.00,
      totalAmount: 4282.82,
      paymentStatus: 'PAID',
      dueDate: new Date('2026-11-15')
    }
  });

  await prisma.payment.upsert({
    where: { paymentNumber: 'PAY-2026-0001' },
    update: {},
    create: {
      paymentNumber: 'PAY-2026-0001',
      invoiceId: inv1.id,
      amount: 4282.82,
      paymentMethod: 'UPI',
      transactionRef: 'UPI/20261115/9988771122',
      status: 'SUCCESS',
      paidAt: new Date('2026-11-15T16:00:00Z'),
      notes: 'Paid seamlessly via Google Pay UPI.'
    }
  });

  await prisma.feedback.upsert({
    where: { appointmentId: apt1.id },
    update: {},
    create: {
      appointmentId: apt1.id,
      userId: customerUser.id,
      rating: 5,
      serviceQuality: 5,
      staffCourtesy: 5,
      timelyDelivery: 5,
      comments: 'Outstanding service! The car drives like brand new and the idle vibration is completely gone. Mechanic Rajesh explained every single detail with patience.'
    }
  });

  // Appointment 2: READY_FOR_PICKUP (Nexon EV - Battery Diagnostic)
  const batteryService = services.find(s => s.name.includes('Battery')) || services[4];
  const apt2 = await prisma.appointment.upsert({
    where: { appointmentNumber: 'APT-2026-0002' },
    update: {},
    create: {
      appointmentNumber: 'APT-2026-0002',
      userId: customerUser.id,
      vehicleId: v2.id,
      serviceCenterId: centerDelhi.id,
      serviceId: batteryService.id,
      preferredDate: new Date('2026-11-20'),
      preferredTimeSlot: '11:00 AM - 01:00 PM',
      status: 'READY_FOR_PICKUP',
      notes: 'Check 12V auxiliary battery health and high-voltage BMS firmware status.'
    }
  });

  const record2 = await prisma.serviceRecord.upsert({
    where: { appointmentId: apt2.id },
    update: {},
    create: {
      appointmentId: apt2.id,
      mechanicId: m2.id,
      inspectionNotes: '12V auxiliary battery state-of-health at 94%. High-voltage battery pack cell deviation within strict 0.01V delta tolerance.',
      workPerformed: 'Battery terminals sanitized. BMS diagnostic scan completed with zero fault codes. Diagnostic report generated and vehicle washed.',
      currentMileage: 14250,
      status: 'READY_FOR_PICKUP',
      completionDate: new Date('2026-11-20T13:45:00Z')
    }
  });

  const inv2 = await prisma.invoice.upsert({
    where: { appointmentId: apt2.id },
    update: {},
    create: {
      invoiceNumber: 'INV-2026-0002',
      appointmentId: apt2.id,
      serviceCharges: 899.00,
      partsCharges: 0.00,
      subtotal: 899.00,
      taxRate: 18.00,
      taxAmount: 161.82,
      discountAmount: 0.00,
      totalAmount: 1060.82,
      paymentStatus: 'PAID',
      dueDate: new Date('2026-11-20')
    }
  });

  await prisma.payment.upsert({
    where: { paymentNumber: 'PAY-2026-0002' },
    update: {},
    create: {
      paymentNumber: 'PAY-2026-0002',
      invoiceId: inv2.id,
      amount: 1060.82,
      paymentMethod: 'CARD',
      transactionRef: 'HDFC/POS/77334411',
      status: 'SUCCESS',
      paidAt: new Date('2026-11-20T14:10:00Z'),
      notes: 'Paid at counter with Credit Card.'
    }
  });

  // Appointment 3: IN_PROGRESS (Creta - Brake Overhaul)
  const brakeService = services.find(s => s.name.includes('Brake')) || services[2];
  const apt3 = await prisma.appointment.upsert({
    where: { appointmentNumber: 'APT-2026-0003' },
    update: {},
    create: {
      appointmentNumber: 'APT-2026-0003',
      userId: customer2.id,
      vehicleId: v3.id,
      serviceCenterId: centerBlr.id,
      serviceId: brakeService.id,
      preferredDate: new Date('2026-11-22'),
      preferredTimeSlot: '02:00 PM - 04:00 PM',
      status: 'IN_PROGRESS',
      notes: 'Brake pedal feels spongy when descending downhill gradients.'
    }
  });

  const record3 = await prisma.serviceRecord.upsert({
    where: { appointmentId: apt3.id },
    update: {},
    create: {
      appointmentId: apt3.id,
      mechanicId: m3.id,
      inspectionNotes: 'Front pads worn down to 2.5mm warning layer. Brake fluid moisture content elevated to 3.5%.',
      workPerformed: 'Installing front ceramic pads. Flushing master cylinder with DOT4 synthetic fluid.',
      currentMileage: 41050,
      status: 'IN_PROGRESS'
    }
  });

  // Consumed Parts for record3: Ceramic brake pads + DOT 4 fluid
  const brakePadPart = parts.find(p => p.partNumber === 'PART-BRK-FR01') || parts[4];
  const brakeFluidPart = parts.find(p => p.partNumber === 'PART-FLD-BRK01') || parts[5];

  const existingSP3 = await prisma.servicePart.findFirst({
    where: { serviceRecordId: record3.id, partId: brakePadPart.id }
  });
  if (!existingSP3) {
    await prisma.servicePart.create({
      data: {
        serviceRecordId: record3.id,
        partId: brakePadPart.id,
        quantity: 1,
        unitPrice: 1850.00,
        totalCost: 1850.00
      }
    });
  }

  const existingSP4 = await prisma.servicePart.findFirst({
    where: { serviceRecordId: record3.id, partId: brakeFluidPart.id }
  });
  if (!existingSP4) {
    await prisma.servicePart.create({
      data: {
        serviceRecordId: record3.id,
        partId: brakeFluidPart.id,
        quantity: 1,
        unitPrice: 380.00,
        totalCost: 380.00
      }
    });
  }

  // Appointment 4: CONFIRMED (Honda City - AC Deep Clean)
  const acService = services.find(s => s.name.includes('AC')) || services[3];
  await prisma.appointment.upsert({
    where: { appointmentNumber: 'APT-2026-0004' },
    update: {},
    create: {
      appointmentNumber: 'APT-2026-0004',
      userId: customer3.id,
      vehicleId: v5.id,
      serviceCenterId: centerMum.id,
      serviceId: acService.id,
      preferredDate: new Date('2026-11-23'),
      preferredTimeSlot: '10:00 AM - 12:00 PM',
      status: 'CONFIRMED',
      notes: 'Musty smell when starting blower in morning.'
    }
  });

  // Appointment 5: PENDING (Thar - Engine Diagnostics)
  const diagService = services.find(s => s.name.includes('Diagnostics')) || services[7];
  await prisma.appointment.upsert({
    where: { appointmentNumber: 'APT-2026-0005' },
    update: {},
    create: {
      appointmentNumber: 'APT-2026-0005',
      userId: customer2.id,
      vehicleId: v4.id,
      serviceCenterId: centerBlr.id,
      serviceId: diagService.id,
      preferredDate: new Date('2026-11-24'),
      preferredTimeSlot: '03:00 PM - 05:00 PM',
      status: 'PENDING',
      notes: 'Check engine light illuminated after off-road weekend trail trip.'
    }
  });

  console.log('--- Database Seeding Completed Successfully! ---');
  console.log('Demo Accounts:');
  console.log('  Admin:    admin@autocare.com    / Admin@123');
  console.log('  Staff:    staff@autocare.com    / Staff@123');
  console.log('  Customer: customer@autocare.com / Customer@123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
