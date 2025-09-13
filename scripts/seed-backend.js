const axios = require('axios');

const BASE_URL = 'https://sports-booking-backend-liql.onrender.com/api';

// Datos de prueba
const testData = {
  establishments: [
    {
      name: "Club Deportivo Central",
      description: "Modernas instalaciones deportivas con canchas de fútbol 5 y paddle",
      address: "Av. Libertador 1234, Buenos Aires",
      city: "Buenos Aires",
      coordinates: {
        lat: -34.6037,
        lng: -58.3816
      },
      phone: "+54 11 4567-8900",
      email: "info@clubcentral.com",
      images: [
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"
      ],
      sports: ["Fútbol 5", "Paddle"],
      amenities: ["Estacionamiento", "Vestuarios", "Buffet", "WiFi"],
      openingHours: {
        monday: { open: "08:00", close: "23:00" },
        tuesday: { open: "08:00", close: "23:00" },
        wednesday: { open: "08:00", close: "23:00" },
        thursday: { open: "08:00", close: "23:00" },
        friday: { open: "08:00", close: "24:00" },
        saturday: { open: "09:00", close: "24:00" },
        sunday: { open: "09:00", close: "22:00" }
      },
      priceRange: "$$",
      featured: true
    },
    {
      name: "Complejo Deportivo Norte",
      description: "Amplio complejo con múltiples canchas y servicios premium",
      address: "Calle Falsa 567, Buenos Aires",
      city: "Buenos Aires", 
      coordinates: {
        lat: -34.5875,
        lng: -58.3974
      },
      phone: "+54 11 4567-8901",
      email: "contacto@deportivonorte.com",
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"
      ],
      sports: ["Fútbol 5", "Tenis", "Paddle"],
      amenities: ["Estacionamiento", "Vestuarios", "Buffet", "WiFi", "Aire Acondicionado"],
      openingHours: {
        monday: { open: "07:00", close: "23:00" },
        tuesday: { open: "07:00", close: "23:00" },
        wednesday: { open: "07:00", close: "23:00" },
        thursday: { open: "07:00", close: "23:00" },
        friday: { open: "07:00", close: "24:00" },
        saturday: { open: "08:00", close: "24:00" },
        sunday: { open: "08:00", close: "22:00" }
      },
      priceRange: "$$$",
      featured: true
    }
  ],
  users: [
    {
      firstName: "Establecimiento",
      lastName: "Demo",
      email: "establecimiento@demo.com",
      password: "password123",
      role: "establishment"
    },
    {
      firstName: "Usuario",
      lastName: "Test",
      email: "usuario@test.com", 
      password: "password123",
      role: "player"
    }
  ]
};

async function seedBackend() {
  try {
    console.log('🌱 Iniciando seed del backend...');
    
    // 1. Registrar usuarios
    console.log('👤 Registrando usuarios...');
    const tokens = [];
    
    for (const user of testData.users) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/register`, user);
        console.log(`✅ Usuario ${user.email} registrado`);
        
        // Login para obtener token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: user.email,
          password: user.password
        });
        
        if (loginResponse.data.token) {
          tokens.push({
            email: user.email,
            role: user.role,
            token: loginResponse.data.token
          });
          console.log(`🔑 Token obtenido para ${user.email}`);
        }
      } catch (error) {
        console.log(`⚠️  Usuario ${user.email} ya existe o error:`, error.response?.data?.message || error.message);
      }
    }
    
    // 2. Crear establecimientos
    console.log('🏢 Creando establecimientos...');
    const establishmentToken = tokens.find(t => t.role === 'establishment')?.token;
    
    if (establishmentToken) {
      for (const establishment of testData.establishments) {
        try {
          const response = await axios.post(`${BASE_URL}/establishments`, establishment, {
            headers: {
              'Authorization': `Bearer ${establishmentToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`✅ Establecimiento "${establishment.name}" creado`);
        } catch (error) {
          console.log(`❌ Error creando establecimiento "${establishment.name}":`, error.response?.data?.message || error.message);
        }
      }
    } else {
      console.log('❌ No se pudo obtener token de establecimiento');
    }
    
    console.log('🎉 Seed completado!');
    
    // Verificar datos
    console.log('🔍 Verificando datos creados...');
    const establishmentsResponse = await axios.get(`${BASE_URL}/establishments`);
    console.log(`📊 Establecimientos en base de datos: ${establishmentsResponse.data.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
  }
}

// Ejecutar seed
seedBackend();
