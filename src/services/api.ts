import { API_BASE_URL } from '../config/api';
import { Doctor, Patient, User, ActiveQueuesData } from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  }
};

export const doctorApi = {
  getAll: async (): Promise<Doctor[]> => {
    const res = await fetch(`${API_BASE_URL}/doctors`);
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  create: async (data: Partial<Doctor>) => {
    const res = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/doctors/${id}`, { method: 'DELETE' });
    return res.json();
  }
};

export const patientApi = {
  register: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAll: async (): Promise<Patient[]> => {
    const res = await fetch(`${API_BASE_URL}/patients`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  getByUserId: async (userId: number): Promise<Patient[]> => {
    const res = await fetch(`${API_BASE_URL}/patients/history/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch patient history');
    return res.json();
  },

  updateStatus: async (id: number, status: string) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};

export const queueApi = {
  getActive: async (): Promise<ActiveQueuesData> => {
    const res = await fetch(`${API_BASE_URL}/queues/active`);
    if (!res.ok) throw new Error('Failed to fetch active queues');
    return res.json();
  }
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  updateProfile: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
    return res.json();
  }
};
