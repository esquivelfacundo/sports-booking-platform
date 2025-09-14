'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  X, 
  Shield, 
  User, 
  Crown, 
  Settings,
  Calendar,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  Key,
  CheckCircle,
  Save
} from 'lucide-react';
import { EstablishmentRegistration, Employee, EMPLOYEE_ROLES } from '@/types/establishment';
import PhoneInput from '@/components/ui/PhoneInput';

interface StaffStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

interface EmployeeFormData extends Omit<Employee, 'id'> {
  id?: string;
}

const StaffStep: React.FC<StaffStepProps> = ({ data, onUpdate, onValidation }) => {
  const [staff, setStaff] = useState<Employee[]>(data.staff || []);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    schedule: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    permissions: []
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

  // Auto-validation: Staff step is always valid (optional step)
  useEffect(() => {
    onValidation(true);
    onUpdate({ staff });
  }, [staff]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'staff',
      schedule: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      permissions: []
    });
    setEditingEmployee(null);
  };

  const handleAddEmployee = () => {
    setShowForm(true);
    resetForm();
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({ ...employee });
    setShowForm(true);
  };

  const handleSaveEmployee = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;

    // Auto-assign permissions based on role
    const rolePermissions = permissionsByRole[formData.role];
    
    const employeeData: Employee = {
      ...formData,
      id: editingEmployee?.id || `employee-${Date.now()}`,
      permissions: rolePermissions
    };

    if (editingEmployee) {
      setStaff(prev => prev.map(emp => 
        emp.id === editingEmployee.id ? employeeData : emp
      ));
    } else {
      setStaff(prev => [...prev, employeeData]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setStaff(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const toggleScheduleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.includes(day)
        ? prev.schedule.filter(d => d !== day)
        : [...prev.schedule, day]
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'manager': return User;
      case 'staff': return Users;
      case 'maintenance': return AlertCircle;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'manager': return 'text-blue-400';
      case 'staff': return 'text-emerald-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRoleLabel = (role: string) => {
    const roleData = EMPLOYEE_ROLES.find(r => r.value === role);
    return roleData?.label || role;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Personal y Accesos</h2>
        <p className="text-gray-400">Gestiona los empleados que tendrán acceso al sistema</p>
      </div>

      {/* Staff List */}
      <div className="space-y-6">
        {staff.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-700 rounded-xl border-2 border-dashed border-gray-600"
          >
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay empleados configurados</h3>
            <p className="text-gray-400 mb-6">Agrega empleados para que puedan gestionar el establecimiento</p>
            <button
              onClick={handleAddEmployee}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <UserPlus className="w-5 h-5" />
              <span>Agregar Primer Empleado</span>
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Personal Configurado ({staff.length})</h3>
              <button
                onClick={handleAddEmployee}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Agregar Empleado</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staff.map((employee, index) => {
                const RoleIcon = getRoleIcon(employee.role);
                const roleColor = getRoleColor(employee.role);
                
                return (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-700 border border-gray-600 rounded-xl p-6 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gray-600 ${roleColor}`}>
                          <RoleIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{employee.name}</h4>
                          <p className={`text-sm ${roleColor}`}>{getRoleLabel(employee.role)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id!)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{employee.email}</span>
                      </div>
                      
                      {employee.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{employee.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {employee.schedule.length} días/semana
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Key className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {employee.permissions.includes('all') 
                            ? 'Acceso total' 
                            : `${employee.permissions.length} permisos`
                          }
                        </span>
                      </div>

                      {/* Schedule Days */}
                      <div className="flex flex-wrap gap-1 pt-2">
                        {employee.schedule.map(day => {
                          const dayLabel = weekDays.find(d => d.value === day)?.label.slice(0, 3);
                          return (
                            <span
                              key={day}
                              className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full"
                            >
                              {dayLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Employee Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
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
                  onClick={() => setShowForm(false)}
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
                  onClick={() => setShowForm(false)}
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
    </div>
  );
};

export default StaffStep;
