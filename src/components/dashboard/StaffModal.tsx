'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  X, 
  Shield, 
  User, 
  Crown, 
  Settings,
  Calendar,
  AlertCircle,
  Mail,
  Phone,
  Key,
  CheckCircle,
  Save
} from 'lucide-react';
import { Employee, EMPLOYEE_ROLES } from '@/types/establishment';
import PhoneInput from '@/components/ui/PhoneInput';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (employee: Employee) => void;
  editingEmployee?: Employee | null;
}

interface EmployeeFormData extends Omit<Employee, 'id'> {
  id?: string;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSuccess, editingEmployee }) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: editingEmployee?.name || '',
    email: editingEmployee?.email || '',
    phone: editingEmployee?.phone || '',
    role: editingEmployee?.role || 'staff',
    schedule: editingEmployee?.schedule || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    permissions: editingEmployee?.permissions || []
  });

  const weekDays = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  const permissionsByRole = {
    admin: ['all'],
    manager: ['reservations', 'courts', 'customers', 'reports'],
    staff: ['reservations', 'customers'],
    maintenance: ['courts', 'maintenance']
  };

  const permissionLabels = {
    all: 'Acceso total al sistema',
    reservations: 'Gestionar reservas',
    courts: 'Gestionar canchas',
    customers: 'Atención al cliente',
    reports: 'Ver reportes',
    maintenance: 'Mantenimiento'
  };

  const handleSaveEmployee = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;

    // Auto-assign permissions based on role
    const rolePermissions = permissionsByRole[formData.role];
    
    const employeeData: Employee = {
      ...formData,
      id: editingEmployee?.id || `employee-${Date.now()}`,
      permissions: rolePermissions
    };

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          role: employeeData.role,
          schedule: employeeData.schedule,
          permissions: employeeData.permissions
        })
      });

      if (response.ok) {
        onSuccess(employeeData);
      } else {
        console.error('Error creating staff member');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleScheduleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.includes(day)
        ? prev.schedule.filter(d => d !== day)
        : [...prev.schedule, day]
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingEmployee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                    placeholder="Número de teléfono"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Employee['role'] }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {EMPLOYEE_ROLES.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Description */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Permisos del Rol</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {EMPLOYEE_ROLES.find((r: any) => r.value === formData.role)?.description}
                </p>
                <div className="space-y-1">
                  {(permissionsByRole as any)[formData.role]?.map((permission: string) => (
                    <div key={permission} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="text-gray-300">{(permissionLabels as any)[permission]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Días de Trabajo
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {weekDays.map(day => (
                    <label
                      key={day.value}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.schedule.includes(day.value)}
                        onChange={() => toggleScheduleDay(day.value)}
                        className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-300">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEmployee}
                disabled={!formData.name.trim() || !formData.email.trim()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  formData.name.trim() && formData.email.trim()
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{editingEmployee ? 'Guardar Cambios' : 'Agregar Empleado'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StaffModal;
