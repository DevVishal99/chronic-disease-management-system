export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'provider';
  createdAt: string;
}

export interface Patient extends User {
  dateOfBirth: string;
  conditions: string[];
  allergies: string[];
  medications: string[];
  providerId?: string;
}

export interface Provider extends User {
  specialization: string;
  patients: string[]; // Array of patient IDs
}

export interface HealthMetric {
  id: string;
  patientId: string;
  type: 'bloodSugar' | 'bloodPressure' | 'weight';
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'patient' | 'provider';
  dateOfBirth?: string;
  specialization?: string;
  consent: boolean;
} 