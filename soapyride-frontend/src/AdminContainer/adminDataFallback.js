// Default initial seed data for client-side fallback when offline
export const FALLBACK_VEHICLES = [
  {
    _id: 'veh-101',
    vehicleNumber: 'WP CAB-4582',
    brand: 'Toyota',
    model: 'Premio G Superior',
    vehicleType: 'Car',
    year: 2019,
    fuelType: 'Petrol',
    color: 'Pearl White',
    mileage: 64200,
    ownerName: 'Kasun Perera',
    ownerPhone: '0771234567',
    ownerEmail: 'kasun.perera@gmail.com',
    ownerAddress: 'No. 42, Flower Road, Colombo 07',
    notes: 'Prefers Mobil 1 5W-30 full synthetic oil.'
  },
  {
    _id: 'veh-102',
    vehicleNumber: 'WP CBE-8921',
    brand: 'Honda',
    model: 'Vezel RS Sensing',
    vehicleType: 'SUV',
    year: 2020,
    fuelType: 'Hybrid',
    color: 'Metallic Grey',
    mileage: 48900,
    ownerName: 'Nadeesha Silva',
    ownerPhone: '0719876543',
    ownerEmail: 'nadeesha.s@yahoo.com',
    ownerAddress: '18/A, Wijerama Mawatha, Nugegoda',
    notes: 'Dual-clutch fluid inspected recently.'
  },
  {
    _id: 'veh-103',
    vehicleNumber: 'WP CAA-1104',
    brand: 'BMW',
    model: '520d M-Sport',
    vehicleType: 'Car',
    year: 2021,
    fuelType: 'Diesel',
    color: 'Sapphire Black',
    mileage: 35600,
    ownerName: 'Rohan Jayawardena',
    ownerPhone: '0778899001',
    ownerEmail: 'rohan.j@corporate.lk',
    ownerAddress: '75, Horton Place, Colombo 07',
    notes: '9H Ceramic Coated. Use pH-neutral wash only.'
  },
  {
    _id: 'veh-104',
    vehicleNumber: 'WP KQ-7740',
    brand: 'Mitsubishi',
    model: 'Montero Sport',
    vehicleType: 'SUV',
    year: 2018,
    fuelType: 'Diesel',
    color: 'Deep Bronze',
    mileage: 98500,
    ownerName: 'Chathura Fernando',
    ownerPhone: '0765544332',
    ownerEmail: 'chathura@gmail.com',
    ownerAddress: 'No. 112, Galle Road, Mount Lavinia',
    notes: 'Requires 4x4 differential oil check on next visit.'
  },
  {
    _id: 'veh-105',
    vehicleNumber: 'WP NB-3329',
    brand: 'Toyota',
    model: 'HiAce KDH 200',
    vehicleType: 'Van',
    year: 2017,
    fuelType: 'Diesel',
    color: 'Silver',
    mileage: 142000,
    ownerName: 'Lanka Travels Pvt Ltd',
    ownerPhone: '0773322110',
    ownerEmail: 'fleet@lankatravels.lk',
    ownerAddress: '290, Duplication Road, Colombo 03',
    notes: 'Commercial fleet vehicle - priority bay turnaround.'
  }
];

export const FALLBACK_SERVICES = [
  {
    _id: 'srv-101',
    serviceCode: 'SRV-001',
    name: 'Express Eco Snow-Foam Wash',
    category: 'Wash & Detailing',
    description: 'High-pressure pH-neutral snow foam exterior wash, wheel decontamination, undercarriage rinse, and interior vacuum.',
    price: 1800,
    duration: '40 mins',
    warranty: 'N/A',
    isActive: true
  },
  {
    _id: 'srv-102',
    serviceCode: 'SRV-002',
    name: 'Signature Detailing & Carnauba Wax Spa',
    category: 'Wash & Detailing',
    description: 'Complete exterior snow foam, polymer sealant wax, dashboard & leather conditioning, AC steam sanitization, and 24-point check.',
    price: 4500,
    duration: '90 mins',
    warranty: '14 Days Shine Guarantee',
    isActive: true
  },
  {
    _id: 'srv-103',
    serviceCode: 'SRV-003',
    name: 'Full Mechanical & Periodic Lube Service',
    category: 'Mechanical & Lube',
    description: 'Full synthetic oil & filter change, brake pad & rotor servicing, coolant & fluid top-up, air/cabin filter check, and safety inspection.',
    price: 11500,
    duration: '150 mins',
    warranty: '6 Months / 5,000 km',
    isActive: true
  },
  {
    _id: 'srv-104',
    serviceCode: 'SRV-004',
    name: 'Computerized 24-Point OBD-II Diagnostics',
    category: 'Diagnostics & Electrical',
    description: 'Full ECU fault code scan, hybrid battery health check, live sensor telemetry analysis, and alternator load test.',
    price: 2500,
    duration: '45 mins',
    warranty: '30 Days Diagnostic Report',
    isActive: true
  },
  {
    _id: 'srv-105',
    serviceCode: 'SRV-005',
    name: '3D Laser Wheel Alignment & Balancing',
    category: 'Wheel & Alignment',
    description: 'Precision 4-wheel laser camber, caster, and toe calibration with computerized dynamic wheel weight balancing.',
    price: 3800,
    duration: '50 mins',
    warranty: '30 Days Alignment Check',
    isActive: true
  },
  {
    _id: 'srv-106',
    serviceCode: 'SRV-006',
    name: 'Multi-Stage Paint Correction & 9H Ceramic',
    category: 'Paint & Ceramic',
    description: 'Machine compounding to remove 90%+ swirl marks followed by dual-layer hydrophobic 9H ceramic armor protection.',
    price: 14500,
    duration: '240 mins',
    warranty: '2 Years Hydrophobic Warranty',
    isActive: true
  }
];

export const FALLBACK_MECHANICS = [
  {
    _id: 'mech-101',
    employeeId: 'MEC-001',
    name: 'Nuwan Bandara',
    phone: '0774512369',
    email: 'nuwan.b@soapyride.com',
    specializations: ['Engine & Transmission', 'Hybrid Systems', 'OBD-II Diagnostics'],
    experienceYears: 9,
    availability: 'On Job',
    assignedBay: 'Bay 1 - Mechanical',
    completedJobsCount: 142,
    rating: 4.9,
    hourlyRate: 2200
  },
  {
    _id: 'mech-102',
    employeeId: 'MEC-002',
    name: 'Dinesh Kumara',
    phone: '0712233445',
    email: 'dinesh.k@soapyride.com',
    specializations: ['Brakes & Suspension', '3D Wheel Alignment', 'Undercarriage'],
    experienceYears: 6,
    availability: 'Available',
    assignedBay: 'Bay 2 - Alignment',
    completedJobsCount: 98,
    rating: 4.8,
    hourlyRate: 1800
  },
  {
    _id: 'mech-103',
    employeeId: 'MEC-003',
    name: 'Suresh Rajapaksa',
    phone: '0768899112',
    email: 'suresh.r@soapyride.com',
    specializations: ['Paint Correction', '9H Ceramic Coating', 'Interior Detailing'],
    experienceYears: 7,
    availability: 'On Job',
    assignedBay: 'Bay 3 - Detailing Studio',
    completedJobsCount: 165,
    rating: 4.95,
    hourlyRate: 2000
  },
  {
    _id: 'mech-104',
    employeeId: 'MEC-004',
    name: 'Malith Wickramasinghe',
    phone: '0756677889',
    email: 'malith.w@soapyride.com',
    specializations: ['Electrical & ECU', 'AC Servicing', 'General Lube Service'],
    experienceYears: 4,
    availability: 'Available',
    assignedBay: 'Bay 4 - Express Bay',
    completedJobsCount: 74,
    rating: 4.7,
    hourlyRate: 1500
  }
];

export const FALLBACK_APPOINTMENTS = [
  {
    _id: 'apt-101',
    name: 'Kasun Perera',
    phone: '0771234567',
    vehicleNumber: 'WP CAB-4582',
    vehicleType: 'Car',
    washPackage: 'Full Mechanical & Periodic Lube Service',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    estimatedPrice: 11500,
    status: 'In Service Bay',
    approvalStatus: 'Approved',
    assignedMechanic: 'Nuwan Bandara',
    notes: 'Use synthetic 5W-30 oil and inspect front brake pads.',
    adminNotes: 'Checked in on time. Assigned to Bay 1.'
  },
  {
    _id: 'apt-102',
    name: 'Nadeesha Silva',
    phone: '0719876543',
    vehicleNumber: 'WP CBE-8921',
    vehicleType: 'SUV',
    washPackage: 'Signature Detailing & Carnauba Wax Spa',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    estimatedPrice: 4500,
    status: 'Confirmed',
    approvalStatus: 'Pending',
    assignedMechanic: 'Suresh Rajapaksa',
    notes: 'AC vent steam sanitization requested.',
    adminNotes: ''
  },
  {
    _id: 'apt-103',
    name: 'Rohan Jayawardena',
    phone: '0778899001',
    vehicleNumber: 'WP CAA-1104',
    vehicleType: 'Car',
    washPackage: 'Multi-Stage Paint Correction & 9H Ceramic',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '10:00',
    estimatedPrice: 14500,
    status: 'Approved',
    approvalStatus: 'Approved',
    assignedMechanic: 'Suresh Rajapaksa',
    notes: 'Black paintwork needs light swirl removal on hood.',
    adminNotes: 'Confirmed ceramic kit in stock.'
  },
  {
    _id: 'apt-104',
    name: 'Chathura Fernando',
    phone: '0765544332',
    vehicleNumber: 'WP KQ-7740',
    vehicleType: 'SUV',
    washPackage: '3D Laser Wheel Alignment & Balancing',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    estimatedPrice: 3800,
    status: 'Quality Check',
    approvalStatus: 'Approved',
    assignedMechanic: 'Dinesh Kumara',
    notes: 'Slight pull to the left at highway speeds.',
    adminNotes: 'Alignment completed, test drive underway.'
  }
];

export const FALLBACK_JOB_CARDS = [
  {
    _id: 'jc-101',
    jobCardNumber: 'JC-2026-101',
    vehicleNumber: 'WP CAB-4582',
    vehicleModel: 'Toyota Premio G Superior',
    customerName: 'Kasun Perera',
    customerPhone: '0771234567',
    assignedMechanic: 'Nuwan Bandara',
    bayNumber: 'Bay 1 - Mechanical',
    priority: 'High',
    status: 'In Progress',
    progressPercent: 65,
    odometerReading: 64200,
    estimatedCompletion: '12:30 PM',
    reportedIssues: 'Periodic 65,000km service, front brake squeak during low-speed braking.',
    tasks: [
      { description: 'Full Synthetic 5W-30 Engine Oil & Filter Replacement', completed: true, cost: 8500 },
      { description: 'Front Brake Pad Replacement & Caliper Greasing', completed: true, cost: 3500 },
      { description: '24-Point Safety & Fluid Inspection', completed: false, cost: 1500 }
    ],
    partsUsed: [
      { partCode: 'PRT-OIL-01', name: 'Mobil 1 5W-30 Full Synthetic (4L)', quantity: 1, unitPrice: 12500 },
      { partCode: 'PRT-FLT-02', name: 'Toyota Genuine Oil Filter 90915-YZZE1', quantity: 1, unitPrice: 2800 },
      { partCode: 'PRT-BRK-04', name: 'Akebono Ceramic Front Brake Pads', quantity: 1, unitPrice: 9500 }
    ],
    laborCost: 4500,
    estimatedTotal: 29300,
    technicianNotes: 'Rear brake pads have 60% life remaining. Front pads replaced.'
  },
  {
    _id: 'jc-102',
    jobCardNumber: 'JC-2026-102',
    vehicleNumber: 'WP KQ-7740',
    vehicleModel: 'Mitsubishi Montero Sport',
    customerName: 'Chathura Fernando',
    customerPhone: '0765544332',
    assignedMechanic: 'Dinesh Kumara',
    bayNumber: 'Bay 2 - Alignment',
    priority: 'Normal',
    status: 'Quality Check',
    progressPercent: 85,
    odometerReading: 98500,
    estimatedCompletion: '04:00 PM',
    reportedIssues: 'Steering vibration at 80km/h and slight pull to left.',
    tasks: [
      { description: '3D Laser 4-Wheel Alignment Calibration', completed: true, cost: 3800 },
      { description: 'Dynamic Digital Wheel Balancing (All 4 Wheels)', completed: true, cost: 2200 },
      { description: 'Road Test & Steering Centering Verification', completed: false, cost: 0 }
    ],
    partsUsed: [
      { partCode: 'PRT-WHL-09', name: 'Alloy Wheel Adhesive Balance Weights Set', quantity: 4, unitPrice: 350 }
    ],
    laborCost: 2500,
    estimatedTotal: 7400,
    technicianNotes: 'Front right toe was out by +0.18 deg. Corrected to factory spec.'
  },
  {
    _id: 'jc-103',
    jobCardNumber: 'JC-2026-103',
    vehicleNumber: 'WP CAA-1104',
    vehicleModel: 'BMW 520d M-Sport',
    customerName: 'Rohan Jayawardena',
    customerPhone: '0778899001',
    assignedMechanic: 'Suresh Rajapaksa',
    bayNumber: 'Bay 3 - Detailing Studio',
    priority: 'High',
    status: 'Completed',
    progressPercent: 100,
    odometerReading: 35600,
    estimatedCompletion: 'Completed',
    reportedIssues: 'Annual 9H Ceramic Coating maintenance & interior leather nourishment.',
    tasks: [
      { description: 'Decontamination Snow Foam & Iron-X Clay Treatment', completed: true, cost: 4500 },
      { description: 'Single-Stage Gloss Enhancement & Ceramic Top-Coat', completed: true, cost: 14500 },
      { description: 'Interior Nappa Leather Conditioning & Ozone Sanitization', completed: true, cost: 4000 }
    ],
    partsUsed: [
      { partCode: 'PRT-DET-05', name: 'Gyeon Q2M Ceramic Cure Booster (250ml)', quantity: 1, unitPrice: 6500 }
    ],
    laborCost: 6000,
    estimatedTotal: 29500,
    technicianNotes: 'Cured under IR lamps for 2 hours. Ready for customer handover.'
  }
];

export const FALLBACK_INVENTORY = [
  {
    _id: 'inv-101',
    partCode: 'PRT-OIL-01',
    name: 'Mobil 1 5W-30 Full Synthetic Engine Oil (4L)',
    category: 'Engine Oil & Fluids',
    brand: 'Mobil 1',
    quantity: 24,
    unit: 'Cans (4L)',
    reorderLevel: 8,
    costPrice: 9800,
    unitPrice: 12500,
    supplierName: 'McLarens Lubricants Ltd',
    supplierPhone: '0114789000',
    supplierEmail: 'orders@mclarens.lk',
    locationBin: 'Rack A-01',
    movements: [
      { type: 'IN', quantity: 30, reason: 'Monthly Supplier Restock', reference: 'PO-2026-088', date: new Date().toISOString(), performedBy: 'Admin' },
      { type: 'OUT', quantity: 6, reason: 'Issued to Service Bays', reference: 'JC-2026-101', date: new Date().toISOString(), performedBy: 'Nuwan Bandara' }
    ]
  },
  {
    _id: 'inv-102',
    partCode: 'PRT-FLT-02',
    name: 'Toyota Genuine Oil Filter (90915-YZZE1)',
    category: 'Filters',
    brand: 'Toyota OEM',
    quantity: 32,
    unit: 'Units',
    reorderLevel: 10,
    costPrice: 1950,
    unitPrice: 2800,
    supplierName: 'Toyota Lanka Spare Parts',
    supplierPhone: '0112939000',
    supplierEmail: 'parts@toyota.lk',
    locationBin: 'Rack B-04',
    movements: [
      { type: 'IN', quantity: 40, reason: 'OEM Bulk Order', reference: 'PO-2026-091', date: new Date().toISOString(), performedBy: 'Admin' },
      { type: 'OUT', quantity: 8, reason: 'Periodic Lube Services', reference: 'JC-2026-101', date: new Date().toISOString(), performedBy: 'Admin' }
    ]
  },
  {
    _id: 'inv-103',
    partCode: 'PRT-BRK-04',
    name: 'Akebono Ceramic Front Brake Pad Set',
    category: 'Brake Components',
    brand: 'Akebono Japan',
    quantity: 4,
    unit: 'Sets',
    reorderLevel: 6,
    costPrice: 7200,
    unitPrice: 9500,
    supplierName: 'AutoLanka Distributors',
    supplierPhone: '0112345678',
    supplierEmail: 'sales@autolanka.lk',
    locationBin: 'Rack C-02',
    movements: [
      { type: 'IN', quantity: 10, reason: 'Initial Stock', reference: 'PO-2026-075', date: new Date().toISOString(), performedBy: 'Admin' },
      { type: 'OUT', quantity: 6, reason: 'Brake Replacements', reference: 'JC-2026-101', date: new Date().toISOString(), performedBy: 'Nuwan Bandara' }
    ]
  },
  {
    _id: 'inv-104',
    partCode: 'PRT-DET-05',
    name: 'Gyeon Q2 Mohs 9H Ceramic Coating Kit (50ml)',
    category: 'Detailing Chemicals',
    brand: 'Gyeon Quartz',
    quantity: 3,
    unit: 'Kits',
    reorderLevel: 5,
    costPrice: 14000,
    unitPrice: 18500,
    supplierName: 'Detailers Hub Colombo',
    supplierPhone: '0777112233',
    supplierEmail: 'supply@detailershub.lk',
    locationBin: 'Cabinet D-01',
    movements: [
      { type: 'IN', quantity: 8, reason: 'Detailing Studio Restock', reference: 'PO-2026-082', date: new Date().toISOString(), performedBy: 'Admin' },
      { type: 'OUT', quantity: 5, reason: 'Ceramic Coating Jobs', reference: 'JC-2026-103', date: new Date().toISOString(), performedBy: 'Suresh Rajapaksa' }
    ]
  },
  {
    _id: 'inv-105',
    partCode: 'PRT-BAT-06',
    name: 'Amaron Pro 12V 65B24L Maintenance-Free Battery',
    category: 'Batteries & Electrical',
    brand: 'Amaron',
    quantity: 9,
    unit: 'Units',
    reorderLevel: 4,
    costPrice: 24500,
    unitPrice: 29500,
    supplierName: 'Associated Battery Manufacturers',
    supplierPhone: '0112695000',
    supplierEmail: 'orders@abmlanka.com',
    locationBin: 'Bay Storage E-01',
    movements: []
  }
];

export const FALLBACK_INVOICES = [
  {
    _id: 'inv-doc-101',
    invoiceNumber: 'INV-2026-001',
    jobCardNumber: 'JC-2026-103',
    customerName: 'Rohan Jayawardena',
    customerPhone: '0778899001',
    vehicleNumber: 'WP CAA-1104',
    items: [
      { description: 'Multi-Stage Paint Correction & 9H Ceramic', itemType: 'Service', quantity: 1, unitPrice: 14500, total: 14500 },
      { description: 'Decontamination Snow Foam & Clay Treatment', itemType: 'Service', quantity: 1, unitPrice: 4500, total: 4500 },
      { description: 'Gyeon Q2M Ceramic Cure Booster', itemType: 'Part', quantity: 1, unitPrice: 6500, total: 6500 },
      { description: 'Interior Nappa Leather Conditioning', itemType: 'Labor', quantity: 1, unitPrice: 4000, total: 4000 }
    ],
    subtotal: 29500,
    discount: 1500,
    tax: 0,
    grandTotal: 28000,
    paidAmount: 28000,
    balanceDue: 0,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    notes: 'Loyalty member 5% discount applied.',
    issuedDate: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'inv-doc-102',
    invoiceNumber: 'INV-2026-002',
    jobCardNumber: 'JC-2026-101',
    customerName: 'Kasun Perera',
    customerPhone: '0771234567',
    vehicleNumber: 'WP CAB-4582',
    items: [
      { description: 'Mobil 1 5W-30 Full Synthetic (4L)', itemType: 'Part', quantity: 1, unitPrice: 12500, total: 12500 },
      { description: 'Toyota Genuine Oil Filter 90915-YZZE1', itemType: 'Part', quantity: 1, unitPrice: 2800, total: 2800 },
      { description: 'Akebono Ceramic Front Brake Pads', itemType: 'Part', quantity: 1, unitPrice: 9500, total: 9500 },
      { description: 'Periodic Mechanical & Brake Service Labor', itemType: 'Labor', quantity: 1, unitPrice: 4500, total: 4500 }
    ],
    subtotal: 29300,
    discount: 1300,
    tax: 0,
    grandTotal: 28000,
    paidAmount: 15000,
    balanceDue: 13000,
    paymentMethod: 'Cash',
    paymentStatus: 'Partial',
    notes: 'Advance Rs. 15,000 paid at check-in. Balance due on pickup.',
    issuedDate: new Date().toISOString()
  },
  {
    _id: 'inv-doc-103',
    invoiceNumber: 'INV-2026-003',
    jobCardNumber: 'JC-2026-102',
    customerName: 'Chathura Fernando',
    customerPhone: '0765544332',
    vehicleNumber: 'WP KQ-7740',
    items: [
      { description: '3D Laser 4-Wheel Alignment Calibration', itemType: 'Service', quantity: 1, unitPrice: 3800, total: 3800 },
      { description: 'Dynamic Digital Wheel Balancing (4 Wheels)', itemType: 'Service', quantity: 1, unitPrice: 2200, total: 2200 },
      { description: 'Alloy Wheel Adhesive Weights Set', itemType: 'Part', quantity: 4, unitPrice: 350, total: 1400 }
    ],
    subtotal: 7400,
    discount: 0,
    tax: 0,
    grandTotal: 7400,
    paidAmount: 0,
    balanceDue: 7400,
    paymentMethod: 'Online / LankaQR',
    paymentStatus: 'Unpaid',
    notes: 'Awaiting final road test completion.',
    issuedDate: new Date().toISOString()
  }
];

export const FALLBACK_STAFF = [
  {
    _id: 'staff-101',
    fullname: 'System Administrator',
    email: 'admin@soapyride.com',
    phone: '0771122334',
    role: 'admin',
    staffRole: 'Admin',
    createdAt: '2026-09-15T08:00:00.000Z'
  },
  {
    _id: 'staff-102',
    fullname: 'Nuwan Bandara',
    email: 'nuwan.b@soapyride.com',
    phone: '0774512369',
    role: 'mechanic',
    staffRole: 'Mechanic',
    createdAt: '2026-10-01T08:00:00.000Z'
  },
  {
    _id: 'staff-103',
    fullname: 'Dilshan Perera',
    email: 'dilshan.sales@soapyride.com',
    phone: '0714455667',
    role: 'sales',
    staffRole: 'Sales Person',
    createdAt: '2026-10-20T08:00:00.000Z'
  }
];
