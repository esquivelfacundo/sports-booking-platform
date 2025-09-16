'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import StaffModal from '@/components/dashboard/StaffModal';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Shield,
  Clock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  hireDate: string;
  salary: number;
  schedule: string[];
  permissions: string[];
  performance: number;
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

const StaffPage = () => {
  const { establishment, loading } = useEstablishment();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditPermissions, setShowEditPermissions] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Available roles
  const roles: Role[] = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      permissions: ['dashboard', 'reservations', 'analytics', 'finance', 'staff', 'courts', 'clients', 'maintenance', 'marketing', 'settings'],
      color: 'red'
    },
    {
      id: 'manager',
      name: 'Gerente',
      description: 'Gestión operativa del establecimiento',
      permissions: ['dashboard', 'reservations', 'analytics', 'finance', 'staff', 'courts', 'clients'],
      color: 'blue'
    },
    {
      id: 'receptionist',
      name: 'Recepcionista',
      description: 'Gestión de reservas y atención al cliente',
      permissions: ['dashboard', 'reservations', 'clients'],
      color: 'green'
    },
    {
      id: 'coach',
      name: 'Entrenador',
      description: 'Gestión de entrenamientos y clases',
      permissions: ['dashboard', 'courts', 'clients'],
      color: 'purple'
    },
    {
      id: 'maintenance',
      name: 'Mantenimiento',
      description: 'Gestión de instalaciones y equipamiento',
      permissions: ['dashboard', 'courts', 'maintenance'],
      color: 'orange'
    }
  ];

  // Helper function to get permissions by role
  const getPermissionsByRole = (role: string): string[] => {
    const roleObj = roles.find(r => r.id === role);
    return roleObj ? roleObj.permissions : ['dashboard'];
  };

  // Initialize employees data based on establishment staff
  useEffect(() => {
    if (establishment?.staff && establishment.staff.length > 0) {
      // Convert establishment staff to Employee format
      const convertedEmployees: Employee[] = establishment.staff.map((staff: any, index: number) => ({
        id: staff.id || (index + 1).toString(),
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        status: 'active' as Employee['status'],
        hireDate: new Date().toISOString().split('T')[0],
        salary: 80000, // Default salary
        schedule: staff.schedule || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        permissions: staff.permissions || getPermissionsByRole(staff.role),
        performance: 85,
        lastLogin: new Date().toISOString()
      }));
      setEmployees(convertedEmployees);
    } else {
      // No staff data available
      setEmployees([]);
    }
  }, [establishment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Event handlers
  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setShowCreateModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
    }
  };

  const handleEditPermissions = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditingPermissions(employee.permissions);
    setShowEditPermissionsModal(true);
  };

  const handleSavePermissions = () => {
    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, permissions: editingPermissions }
          : emp
      ));
      setShowEditPermissionsModal(false);
      setEditingEmployee(null);
      setEditingPermissions([]);
    }
  };

  const handleToggleStatus = (employeeId: string) => {
    if (window.confirm('¿Estás seguro de que quieres cambiar el estado de este empleado?')) {
      setEmployees(employees.map(emp => 
        emp.id === employeeId 
          ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' }
          : emp
      ));
    }
  };

  // Add new employee
  const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
    const employee: Employee = {
      ...newEmployee,
      id: Date.now().toString(),
    };
    setEmployees([...employees, employee]);
    setShowCreateModal(false);
    setSelectedEmployee(null);
  };

  // Get role color
  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.color : 'gray';
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || employee.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
    totalSalary: employees.reduce((sum, e) => sum + e.salary, 0) / employees.length || 0
  };

  const handleViewPermissions = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPermissions(true);
  };

  const togglePermission = (permission: string) => {
    setEditingPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Personal</h1>
            <p className="text-gray-400 mt-2">Gestiona el equipo de trabajo de tu establecimiento</p>
          </div>
          <button
            onClick={handleCreateEmployee}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Personal</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Personal</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Activos</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Inactivos</p>
                <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
              </div>
              <EyeOff className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Salario Promedio</p>
                <p className="text-2xl font-bold text-yellow-400">${stats.totalSalary.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todos los roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Lista de Personal</h2>
          </div>
          
          {filteredEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay personal registrado</h3>
              <p className="text-gray-500 mb-6">Comienza agregando miembros a tu equipo</p>
              <button
                onClick={handleCreateEmployee}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Primer Empleado</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Empleado</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Salario</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Último Acceso</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredEmployees.map((employee) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {employee.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{employee.name}</div>
                            <div className="text-sm text-gray-400">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getRoleColor(employee.role)}-500/20 text-${getRoleColor(employee.role)}-400`}>
                          {roles.find(r => r.id === employee.role)?.name || employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${employee.salary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(employee.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewPermissions(employee)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Ver permisos"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(employee.id)}
                            className={`${employee.status === 'active' ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'} transition-colors`}
                            title={employee.status === 'active' ? 'Desactivar' : 'Activar'}
                          >
                            {employee.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Staff Modal */}
        <StaffModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
};

export default StaffPage;
