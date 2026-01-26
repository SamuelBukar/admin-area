import type { Applicant } from '@/types/applicant';

/**
 * Get display name for an applicant
 */
export const getApplicantName = (applicant?: Applicant): string => {
  if (!applicant) return 'Unknown';
  
  if (applicant.type === 'person') {
    return `${applicant.firstName} ${applicant.lastName}`.trim();
  } else {
    return applicant.companyName;
  }
};

/**
 * Get email for an applicant
 */
export const getApplicantEmail = (applicant?: Applicant): string => {
  if (!applicant) return '';
  return applicant.email;
};

/**
 * Get phone for an applicant
 */
export const getApplicantPhone = (applicant?: Applicant): string => {
  if (!applicant) return '';
  return applicant.phone || '';
};

/**
 * Get ID for an applicant
 */
export const getApplicantId = (applicant?: Applicant): string => {
  if (!applicant) return '';
  return applicant.id || '';
};

/**
 * Get full address for an applicant
 */
export const getApplicantAddress = (applicant?: Applicant): string => {
  if (!applicant) return '';
  
  const parts: string[] = [];
  if (applicant.address) parts.push(applicant.address);
  if (applicant.city) parts.push(applicant.city);
  if (applicant.state) parts.push(applicant.state);
  if (applicant.zipCode) parts.push(applicant.zipCode);
  if (applicant.country) parts.push(applicant.country);
  
  return parts.join(', ');
};

/**
 * Extract applicant data from form data
 */
export const extractApplicantFromFormData = (formData: Record<string, any>): Applicant | undefined => {
  // Check if it's a company application
  if (formData.applicantType === 'company' || formData.companyName) {
    return {
      type: 'company',
      id: formData.applicantId || formData.applicant_id || crypto.randomUUID(),
      companyName: formData.companyName || formData.company_name || '',
      registrationNumber: formData.registrationNumber || formData.registration_number,
      taxId: formData.taxId || formData.tax_id,
      email: formData.email || formData.companyEmail || '',
      phone: formData.phone || formData.companyPhone,
      website: formData.website,
      address: formData.address || formData.companyAddress,
      city: formData.city || formData.companyCity,
      state: formData.state || formData.companyState,
      zipCode: formData.zipCode || formData.zip_code || formData.postalCode,
      country: formData.country || formData.companyCountry,
      contactPerson: formData.contactPerson ? {
        firstName: formData.contactPerson.firstName || formData.contactPerson.first_name || '',
        lastName: formData.contactPerson.lastName || formData.contactPerson.last_name || '',
        email: formData.contactPerson.email || '',
        phone: formData.contactPerson.phone,
        position: formData.contactPerson.position,
      } : undefined,
      industry: formData.industry,
      yearEstablished: formData.yearEstablished || formData.year_established,
    };
  }
  
  // Otherwise it's a person
  if (formData.firstName || formData.first_name || formData.name) {
    return {
      type: 'person',
      id: formData.applicantId || formData.applicant_id || crypto.randomUUID(),
      firstName: formData.firstName || formData.first_name || formData.name?.split(' ')[0] || '',
      lastName: formData.lastName || formData.last_name || formData.name?.split(' ').slice(1).join(' ') || '',
      email: formData.email || '',
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode || formData.zip_code || formData.postalCode,
      country: formData.country,
      dateOfBirth: formData.dateOfBirth || formData.date_of_birth || formData.dob,
      nationalId: formData.nationalId || formData.national_id || formData.idNumber,
      occupation: formData.occupation,
    };
  }
  
  return undefined;
};

