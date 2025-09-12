'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  UserCheck,
  UserX,
  Activity,
  Star,
  MoreHorizontal,
  Settings,
  BarChart3,
  DollarSign,
  Wrench,
  Megaphone
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff' | 'maintenance';
  status: 'active' | 'inactive' | 'suspended';
  hireDate: string;
  salary: number;
  schedule: string[];
  permissions: string[];
  performance: number;
  avatar?: string;
  lastLogin?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

const StaffPage = () => {
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

  const roles: Role[] = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      permissions: ['dashboard', 'reservations', 'analytics', 'finance', 'staff', 'courts', 'clients', 'maintenance', 'marketing', 'settings'],
      color: 'emerald'
    },
    {
      id: 'manager',
      name: 'Gerente',
      description: 'Gestión operativa y supervisión',
      permissions: ['dashboard', 'reservations', 'analytics', 'staff', 'courts', 'clients', 'maintenance'],
      color: 'blue'
    },
    {
      id: 'staff',
      name: 'Personal',
      description: 'Operaciones básicas y atención al cliente',
      permissions: ['dashboard', 'reservations', 'clients'],
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

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@complejo.com',
      phone: '+54 11 1234-5678',
      role: 'admin',
      status: 'active',
      hireDate: '2023-01-15',
      salary: 150000,
      schedule: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      permissions: ['dashboard', 'reservations', 'analytics', 'finance', 'staff', 'courts', 'clients', 'maintenance', 'marketing', 'settings'],
      performance: 95,
      lastLogin: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'María González',
      email: 'maria.gonzalez@complejo.com',
      phone: '+54 11 9876-5432',
      role: 'manager',
      status: 'active',
      hireDate: '2023-03-20',
      salary: 120000,
      schedule: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      permissions: ['dashboard', 'reservations', 'analytics', 'staff', 'courts', 'clients', 'maintenance'],
      performance: 88,
      lastLogin: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      name: 'Juan Pérez',
      email: 'juan.perez@complejo.com',
      phone: '+54 11 5555-1234',
      role: 'staff',
      status: 'active',
      hireDate: '2023-06-10',
      salary: 80000,
      schedule: ['Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      permissions: ['dashboard', 'reservations', 'clients'],
      performance: 92,
      lastLogin: '2024-01-14T18:45:00Z'
    },
    {
      id: '4',
      name: 'Ana Martínez',
      email: 'ana.martinez@complejo.com',
      phone: '+54 11 7777-8888',
      role: 'staff',
      status: 'inactive',
      hireDate: '2023-08-05',
      salary: 75000,
      schedule: ['Lunes', 'Martes', 'Sábado', 'Domingo'],
      permissions: ['dashboard', 'reservations', 'clients'],
      performance: 85,
      lastLogin: '2024-01-10T14:20:00Z'
    },
    {
      id: '5',
      name: 'Diego López',
      email: 'diego.lopez@complejo.com',
      phone: '+54 11 3333-4444',
      role: 'maintenance',
      status: 'active',
      hireDate: '2023-04-12',
      salary: 90000,
      schedule: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      permissions: ['dashboard', 'courts', 'maintenance'],
      performance: 90,
      lastLogin: '2024-01-15T07:30:00Z'
    }
  ]);

  // Handlers for CRUD operations
  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setShowCreateModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      alert('Empleado eliminado exitosamente');
    }
  };

  const handleEditPermissions = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditingPermissions([...employee.permissions]);
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
      alert('Permisos actualizados exitosamente');
    }
  };

  const handleSaveEmployee = (employeeData: Partial<Employee>) => {
    if (selectedEmployee) {
      // Edit existing employee
      setEmployees(employees.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, ...employeeData }
          : emp
      ));
      alert('Empleado actualizado exitosamente');
    } else {
      // Create new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: employeeData.name || '',
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        role: employeeData.role || 'staff',
        status: employeeData.status || 'active',
        hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
        salary: employeeData.salary || 0,
        schedule: employeeData.schedule || [],
        permissions: employeeData.permissions || [],
        performance: employeeData.performance || 0
      };
      setEmployees([...employees, newEmployee]);
      alert('Empleado creado exitosamente');
    }
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.id === role);
    switch (roleData?.color) {
      case 'emerald': return 'text-emerald-400 bg-emerald-400/10';
      case 'blue': return 'text-blue-400 bg-blue-400/10';
      case 'purple': return 'text-purple-400 bg-purple-400/10';
      case 'orange': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10';
      case 'inactive': return 'text-gray-400 bg-gray-400/10';
      case 'suspended': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-emerald-400';
    if (performance >= 80) return 'text-blue-400';
    if (performance >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesRole = selectedRole === 'all' || employee.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || employee.status === selectedStatus;
    const matchesSearch = !searchTerm || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
    avgPerformance: Math.round(employees.reduce((sum, e) => sum + e.performance, 0) / employees.length)
  };

  const openPermissionsModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPermissions(true);
  };


  const togglePermission = (permissionId: string) => {
    setEditingPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Personal</h1>
          <p className="text-gray-400 mt-1">Administra empleados, roles y permisos del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Agregar Empleado</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Empleados</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Activos</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Inactivos</p>
              <p className="text-2xl font-bold text-gray-400">{stats.inactive}</p>
            </div>
            <UserX className="h-8 w-8 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rendimiento Promedio</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(stats.avgPerformance)}`}>{stats.avgPerformance}%</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Roles Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Roles y Permisos</h3>
            <p className="text-gray-400 text-sm">Configuración de accesos al sistema</p>
          </div>
          <Shield className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">{role.name}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role.id)}`}>
                  {employees.filter(e => e.role === role.id).length}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{role.description}</p>
              <div className="text-xs text-gray-500">
                {role.permissions.length} permisos asignados
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-80"
                suppressHydrationWarning={true}
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="suspended">Suspendidos</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Salario</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rendimiento</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Último Acceso</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEmployees.map((employee, index) => (
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{employee.name}</div>
                        <div className="text-sm text-gray-400">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                      {roles.find(r => r.id === employee.role)?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {getStatusIcon(employee.status)}
                      <span className="ml-1 capitalize">
                        {employee.status === 'active' ? 'Activo' : 
                         employee.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-400">
                    {formatCurrency(employee.salary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            employee.performance >= 90 ? 'bg-emerald-500' :
                            employee.performance >= 80 ? 'bg-blue-500' :
                            employee.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${employee.performance}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getPerformanceColor(employee.performance)}`}>
                        {employee.performance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString('es-AR') : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openPermissionsModal(employee)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditEmployee(employee)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openPermissionsModal(employee)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">No hay empleados</h3>
            <p className="mt-1 text-sm text-gray-400">
              No se encontraron empleados que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>

      {/* Permissions Modal */}
      {showPermissions && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Permisos de {selectedEmployee.name}</h3>
              <button
                onClick={() => setShowPermissions(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Rol Actual</h4>
                  <p className="text-gray-400 text-sm">{roles.find(r => r.id === selectedEmployee.role)?.description}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedEmployee.role)}`}>
                  {roles.find(r => r.id === selectedEmployee.role)?.name}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-white mb-3">Permisos Asignados</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'dashboard', name: 'Dashboard', icon: Activity },
                    { id: 'reservations', name: 'Reservas', icon: Calendar },
                    { id: 'analytics', name: 'Análisis', icon: Activity },
                    { id: 'finance', name: 'Finanzas', icon: Activity },
                    { id: 'staff', name: 'Personal', icon: Users },
                    { id: 'courts', name: 'Canchas', icon: MapPin },
                    { id: 'clients', name: 'Clientes', icon: Users },
                    { id: 'maintenance', name: 'Mantenimiento', icon: Settings },
                    { id: 'marketing', name: 'Marketing', icon: Activity },
                    { id: 'settings', name: 'Configuración', icon: Settings }
                  ].map((permission) => {
                    const hasPermission = selectedEmployee.permissions.includes(permission.id);
                    const Icon = permission.icon;
                    
                    return (
                      <div
                        key={permission.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border ${
                          hasPermission 
                            ? 'bg-emerald-600/10 border-emerald-600/20 text-emerald-400' 
                            : 'bg-gray-700 border-gray-600 text-gray-400'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{permission.name}</span>
                        {hasPermission && <CheckCircle className="h-4 w-4 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPermissions(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <button 
                onClick={() => handleEditPermissions(selectedEmployee)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
              >
                Modificar Permisos
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Agregar Nuevo Empleado</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const employeeData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                role: formData.get('role') as Employee['role'],
                status: formData.get('status') as Employee['status'],
                hireDate: formData.get('hireDate') as string,
                salary: Number(formData.get('salary')),
                schedule: (formData.get('schedule') as string).split(',').map(s => s.trim()),
                permissions: roles.find(r => r.id === formData.get('role'))?.permissions || [],
                performance: Number(formData.get('performance'))
              };
              handleSaveEmployee(employeeData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="juan.perez@complejo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado *
                  </label>
                  <select
                    name="status"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Contratación *
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salario (ARS) *
                  </label>
                  <input
                    type="number"
                    name="salary"
                    required
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="80000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rendimiento (%) *
                  </label>
                  <input
                    type="number"
                    name="performance"
                    required
                    min="0"
                    max="100"
                    defaultValue="85"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Horario de Trabajo
                </label>
                <input
                  type="text"
                  name="schedule"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Lunes, Martes, Miércoles, Jueves, Viernes"
                />
                <p className="text-gray-400 text-xs mt-1">Separar días con comas</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  Crear Empleado
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Empleado</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const employeeData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                role: formData.get('role') as Employee['role'],
                status: formData.get('status') as Employee['status'],
                hireDate: formData.get('hireDate') as string,
                salary: Number(formData.get('salary')),
                schedule: (formData.get('schedule') as string).split(',').map(s => s.trim()),
                permissions: roles.find(r => r.id === formData.get('role'))?.permissions || [],
                performance: Number(formData.get('performance'))
              };
              handleSaveEmployee(employeeData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={selectedEmployee.name}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={selectedEmployee.email}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    defaultValue={selectedEmployee.phone}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    name="role"
                    required
                    defaultValue={selectedEmployee.role}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={selectedEmployee.status}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Contratación *
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    required
                    defaultValue={selectedEmployee.hireDate}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salario (ARS) *
                  </label>
                  <input
                    type="number"
                    name="salary"
                    required
                    min="0"
                    defaultValue={selectedEmployee.salary}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rendimiento (%) *
                  </label>
                  <input
                    type="number"
                    name="performance"
                    required
                    min="0"
                    max="100"
                    defaultValue={selectedEmployee.performance}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Horario de Trabajo
                </label>
                <input
                  type="text"
                  name="schedule"
                  defaultValue={selectedEmployee.schedule.join(', ')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Lunes, Martes, Miércoles, Jueves, Viernes"
                />
                <p className="text-gray-400 text-xs mt-1">Separar días con comas</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditPermissions && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Permisos - {selectedEmployee.name}</h3>
              <button
                onClick={() => setShowEditPermissions(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-3 h-3 rounded-full bg-${roles.find(r => r.id === selectedEmployee.role)?.color}-400`}></div>
                  <div>
                    <h4 className="font-medium text-white">{roles.find(r => r.id === selectedEmployee.role)?.name}</h4>
                    <p className="text-sm text-gray-400">{roles.find(r => r.id === selectedEmployee.role)?.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-4">Seleccionar Permisos</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'dashboard', name: 'Dashboard', icon: Activity },
                    { id: 'reservations', name: 'Reservas', icon: Calendar },
                    { id: 'analytics', name: 'Analíticas', icon: BarChart3 },
                    { id: 'finance', name: 'Finanzas', icon: DollarSign },
                    { id: 'staff', name: 'Personal', icon: Users },
                    { id: 'courts', name: 'Canchas', icon: MapPin },
                    { id: 'clients', name: 'Clientes', icon: UserCheck },
                    { id: 'maintenance', name: 'Mantenimiento', icon: Wrench },
                    { id: 'marketing', name: 'Marketing', icon: Megaphone },
                    { id: 'settings', name: 'Configuración', icon: Settings }
                  ].map((permission) => {
                    const Icon = permission.icon;
                    const isSelected = editingPermissions.includes(permission.id);
                    return (
                      <div
                        key={permission.id}
                        onClick={() => togglePermission(permission.id)}
                        className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                            : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{permission.name}</span>
                        {isSelected && <CheckCircle className="h-4 w-4 ml-auto" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-400 mb-1">Información Importante</h5>
                    <p className="text-sm text-blue-300">
                      Los cambios en los permisos afectarán el acceso del empleado a las diferentes secciones del sistema.
                      Asegúrate de otorgar solo los permisos necesarios para su rol.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditPermissions(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSavePermissions(editingPermissions)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
              >
                Guardar Permisos
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
