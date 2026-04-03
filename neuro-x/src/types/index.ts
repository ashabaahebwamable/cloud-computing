export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Radiologist' | 'Doctor' | 'Anesthesiologist';
  loginTime?: string;
}

export interface Case {
  id: number;
  uploaded_by: number;
  patient_name: string;
  image_path: string | null;
  mask_path: string | null;
  findings: string | null;
  confidence: number | null;
  status: 'pending' | 'transferred' | 'reviewed' | 'completed';
  created_at: string;
  // Joined fields
  sent_to?: number;
  sent_to_name?: string;
  transfer_notes?: string;
  transfer_time?: string;
  radiologist_name?: string;
}

export interface ShiftStats {
  login_time: string | null;
  cases_handled: number;
}

export interface TransferUser {
  id: number;
  name: string;
  role: string;
}

export interface UploadCaseResult {
  id: number;
  imagePath: string | null;
  findings: string;
  confidence: number;
  maskPath: string;
  status: string;
}
