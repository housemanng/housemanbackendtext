import { Types, Document } from "mongoose";

// Base user interface
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

// Populated user interface with NIN details
export interface PopulatedUser extends IUser {
  ninDetails: {
    firstName: string;
    lastName: string;
  };
}

// Property interface
export interface IProperty {
  _id: Types.ObjectId;
  name: string;
  streetNo: string;
  flatNumber: string;
  city: string;
  state: string;
  country: string;
}

// Populated property interface with landlord, agent, and company
export interface PopulatedProperty extends IProperty {
  landlord: PopulatedUser;
  agent: PopulatedUser;
  company?: PopulatedUser; // Optional company field for management companies
}

// Base tenant interface
export interface ITenantBase {
  _id: Types.ObjectId;
  role: string;
  rent_status: string;
  flatNumber: string;
  uvcCode: string;
  rentAmount: string;
  rentDate: Date;
  expiryDate: Date;
  property: Types.ObjectId;
  currentAddress?: Types.ObjectId;
  addressHistory: Types.ObjectId[];
  housemates: Types.ObjectId[];
  reviews: Types.ObjectId[];
  maxHousemates: number;
  currentHousemateCount: number;
  name?: string;
}

// Populated tenant interface
export interface PopulatedTenant extends Omit<ITenantBase, 'property'> {
  user: PopulatedUser;
  property: {
    _id: Types.ObjectId;
    streetNo: string;
    flatNumber: string;
    name: string;
  };
  canAcceptHousemate(): boolean;
  incrementHousemateCount(): Promise<void>;
  decrementHousemateCount(): Promise<void>;
}

// Housemate interface
export interface IHousemate {
  _id: Types.ObjectId;
  uvcCode: string;
  status: string;
}

// Tenant with housemate details interface
export interface TenantWithHousemate extends Document {
  _id: Types.ObjectId;
  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
  housemates: IHousemate[];
}

// Housemate request interface
export interface IHousemateRequest {
  _id: Types.ObjectId;
  uvcCode: string;
  reason: string;
  intendedLeaveDate: Date;
  status: string;
  requestedAt: Date;
  requestedBy: {
    user: Types.ObjectId;
    uvcCode: string;
  };
  approvedAt?: Date;
  approvedBy?: {
    user: Types.ObjectId;
    role: string;
  };
  property: PopulatedProperty;
  tenant: PopulatedTenant;
}

// Request data interface
export interface RequestData extends IHousemateRequest {
  tenant: PopulatedTenant;
  property: PopulatedProperty;
}



