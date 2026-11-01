import { 
  UserProfile, 
  EWasteCategory, 
  PickupRequest, 
  EWasteBatch, 
  EprLedgerEntry, 
  RewardItem, 
  AuditLog,
  PartnerDetail,
  RecyclerDetail
} from '../types';

export const INITIAL_CATEGORIES: EWasteCategory[] = [
  {
    id: 'cat-it',
    name: 'Computing & IT Hardware',
    code: 'ITEW-01',
    description: 'Laptops, server racks, desktops, monitors, motherboards, RAM, and hard drives.',
    hazardousComponents: ['Lead in solders', 'Mercury in CCFL backlights', 'Cadmium in chip resistors'],
    recoverableMaterials: ['High-grade Gold', 'Electrolytic Copper', 'Pure Aluminum', 'ABS Plastic'],
    pointsPerKg: 15,
    co2FactorPerKg: 2.30,
    iconName: 'Laptop'
  },
  {
    id: 'cat-telecom',
    name: 'Telecom & Mobile Devices',
    code: 'ITEW-02',
    description: 'Smartphones, cellular modems, commercial networking switches, routers, and PBX units.',
    hazardousComponents: ['Lithium cobalt oxide', 'Beryllium copper connectors'],
    recoverableMaterials: ['Gold micro-bonding wire', 'Silver pins', 'Cobalt', 'Tantalum capacitors'],
    pointsPerKg: 20,
    co2FactorPerKg: 3.10,
    iconName: 'Smartphone'
  },
  {
    id: 'cat-appliances',
    name: 'Large Electrical Appliances',
    code: 'CEEW-01',
    description: 'Refrigerators, climate control systems, dishwashers, and washing machines.',
    hazardousComponents: ['Fluorocarbon refrigerants (ODS)', 'PCB capacitors', 'Heavy motor oils'],
    recoverableMaterials: ['Structural Steel', 'Heavy Copper windings', 'Aluminum radiators'],
    pointsPerKg: 8,
    co2FactorPerKg: 1.65,
    iconName: 'Refrigerator'
  },
  {
    id: 'cat-consumer',
    name: 'Small Consumer Electronics',
    code: 'CEEW-02',
    description: 'Audio systems, microwave ovens, digital cameras, office copiers, and power tools.',
    hazardousComponents: ['Flame retardants (TBBPA)', 'Lead crystal optics'],
    recoverableMaterials: ['Silicon steel', 'Transformers', 'Recyclable Polycarbonate'],
    pointsPerKg: 10,
    co2FactorPerKg: 1.45,
    iconName: 'Tv'
  },
  {
    id: 'cat-batteries',
    name: 'Power Storage & Batteries',
    code: 'BATT-01',
    description: 'Enterprise UPS battery racks, lithium-ion packs, and sealed lead-acid storage units.',
    hazardousComponents: ['Sulfuric acid electrolyte', 'Toxic nickel-cadmium', 'Volatile organic carbonates'],
    recoverableMaterials: ['Refined Lead (99.9%)', 'Battery-grade Lithium carbonate', 'Nickel', 'Cobalt'],
    pointsPerKg: 25,
    co2FactorPerKg: 4.20,
    iconName: 'BatteryCharging'
  },
  {
    id: 'cat-lighting',
    name: 'Industrial Lighting & Control Panels',
    code: 'LGT-01',
    description: 'Fluorescent tubes, LED fixtures, industrial automation PLCs, and power controllers.',
    hazardousComponents: ['Vaporous elemental mercury', 'Phosphor powder residue'],
    recoverableMaterials: ['Optical Glass', 'Extruded Aluminum heat-sinks', 'Copper chokes'],
    pointsPerKg: 12,
    co2FactorPerKg: 1.80,
    iconName: 'Zap'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-citizen',
    email: 'citizen@ecotrack.org',
    fullName: 'Sarah Jenkins',
    phone: '+1 (555) 382-9011',
    role: 'citizen',
    rewardPoints: 480,
    isVerified: true,
    createdAt: '2026-08-15T09:30:00Z'
  },
  {
    id: 'user-partner',
    email: 'partner@ecotrack.org',
    fullName: 'David Vance (EcoHaul Logistics)',
    phone: '+1 (555) 948-2200',
    role: 'partner',
    rewardPoints: 0,
    isVerified: true,
    organizationName: 'EcoHaul Certified Logistics Ltd.',
    createdAt: '2026-07-10T14:00:00Z'
  },
  {
    id: 'user-recycler',
    email: 'recycler@ecotrack.org',
    fullName: 'Dr. Elena Ramos (GreenCycle)',
    phone: '+1 (555) 774-8899',
    role: 'recycler',
    rewardPoints: 0,
    isVerified: true,
    organizationName: 'GreenCycle High-Recovery Refining Inc.',
    createdAt: '2026-06-01T10:15:00Z'
  },
  {
    id: 'user-org',
    email: 'org@ecotrack.org',
    fullName: 'Marcus Sterling (Apex Tech)',
    phone: '+1 (555) 602-4411',
    role: 'organization',
    rewardPoints: 1250,
    isVerified: true,
    organizationName: 'Apex Technology Corp (Enterprise ITAD)',
    createdAt: '2026-05-19T11:45:00Z'
  },
  {
    id: 'user-admin',
    email: 'admin@ecotrack.org',
    fullName: 'Priya Sharma (Compliance Officer)',
    phone: '+1 (555) 100-2026',
    role: 'admin',
    rewardPoints: 0,
    isVerified: true,
    createdAt: '2026-01-01T08:00:00Z'
  }
];

export const INITIAL_PARTNER_DETAILS: PartnerDetail[] = [
  {
    id: 'part-01',
    profileId: 'user-partner',
    companyName: 'EcoHaul Certified Logistics Ltd.',
    licenseNumber: 'CPCB-LOG-2026-8841',
    fleetSize: 12,
    serviceZones: ['North Metro Zone A', 'Central Commercial Hub', 'East Industrial Belt'],
    approvalStatus: 'approved',
    weighingScaleCalibratedAt: '2026-10-15T09:00:00Z',
    createdAt: '2026-07-10T14:00:00Z'
  }
];

export const INITIAL_RECYCLER_DETAILS: RecyclerDetail[] = [
  {
    id: 'rec-01',
    profileId: 'user-recycler',
    facilityName: 'GreenCycle High-Recovery Refining Inc.',
    pollutionControlBoardReg: 'PCB-EPR-REC-9042-B',
    facilityAddress: 'Plot 48, CleanTech Eco-Park, Sector 9',
    processingCapacityMtMonth: 450.0,
    certifiedTechnologies: ['Automated Optical Sorting', 'Hydrometallurgical Precious Metal Extraction', 'Thermal Closed-Loop Pyrolysis'],
    approvalStatus: 'approved',
    createdAt: '2026-06-01T10:15:00Z'
  }
];

export const INITIAL_PICKUPS: PickupRequest[] = [
  {
    id: 'req-001',
    requestNumber: 'REQ-2026-0891',
    userId: 'user-citizen',
    userFullName: 'Sarah Jenkins',
    userEmail: 'citizen@ecotrack.org',
    userPhone: '+1 (555) 382-9011',
    categoryId: 'cat-it',
    categoryName: 'Computing & IT Hardware',
    itemDescription: '2 Old ThinkPad laptops, 1 CRT monitor, 4 power supply adapters',
    estimatedQuantity: 7,
    estimatedWeightKg: 18.5,
    pickupAddress: '742 Evergreen Terrace, Apt 4B',
    pickupCity: 'Metro City',
    preferredDate: '2026-11-04',
    timeSlot: '10:00 AM - 01:00 PM',
    specialNotes: 'Equipment safely boxed at front door with elevator access',
    status: 'requested',
    createdAt: '2026-10-31T09:12:00Z',
    updatedAt: '2026-10-31T09:12:00Z'
  },
  {
    id: 'req-002',
    requestNumber: 'REQ-2026-0887',
    userId: 'user-citizen',
    userFullName: 'Sarah Jenkins',
    userEmail: 'citizen@ecotrack.org',
    userPhone: '+1 (555) 382-9011',
    categoryId: 'cat-batteries',
    categoryName: 'Power Storage & Batteries',
    itemDescription: '3 Home Inverter batteries and old laptop backup power banks',
    estimatedQuantity: 5,
    estimatedWeightKg: 35.0,
    pickupAddress: '742 Evergreen Terrace, Apt 4B',
    pickupCity: 'Metro City',
    preferredDate: '2026-11-03',
    timeSlot: '02:00 PM - 05:00 PM',
    specialNotes: 'Heavy lead battery cells, requires lifting dolly',
    status: 'assigned',
    createdAt: '2026-10-29T11:20:00Z',
    updatedAt: '2026-10-30T08:15:00Z',
    assignment: {
      id: 'asg-002',
      requestId: 'req-002',
      partnerId: 'user-partner',
      partnerCompanyName: 'EcoHaul Certified Logistics Ltd.',
      assignedByAdminId: 'user-admin',
      status: 'assigned',
      assignedAt: '2026-10-30T08:15:00Z'
    }
  },
  {
    id: 'req-003',
    requestNumber: 'REQ-2026-0872',
    userId: 'user-citizen',
    userFullName: 'Sarah Jenkins',
    userEmail: 'citizen@ecotrack.org',
    userPhone: '+1 (555) 382-9011',
    categoryId: 'cat-consumer',
    categoryName: 'Small Consumer Electronics',
    itemDescription: '1 Microwave, 2 Broken sound bars, 1 Flatbed scanner',
    estimatedQuantity: 4,
    estimatedWeightKg: 24.0,
    pickupAddress: '742 Evergreen Terrace, Apt 4B',
    pickupCity: 'Metro City',
    preferredDate: '2026-11-02',
    timeSlot: '10:00 AM - 01:00 PM',
    status: 'scheduled',
    createdAt: '2026-10-27T14:40:00Z',
    updatedAt: '2026-10-28T16:00:00Z',
    assignment: {
      id: 'asg-003',
      requestId: 'req-003',
      partnerId: 'user-partner',
      partnerCompanyName: 'EcoHaul Certified Logistics Ltd.',
      assignedByAdminId: 'user-admin',
      status: 'accepted',
      scheduledAt: '2026-11-02T10:30:00Z',
      vehicleRegistration: 'EV-TRK-708',
      assignedAgentName: 'Robert Gomez',
      assignedAt: '2026-10-28T09:00:00Z'
    }
  },
  {
    id: 'req-004',
    requestNumber: 'REQ-2026-0850',
    userId: 'user-citizen',
    userFullName: 'Sarah Jenkins',
    userEmail: 'citizen@ecotrack.org',
    userPhone: '+1 (555) 382-9011',
    categoryId: 'cat-telecom',
    categoryName: 'Telecom & Mobile Devices',
    itemDescription: '8 Decommissioned smartphones, 2 office routers, 1 PBX box',
    estimatedQuantity: 11,
    estimatedWeightKg: 12.0,
    pickupAddress: '742 Evergreen Terrace, Apt 4B',
    pickupCity: 'Metro City',
    preferredDate: '2026-10-25',
    timeSlot: '02:00 PM - 05:00 PM',
    status: 'collected',
    createdAt: '2026-10-23T10:00:00Z',
    updatedAt: '2026-10-25T14:45:00Z',
    assignment: {
      id: 'asg-004',
      requestId: 'req-004',
      partnerId: 'user-partner',
      partnerCompanyName: 'EcoHaul Certified Logistics Ltd.',
      assignedByAdminId: 'user-admin',
      status: 'completed',
      scheduledAt: '2026-10-25T14:00:00Z',
      vehicleRegistration: 'EV-TRK-708',
      assignedAgentName: 'Robert Gomez',
      assignedAt: '2026-10-24T09:00:00Z'
    },
    collectionRecord: {
      id: 'col-004',
      requestId: 'req-004',
      collectorId: 'user-partner',
      collectorName: 'Robert Gomez (EcoHaul)',
      actualWeightKg: 13.2,
      itemCount: 11,
      sealTagNumber: 'SEAL-2026-88194',
      gpsCoordinates: '40.7128° N, 74.0060° W',
      collectedAt: '2026-10-25T14:35:00Z',
      status: 'submitted',
      notes: 'All devices collected and placed in anti-static tamper bag #88194. Calibrated digital scale readout verified.'
    }
  },
  {
    id: 'req-005',
    requestNumber: 'REQ-2026-0820',
    userId: 'user-org',
    userFullName: 'Marcus Sterling',
    userEmail: 'org@ecotrack.org',
    userPhone: '+1 (555) 602-4411',
    organizationId: 'org-01',
    organizationName: 'Apex Technology Corp (Enterprise ITAD)',
    categoryId: 'cat-it',
    categoryName: 'Computing & IT Hardware',
    itemDescription: 'Q3 Datacenter Server Refresh: 18 2U Rackmount Servers, 6 High-Density Switches',
    estimatedQuantity: 24,
    estimatedWeightKg: 420.0,
    pickupAddress: 'Apex Innovation Park, Tower B Loading Dock',
    pickupCity: 'Metro City Industrial Park',
    preferredDate: '2026-10-18',
    timeSlot: '09:00 AM - 12:00 PM',
    status: 'verified',
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-19T11:00:00Z',
    assignment: {
      id: 'asg-005',
      requestId: 'req-005',
      partnerId: 'user-partner',
      partnerCompanyName: 'EcoHaul Certified Logistics Ltd.',
      assignedByAdminId: 'user-admin',
      status: 'completed',
      scheduledAt: '2026-10-18T09:30:00Z',
      vehicleRegistration: 'HD-ECO-402',
      assignedAgentName: 'Carlos Mendez',
      assignedAt: '2026-10-16T10:00:00Z'
    },
    collectionRecord: {
      id: 'col-005',
      requestId: 'req-005',
      collectorId: 'user-partner',
      collectorName: 'Carlos Mendez (EcoHaul)',
      actualWeightKg: 435.5,
      itemCount: 24,
      sealTagNumber: 'SEAL-APEX-9921',
      gpsCoordinates: '40.7589° N, 73.9851° W',
      collectedAt: '2026-10-18T10:15:00Z',
      status: 'verified',
      notes: 'Industrial palletized server chassis weighed on certified dock floor scale.'
    },
    weightVerification: {
      id: 'ver-005',
      collectionRecordId: 'col-005',
      adminId: 'user-admin',
      adminName: 'Priya Sharma',
      verifiedWeightKg: 435.5,
      varianceKg: 0.0,
      notes: 'Dock weight slip cross-verified against calibrated fleet manifest. Tolerance 0.0%. Approved for consolidation.',
      status: 'approved',
      verifiedAt: '2026-10-19T11:00:00Z'
    }
  },
  {
    id: 'req-006',
    requestNumber: 'REQ-2026-0799',
    userId: 'user-org',
    userFullName: 'Marcus Sterling',
    userEmail: 'org@ecotrack.org',
    userPhone: '+1 (555) 602-4411',
    organizationId: 'org-01',
    organizationName: 'Apex Technology Corp (Enterprise ITAD)',
    categoryId: 'cat-it',
    categoryName: 'Computing & IT Hardware',
    itemDescription: 'Engineering Workstations & High-End GPUs Decommission (45 units)',
    estimatedQuantity: 45,
    estimatedWeightKg: 580.0,
    pickupAddress: 'Apex Innovation Park, Tower B Loading Dock',
    pickupCity: 'Metro City Industrial Park',
    preferredDate: '2026-10-05',
    timeSlot: '09:00 AM - 12:00 PM',
    status: 'recycled',
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-22T16:00:00Z',
    assignment: {
      id: 'asg-006',
      requestId: 'req-006',
      partnerId: 'user-partner',
      partnerCompanyName: 'EcoHaul Certified Logistics Ltd.',
      assignedByAdminId: 'user-admin',
      status: 'completed',
      assignedAt: '2026-10-03T11:00:00Z'
    },
    collectionRecord: {
      id: 'col-006',
      requestId: 'req-006',
      collectorId: 'user-partner',
      collectorName: 'Carlos Mendez (EcoHaul)',
      actualWeightKg: 592.0,
      itemCount: 45,
      sealTagNumber: 'SEAL-APEX-9850',
      collectedAt: '2026-10-05T10:30:00Z',
      status: 'verified'
    },
    weightVerification: {
      id: 'ver-006',
      collectionRecordId: 'col-006',
      adminId: 'user-admin',
      adminName: 'Priya Sharma',
      verifiedWeightKg: 592.0,
      varianceKg: 0.0,
      status: 'approved',
      verifiedAt: '2026-10-06T14:00:00Z'
    }
  }
];

export const INITIAL_BATCHES: EWasteBatch[] = [
  {
    id: 'batch-001',
    batchNumber: 'BATCH-2026-0042',
    recyclerId: 'user-recycler',
    recyclerFacilityName: 'GreenCycle High-Recovery Refining Inc.',
    createdById: 'user-admin',
    pickupRequestIds: ['req-006'],
    totalWeightKg: 592.0,
    itemCount: 45,
    manifestNumber: 'MNF-CPCB-2026-9938',
    status: 'verified',
    dispatchedAt: '2026-10-08T09:00:00Z',
    receivedAt: '2026-10-09T11:30:00Z',
    completedAt: '2026-10-21T15:00:00Z',
    recyclingRecord: {
      id: 'rec-rec-001',
      batchId: 'batch-001',
      batchNumber: 'BATCH-2026-0042',
      recyclerId: 'user-recycler',
      facilityName: 'GreenCycle High-Recovery Refining Inc.',
      receivedWeightKg: 592.0,
      copperRecoveredKg: 88.5,
      aluminumRecoveredKg: 142.0,
      plasticsRecoveredKg: 198.0,
      preciousMetalsGrams: 42.8,
      glassRecoveredKg: 34.0,
      hazardousResidueKg: 18.2,
      processingMethod: 'Hydrometallurgical refining + Optical mechanical sorting (Zero-landfill certified)',
      certificateNumber: 'CERT-REC-2026-0042',
      adminVerified: true,
      submittedAt: '2026-10-21T16:30:00Z',
      verifiedAt: '2026-10-22T10:00:00Z'
    }
  },
  {
    id: 'batch-002',
    batchNumber: 'BATCH-2026-0043',
    recyclerId: 'user-recycler',
    recyclerFacilityName: 'GreenCycle High-Recovery Refining Inc.',
    createdById: 'user-admin',
    pickupRequestIds: ['req-005'],
    totalWeightKg: 435.5,
    itemCount: 24,
    manifestNumber: 'MNF-CPCB-2026-9955',
    status: 'in_processing',
    dispatchedAt: '2026-10-24T08:30:00Z',
    receivedAt: '2026-10-25T13:00:00Z'
  }
];

export const INITIAL_EPR_LEDGER: EprLedgerEntry[] = [
  {
    id: 'epr-001',
    ledgerReference: 'EPR-REC-2026-00084',
    batchId: 'batch-001',
    batchNumber: 'BATCH-2026-0042',
    recyclingRecordId: 'rec-rec-001',
    organizationId: 'org-01',
    organizationName: 'Apex Technology Corp (Enterprise ITAD)',
    categoryId: 'cat-it',
    categoryName: 'Computing & IT Hardware',
    verifiedWeightKg: 592.0,
    creditAmount: 592.0,
    creditType: 'recycling',
    status: 'verified',
    verifierName: 'Priya Sharma (Admin Compliance)',
    transactionHash: '0x8f2a1b9c4d3e70659821af3e0984cba7e52d3a9187c2b4e5f6',
    notes: 'Complete hydrometallurgical recovery certificate verified. Eligible for corporate EPR annual quota credit.',
    recordedAt: '2026-10-22T10:15:00Z'
  },
  {
    id: 'epr-002',
    ledgerReference: 'EPR-REC-2026-00079',
    batchId: 'batch-archived-01',
    batchNumber: 'BATCH-2026-0038',
    recyclingRecordId: 'rec-archived-01',
    organizationId: 'org-01',
    organizationName: 'Apex Technology Corp (Enterprise ITAD)',
    categoryId: 'cat-telecom',
    categoryName: 'Telecom & Mobile Devices',
    verifiedWeightKg: 310.0,
    creditAmount: 310.0,
    creditType: 'recycling',
    status: 'verified',
    verifierName: 'Priya Sharma (Admin Compliance)',
    transactionHash: '0x17c99e4b2d8a5f0134762bca8817290de45f891b2c3d4e5a6f',
    notes: 'Verified against Pollution Control Board Form 6 transport manifest.',
    recordedAt: '2026-09-28T14:20:00Z'
  }
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew-01',
    title: 'Plant 5 Native Agro-Forestry Trees',
    description: 'We partner with accredited reforestation trusts to plant 5 native broadleaf trees on your behalf.',
    category: 'donation',
    pointsRequired: 200,
    sponsorName: 'EcoForest Global Initiative',
    voucherCodeSample: 'TREE-ECO-5X-CERT',
    icon: 'Trees',
    isActive: true
  },
  {
    id: 'rew-02',
    title: '$25 Sustainable Tech Store Voucher',
    description: 'Valid for eco-certified modular electronics, phone cases made from ocean plastic, and solar chargers.',
    category: 'voucher',
    pointsRequired: 350,
    sponsorName: 'GreenGear Electronics',
    voucherCodeSample: 'GREENGEAR25-SAVE',
    icon: 'Gift',
    isActive: true
  },
  {
    id: 'rew-03',
    title: 'Free Annual Electronic Health Check',
    description: 'Complimentary professional hardware diagnostics and thermal repaste for your personal laptop or PC.',
    category: 'discount',
    pointsRequired: 400,
    sponsorName: 'RightToRepair Hub',
    voucherCodeSample: 'REPAIR-HEALTH-2026',
    icon: 'Wrench',
    isActive: true
  },
  {
    id: 'rew-04',
    title: 'Zero-Waste Organic Cotton Tech Sleeve',
    description: 'Custom padded laptop sleeve crafted from 100% recycled canvas with biological dyes.',
    category: 'swag',
    pointsRequired: 500,
    sponsorName: 'EcoTrack Merchandise',
    voucherCodeSample: 'SLEEVE-CLAIM-992',
    icon: 'ShieldCheck',
    isActive: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    actorId: 'user-admin',
    actorName: 'Priya Sharma',
    actorRole: 'admin',
    action: 'EPR_CREDIT_ISSUED',
    entityName: 'epr_ledger',
    entityId: 'EPR-REC-2026-00084',
    details: 'Verified recycling batch BATCH-2026-0042 and allocated 592.0 EPR credits to Apex Technology Corp.',
    timestamp: '2026-10-22T10:15:00Z'
  },
  {
    id: 'log-002',
    actorId: 'user-recycler',
    actorName: 'Dr. Elena Ramos',
    actorRole: 'recycler',
    action: 'RECYCLING_YIELD_SUBMITTED',
    entityName: 'recycling_records',
    entityId: 'rec-rec-001',
    details: 'Submitted recovery fractions: Cu: 88.5kg, Al: 142kg, Au: 42.8g for batch BATCH-2026-0042.',
    timestamp: '2026-10-21T16:30:00Z'
  },
  {
    id: 'log-003',
    actorId: 'user-admin',
    actorName: 'Priya Sharma',
    actorRole: 'admin',
    action: 'WEIGHT_VERIFIED',
    entityName: 'weight_verifications',
    entityId: 'ver-005',
    details: 'Approved weight of 435.5 kg for pickup REQ-2026-0820 with 0.0% variance.',
    timestamp: '2026-10-19T11:00:00Z'
  },
  {
    id: 'log-004',
    actorId: 'user-partner',
    actorName: 'David Vance',
    actorRole: 'partner',
    action: 'COLLECTION_COMPLETED',
    entityName: 'collection_records',
    entityId: 'col-004',
    details: 'Recorded actual collected weight 13.2 kg for REQ-2026-0850. Seal tag #SEAL-2026-88194 attached.',
    timestamp: '2026-10-25T14:35:00Z'
  }
];
