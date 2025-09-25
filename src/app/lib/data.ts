
import type { Submission } from '@/lib/types';

const defaultTerms = "1. The guest assumes all responsibility for any damages to the room or hotel property. \n2. The hotel is not responsible for lost or stolen articles. \n3. Smoking is strictly prohibited in all rooms and public areas. A cleaning fee will be assessed for violations. \n4. Check-out time is 11:00 AM. Late check-outs may incur additional charges."

export const submissions: Submission[] = [
  {
    id: 'SUB-001',
    propertyId: 'PROP-001',
    propertyName: 'The Grand Resort',
    bookingId: 'BK-10593',
    mainGuestName: 'John Doe',
    mainGuestPhoneNumber: '+1-555-123-4567',
    numberOfGuests: 2,
    checkInDate: new Date('2024-08-15'),
    checkOutDate: new Date('2024-08-20'),
    termsAndConditions: defaultTerms,
    status: 'Awaiting Guest',
    guests: [
      { id: 'G-001-1', guestNumber: 1, status: 'Pending' },
      { id: 'G-001-2', guestNumber: 2, status: 'Pending' },
    ],
  },
  {
    id: 'SUB-002',
    propertyId: 'PROP-001',
    propertyName: 'The Grand Resort',
    bookingId: 'BK-10594',
    mainGuestName: 'Jane Smith',
    mainGuestPhoneNumber: '+1-555-987-6543',
    numberOfGuests: 1,
    checkInDate: new Date('2024-08-16'),
    checkOutDate: new Date('2024-08-22'),
    termsAndConditions: defaultTerms,
    status: 'Approved',
    guests: [
      {
        id: 'G-002-1',
        guestNumber: 1,
        status: 'Approved',
        idDocumentUrl: 'https://picsum.photos/seed/id2/800/500',
        idDocumentAiHint: 'passport document',
        verificationSummary: 'The ID appears to be a valid passport. All information is clear and consistent. The holder is Jane Smith, born on 1990-05-20. The passport is valid until 2030-01-01.',
        verificationIssues: 'No issues detected.',
      },
    ],
  },
  {
    id: 'SUB-003',
    propertyId: 'PROP-002',
    propertyName: 'Beachside Villa',
    bookingId: 'BK-10595',
    mainGuestName: 'Peter Jones',
    mainGuestPhoneNumber: '+1-555-345-6789',
    numberOfGuests: 3,
    checkInDate: new Date('2024-09-01'),
    checkOutDate: new Date('2024-09-10'),
    termsAndConditions: defaultTerms,
    status: 'Rejected',
    guests: [
        { id: 'G-003-1', guestNumber: 1, status: 'Approved', idDocumentUrl: 'https://picsum.photos/seed/id3a/800/500', idDocumentAiHint: 'passport document' },
        { 
            id: 'G-003-2', 
            guestNumber: 2, 
            status: 'Rejected',
            idDocumentUrl: 'https://picsum.photos/seed/id3b/800/500',
            idDocumentAiHint: 'license paper',
            verificationSummary: 'The document is a driver\'s license for an unknown individual.',
            verificationIssues: 'The driver\'s license appears to be expired. Expiry date is 2023-12-31. The corners of the ID seem worn, which could indicate tampering, but might also be normal wear and tear.'
        },
        { id: 'G-003-3', guestNumber: 3, status: 'Pending' },
    ]
  },
  {
    id: 'SUB-004',
    propertyId: 'PROP-002',
    propertyName: 'Beachside Villa',
    bookingId: 'BK-10596',
    mainGuestName: 'Emily White',
    mainGuestPhoneNumber: '+1-555-555-5555',
    numberOfGuests: 1,
    checkInDate: new Date('2024-09-05'),
    checkOutDate: new Date('2024-09-08'),
    termsAndConditions: defaultTerms,
    status: 'Awaiting Guest',
    guests: [
        { id: 'G-004-1', guestNumber: 1, status: 'Pending' }
    ]
  },
];
