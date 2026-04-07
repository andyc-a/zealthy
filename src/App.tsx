import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './routes/patient/Login'
import Dashboard from './routes/patient/Dashboard'
import Appointments from './routes/patient/Appointments'
import Prescriptions from './routes/patient/Prescriptions'

import AdminHome from './routes/admin/AdminHome'
import PatientDetail from './routes/admin/PatientDetail'
import PatientForm from './routes/admin/PatientForm'
import PrescriptionForm from './routes/admin/PrescriptionForm'
import AppointmentForm from './routes/admin/AppointmentForm'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Patient Portal */}
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />

          {/* Admin EMR */}
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/patients/new" element={<PatientForm />} />
          <Route path="/admin/patients/:id" element={<PatientDetail />} />
          <Route path="/admin/patients/:id/edit" element={<PatientForm />} />
          <Route path="/admin/patients/:id/prescriptions/new" element={<PrescriptionForm />} />
          <Route path="/admin/patients/:id/prescriptions/:rxId/edit" element={<PrescriptionForm />} />
          <Route path="/admin/patients/:id/appointments/new" element={<AppointmentForm />} />
          <Route path="/admin/patients/:id/appointments/:apptId/edit" element={<AppointmentForm />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
