'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { 
  Wrench, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  DollarSign,
  Activity,
  TrendingUp,
  Settings,
  FileText,
  Camera,
  Zap
} from 'lucide-react';

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  courtId: string;
  courtName: string;
  type: 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  createdDate: string;
  scheduledDate: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  notes?: string;
  images?: string[];
}

const MaintenancePage = () => {
  const { establishment, isDemo, loading } = useEstablishment();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  // Initialize maintenance tasks data based on demo or real data
  useEffect(() => {
    if (isDemo) {
      // Demo data
      setMaintenanceTasks([
        {
          id: '1',
          title: 'Reparación de iluminación LED',
          description: 'Reemplazar 4 luminarias LED defectuosas en la cancha de fútbol',
          courtId: '1',
          courtName: 'Cancha de Fútbol 1',
          type: 'corrective',
          priority: 'high',
          status: 'in_progress',
          assignedTo: 'Diego López',
          createdDate: '2024-01-10',
          scheduledDate: '2024-01-15',
          estimatedCost: 25000,
          estimatedDuration: 4,
          actualDuration: 3,
          notes: 'Se necesitan luminarias de 150W específicas para exteriores'
        },
    {
      id: '2',
      title: 'Mantenimiento preventivo césped sintético',
      description: 'Limpieza profunda y cepillado del césped sintético',
      courtId: '1',
      courtName: 'Cancha de Fútbol 1',
      type: 'preventive',
      priority: 'medium',
      status: 'completed',
      assignedTo: 'Carlos Mendoza',
      createdDate: '2024-01-01',
      scheduledDate: '2024-01-05',
      completedDate: '2024-01-05',
      estimatedCost: 15000,
      actualCost: 12000,
      estimatedDuration: 6,
      actualDuration: 5,
      notes: 'Mantenimiento completado exitosamente'
    },
    {
      id: '3',
      title: 'Reparación de red de tenis',
      description: 'Reemplazar red dañada por el viento',
      courtId: '2',
      courtName: 'Cancha de Tenis 1',
      type: 'corrective',
      priority: 'medium',
      status: 'pending',
      assignedTo: 'Ana García',
      createdDate: '2024-01-12',
      scheduledDate: '2024-01-18',
      estimatedCost: 8000,
      estimatedDuration: 2,
      notes: 'Red oficial de torneo requerida'
    },
    {
      id: '4',
      title: 'Emergencia: Fuga de agua en vestuarios',
      description: 'Reparación urgente de tubería rota en vestuarios',
      courtId: '0',
      courtName: 'Instalaciones Generales',
      type: 'emergency',
      priority: 'critical',
      status: 'completed',
      assignedTo: 'Roberto Silva',
      createdDate: '2024-01-08',
      scheduledDate: '2024-01-08',
      completedDate: '2024-01-08',
      estimatedCost: 35000,
      actualCost: 42000,
      estimatedDuration: 8,
      actualDuration: 10,
      notes: 'Reparación de emergencia completada, se requiere seguimiento'
    },
    {
      id: '5',
      title: 'Pintura de líneas de paddle',
      description: 'Repintado de líneas de demarcación en cancha de paddle',
      courtId: '3',
      courtName: 'Cancha de Paddle 1',
      type: 'preventive',
      priority: 'low',
      status: 'pending',
      assignedTo: 'Luis Fernández',
      createdDate: '2024-01-14',
      scheduledDate: '2024-01-20',
      estimatedCost: 5000,
      estimatedDuration: 3,
      notes: 'Usar pintura especial para superficies sintéticas'
    },
    {
      id: '6',
      title: 'Revisión sistema de riego',
      description: 'Inspección y mantenimiento del sistema de riego automático',
      courtId: '0',
      courtName: 'Instalaciones Generales',
      type: 'preventive',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'Diego López',
      createdDate: '2024-01-11',
      scheduledDate: '2024-01-16',
      estimatedCost: 18000,
      estimatedDuration: 5,
      actualDuration: 3,
      notes: 'Revisión de aspersores y programación'
    }
  ]);

  // Form state for creating/editing maintenance tasks
  const [formData, setFormData] = useState<Partial<MaintenanceTask>>({
    title: '',
    description: '',
    courtId: '',
    courtName: '',
    type: 'preventive',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    scheduledDate: '',
    estimatedCost: 0,
    estimatedDuration: 1,
    notes: ''
  });

  // Handler functions
  const handleCreateTask = () => {
    const newTask: MaintenanceTask = {
      id: Date.now().toString(),
      title: formData.title || '',
      description: formData.description || '',
      courtId: formData.courtId || '',
      courtName: formData.courtName || '',
      type: formData.type as MaintenanceTask['type'] || 'preventive',
      priority: formData.priority as MaintenanceTask['priority'] || 'medium',
      status: formData.status as MaintenanceTask['status'] || 'pending',
      assignedTo: formData.assignedTo || '',
      createdDate: new Date().toISOString().split('T')[0],
      scheduledDate: formData.scheduledDate || '',
      estimatedCost: formData.estimatedCost || 0,
      estimatedDuration: formData.estimatedDuration || 1,
      notes: formData.notes || ''
    };

    setTasks(prev => [...prev, newTask]);
    setShowCreateModal(false);
    resetForm();
    alert('Tarea de mantenimiento creada exitosamente');
  };

  const handleEditTask = () => {
    if (!selectedTask) return;

    setTasks(prev => prev.map(task => 
      task.id === selectedTask.id 
        ? { ...task, ...formData }
        : task
    ));
    setShowEditModal(false);
    setSelectedTask(null);
    resetForm();
    alert('Tarea actualizada exitosamente');
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      alert('Tarea eliminada exitosamente');
    }
  };

  const openEditModal = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setFormData(task);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      courtId: '',
      courtName: '',
      type: 'preventive',
      priority: 'medium',
      status: 'pending',
      assignedTo: '',
      scheduledDate: '',
      estimatedCost: 0,
      estimatedDuration: 1,
      notes: ''
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'text-blue-400 bg-blue-400/10';
      case 'corrective': return 'text-orange-400 bg-orange-400/10';
      case 'emergency': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || task.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    totalCost: tasks.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost), 0),
    avgDuration: tasks.filter(t => t.actualDuration).reduce((sum, t) => sum + (t.actualDuration || 0), 0) / tasks.filter(t => t.actualDuration).length || 0,
    criticalTasks: tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length
  };

  const openTaskModal = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Mantenimiento</h1>
          <p className="text-gray-400 mt-1">Administra las tareas de mantenimiento del complejo</p>
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
            <Plus className="h-4 w-4" />
            <span>Nueva Tarea</span>
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
              <p className="text-gray-400 text-sm">Total Tareas</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-400" />
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
              <p className="text-gray-400 text-sm">En Progreso</p>
              <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
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
              <p className="text-gray-400 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
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
              <p className="text-gray-400 text-sm">Críticas</p>
              <p className="text-2xl font-bold text-red-400">{stats.criticalTasks}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Costo Total</h3>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalCost)}</p>
          <p className="text-gray-400 text-sm mt-1">Este mes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Duración Promedio</h3>
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.avgDuration.toFixed(1)}h</p>
          <p className="text-gray-400 text-sm mt-1">Por tarea</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Completadas</h3>
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
          <p className="text-gray-400 text-sm mt-1">Este mes</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-80"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="preventive">Preventivo</option>
              <option value="corrective">Correctivo</option>
              <option value="emergency">Emergencia</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
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

      {/* Tasks Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tarea</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asignado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Costo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTasks.map((task, index) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-600 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{task.title}</div>
                        <div className="text-sm text-gray-400">{task.courtName}</div>
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{task.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
                      {task.type === 'preventive' ? 'Preventivo' :
                       task.type === 'corrective' ? 'Correctivo' : 'Emergencia'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'low' ? 'Baja' :
                       task.priority === 'medium' ? 'Media' :
                       task.priority === 'high' ? 'Alta' : 'Crítica'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1">
                        {task.status === 'pending' ? 'Pendiente' :
                         task.status === 'in_progress' ? 'En progreso' :
                         task.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {task.assignedTo.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm text-white">{task.assignedTo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div>
                      <div>Programada: {new Date(task.scheduledDate).toLocaleDateString('es-AR')}</div>
                      {task.completedDate && (
                        <div className="text-emerald-400">Completada: {new Date(task.completedDate).toLocaleDateString('es-AR')}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-emerald-400 font-medium">
                        {formatCurrency(task.actualCost || task.estimatedCost)}
                      </div>
                      {task.actualCost && task.actualCost !== task.estimatedCost && (
                        <div className="text-gray-400 text-xs">
                          Est: {formatCurrency(task.estimatedCost)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openTaskModal(task)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                      <button className="text-orange-400 hover:text-orange-300 transition-colors">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
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

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">No hay tareas</h3>
            <p className="mt-1 text-sm text-gray-400">
              No se encontraron tareas que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalles de la Tarea</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Info */}
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Información de la Tarea</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Título</p>
                      <p className="text-white font-medium">{selectedTask.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Descripción</p>
                      <p className="text-white">{selectedTask.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Cancha</p>
                        <p className="text-white">{selectedTask.courtName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Asignado a</p>
                        <p className="text-white">{selectedTask.assignedTo}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Estado y Prioridad</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tipo</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedTask.type)}`}>
                        {selectedTask.type === 'preventive' ? 'Preventivo' :
                         selectedTask.type === 'corrective' ? 'Correctivo' : 'Emergencia'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Prioridad</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority === 'low' ? 'Baja' :
                         selectedTask.priority === 'medium' ? 'Media' :
                         selectedTask.priority === 'high' ? 'Alta' : 'Crítica'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Estado</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                        {getStatusIcon(selectedTask.status)}
                        <span className="ml-1">
                          {selectedTask.status === 'pending' ? 'Pendiente' :
                           selectedTask.status === 'in_progress' ? 'En progreso' :
                           selectedTask.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTask.notes && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Notas</h4>
                    <p className="text-gray-300 text-sm">{selectedTask.notes}</p>
                  </div>
                )}
              </div>

              {/* Timeline and Costs */}
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Cronograma</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Creada</span>
                      <span className="text-white">{new Date(selectedTask.createdDate).toLocaleDateString('es-AR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Programada</span>
                      <span className="text-white">{new Date(selectedTask.scheduledDate).toLocaleDateString('es-AR')}</span>
                    </div>
                    {selectedTask.completedDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Completada</span>
                        <span className="text-emerald-400">{new Date(selectedTask.completedDate).toLocaleDateString('es-AR')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Costos y Duración</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(selectedTask.actualCost || selectedTask.estimatedCost)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {selectedTask.actualCost ? 'Costo Real' : 'Costo Estimado'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {selectedTask.actualDuration || selectedTask.estimatedDuration}h
                      </p>
                      <p className="text-gray-400 text-sm">
                        {selectedTask.actualDuration ? 'Duración Real' : 'Duración Estimada'}
                      </p>
                    </div>
                  </div>
                  {selectedTask.actualCost && selectedTask.actualCost !== selectedTask.estimatedCost && (
                    <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Estimado</span>
                        <span className="text-gray-300">{formatCurrency(selectedTask.estimatedCost)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-400">Diferencia</span>
                        <span className={selectedTask.actualCost > selectedTask.estimatedCost ? 'text-red-400' : 'text-emerald-400'}>
                          {selectedTask.actualCost > selectedTask.estimatedCost ? '+' : ''}
                          {formatCurrency(selectedTask.actualCost - selectedTask.estimatedCost)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Acciones</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <CheckCircle className="h-4 w-4" />
                      <span>Completar</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Camera className="h-4 w-4" />
                      <span>Fotos</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <FileText className="h-4 w-4" />
                      <span>Reporte</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
                Actualizar Tarea
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
