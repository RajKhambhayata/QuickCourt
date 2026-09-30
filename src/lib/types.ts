export type UserRole = 'USER' | 'OWNER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED' | 'PENDING_APPROVAL' | 'REJECTED';
export type FacilityStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  status: UserStatus;
  isVerified: boolean;
}

export interface FacilityWithDetails {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state?: string | null;
  pincode?: string | null;
  images: string[];
  sports: string[];
  amenities: string[];
  venueType: string;
  status: FacilityStatus;
  rejectionReason?: string | null;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  courts: CourtItem[];
  reviews: ReviewItem[];
  avgRating?: number;
  totalReviews?: number;
  minPrice?: number;
}

export interface CourtItem {
  id: string;
  facilityId: string;
  name: string;
  sportType: string;
  surfaceType?: string | null;
  pricePerHour: number;
  operatingStartHour: number;
  operatingEndHour: number;
  isActive: boolean;
}

export interface SlotStatus {
  time: string; // e.g. "06:00 - 07:00"
  startTime: string; // "06:00"
  endTime: string; // "07:00"
  isBooked: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  blockedSlotId?: string;
  price: number;
  bookingId?: string;
}

export interface BookingItem {
  id: string;
  bookingNumber: string;
  userId: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: string;
  paymentStatus: string;
  cancellationReason?: string | null;
  createdAt: string;
  court: {
    id: string;
    name: string;
    sportType: string;
    facility: {
      id: string;
      name: string;
      address: string;
      city: string;
      images: string[];
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}
