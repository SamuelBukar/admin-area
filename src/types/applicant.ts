// Applicant information - can be a person or company
export type ApplicantType = 'person' | 'company';

export interface PersonApplicant {
  type: 'person';
  id?: string; // Applicant ID
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  nationalId?: string;
  occupation?: string;
}

export interface CompanyApplicant {
  type: 'company';
  id?: string; // Applicant ID
  companyName: string;
  registrationNumber?: string;
  taxId?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  contactPerson?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position?: string;
  };
  industry?: string;
  yearEstablished?: number;
}

export type Applicant = PersonApplicant | CompanyApplicant;

