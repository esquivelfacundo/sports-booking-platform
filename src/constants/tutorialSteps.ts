export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  actionText?: string;
}

export const dashboardTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a tu Dashboard!',
    description: 'Te guiaremos paso a paso por todas las funcionalidades de tu panel de control. Aquí podrás gestionar tu establecimiento, canchas, reservas y mucho más.',
    target: '[data-tutorial="dashboard-header"]',
    position: 'center',
    actionText: 'Este tutorial te tomará aproximadamente 2 minutos'
  },
  {
    id: 'stats-overview',
    title: 'Resumen de Estadísticas',
    description: 'Aquí puedes ver un resumen rápido de las métricas más importantes: reservas de hoy, ingresos del mes, ocupación promedio y calificación de tu establecimiento.',
    target: '[data-tutorial="stats-cards"]',
    position: 'bottom',
    actionText: 'Estas estadísticas se actualizan en tiempo real'
  },
  {
    id: 'establishment-info',
    title: 'Información del Establecimiento',
    description: 'Esta sección muestra los datos principales de tu establecimiento: nombre, dirección, estado de aprobación y información de contacto.',
    target: '[data-tutorial="establishment-info"]',
    position: 'right',
    actionText: 'Puedes editar esta información desde la configuración'
  },
  {
    id: 'courts-section',
    title: 'Gestión de Canchas',
    description: 'Aquí se muestran todas tus canchas registradas. Puedes ver el estado, tipo de deporte, superficie y precio por hora de cada una.',
    target: '[data-tutorial="courts-section"]',
    position: 'top',
    actionText: 'Haz clic en "Gestionar Canchas" para agregar, editar o desactivar canchas'
  },
  {
    id: 'staff-section',
    title: 'Personal del Establecimiento',
    description: 'Esta sección muestra todo tu equipo de trabajo: empleados, sus roles, permisos y estado activo.',
    target: '[data-tutorial="staff-section"]',
    position: 'top',
    actionText: 'Puedes agregar nuevo personal y gestionar sus permisos desde aquí'
  },
  {
    id: 'navigation-menu',
    title: 'Menú de Navegación',
    description: 'Desde este menú lateral puedes acceder a todas las secciones: Dashboard, Reservas, Canchas, Personal, Finanzas, Torneos y Configuración.',
    target: '[data-tutorial="sidebar-nav"]',
    position: 'right',
    actionText: 'Cada sección tiene herramientas específicas para gestionar tu negocio'
  },
  {
    id: 'user-profile',
    title: 'Perfil de Usuario',
    description: 'En la esquina superior derecha puedes acceder a tu perfil, configuración de cuenta y cerrar sesión.',
    target: '[data-tutorial="user-profile"]',
    position: 'bottom',
    actionText: 'También puedes ver notificaciones importantes aquí'
  },
  {
    id: 'quick-actions',
    title: 'Acciones Rápidas',
    description: 'Estos botones te permiten realizar las acciones más comunes rápidamente: crear nueva reserva, agregar cancha, o ver el calendario.',
    target: '[data-tutorial="quick-actions"]',
    position: 'top',
    actionText: 'Estas acciones también están disponibles en sus respectivas secciones'
  },
  {
    id: 'completion',
    title: '¡Tutorial Completado!',
    description: 'Ya conoces las funcionalidades principales de tu dashboard. Puedes volver a ver este tutorial en cualquier momento desde Configuración > Ayuda.',
    target: '[data-tutorial="dashboard-header"]',
    position: 'center',
    actionText: '¡Ahora estás listo para gestionar tu establecimiento!'
  }
];

export const firstLoginTutorialSteps: TutorialStep[] = [
  {
    id: 'first-welcome',
    title: '¡Felicitaciones por tu registro!',
    description: 'Tu establecimiento ha sido aprobado y ya está activo. Te mostraremos cómo usar tu nuevo panel de control para gestionar tu negocio de manera eficiente.',
    target: '[data-tutorial="dashboard-header"]',
    position: 'center',
    actionText: 'Este es tu primer inicio de sesión, ¡comencemos!'
  },
  ...dashboardTutorialSteps.slice(1) // Reutilizar los pasos del tutorial normal, excluyendo el primer paso
];
