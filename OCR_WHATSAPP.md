# Documentación Completa: Integración OCR y WhatsApp

## Índice

1. [Introducción](#1-introducción)
2. [Arquitectura General](#2-arquitectura-general)
3. [Requisitos Previos](#3-requisitos-previos)
4. [Base de Datos](#4-base-de-datos)
5. [Backend - Servicio de Integraciones](#5-backend---servicio-de-integraciones)
6. [Backend - Servicio OCR](#6-backend---servicio-ocr)
7. [Backend - Servicio WhatsApp](#7-backend---servicio-whatsapp)
8. [API GraphQL](#8-api-graphql)
9. [Frontend - Página de Integraciones](#9-frontend---página-de-integraciones)
10. [Frontend - Uso de OCR en Gastos](#10-frontend---uso-de-ocr-en-gastos)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Flujos de Datos](#12-flujos-de-datos)
13. [Seguridad](#13-seguridad)
14. [Testing](#14-testing)

---

## 1. Introducción

Este documento describe la implementación completa del sistema de integraciones para OCR (Reconocimiento Óptico de Caracteres) y WhatsApp Business API en ObraTotal AI. El sistema permite a cada empresa configurar sus propias credenciales de OpenAI y WhatsApp para:

- **OCR**: Extraer datos automáticamente de facturas y comprobantes usando GPT-4 Vision
- **WhatsApp**: Enviar y recibir mensajes para registro de gastos conversacional

### 1.1 Objetivo del Sistema

Permitir que cada empresa (tenant) del sistema configure y gestione sus propias integraciones de manera independiente, con:
- Almacenamiento seguro de API keys (encriptación AES-256-GCM)
- Pruebas de conexión antes de activar
- Caché de configuraciones para rendimiento
- Logs de auditoría

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │ Página Integraciones│    │ Página Nuevo Gasto (OCR)        │ │
│  │ /settings/          │    │ /gastos/nuevo                   │ │
│  │ integraciones       │    │                                 │ │
│  └──────────┬──────────┘    └───────────────┬─────────────────┘ │
└─────────────┼───────────────────────────────┼───────────────────┘
              │ GraphQL                       │ GraphQL
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │ IntegracionesResolver│   │ IntegracionesResolver           │ │
│  │ - upsertIntegration │    │ - processOCR                    │ │
│  │ - testIntegration   │    │                                 │ │
│  │ - toggleIntegration │    │                                 │ │
│  └──────────┬──────────┘    └───────────────┬─────────────────┘ │
│             │                               │                    │
│             ▼                               ▼                    │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │ IntegracionesService│    │ OCRService                      │ │
│  │ - encrypt/decrypt   │    │ - processImage                  │ │
│  │ - testConnection    │    │ - extractWithOpenAI             │ │
│  │ - cache Redis       │    │ - cache in-memory               │ │
│  └──────────┬──────────┘    └───────────────┬─────────────────┘ │
│             │                               │                    │
│             ▼                               ▼                    │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │ PostgreSQL          │    │ OpenAI API (GPT-4 Vision)       │ │
│  │ empresa_integrations│    │                                 │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ WhatsAppService                                              │ │
│  │ - sendMessage / sendInteractiveMessage                       │ │
│  │ - downloadMedia / verifyWebhook                              │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ WhatsApp Business Cloud API (graph.facebook.com/v18.0)       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Requisitos Previos

### 3.1 Dependencias del Proyecto

Asegúrate de tener instaladas las siguientes dependencias en el backend:

```bash
# En /backend/api
npm install @prisma/client zod winston crypto openai axios sharp tesseract.js ioredis
```

**package.json** debe incluir:
```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "zod": "^3.x",
    "winston": "^3.x",
    "openai": "^4.x",
    "axios": "^1.x",
    "sharp": "^0.33.x",
    "tesseract.js": "^5.x",
    "ioredis": "^5.x"
  }
}
```

### 3.2 Servicios Externos Requeridos

1. **OpenAI API**
   - Cuenta en https://platform.openai.com
   - API Key con acceso a GPT-4 Vision (gpt-4o o gpt-4-vision-preview)
   - Créditos suficientes para procesamiento de imágenes

2. **WhatsApp Business API**
   - Cuenta de Meta Business
   - App creada en Meta for Developers
   - WhatsApp Business Account ID
   - Phone Number ID verificado
   - Access Token permanente

3. **Redis**
   - Servidor Redis para caché de configuraciones
   - URL de conexión configurada en variables de entorno

---

## 4. Base de Datos

### 4.1 Modelo EmpresaIntegration (Prisma Schema)

Ubicación: `/backend/api/prisma/schema.prisma`

```prisma
model EmpresaIntegration {
  id                  String    @id @default(uuid())
  type                String    // OPENAI, WHATSAPP
  encryptedApiKey     String    @map("encrypted_api_key")
  phoneNumberId       String?   @map("phone_number_id")
  businessAccountId   String?   @map("business_account_id")
  verifyToken         String?   @map("verify_token")
  config              Json?
  isActive            Boolean   @default(true) @map("is_active")
  lastTestedAt        DateTime? @map("last_tested_at")
  lastTestSuccess     Boolean?  @map("last_test_success")
  
  empresaId           String    @map("empresa_id")
  
  createdById         String    @map("created_by_id")
  updatedById         String    @map("updated_by_id")
  
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  @@unique([empresaId, type])
  @@index([empresaId])
  @@map("empresa_integrations")
}
```

### 4.2 Descripción de Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único de la integración |
| `type` | String | Tipo de integración: `OPENAI` o `WHATSAPP` |
| `encryptedApiKey` | String | API Key encriptada con AES-256-GCM |
| `phoneNumberId` | String? | ID del número de WhatsApp (solo para WHATSAPP) |
| `businessAccountId` | String? | ID de cuenta de negocio WhatsApp (solo para WHATSAPP) |
| `verifyToken` | String? | Token de verificación para webhook WhatsApp |
| `config` | Json? | Configuración adicional en formato JSON |
| `isActive` | Boolean | Si la integración está activa |
| `lastTestedAt` | DateTime? | Última vez que se probó la conexión |
| `lastTestSuccess` | Boolean? | Resultado de la última prueba |
| `empresaId` | String | ID de la empresa propietaria |
| `createdById` | String | Usuario que creó la integración |
| `updatedById` | String | Usuario que actualizó la integración |

### 4.3 Modelo Gasto - Campos OCR

Los siguientes campos en el modelo `Gasto` almacenan datos extraídos por OCR:

```prisma
model Gasto {
  // ... otros campos ...
  
  invoiceNumber       String?     @map("invoice_number")
  invoiceType         String?     @map("invoice_type")
  invoiceLetter       String?     @map("invoice_letter") // A, B, C, M, E
  invoiceDate         DateTime?   @db.Date @map("invoice_date")
  
  // AFIP Electronic Invoice Data
  cae                 String?     // Código de Autorización Electrónico (14 dígitos)
  caeDueDate          DateTime?   @db.Date @map("cae_due_date")
  
  // OCR extracted vendor data (before linking to Proveedor)
  vendorName          String?     @map("vendor_name")
  vendorTaxId         String?     @map("vendor_tax_id") // CUIT
  
  // OCR confidence and validation
  ocrConfidence       Float?      @map("ocr_confidence")
  ocrValidated        Boolean     @default(false) @map("ocr_validated")
  
  // ... otros campos ...
}
```

### 4.4 Migración de Base de Datos

Ejecutar después de agregar los modelos:

```bash
cd /backend/api
npx prisma migrate dev --name add_integrations_and_ocr_fields
npx prisma generate
```

---

## 5. Backend - Servicio de Integraciones

### 5.1 Schema de Validación (Zod)

Ubicación: `/backend/api/src/modules/integraciones/integraciones.schema.ts`

```typescript
import { z } from 'zod';

// Tipos de integración soportados
export const integrationTypeSchema = z.enum(['OPENAI', 'WHATSAPP']);
export type IntegrationType = z.infer<typeof integrationTypeSchema>;

// Schema para crear/actualizar integración
export const upsertIntegrationSchema = z.object({
  type: integrationTypeSchema,
  apiKey: z.string().min(1, 'API Key es requerida'),
  // Campos específicos de WhatsApp
  phoneNumberId: z.string().optional(),
  businessAccountId: z.string().optional(),
  verifyToken: z.string().optional(),
  // Configuración adicional
  config: z.record(z.unknown()).optional(),
});

export type UpsertIntegrationInput = z.infer<typeof upsertIntegrationSchema>;

// Schema para probar integración
export const testIntegrationSchema = z.object({
  type: integrationTypeSchema,
});

export type TestIntegrationInput = z.infer<typeof testIntegrationSchema>;
```

### 5.2 Servicio de Integraciones

Ubicación: `/backend/api/src/modules/integraciones/integraciones.service.ts`

```typescript
/**
 * @fileoverview Servicio de Integraciones
 * Maneja la gestión de integraciones externas (OpenAI, WhatsApp)
 * con encriptación de API keys y caché de configuraciones
 */

import crypto from 'crypto';
import { prisma } from '@/config/database';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError } from '@/utils/errors';
import type { UpsertIntegrationInput, IntegrationType } from './integraciones.schema';
import OpenAI from 'openai';
import axios from 'axios';

// Configuración de encriptación
const ENCRYPTION_KEY = process.env.INTEGRATION_ENCRYPTION_KEY || 'default-key-change-in-production!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Configuración de caché
const CACHE_PREFIX = 'integration:';
const CACHE_TTL = 3600; // 1 hora en segundos

// URL de WhatsApp API
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export class IntegracionesService {
  /**
   * Encripta un valor usando AES-256-GCM
   * @param text - Texto a encriptar
   * @returns Texto encriptado en formato: iv:authTag:encrypted (hex)
   */
  private encrypt(text: string): string {
    // Asegurar que la key tenga 32 bytes
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Formato: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Desencripta un valor encriptado con AES-256-GCM
   * @param encryptedText - Texto encriptado en formato iv:authTag:encrypted
   * @returns Texto original desencriptado
   */
  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Enmascara una API key para mostrar en UI
   * Muestra solo los primeros 4 y últimos 4 caracteres
   * @param apiKey - API key completa
   * @returns API key enmascarada (ej: "sk-p...xyz1")
   */
  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
      return '****';
    }
    return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  }

  /**
   * Obtiene la clave de caché para una integración
   */
  private getCacheKey(empresaId: string, type: IntegrationType): string {
    return `${CACHE_PREFIX}${empresaId}:${type}`;
  }

  /**
   * Invalida el caché de una integración
   */
  private async invalidateCache(empresaId: string, type: IntegrationType): Promise<void> {
    const cacheKey = this.getCacheKey(empresaId, type);
    await redis.del(cacheKey);
    logger.debug('Integration cache invalidated', { empresaId, type });
  }

  /**
   * Crea o actualiza una integración
   * Si ya existe una integración del mismo tipo para la empresa, la actualiza
   */
  async upsert(
    empresaId: string,
    userId: string,
    input: UpsertIntegrationInput
  ) {
    const { type, apiKey, phoneNumberId, businessAccountId, verifyToken, config } = input;

    // Encriptar API key
    const encryptedApiKey = this.encrypt(apiKey);

    // Buscar integración existente
    const existing = await prisma.empresaIntegration.findUnique({
      where: {
        empresaId_type: { empresaId, type },
      },
    });

    let integration;

    if (existing) {
      // Actualizar existente
      integration = await prisma.empresaIntegration.update({
        where: { id: existing.id },
        data: {
          encryptedApiKey,
          phoneNumberId: type === 'WHATSAPP' ? phoneNumberId : null,
          businessAccountId: type === 'WHATSAPP' ? businessAccountId : null,
          verifyToken: type === 'WHATSAPP' ? verifyToken : null,
          config: config || {},
          updatedById: userId,
          // Reset test status when credentials change
          lastTestedAt: null,
          lastTestSuccess: null,
        },
      });
      logger.info('Integration updated', { integrationId: integration.id, type, empresaId });
    } else {
      // Crear nueva
      integration = await prisma.empresaIntegration.create({
        data: {
          type,
          encryptedApiKey,
          phoneNumberId: type === 'WHATSAPP' ? phoneNumberId : null,
          businessAccountId: type === 'WHATSAPP' ? businessAccountId : null,
          verifyToken: type === 'WHATSAPP' ? verifyToken : null,
          config: config || {},
          empresaId,
          createdById: userId,
          updatedById: userId,
          isActive: true,
        },
      });
      logger.info('Integration created', { integrationId: integration.id, type, empresaId });
    }

    // Invalidar caché
    await this.invalidateCache(empresaId, type);

    // Retornar con API key enmascarada
    return {
      ...integration,
      maskedApiKey: this.maskApiKey(apiKey),
      encryptedApiKey: undefined, // No exponer el valor encriptado
    };
  }

  /**
   * Obtiene todas las integraciones de una empresa
   * Retorna con API keys enmascaradas
   */
  async findAll(empresaId: string) {
    const integrations = await prisma.empresaIntegration.findMany({
      where: { empresaId },
      orderBy: { type: 'asc' },
    });

    return integrations.map((integration) => {
      // Desencriptar para enmascarar
      let maskedApiKey = '****';
      try {
        const decrypted = this.decrypt(integration.encryptedApiKey);
        maskedApiKey = this.maskApiKey(decrypted);
      } catch (error) {
        logger.error('Failed to decrypt API key for masking', { 
          integrationId: integration.id,
          error 
        });
      }

      return {
        ...integration,
        maskedApiKey,
        encryptedApiKey: undefined,
      };
    });
  }

  /**
   * Obtiene una integración por tipo
   */
  async findByType(empresaId: string, type: IntegrationType) {
    const integration = await prisma.empresaIntegration.findUnique({
      where: {
        empresaId_type: { empresaId, type },
      },
    });

    if (!integration) {
      return null;
    }

    let maskedApiKey = '****';
    try {
      const decrypted = this.decrypt(integration.encryptedApiKey);
      maskedApiKey = this.maskApiKey(decrypted);
    } catch (error) {
      logger.error('Failed to decrypt API key', { integrationId: integration.id });
    }

    return {
      ...integration,
      maskedApiKey,
      encryptedApiKey: undefined,
    };
  }

  /**
   * Obtiene la API key desencriptada (para uso interno)
   * NUNCA exponer este método en la API GraphQL
   */
  async getDecryptedApiKey(empresaId: string, type: IntegrationType): Promise<string | null> {
    // Intentar obtener de caché
    const cacheKey = this.getCacheKey(empresaId, type);
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      logger.debug('Integration config from cache', { empresaId, type });
      return cached;
    }

    // Obtener de base de datos
    const integration = await prisma.empresaIntegration.findUnique({
      where: {
        empresaId_type: { empresaId, type },
      },
    });

    if (!integration || !integration.isActive) {
      return null;
    }

    try {
      const apiKey = this.decrypt(integration.encryptedApiKey);
      
      // Guardar en caché
      await redis.setex(cacheKey, CACHE_TTL, apiKey);
      
      return apiKey;
    } catch (error) {
      logger.error('Failed to decrypt API key', { empresaId, type, error });
      return null;
    }
  }

  /**
   * Obtiene configuración completa de WhatsApp (para uso interno)
   */
  async getWhatsAppConfig(empresaId: string) {
    const integration = await prisma.empresaIntegration.findUnique({
      where: {
        empresaId_type: { empresaId, type: 'WHATSAPP' },
      },
    });

    if (!integration || !integration.isActive) {
      return null;
    }

    try {
      const accessToken = this.decrypt(integration.encryptedApiKey);
      
      return {
        accessToken,
        phoneNumberId: integration.phoneNumberId,
        businessAccountId: integration.businessAccountId,
        verifyToken: integration.verifyToken,
      };
    } catch (error) {
      logger.error('Failed to get WhatsApp config', { empresaId, error });
      return null;
    }
  }

  /**
   * Activa o desactiva una integración
   */
  async toggle(empresaId: string, type: IntegrationType, userId: string) {
    const integration = await prisma.empresaIntegration.findUnique({
      where: {
        empresaId_type: { empresaId, type },
      },
    });

    if (!integration) {
      throw new NotFoundError('Integración');
    }

    const updated = await prisma.empresaIntegration.update({
      where: { id: integration.id },
      data: {
        isActive: !integration.isActive,
        updatedById: userId,
      },
    });

    // Invalidar caché
    await this.invalidateCache(empresaId, type);

    logger.info('Integration toggled', { 
      integrationId: integration.id, 
      type, 
      isActive: updated.isActive 
    });

    return {
      ...updated,
      maskedApiKey: '****',
      encryptedApiKey: undefined,
    };
  }

  /**
   * Elimina una integración
   */
  async delete(empresaId: string, type: IntegrationType, userId: string) {
    const integration = await prisma.empresaIntegration.findUnique({
      where: {
        empresaId_type: { empresaId, type },
      },
    });

    if (!integration) {
      throw new NotFoundError('Integración');
    }

    await prisma.empresaIntegration.delete({
      where: { id: integration.id },
    });

    // Invalidar caché
    await this.invalidateCache(empresaId, type);

    logger.info('Integration deleted', { integrationId: integration.id, type, empresaId, userId });

    return true;
  }

  /**
   * Prueba la conexión de una integración
   * Para OpenAI: hace una llamada simple a la API
   * Para WhatsApp: verifica el token con la API de Meta
   */
  async testConnection(empresaId: string, type: IntegrationType): Promise<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
  }> {
    const integration = await prisma.empresaIntegration.findUnique({
      where: {
        empresaId_type: { empresaId, type },
      },
    });

    if (!integration) {
      throw new NotFoundError('Integración');
    }

    let success = false;
    let message = '';
    let details: Record<string, unknown> = {};

    try {
      const apiKey = this.decrypt(integration.encryptedApiKey);

      if (type === 'OPENAI') {
        // Probar OpenAI
        const openai = new OpenAI({ apiKey });
        const response = await openai.models.list();
        
        // Verificar que tenga acceso a GPT-4 Vision
        const hasVision = response.data.some(
          (model) => model.id.includes('gpt-4') && 
                     (model.id.includes('vision') || model.id.includes('gpt-4o'))
        );

        success = true;
        message = hasVision 
          ? 'Conexión exitosa. Acceso a GPT-4 Vision confirmado.'
          : 'Conexión exitosa, pero no se detectó acceso a GPT-4 Vision.';
        details = {
          modelsAvailable: response.data.length,
          hasVisionAccess: hasVision,
        };
      } else if (type === 'WHATSAPP') {
        // Probar WhatsApp
        if (!integration.phoneNumberId) {
          throw new ValidationError('Phone Number ID es requerido para WhatsApp');
        }

        const response = await axios.get(
          `${WHATSAPP_API_URL}/${integration.phoneNumberId}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        success = true;
        message = 'Conexión exitosa con WhatsApp Business API.';
        details = {
          phoneNumber: response.data.display_phone_number,
          verifiedName: response.data.verified_name,
          qualityRating: response.data.quality_rating,
        };
      }
    } catch (error: unknown) {
      success = false;
      
      if (axios.isAxiosError(error)) {
        message = `Error de conexión: ${error.response?.data?.error?.message || error.message}`;
        details = { statusCode: error.response?.status };
      } else if (error instanceof Error) {
        message = `Error: ${error.message}`;
      } else {
        message = 'Error desconocido al probar la conexión';
      }
      
      logger.error('Integration test failed', { empresaId, type, error });
    }

    // Actualizar estado de prueba en la base de datos
    await prisma.empresaIntegration.update({
      where: { id: integration.id },
      data: {
        lastTestedAt: new Date(),
        lastTestSuccess: success,
      },
    });

    return { success, message, details };
  }
}

export const integracionesService = new IntegracionesService();
```

---

## 6. Backend - Servicio OCR

### 6.1 Tipos y Estructuras de Datos

Ubicación: `/backend/api/src/services/ocr/ocr.types.ts`

```typescript
/**
 * @fileoverview Tipos para el servicio OCR
 * Define estructuras de datos para extracción de facturas
 */

// Información del proveedor extraída
export interface VendorInfo {
  name: string | null;
  taxId: string | null;      // CUIT
  address: string | null;
  phone: string | null;
}

// Ítem de línea de factura
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Verificación matemática de totales
export interface MathCheck {
  calculatedItemsTotal: number;  // Suma de line items
  declaredTotal: number;         // Total declarado en factura
  difference: number;            // Diferencia absoluta
  isValid: boolean;              // Si la diferencia es aceptable (<1%)
}

// Datos extraídos de la factura
export interface ExtractedInvoiceData {
  invoiceNumber: string | null;
  invoiceType: string | null;      // "Factura", "Recibo", "Ticket", etc.
  invoiceLetter: string | null;    // A, B, C, M, E (AFIP Argentina)
  invoiceDate: string | null;      // ISO date string
  
  // Montos
  subtotal: number | null;
  taxAmount: number | null;        // IVA
  total: number | null;
  currency: string;                // ARS, USD, etc.
  
  // Proveedor
  vendor: VendorInfo;
  
  // AFIP Electronic Invoice
  cae: string | null;              // 14 dígitos
  caeDueDate: string | null;       // Vencimiento CAE
  
  // Detalle
  lineItems: LineItem[];
  
  // Validación
  mathCheck: MathCheck | null;
}

// Resultado del procesamiento OCR
export interface OCRResult {
  success: boolean;
  data: ExtractedInvoiceData | null;
  rawText: string | null;          // Texto crudo extraído
  confidence: number;              // 0-1, confianza general
  warnings: string[];              // Advertencias (ej: "Total no coincide")
  processingTimeMs: number;
  provider: 'openai' | 'tesseract';
}

// Configuración del OCR
export interface OCRConfig {
  provider: 'openai' | 'tesseract' | 'auto';
  language: string;                // 'es', 'en', etc.
  enhanceImage: boolean;           // Pre-procesar imagen
  extractLineItems: boolean;       // Extraer detalle de ítems
  confidenceThreshold: number;     // Mínimo de confianza aceptable
}

// Patrones regex para parsing de facturas argentinas
export const INVOICE_PATTERNS = {
  // Número de factura: varios formatos
  invoiceNumber: [
    /(?:factura|fact|fc|comp|nro|n°|#)\s*[:\s]?\s*(\d{4,5}[-\s]?\d{8})/i,
    /(\d{4,5}[-\s]\d{8})/,
    /(?:nro|n°|#)\s*[:\s]?\s*(\d+)/i,
  ],
  
  // Tipo de comprobante
  invoiceType: [
    /(factura\s*[a-e])/i,
    /(recibo\s*[a-e]?)/i,
    /(ticket)/i,
    /(nota\s*de\s*(?:crédito|débito))/i,
  ],
  
  // Letra de factura AFIP
  invoiceLetter: /factura\s*([a-e])/i,
  
  // CUIT
  cuit: [
    /cuit[:\s]*(\d{2}[-\s]?\d{8}[-\s]?\d{1})/i,
    /(\d{2}-\d{8}-\d{1})/,
  ],
  
  // CAE (14 dígitos)
  cae: /cae[:\s]*(\d{14})/i,
  
  // Fecha
  date: [
    /fecha[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
  ],
  
  // Montos
  total: [
    /total[:\s]*\$?\s*([\d.,]+)/i,
    /importe\s*total[:\s]*\$?\s*([\d.,]+)/i,
  ],
  subtotal: /sub\s*total[:\s]*\$?\s*([\d.,]+)/i,
  iva: /iva[:\s]*\$?\s*([\d.,]+)/i,
};
```

### 6.2 Parser de Facturas (Fallback)

Ubicación: `/backend/api/src/services/ocr/ocr.parser.ts`

```typescript
/**
 * @fileoverview Parser de facturas para texto OCR
 * Usado como fallback cuando GPT-4 Vision no está disponible
 */

import { INVOICE_PATTERNS, type ExtractedInvoiceData, type VendorInfo, type LineItem } from './ocr.types';

export class InvoiceParser {
  private text: string;
  private normalizedText: string;

  constructor(rawText: string) {
    this.text = rawText;
    this.normalizedText = this.normalizeText(rawText);
  }

  /**
   * Normaliza el texto para facilitar el parsing
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[""'']/g, '"')
      .trim();
  }

  /**
   * Busca un patrón en el texto y retorna el primer grupo de captura
   */
  private findPattern(patterns: RegExp | RegExp[]): string | null {
    const patternList = Array.isArray(patterns) ? patterns : [patterns];
    
    for (const pattern of patternList) {
      const match = this.text.match(pattern) || this.normalizedText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Parsea un monto de texto a número
   */
  private parseAmount(text: string | null): number | null {
    if (!text) return null;
    
    // Remover símbolos de moneda y espacios
    const cleaned = text.replace(/[$\s]/g, '');
    
    // Manejar formato argentino (1.234,56) vs americano (1,234.56)
    let normalized: string;
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Si tiene ambos, determinar cuál es el separador decimal
      const lastComma = cleaned.lastIndexOf(',');
      const lastDot = cleaned.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // Formato argentino: 1.234,56
        normalized = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato americano: 1,234.56
        normalized = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      // Solo coma, asumir decimal
      normalized = cleaned.replace(',', '.');
    } else {
      normalized = cleaned;
    }
    
    const amount = parseFloat(normalized);
    return isNaN(amount) ? null : amount;
  }

  /**
   * Parsea una fecha de texto a ISO string
   */
  private parseDate(text: string | null): string | null {
    if (!text) return null;
    
    // Intentar varios formatos
    const formats = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,  // dd/mm/yyyy
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,   // dd/mm/yy
    ];
    
    for (const format of formats) {
      const match = text.match(format);
      if (match) {
        let [, day, month, year] = match;
        
        // Convertir año de 2 dígitos a 4
        if (year.length === 2) {
          year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }
        
        // Validar fecha
        const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    return null;
  }

  /**
   * Extrae información del proveedor
   */
  private extractVendor(): VendorInfo {
    const cuit = this.findPattern(INVOICE_PATTERNS.cuit);
    
    // Intentar extraer nombre (generalmente en las primeras líneas)
    const lines = this.text.split('\n').slice(0, 10);
    let name: string | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Buscar líneas que parezcan nombres de empresa
      if (trimmed.length > 5 && trimmed.length < 100 && 
          !trimmed.match(/^\d/) && 
          !trimmed.toLowerCase().includes('factura') &&
          !trimmed.toLowerCase().includes('cuit')) {
        name = trimmed;
        break;
      }
    }
    
    return {
      name,
      taxId: cuit,
      address: null,  // Difícil de extraer sin contexto
      phone: null,
    };
  }

  /**
   * Extrae la letra de factura AFIP
   */
  private extractInvoiceLetter(): string | null {
    const match = this.text.match(INVOICE_PATTERNS.invoiceLetter);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    return null;
  }

  /**
   * Parsea el texto completo y extrae datos de factura
   */
  parse(): ExtractedInvoiceData {
    const invoiceNumber = this.findPattern(INVOICE_PATTERNS.invoiceNumber);
    const invoiceType = this.findPattern(INVOICE_PATTERNS.invoiceType);
    const invoiceLetter = this.extractInvoiceLetter();
    const dateStr = this.findPattern(INVOICE_PATTERNS.date);
    const invoiceDate = this.parseDate(dateStr);
    
    const totalStr = this.findPattern(INVOICE_PATTERNS.total);
    const subtotalStr = this.findPattern(INVOICE_PATTERNS.subtotal);
    const ivaStr = this.findPattern(INVOICE_PATTERNS.iva);
    
    const total = this.parseAmount(totalStr);
    const subtotal = this.parseAmount(subtotalStr);
    const taxAmount = this.parseAmount(ivaStr);
    
    const cae = this.findPattern(INVOICE_PATTERNS.cae);
    
    const vendor = this.extractVendor();
    
    return {
      invoiceNumber,
      invoiceType: invoiceType ? this.capitalizeFirst(invoiceType) : null,
      invoiceLetter,
      invoiceDate,
      subtotal,
      taxAmount,
      total,
      currency: 'ARS',  // Default para Argentina
      vendor,
      cae,
      caeDueDate: null,  // Difícil de extraer
      lineItems: [],     // Requiere parsing más complejo
      mathCheck: null,
    };
  }

  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}
```

### 6.3 Servicio OCR Principal

Ubicación: `/backend/api/src/services/ocr/ocr.service.ts`

```typescript
/**
 * @fileoverview Servicio OCR para extracción de datos de facturas
 * Usa GPT-4 Vision como motor principal y Tesseract como fallback
 */

import crypto from 'crypto';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import { logger } from '@/utils/logger';
import { InvoiceParser } from './ocr.parser';
import type { 
  OCRResult, 
  OCRConfig, 
  ExtractedInvoiceData,
  MathCheck,
  LineItem 
} from './ocr.types';

// Configuración por defecto
const DEFAULT_CONFIG: OCRConfig = {
  provider: 'openai',
  language: 'es',
  enhanceImage: true,
  extractLineItems: true,
  confidenceThreshold: 0.7,
};

// Configuración de reintentos
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

// Caché en memoria para resultados OCR
const ocrCache = new Map<string, { result: OCRResult; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export class OCRService {
  private openai: OpenAI | null = null;
  private config: OCRConfig;

  /**
   * Constructor del servicio OCR
   * @param apiKey - API Key de OpenAI (requerida para GPT-4 Vision)
   * @param config - Configuración opcional del OCR
   */
  constructor(apiKey?: string, config?: Partial<OCRConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Genera hash SHA-256 de la imagen para caché
   */
  private generateImageHash(imageBuffer: Buffer): string {
    return crypto.createHash('sha256').update(imageBuffer).digest('hex');
  }

  /**
   * Obtiene resultado de caché si existe y no expiró
   */
  private getFromCache(hash: string): OCRResult | null {
    const cached = ocrCache.get(hash);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      logger.debug('OCR result from cache', { hash: hash.substring(0, 16) });
      return cached.result;
    }
    return null;
  }

  /**
   * Guarda resultado en caché
   */
  private saveToCache(hash: string, result: OCRResult): void {
    ocrCache.set(hash, { result, timestamp: Date.now() });
    
    // Limpiar entradas expiradas periódicamente
    if (ocrCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of ocrCache.entries()) {
        if (now - value.timestamp > CACHE_TTL_MS) {
          ocrCache.delete(key);
        }
      }
    }
  }

  /**
   * Pre-procesa la imagen para mejorar OCR
   * - Convierte a escala de grises
   * - Aumenta contraste
   * - Redimensiona si es muy grande
   */
  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      let processed = image
        .grayscale()
        .normalize()  // Mejora contraste
        .sharpen();   // Mejora bordes
      
      // Redimensionar si es muy grande (max 2000px en cualquier dimensión)
      const maxDimension = 2000;
      if (metadata.width && metadata.width > maxDimension) {
        processed = processed.resize(maxDimension, null, { fit: 'inside' });
      } else if (metadata.height && metadata.height > maxDimension) {
        processed = processed.resize(null, maxDimension, { fit: 'inside' });
      }
      
      return await processed.png().toBuffer();
    } catch (error) {
      logger.warn('Image preprocessing failed, using original', { error });
      return imageBuffer;
    }
  }

  /**
   * Ejecuta con reintentos y backoff exponencial
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Verificar si es un error recuperable
        const isRetryable = 
          lastError.message.includes('429') ||  // Rate limit
          lastError.message.includes('500') ||  // Server error
          lastError.message.includes('503') ||  // Service unavailable
          lastError.message.includes('timeout');
        
        if (!isRetryable || attempt === RETRY_CONFIG.maxRetries) {
          throw lastError;
        }
        
        // Calcular delay con backoff exponencial
        const delay = Math.min(
          RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1),
          RETRY_CONFIG.maxDelayMs
        );
        
        logger.warn(`${operationName} failed, retrying in ${delay}ms`, {
          attempt,
          error: lastError.message,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Extrae datos usando GPT-4 Vision
   */
  private async extractWithOpenAI(imageBase64: string): Promise<ExtractedInvoiceData> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const systemPrompt = `Eres un experto en extracción de datos de facturas y comprobantes argentinos.
Tu tarea es analizar la imagen de una factura y extraer TODOS los datos posibles en formato JSON estructurado.

IMPORTANTE:
- Extrae EXACTAMENTE lo que ves, no inventes datos
- Para campos que no puedas leer claramente, usa null
- Los montos deben ser números (sin símbolos de moneda)
- Las fechas deben estar en formato YYYY-MM-DD
- El CUIT debe tener formato XX-XXXXXXXX-X
- El CAE tiene exactamente 14 dígitos
- La letra de factura es A, B, C, M o E

Responde SOLO con JSON válido, sin texto adicional.`;

    const userPrompt = `Analiza esta imagen de factura/comprobante y extrae los siguientes datos en JSON:

{
  "invoiceNumber": "número de factura completo (ej: 0001-00012345)",
  "invoiceType": "tipo de comprobante (Factura, Recibo, Ticket, Nota de Crédito, etc)",
  "invoiceLetter": "letra AFIP (A, B, C, M, E) o null",
  "invoiceDate": "fecha en formato YYYY-MM-DD",
  "subtotal": número sin IVA,
  "taxAmount": monto de IVA,
  "total": monto total,
  "currency": "ARS" o "USD",
  "vendor": {
    "name": "nombre o razón social del emisor",
    "taxId": "CUIT del emisor (XX-XXXXXXXX-X)",
    "address": "dirección del emisor",
    "phone": "teléfono del emisor"
  },
  "cae": "código CAE de 14 dígitos o null",
  "caeDueDate": "vencimiento CAE en YYYY-MM-DD o null",
  "lineItems": [
    {
      "description": "descripción del ítem",
      "quantity": cantidad numérica,
      "unitPrice": precio unitario,
      "total": total del ítem
    }
  ]
}`;

    const response = await this.withRetry(
      async () => {
        return await this.openai!.chat.completions.create({
          model: 'gpt-4o',  // o 'gpt-4-vision-preview'
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: userPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${imageBase64}`,
                    detail: 'high',
                  },
                },
              ],
            },
          ],
          max_tokens: 2000,
          temperature: 0.1,  // Baja temperatura para respuestas consistentes
        });
      },
      'OpenAI Vision API'
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parsear JSON de la respuesta
    // Manejar caso donde GPT envuelve en ```json ... ```
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsed = JSON.parse(jsonStr);
      
      // Validar y normalizar estructura
      return this.normalizeExtractedData(parsed);
    } catch (parseError) {
      logger.error('Failed to parse OpenAI response as JSON', { 
        content: content.substring(0, 500),
        error: parseError 
      });
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  /**
   * Normaliza y valida datos extraídos
   */
  private normalizeExtractedData(raw: Record<string, unknown>): ExtractedInvoiceData {
    return {
      invoiceNumber: typeof raw.invoiceNumber === 'string' ? raw.invoiceNumber : null,
      invoiceType: typeof raw.invoiceType === 'string' ? raw.invoiceType : null,
      invoiceLetter: this.validateInvoiceLetter(raw.invoiceLetter),
      invoiceDate: this.validateDate(raw.invoiceDate),
      subtotal: this.validateNumber(raw.subtotal),
      taxAmount: this.validateNumber(raw.taxAmount),
      total: this.validateNumber(raw.total),
      currency: raw.currency === 'USD' ? 'USD' : 'ARS',
      vendor: this.normalizeVendor(raw.vendor),
      cae: this.validateCAE(raw.cae),
      caeDueDate: this.validateDate(raw.caeDueDate),
      lineItems: this.normalizeLineItems(raw.lineItems),
      mathCheck: null,  // Se calcula después
    };
  }

  private validateInvoiceLetter(value: unknown): string | null {
    if (typeof value === 'string' && ['A', 'B', 'C', 'M', 'E'].includes(value.toUpperCase())) {
      return value.toUpperCase();
    }
    return null;
  }

  private validateDate(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }

  private validateNumber(value: unknown): number | null {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/[,$]/g, ''));
      if (!isNaN(num)) return num;
    }
    return null;
  }

  private validateCAE(value: unknown): string | null {
    if (typeof value === 'string' && /^\d{14}$/.test(value)) {
      return value;
    }
    return null;
  }

  private normalizeVendor(raw: unknown): ExtractedInvoiceData['vendor'] {
    if (!raw || typeof raw !== 'object') {
      return { name: null, taxId: null, address: null, phone: null };
    }
    const vendor = raw as Record<string, unknown>;
    return {
      name: typeof vendor.name === 'string' ? vendor.name : null,
      taxId: typeof vendor.taxId === 'string' ? vendor.taxId : null,
      address: typeof vendor.address === 'string' ? vendor.address : null,
      phone: typeof vendor.phone === 'string' ? vendor.phone : null,
    };
  }

  private normalizeLineItems(raw: unknown): LineItem[] {
    if (!Array.isArray(raw)) return [];
    
    return raw
      .filter((item): item is Record<string, unknown> => 
        item !== null && typeof item === 'object'
      )
      .map(item => ({
        description: typeof item.description === 'string' ? item.description : '',
        quantity: this.validateNumber(item.quantity) || 1,
        unitPrice: this.validateNumber(item.unitPrice) || 0,
        total: this.validateNumber(item.total) || 0,
      }))
      .filter(item => item.description.length > 0);
  }

  /**
   * Realiza verificación matemática de totales
   */
  private performMathCheck(data: ExtractedInvoiceData): MathCheck | null {
    if (data.total === null) return null;
    
    // Calcular total de line items
    const calculatedItemsTotal = data.lineItems.reduce(
      (sum, item) => sum + item.total,
      0
    );
    
    // Si no hay line items, intentar con subtotal + tax
    let expectedTotal = calculatedItemsTotal;
    if (calculatedItemsTotal === 0 && data.subtotal !== null) {
      expectedTotal = data.subtotal + (data.taxAmount || 0);
    }
    
    const difference = Math.abs(data.total - expectedTotal);
    const tolerance = data.total * 0.01;  // 1% de tolerancia
    
    return {
      calculatedItemsTotal,
      declaredTotal: data.total,
      difference,
      isValid: difference <= tolerance || calculatedItemsTotal === 0,
    };
  }

  /**
   * Extrae datos usando Tesseract (fallback)
   */
  private async extractWithTesseract(imageBuffer: Buffer): Promise<{
    data: ExtractedInvoiceData;
    rawText: string;
  }> {
    const result = await Tesseract.recognize(imageBuffer, this.config.language, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          logger.debug('Tesseract progress', { progress: m.progress });
        }
      },
    });

    const rawText = result.data.text;
    const parser = new InvoiceParser(rawText);
    const data = parser.parse();

    return { data, rawText };
  }

  /**
   * Calcula confianza general del resultado
   */
  private calculateConfidence(data: ExtractedInvoiceData, provider: 'openai' | 'tesseract'): number {
    let score = provider === 'openai' ? 0.8 : 0.5;  // Base score
    
    // Bonus por campos extraídos
    if (data.invoiceNumber) score += 0.05;
    if (data.total !== null) score += 0.05;
    if (data.invoiceDate) score += 0.03;
    if (data.vendor.name) score += 0.02;
    if (data.vendor.taxId) score += 0.02;
    if (data.cae) score += 0.03;
    
    // Penalización si math check falla
    if (data.mathCheck && !data.mathCheck.isValid) {
      score -= 0.1;
    }
    
    return Math.min(Math.max(score, 0), 1);  // Clamp 0-1
  }

  /**
   * Genera advertencias basadas en los datos extraídos
   */
  private generateWarnings(data: ExtractedInvoiceData): string[] {
    const warnings: string[] = [];
    
    if (!data.invoiceNumber) {
      warnings.push('No se pudo extraer el número de factura');
    }
    
    if (data.total === null) {
      warnings.push('No se pudo extraer el monto total');
    }
    
    if (!data.invoiceDate) {
      warnings.push('No se pudo extraer la fecha');
    }
    
    if (!data.vendor.name && !data.vendor.taxId) {
      warnings.push('No se pudo identificar al proveedor');
    }
    
    if (data.mathCheck && !data.mathCheck.isValid) {
      warnings.push(
        `Discrepancia en totales: calculado $${data.mathCheck.calculatedItemsTotal.toFixed(2)} ` +
        `vs declarado $${data.mathCheck.declaredTotal.toFixed(2)}`
      );
    }
    
    if (data.invoiceLetter && !data.cae) {
      warnings.push('Factura electrónica sin CAE detectado');
    }
    
    return warnings;
  }

  /**
   * Procesa una imagen y extrae datos de factura
   * @param imageBuffer - Buffer de la imagen (JPEG, PNG, etc.)
   * @returns Resultado del OCR con datos extraídos
   */
  async processImage(imageBuffer: Buffer): Promise<OCRResult> {
    const startTime = Date.now();
    
    // Verificar caché
    const imageHash = this.generateImageHash(imageBuffer);
    const cached = this.getFromCache(imageHash);
    if (cached) {
      return {
        ...cached,
        processingTimeMs: Date.now() - startTime,
      };
    }

    try {
      // Pre-procesar imagen si está habilitado
      const processedImage = this.config.enhanceImage
        ? await this.preprocessImage(imageBuffer)
        : imageBuffer;

      let data: ExtractedInvoiceData;
      let rawText: string | null = null;
      let provider: 'openai' | 'tesseract';

      // Intentar con OpenAI primero
      if (this.openai && this.config.provider !== 'tesseract') {
        try {
          const base64 = processedImage.toString('base64');
          data = await this.extractWithOpenAI(base64);
          provider = 'openai';
          
          logger.info('OCR completed with OpenAI', { 
            hash: imageHash.substring(0, 16),
            hasInvoiceNumber: !!data.invoiceNumber,
            hasTotal: data.total !== null,
          });
        } catch (openaiError) {
          logger.warn('OpenAI OCR failed, falling back to Tesseract', { 
            error: openaiError 
          });
          
          // Fallback a Tesseract
          const tesseractResult = await this.extractWithTesseract(processedImage);
          data = tesseractResult.data;
          rawText = tesseractResult.rawText;
          provider = 'tesseract';
        }
      } else {
        // Usar Tesseract directamente
        const tesseractResult = await this.extractWithTesseract(processedImage);
        data = tesseractResult.data;
        rawText = tesseractResult.rawText;
        provider = 'tesseract';
      }

      // Realizar verificación matemática
      data.mathCheck = this.performMathCheck(data);

      // Calcular confianza y generar advertencias
      const confidence = this.calculateConfidence(data, provider);
      const warnings = this.generateWarnings(data);

      const result: OCRResult = {
        success: true,
        data,
        rawText,
        confidence,
        warnings,
        processingTimeMs: Date.now() - startTime,
        provider,
      };

      // Guardar en caché
      this.saveToCache(imageHash, result);

      return result;
    } catch (error) {
      logger.error('OCR processing failed', { error });
      
      return {
        success: false,
        data: null,
        rawText: null,
        confidence: 0,
        warnings: [error instanceof Error ? error.message : 'Error desconocido'],
        processingTimeMs: Date.now() - startTime,
        provider: 'tesseract',
      };
    }
  }
}
```

---

## 7. Backend - Servicio WhatsApp

### 7.1 Tipos y Estructuras de Datos

Ubicación: `/backend/api/src/services/whatsapp/whatsapp.types.ts`

```typescript
/**
 * @fileoverview Tipos para el servicio WhatsApp Business API
 */

// Configuración del servicio WhatsApp
export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
  verifyToken?: string;
}

// Tipos de mensaje
export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'interactive' | 'template';

// Mensaje de texto saliente
export interface TextMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

// Botón interactivo
export interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;  // Max 20 caracteres
  };
}

// Mensaje interactivo con botones
export interface InteractiveButtonMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button';
    header?: { type: 'text'; text: string };
    body: { text: string };
    footer?: { text: string };
    action: { buttons: InteractiveButton[] };
  };
}

// Fila de lista interactiva
export interface ListRow {
  id: string;
  title: string;       // Max 24 caracteres
  description?: string; // Max 72 caracteres
}

// Sección de lista
export interface ListSection {
  title?: string;       // Max 24 caracteres
  rows: ListRow[];
}

// Mensaje interactivo con lista
export interface InteractiveListMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'list';
    header?: { type: 'text'; text: string };
    body: { text: string };
    footer?: { text: string };
    action: {
      button: string;  // Texto del botón, max 20 caracteres
      sections: ListSection[];
    };
  };
}

// Mensaje de plantilla
export interface TemplateMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: { code: string };  // ej: 'es_AR', 'en_US'
    components?: TemplateComponent[];
  };
}

// Componente de plantilla
export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

// Parámetro de plantilla
export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: { fallback_value: string; code: string; amount_1000: number };
  date_time?: { fallback_value: string };
  image?: { link: string };
}

// Webhook - Estructura del payload entrante
export interface WebhookPayload {
  object: 'whatsapp_business_account';
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: {
    messaging_product: 'whatsapp';
    metadata: { display_phone_number: string; phone_number_id: string };
    contacts?: WebhookContact[];
    messages?: IncomingMessage[];
    statuses?: MessageStatus[];
  };
  field: 'messages';
}

export interface WebhookContact {
  profile: { name: string };
  wa_id: string;
}

// Mensaje entrante
export interface IncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: MessageType;
  text?: { body: string };
  image?: MediaContent;
  document?: MediaContent;
  audio?: MediaContent;
  video?: MediaContent;
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  context?: { from: string; id: string };
}

export interface MediaContent {
  id: string;
  mime_type: string;
  sha256?: string;
  caption?: string;
  filename?: string;
}

// Estado de mensaje
export interface MessageStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message: string }>;
}

// Respuesta de envío de mensaje
export interface SendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}
```

### 7.2 Servicio WhatsApp

Ubicación: `/backend/api/src/services/whatsapp/whatsapp.service.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { logger } from '@/utils/logger';
import type {
  WhatsAppConfig, TextMessage, InteractiveButtonMessage,
  InteractiveListMessage, TemplateMessage, SendMessageResponse,
  WebhookPayload, IncomingMessage, InteractiveButton, ListSection,
  TemplateComponent,
} from './whatsapp.types';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export class WhatsAppService {
  private client: AxiosInstance;
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: WHATSAPP_API_URL,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Verifica el webhook de WhatsApp (GET request)
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.verifyToken) {
      logger.info('Webhook verified successfully');
      return challenge;
    }
    return null;
  }

  // Envía un mensaje de texto simple
  async sendTextMessage(to: string, text: string): Promise<SendMessageResponse> {
    const message: TextMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: true, body: text },
    };

    const response = await this.client.post(
      `/${this.config.phoneNumberId}/messages`,
      message
    );
    logger.info('Text message sent', { to, messageId: response.data.messages?.[0]?.id });
    return response.data;
  }

  // Envía un mensaje con botones interactivos (max 3 botones)
  async sendButtonMessage(
    to: string,
    body: string,
    buttons: Array<{ id: string; title: string }>,
    header?: string,
    footer?: string
  ): Promise<SendMessageResponse> {
    if (buttons.length > 3) throw new Error('Maximum 3 buttons allowed');

    const interactiveButtons: InteractiveButton[] = buttons.map((btn) => ({
      type: 'reply',
      reply: { id: btn.id, title: btn.title.substring(0, 20) },
    }));

    const message: InteractiveButtonMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: { buttons: interactiveButtons },
      },
    };

    if (header) message.interactive.header = { type: 'text', text: header };
    if (footer) message.interactive.footer = { text: footer };

    const response = await this.client.post(
      `/${this.config.phoneNumberId}/messages`,
      message
    );
    return response.data;
  }

  // Envía un mensaje con lista de opciones
  async sendListMessage(
    to: string,
    body: string,
    buttonText: string,
    sections: ListSection[],
    header?: string,
    footer?: string
  ): Promise<SendMessageResponse> {
    const message: InteractiveListMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: body },
        action: {
          button: buttonText.substring(0, 20),
          sections: sections.map((section) => ({
            title: section.title?.substring(0, 24),
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row.title.substring(0, 24),
              description: row.description?.substring(0, 72),
            })),
          })),
        },
      },
    };

    if (header) message.interactive.header = { type: 'text', text: header };
    if (footer) message.interactive.footer = { text: footer };

    const response = await this.client.post(
      `/${this.config.phoneNumberId}/messages`,
      message
    );
    return response.data;
  }

  // Envía un mensaje usando una plantilla pre-aprobada
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components?: TemplateComponent[]
  ): Promise<SendMessageResponse> {
    const message: TemplateMessage = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name: templateName, language: { code: languageCode }, components },
    };

    const response = await this.client.post(
      `/${this.config.phoneNumberId}/messages`,
      message
    );
    return response.data;
  }

  // Descarga un archivo multimedia recibido
  async downloadMedia(mediaId: string): Promise<Buffer> {
    const urlResponse = await this.client.get(`/${mediaId}`);
    const mediaUrl = urlResponse.data.url;

    const mediaResponse = await axios.get(mediaUrl, {
      headers: { 'Authorization': `Bearer ${this.config.accessToken}` },
      responseType: 'arraybuffer',
    });

    return Buffer.from(mediaResponse.data);
  }

  // Marca un mensaje como leído
  async markAsRead(messageId: string): Promise<void> {
    await this.client.post(`/${this.config.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });
  }

  // Parsea el payload del webhook y extrae mensajes
  parseWebhookPayload(payload: WebhookPayload): Array<{
    message: IncomingMessage;
    phoneNumberId: string;
    contactName: string;
    contactPhone: string;
  }> {
    const messages: Array<{
      message: IncomingMessage;
      phoneNumberId: string;
      contactName: string;
      contactPhone: string;
    }> = [];

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages' || !change.value.messages) continue;

        const phoneNumberId = change.value.metadata.phone_number_id;
        const contacts = change.value.contacts || [];

        for (const message of change.value.messages) {
          const contact = contacts.find((c) => c.wa_id === message.from);
          messages.push({
            message,
            phoneNumberId,
            contactName: contact?.profile.name || 'Unknown',
            contactPhone: message.from,
          });
        }
      }
    }

    return messages;
  }

  // Extrae el contenido de texto de un mensaje entrante
  extractMessageContent(message: IncomingMessage): string | null {
    switch (message.type) {
      case 'text':
        return message.text?.body || null;
      case 'interactive':
        if (message.interactive?.type === 'button_reply') {
          return message.interactive.button_reply?.title || null;
        }
        if (message.interactive?.type === 'list_reply') {
          return message.interactive.list_reply?.title || null;
        }
        return null;
      case 'image':
      case 'document':
        return message.image?.caption || message.document?.caption || null;
      default:
        return null;
    }
  }

  // Obtiene el ID de selección de un mensaje interactivo
  getInteractiveReplyId(message: IncomingMessage): string | null {
    if (message.type !== 'interactive') return null;
    if (message.interactive?.type === 'button_reply') {
      return message.interactive.button_reply?.id || null;
    }
    if (message.interactive?.type === 'list_reply') {
      return message.interactive.list_reply?.id || null;
    }
    return null;
  }
}
```

---

## 8. API GraphQL

### 8.1 Resolver de Integraciones

Ubicación: `/backend/api/src/modules/integraciones/integraciones.resolver.ts`

```typescript
import { integracionesService } from './integraciones.service';
import { OCRService } from '@/services/ocr/ocr.service';
import { upsertIntegrationSchema, testIntegrationSchema } from './integraciones.schema';
import { logger } from '@/utils/logger';

// Type Definitions GraphQL
export const integracionesTypeDefs = `#graphql
  enum IntegrationType {
    OPENAI
    WHATSAPP
  }

  type Integration {
    id: ID!
    type: IntegrationType!
    maskedApiKey: String!
    phoneNumberId: String
    businessAccountId: String
    verifyToken: String
    config: JSON
    isActive: Boolean!
    lastTestedAt: DateTime
    lastTestSuccess: Boolean
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type TestResult {
    success: Boolean!
    message: String!
    details: JSON
  }

  type OCRResult {
    success: Boolean!
    invoiceNumber: String
    invoiceType: String
    invoiceLetter: String
    invoiceDate: String
    subtotal: Float
    taxAmount: Float
    total: Float
    currency: String
    vendorName: String
    vendorTaxId: String
    cae: String
    caeDueDate: String
    lineItems: [OCRLineItem!]
    confidence: Float!
    warnings: [String!]!
    processingTimeMs: Int!
    mathCheck: MathCheck
  }

  type OCRLineItem {
    description: String!
    quantity: Float!
    unitPrice: Float!
    total: Float!
  }

  type MathCheck {
    calculatedItemsTotal: Float!
    declaredTotal: Float!
    difference: Float!
    isValid: Boolean!
  }

  input UpsertIntegrationInput {
    type: IntegrationType!
    apiKey: String!
    phoneNumberId: String
    businessAccountId: String
    verifyToken: String
    config: JSON
  }

  extend type Query {
    integrations: [Integration!]!
    integration(type: IntegrationType!): Integration
  }

  extend type Mutation {
    upsertIntegration(input: UpsertIntegrationInput!): Integration!
    toggleIntegration(type: IntegrationType!): Integration!
    deleteIntegration(type: IntegrationType!): Boolean!
    testIntegration(type: IntegrationType!): TestResult!
    processOCR(imageBase64: String!): OCRResult!
  }
`;

// Resolvers
export const integracionesResolvers = {
  Query: {
    // Obtiene todas las integraciones de la empresa
    integrations: async (_: unknown, __: unknown, context: { empresaId: string }) => {
      return integracionesService.findAll(context.empresaId);
    },

    // Obtiene una integración por tipo
    integration: async (
      _: unknown,
      { type }: { type: string },
      context: { empresaId: string }
    ) => {
      const validated = testIntegrationSchema.parse({ type });
      return integracionesService.findByType(context.empresaId, validated.type);
    },
  },

  Mutation: {
    // Crea o actualiza una integración
    upsertIntegration: async (
      _: unknown,
      { input }: { input: unknown },
      context: { empresaId: string; userId: string }
    ) => {
      const validated = upsertIntegrationSchema.parse(input);
      return integracionesService.upsert(
        context.empresaId,
        context.userId,
        validated
      );
    },

    // Activa/desactiva una integración
    toggleIntegration: async (
      _: unknown,
      { type }: { type: string },
      context: { empresaId: string; userId: string }
    ) => {
      const validated = testIntegrationSchema.parse({ type });
      return integracionesService.toggle(
        context.empresaId,
        validated.type,
        context.userId
      );
    },

    // Elimina una integración
    deleteIntegration: async (
      _: unknown,
      { type }: { type: string },
      context: { empresaId: string; userId: string }
    ) => {
      const validated = testIntegrationSchema.parse({ type });
      return integracionesService.delete(
        context.empresaId,
        validated.type,
        context.userId
      );
    },

    // Prueba la conexión de una integración
    testIntegration: async (
      _: unknown,
      { type }: { type: string },
      context: { empresaId: string }
    ) => {
      const validated = testIntegrationSchema.parse({ type });
      return integracionesService.testConnection(context.empresaId, validated.type);
    },

    // Procesa una imagen con OCR
    processOCR: async (
      _: unknown,
      { imageBase64 }: { imageBase64: string },
      context: { empresaId: string }
    ) => {
      // Obtener API key de OpenAI de la empresa
      const apiKey = await integracionesService.getDecryptedApiKey(
        context.empresaId,
        'OPENAI'
      );

      if (!apiKey) {
        return {
          success: false,
          confidence: 0,
          warnings: ['No hay integración de OpenAI configurada'],
          processingTimeMs: 0,
        };
      }

      // Crear instancia de OCRService con la API key de la empresa
      const ocrService = new OCRService(apiKey);

      // Convertir base64 a buffer
      const imageBuffer = Buffer.from(imageBase64, 'base64');

      // Procesar imagen
      const result = await ocrService.processImage(imageBuffer);

      logger.info('OCR processed', {
        empresaId: context.empresaId,
        success: result.success,
        confidence: result.confidence,
      });

      // Mapear resultado al formato GraphQL
      if (!result.success || !result.data) {
        return {
          success: false,
          confidence: result.confidence,
          warnings: result.warnings,
          processingTimeMs: result.processingTimeMs,
        };
      }

      return {
        success: true,
        invoiceNumber: result.data.invoiceNumber,
        invoiceType: result.data.invoiceType,
        invoiceLetter: result.data.invoiceLetter,
        invoiceDate: result.data.invoiceDate,
        subtotal: result.data.subtotal,
        taxAmount: result.data.taxAmount,
        total: result.data.total,
        currency: result.data.currency,
        vendorName: result.data.vendor.name,
        vendorTaxId: result.data.vendor.taxId,
        cae: result.data.cae,
        caeDueDate: result.data.caeDueDate,
        lineItems: result.data.lineItems,
        confidence: result.confidence,
        warnings: result.warnings,
        processingTimeMs: result.processingTimeMs,
        mathCheck: result.data.mathCheck,
      };
    },
  },
};
```

### 8.2 Mutations del Frontend

Ubicación: `/frontend/web/src/graphql/mutations/integraciones.ts`

```typescript
import { gql } from '@apollo/client';

export const UPSERT_INTEGRATION_MUTATION = gql`
  mutation UpsertIntegration($input: UpsertIntegrationInput!) {
    upsertIntegration(input: $input) {
      id
      type
      maskedApiKey
      phoneNumberId
      businessAccountId
      verifyToken
      config
      isActive
      lastTestedAt
      lastTestSuccess
      createdAt
      updatedAt
    }
  }
`;

export const TOGGLE_INTEGRATION_MUTATION = gql`
  mutation ToggleIntegration($type: IntegrationType!) {
    toggleIntegration(type: $type) {
      id
      type
      isActive
    }
  }
`;

export const DELETE_INTEGRATION_MUTATION = gql`
  mutation DeleteIntegration($type: IntegrationType!) {
    deleteIntegration(type: $type)
  }
`;

export const TEST_INTEGRATION_MUTATION = gql`
  mutation TestIntegration($type: IntegrationType!) {
    testIntegration(type: $type) {
      success
      message
      details
    }
  }
`;

export const PROCESS_OCR_MUTATION = gql`
  mutation ProcessOCR($imageBase64: String!) {
    processOCR(imageBase64: $imageBase64) {
      success
      invoiceNumber
      invoiceType
      invoiceLetter
      invoiceDate
      subtotal
      taxAmount
      total
      currency
      vendorName
      vendorTaxId
      cae
      caeDueDate
      lineItems {
        description
        quantity
        unitPrice
        total
      }
      confidence
      warnings
      processingTimeMs
      mathCheck {
        calculatedItemsTotal
        declaredTotal
        difference
        isValid
      }
    }
  }
`;
```

### 8.3 Queries del Frontend

Ubicación: `/frontend/web/src/graphql/queries/integraciones.ts`

```typescript
import { gql } from '@apollo/client';

export const GET_INTEGRATIONS_QUERY = gql`
  query GetIntegrations {
    integrations {
      id
      type
      maskedApiKey
      phoneNumberId
      businessAccountId
      verifyToken
      config
      isActive
      lastTestedAt
      lastTestSuccess
      createdAt
      updatedAt
    }
  }
`;

export const GET_INTEGRATION_QUERY = gql`
  query GetIntegration($type: IntegrationType!) {
    integration(type: $type) {
      id
      type
      maskedApiKey
      phoneNumberId
      businessAccountId
      verifyToken
      config
      isActive
      lastTestedAt
      lastTestSuccess
      createdAt
      updatedAt
    }
  }
`;
```

---

## 9. Frontend - Página de Integraciones

### 9.1 Componente Principal

Ubicación: `/frontend/web/src/app/(dashboard)/settings/integraciones/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  Settings, Key, Phone, CheckCircle, XCircle, 
  Loader2, Eye, EyeOff, Trash2, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

import { GET_INTEGRATIONS_QUERY } from '@/graphql/queries/integraciones';
import {
  UPSERT_INTEGRATION_MUTATION,
  TOGGLE_INTEGRATION_MUTATION,
  DELETE_INTEGRATION_MUTATION,
  TEST_INTEGRATION_MUTATION,
} from '@/graphql/mutations/integraciones';

interface Integration {
  id: string;
  type: 'OPENAI' | 'WHATSAPP';
  maskedApiKey: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  verifyToken?: string;
  isActive: boolean;
  lastTestedAt?: string;
  lastTestSuccess?: boolean;
}

export default function IntegracionesPage() {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [editingType, setEditingType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    apiKey: '',
    phoneNumberId: '',
    businessAccountId: '',
    verifyToken: '',
  });

  // Query para obtener integraciones
  const { data, loading, refetch } = useQuery(GET_INTEGRATIONS_QUERY);

  // Mutations
  const [upsertIntegration, { loading: upserting }] = useMutation(
    UPSERT_INTEGRATION_MUTATION,
    {
      onCompleted: () => {
        toast.success('Integración guardada correctamente');
        setEditingType(null);
        resetForm();
        refetch();
      },
      onError: (error) => toast.error(`Error: ${error.message}`),
    }
  );

  const [toggleIntegration] = useMutation(TOGGLE_INTEGRATION_MUTATION, {
    onCompleted: (data) => {
      const status = data.toggleIntegration.isActive ? 'activada' : 'desactivada';
      toast.success(`Integración ${status}`);
      refetch();
    },
  });

  const [deleteIntegration] = useMutation(DELETE_INTEGRATION_MUTATION, {
    onCompleted: () => {
      toast.success('Integración eliminada');
      refetch();
    },
  });

  const [testIntegration, { loading: testing }] = useMutation(
    TEST_INTEGRATION_MUTATION,
    {
      onCompleted: (data) => {
        if (data.testIntegration.success) {
          toast.success(data.testIntegration.message);
        } else {
          toast.error(data.testIntegration.message);
        }
        refetch();
      },
    }
  );

  const resetForm = () => {
    setFormData({ apiKey: '', phoneNumberId: '', businessAccountId: '', verifyToken: '' });
  };

  const handleSubmit = async (type: 'OPENAI' | 'WHATSAPP') => {
    if (!formData.apiKey) {
      toast.error('API Key es requerida');
      return;
    }
    if (type === 'WHATSAPP' && !formData.phoneNumberId) {
      toast.error('Phone Number ID es requerido para WhatsApp');
      return;
    }

    await upsertIntegration({
      variables: {
        input: {
          type,
          apiKey: formData.apiKey,
          phoneNumberId: type === 'WHATSAPP' ? formData.phoneNumberId : undefined,
          businessAccountId: type === 'WHATSAPP' ? formData.businessAccountId : undefined,
          verifyToken: type === 'WHATSAPP' ? formData.verifyToken : undefined,
        },
      },
    });
  };

  const getIntegration = (type: string): Integration | undefined => {
    return data?.integrations?.find((i: Integration) => i.type === type);
  };

  const openaiIntegration = getIntegration('OPENAI');
  const whatsappIntegration = getIntegration('WHATSAPP');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Integraciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Configura tus integraciones con servicios externos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* OpenAI Card - muestra estado, API key enmascarada, botones de acción */}
        {/* WhatsApp Card - muestra Phone Number ID, Business Account ID, etc. */}
        {/* Formularios de edición para cada integración */}
      </div>
    </div>
  );
}
```

**Funcionalidades del componente:**

1. **Visualización de integraciones existentes**:
   - Muestra estado (activo/inactivo) con iconos de color
   - API Key enmascarada con opción de mostrar/ocultar
   - Última prueba de conexión y su resultado

2. **Acciones disponibles**:
   - **Probar**: Verifica la conexión con el servicio externo
   - **Activar/Desactivar**: Toggle del estado de la integración
   - **Editar**: Abre formulario para modificar credenciales
   - **Eliminar**: Elimina la integración (con confirmación)

3. **Formulario de configuración**:
   - Para OpenAI: Solo API Key
   - Para WhatsApp: Access Token, Phone Number ID, Business Account ID, Verify Token

---

## 10. Frontend - Uso de OCR en Gastos

### 10.1 Página de Nuevo Gasto con OCR

Ubicación: `/frontend/web/src/app/(dashboard)/gastos/nuevo/page.tsx`

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { PROCESS_OCR_MUTATION } from '@/graphql/mutations/integraciones';
import { CREATE_GASTO_MUTATION } from '@/graphql/mutations/gastos';

interface OCRData {
  invoiceNumber: string | null;
  invoiceType: string | null;
  invoiceLetter: string | null;
  invoiceDate: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  total: number | null;
  currency: string;
  vendorName: string | null;
  vendorTaxId: string | null;
  cae: string | null;
  caeDueDate: string | null;
  confidence: number;
  warnings: string[];
}

export default function NuevoGastoPage() {
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [useOcr, setUseOcr] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    obraId: '',
    description: '',
    amount: '',
    taxAmount: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    invoiceType: '',
    invoiceLetter: '',
    invoiceDate: '',
    vendorName: '',
    vendorTaxId: '',
    cae: '',
    caeDueDate: '',
  });

  const [processOCR, { loading: processingOcr }] = useMutation(PROCESS_OCR_MUTATION);
  const [createGasto, { loading: creating }] = useMutation(CREATE_GASTO_MUTATION);

  // Dropzone para subir imagen
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (!useOcr) return;

    // Convertir a base64 y procesar OCR
    const base64Reader = new FileReader();
    base64Reader.onload = async () => {
      const base64 = (base64Reader.result as string).split(',')[1];
      
      try {
        const { data } = await processOCR({
          variables: { imageBase64: base64 },
        });

        if (data?.processOCR?.success) {
          const ocr = data.processOCR;
          setOcrData(ocr);
          
          // Auto-rellenar formulario con datos OCR
          setFormData(prev => ({
            ...prev,
            description: ocr.vendorName || prev.description,
            amount: ocr.subtotal?.toString() || ocr.total?.toString() || '',
            taxAmount: ocr.taxAmount?.toString() || '',
            invoiceNumber: ocr.invoiceNumber || '',
            invoiceType: ocr.invoiceType || '',
            invoiceLetter: ocr.invoiceLetter || '',
            invoiceDate: ocr.invoiceDate || '',
            vendorName: ocr.vendorName || '',
            vendorTaxId: ocr.vendorTaxId || '',
            cae: ocr.cae || '',
            caeDueDate: ocr.caeDueDate || '',
          }));

          if (ocr.confidence >= 0.8) {
            toast.success('Datos extraídos correctamente');
          } else {
            toast.warning('Revisa los datos extraídos, la confianza es baja');
          }
        } else {
          toast.error('No se pudieron extraer datos de la imagen');
        }
      } catch (error) {
        toast.error('Error al procesar la imagen');
        console.error(error);
      }
    };
    base64Reader.readAsDataURL(file);
  }, [useOcr, processOCR]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.obraId || !formData.description || !formData.amount) {
      toast.error('Completa los campos requeridos');
      return;
    }

    try {
      await createGasto({
        variables: {
          input: {
            obraId: formData.obraId,
            description: formData.description,
            amount: parseFloat(formData.amount),
            taxAmount: formData.taxAmount ? parseFloat(formData.taxAmount) : undefined,
            date: new Date(formData.date).toISOString(),
            invoiceNumber: formData.invoiceNumber || undefined,
            invoiceType: formData.invoiceType || undefined,
            invoiceLetter: formData.invoiceLetter || undefined,
            invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : undefined,
            vendorName: formData.vendorName || undefined,
            vendorTaxId: formData.vendorTaxId || undefined,
            cae: formData.cae || undefined,
            caeDueDate: formData.caeDueDate ? new Date(formData.caeDueDate).toISOString() : undefined,
            ocrConfidence: ocrData?.confidence,
            source: ocrData ? 'OCR' : 'MANUAL',
          },
        },
      });

      toast.success('Gasto creado correctamente');
      // Redirect o reset form
    } catch (error) {
      toast.error('Error al crear el gasto');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nuevo Gasto</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Columna izquierda: Upload y preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Comprobante</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useOcr}
                onChange={(e) => setUseOcr(e.target.checked)}
                className="checkbox"
              />
              <span className="text-sm">Usar OCR automático</span>
            </label>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
              ${processingOcr ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            {processingOcr ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p>Procesando imagen...</p>
              </div>
            ) : imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p>Arrastra una imagen o haz clic para seleccionar</p>
                <p className="text-sm text-gray-500">JPG, PNG o WebP</p>
              </div>
            )}
          </div>

          {/* OCR Results */}
          {ocrData && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Confianza OCR:</span>
                <span className={`font-bold ${ocrData.confidence >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(ocrData.confidence * 100).toFixed(0)}%
                </span>
                {ocrData.confidence >= 0.8 ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
              </div>

              {ocrData.warnings.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-yellow-600">Advertencias:</p>
                  <ul className="text-sm text-yellow-700">
                    {ocrData.warnings.map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {ocrData.cae && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">CAE:</span> {ocrData.cae}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna derecha: Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos del formulario: obraId, description, amount, etc. */}
          {/* Los campos se pre-rellenan con datos OCR cuando están disponibles */}
          
          <button
            type="submit"
            disabled={creating}
            className="btn btn-primary w-full"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Gasto'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Flujo de uso de OCR:**

1. Usuario sube imagen de factura (drag & drop o click)
2. Si OCR está habilitado, se envía imagen en base64 al backend
3. Backend procesa con GPT-4 Vision y retorna datos estructurados
4. Frontend auto-rellena el formulario con los datos extraídos
5. Usuario revisa, corrige si es necesario, y guarda el gasto
6. Se almacena `ocrConfidence` y `source: 'OCR'` para auditoría

---

## 11. Variables de Entorno

### 11.1 Backend (.env)

```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/obratotal"

# Redis
REDIS_URL="redis://localhost:6379"

# Encriptación de API Keys
INTEGRATION_ENCRYPTION_KEY="tu-clave-secreta-de-32-caracteres-minimo"

# JWT (para autenticación)
JWT_SECRET="tu-jwt-secret"
JWT_EXPIRES_IN="7d"

# Logging
LOG_LEVEL="info"
NODE_ENV="development"
```

### 11.2 Frontend (.env.local)

```bash
# API Backend
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"

# Otras configuraciones
NEXT_PUBLIC_APP_NAME="ObraTotal AI"
```

### 11.3 Configuración de WhatsApp en Meta

Para configurar WhatsApp Business API:

1. **Crear App en Meta for Developers**:
   - Ir a https://developers.facebook.com
   - Crear nueva app tipo "Business"
   - Agregar producto "WhatsApp"

2. **Obtener credenciales**:
   - **Phone Number ID**: En WhatsApp > Getting Started > Phone Number ID
   - **Business Account ID**: En WhatsApp > Getting Started > WhatsApp Business Account ID
   - **Access Token**: Generar token permanente en System Users

3. **Configurar Webhook**:
   - URL: `https://tu-dominio.com/api/webhooks/whatsapp`
   - Verify Token: El mismo que configuras en la integración
   - Suscribirse a: `messages`

---

## 12. Flujos de Datos

### 12.1 Flujo OCR Completo

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │     │   Frontend  │     │   Backend   │
│  sube foto  │────▶│  convierte  │────▶│  GraphQL    │
│             │     │  a base64   │     │  Resolver   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
         ┌─────────────────────┐
         │ IntegracionesService│
         │ getDecryptedApiKey  │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │     OCRService      │
         │  - preprocessImage  │
         │  - extractWithOpenAI│
         │  - performMathCheck │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   OpenAI GPT-4o     │
         │   Vision API        │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Datos Extraídos    │
         │  - invoiceNumber    │
         │  - total, tax       │
         │  - vendor, CAE      │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   Frontend          │
         │   auto-rellena      │
         │   formulario        │
         └─────────────────────┘
```

### 12.2 Flujo de Configuración de Integración

```
1. Usuario accede a /settings/integraciones
2. Frontend carga integraciones existentes (GET_INTEGRATIONS_QUERY)
3. Usuario ingresa API Key y datos adicionales
4. Frontend envía UPSERT_INTEGRATION_MUTATION
5. Backend encripta API Key con AES-256-GCM
6. Backend guarda en tabla empresa_integrations
7. Backend invalida caché Redis
8. Usuario prueba conexión (TEST_INTEGRATION_MUTATION)
9. Backend desencripta API Key y hace llamada de prueba
10. Backend actualiza lastTestedAt y lastTestSuccess
```

---

## 13. Seguridad

### 13.1 Encriptación de API Keys

- **Algoritmo**: AES-256-GCM (autenticado)
- **Key derivation**: scrypt con salt fijo
- **Formato almacenado**: `iv:authTag:encryptedData` (hex)
- **IV**: 16 bytes aleatorios por cada encriptación
- **Auth Tag**: 16 bytes para verificar integridad

### 13.2 Buenas Prácticas Implementadas

1. **API Keys nunca se exponen**:
   - Solo se retorna `maskedApiKey` en queries
   - `getDecryptedApiKey` es método interno, no expuesto en GraphQL

2. **Validación de inputs**:
   - Zod schemas en backend
   - Validación de tipos en frontend

3. **Autorización**:
   - Cada operación verifica `empresaId` del contexto
   - Usuarios solo acceden a integraciones de su empresa

4. **Caché seguro**:
   - Redis con TTL de 1 hora
   - Se invalida al modificar integración

5. **Logs de auditoría**:
   - Se registra creación, modificación y eliminación
   - Se registra cada uso de OCR

---

## 14. Testing

### 14.1 Tests de Integración Backend

```typescript
// /backend/api/src/modules/integraciones/__tests__/integraciones.service.test.ts

import { IntegracionesService } from '../integraciones.service';
import { prismaMock } from '@/test/prisma-mock';

describe('IntegracionesService', () => {
  let service: IntegracionesService;

  beforeEach(() => {
    service = new IntegracionesService();
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt correctly', () => {
      const original = 'sk-test-api-key-12345';
      const encrypted = service['encrypt'](original);
      const decrypted = service['decrypt'](encrypted);
      
      expect(encrypted).not.toBe(original);
      expect(decrypted).toBe(original);
    });
  });

  describe('maskApiKey', () => {
    it('should mask API key correctly', () => {
      const apiKey = 'sk-1234567890abcdef';
      const masked = service['maskApiKey'](apiKey);
      
      expect(masked).toBe('sk-1...cdef');
    });
  });

  describe('upsert', () => {
    it('should create new integration', async () => {
      prismaMock.empresaIntegration.findUnique.mockResolvedValue(null);
      prismaMock.empresaIntegration.create.mockResolvedValue({
        id: 'int-1',
        type: 'OPENAI',
        encryptedApiKey: 'encrypted',
        isActive: true,
        // ... otros campos
      });

      const result = await service.upsert('emp-1', 'user-1', {
        type: 'OPENAI',
        apiKey: 'sk-test',
      });

      expect(result.id).toBe('int-1');
      expect(result.maskedApiKey).toBeDefined();
    });
  });
});
```

### 14.2 Tests E2E Frontend

```typescript
// /frontend/web/cypress/e2e/integraciones.cy.ts

describe('Integraciones Page', () => {
  beforeEach(() => {
    cy.login(); // Custom command para login
    cy.visit('/settings/integraciones');
  });

  it('should display integration cards', () => {
    cy.contains('OpenAI').should('be.visible');
    cy.contains('WhatsApp').should('be.visible');
  });

  it('should save OpenAI integration', () => {
    cy.get('[data-testid="openai-apikey-input"]').type('sk-test-key');
    cy.get('[data-testid="openai-save-btn"]').click();
    
    cy.contains('Integración guardada').should('be.visible');
  });

  it('should test integration connection', () => {
    cy.get('[data-testid="openai-test-btn"]').click();
    
    cy.contains('Conexión exitosa').should('be.visible');
  });
});
```

---

## Resumen de Archivos a Crear/Modificar

### Backend

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `prisma/schema.prisma` | Modificar | Agregar modelo EmpresaIntegration y campos OCR en Gasto |
| `src/modules/integraciones/integraciones.schema.ts` | Crear | Schemas Zod |
| `src/modules/integraciones/integraciones.service.ts` | Crear | Servicio con encriptación |
| `src/modules/integraciones/integraciones.resolver.ts` | Crear | Resolvers GraphQL |
| `src/services/ocr/ocr.types.ts` | Crear | Tipos OCR |
| `src/services/ocr/ocr.parser.ts` | Crear | Parser fallback |
| `src/services/ocr/ocr.service.ts` | Crear | Servicio OCR principal |
| `src/services/whatsapp/whatsapp.types.ts` | Crear | Tipos WhatsApp |
| `src/services/whatsapp/whatsapp.service.ts` | Crear | Servicio WhatsApp |

### Frontend

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/graphql/queries/integraciones.ts` | Crear | Queries GraphQL |
| `src/graphql/mutations/integraciones.ts` | Crear | Mutations GraphQL |
| `src/app/(dashboard)/settings/integraciones/page.tsx` | Crear | Página de config |
| `src/app/(dashboard)/gastos/nuevo/page.tsx` | Modificar | Agregar OCR |

---

**Fin del documento**

