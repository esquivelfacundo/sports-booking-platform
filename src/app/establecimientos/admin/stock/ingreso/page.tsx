'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Camera, X, Check, AlertTriangle, 
  Plus, Trash2, Edit2, Search, Package, ArrowLeft,
  Loader2, CheckCircle, XCircle, RefreshCw, Save,
  ChevronDown, Link2, Unlink, Truck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import CreateProductSidebar from '@/components/stock/CreateProductSidebar';
import SupplierSidebar from '@/components/stock/SupplierSidebar';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  // Product association
  productId: string | null;
  productName: string | null;
  matchConfidence: number;
  isNewProduct: boolean;
  // Editable fields
  isEditing: boolean;
}

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  unit: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Supplier {
  id: string;
  name: string;
  businessName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  isActive: boolean;
}

interface OCRData {
  invoiceNumber: string | null;
  invoiceType: string | null;
  invoiceLetter: string | null;
  invoiceDate: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  total: number | null;
  currency: string;
  vendor: {
    name: string | null;
    taxId: string | null;
    address: string | null;
    phone: string | null;
  };
  cae: string | null;
  caeDueDate: string | null;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

type Step = 'upload' | 'review' | 'confirm';

export default function StockIngresoPage() {
  const router = useRouter();
  const { establishment } = useEstablishment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // OCR data
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);
  
  // Line items with product associations
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  
  // Products for matching
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Invoice metadata (editable)
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Supplier management
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierMatchConfidence, setSupplierMatchConfidence] = useState(0);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [showSupplierSidebar, setShowSupplierSidebar] = useState(false);
  const [supplierFromOCR, setSupplierFromOCR] = useState<{name: string | null; taxId: string | null}>({ name: null, taxId: null });
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Product search for association
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState<string | null>(null);
  
  // Create product sidebar
  const [showCreateProductSidebar, setShowCreateProductSidebar] = useState(false);
  const [createProductForItem, setCreateProductForItem] = useState<LineItem | null>(null);
  
  // OpenAI integration status
  const [hasOpenAIIntegration, setHasOpenAIIntegration] = useState<boolean | null>(null);

  // Load products, suppliers and check integration on mount
  useEffect(() => {
    if (establishment?.id) {
      loadProducts();
      loadSuppliers();
      checkOpenAIIntegration();
    }
  }, [establishment?.id]);

  const checkOpenAIIntegration = async () => {
    try {
      const response = await apiClient.getIntegration('OPENAI') as any;
      // Response structure: { success: true, data: { isActive: true, ... } }
      setHasOpenAIIntegration(response?.data?.isActive === true);
    } catch (error) {
      setHasOpenAIIntegration(false);
    }
  };

  const loadProducts = async () => {
    if (!establishment?.id) return;
    setProductsLoading(true);
    try {
      const response = await apiClient.getProducts({
        establishmentId: establishment.id,
        isActive: true
      }) as any;
      const loadedProducts = response.products || [];
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadSuppliers = async () => {
    if (!establishment?.id) return;
    try {
      const response = await apiClient.getSuppliers({
        establishmentId: establishment.id,
        isActive: true
      }) as any;
      setSuppliers(response.suppliers || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  // Match supplier by CUIT or name
  const matchSupplier = async (vendorName: string, vendorTaxId: string) => {
    if (!vendorName && !vendorTaxId) return;
    
    // First try exact CUIT match
    if (vendorTaxId) {
      const exactMatch = suppliers.find(s => 
        s.taxId && s.taxId.replace(/[-\s]/g, '') === vendorTaxId.replace(/[-\s]/g, '')
      );
      if (exactMatch) {
        setSelectedSupplier(exactMatch);
        setSupplierMatchConfidence(1);
        return;
      }
    }
    
    // Try name match
    if (vendorName) {
      const nameLower = vendorName.toLowerCase();
      let bestMatch: { supplier: Supplier; confidence: number } | null = null;
      
      for (const supplier of suppliers) {
        const supplierNameLower = supplier.name.toLowerCase();
        const businessNameLower = supplier.businessName?.toLowerCase() || '';
        
        // Exact name match
        if (supplierNameLower === nameLower || businessNameLower === nameLower) {
          setSelectedSupplier(supplier);
          setSupplierMatchConfidence(1);
          return;
        }
        
        // Partial match
        if (supplierNameLower.includes(nameLower) || nameLower.includes(supplierNameLower) ||
            businessNameLower.includes(nameLower) || nameLower.includes(businessNameLower)) {
          const confidence = Math.min(supplierNameLower.length, nameLower.length) / 
                            Math.max(supplierNameLower.length, nameLower.length) * 0.8;
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = { supplier, confidence };
          }
        }
      }
      
      if (bestMatch && bestMatch.confidence >= 0.5) {
        setSelectedSupplier(bestMatch.supplier);
        setSupplierMatchConfidence(bestMatch.confidence);
        return;
      }
    }
    
    // No match found
    setSelectedSupplier(null);
    setSupplierMatchConfidence(0);
  };

  // Filter suppliers for dropdown
  const filteredSuppliers = supplierSearchQuery.trim() === ''
    ? suppliers
    : suppliers.filter(s =>
        s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
        (s.businessName && s.businessName.toLowerCase().includes(supplierSearchQuery.toLowerCase())) ||
        (s.taxId && s.taxId.includes(supplierSearchQuery))
      );

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessingError(null);
    }
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessingError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Process image with OCR
  const processImage = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const result = await apiClient.processOCR(selectedFile);
      
      if (result.success && result.data) {
        setOcrData(result.data);
        setOcrConfidence(result.confidence);
        setOcrWarnings(result.warnings || []);
        
        // Set invoice metadata
        setInvoiceNumber(result.data.invoiceNumber || '');
        setInvoiceDate(result.data.invoiceDate || new Date().toISOString().split('T')[0]);
        
        // Store OCR vendor info and try to match supplier
        const vendorName = result.data.vendor?.name || '';
        const vendorTaxId = result.data.vendor?.taxId || '';
        setSupplierFromOCR({ name: vendorName, taxId: vendorTaxId });
        
        // Try to match with existing supplier
        await matchSupplier(vendorName, vendorTaxId);
        
        // Process line items and match with products
        const processedItems = await matchProductsToItems(result.data.lineItems || []);
        setLineItems(processedItems);
        
        setCurrentStep('review');
      } else {
        setProcessingError(result.error || 'Error al procesar la imagen');
      }
    } catch (error: any) {
      console.error('OCR Error:', error);
      setProcessingError(error.message || 'Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  // Match OCR items with existing products
  const matchProductsToItems = async (ocrItems: OCRData['lineItems']): Promise<LineItem[]> => {
    return ocrItems.map((item, index) => {
      // Try to find matching product by name similarity
      const match = findBestProductMatch(item.description);
      
      return {
        id: `item-${index}-${Date.now()}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        productId: match?.product?.id || null,
        productName: match?.product?.name || null,
        matchConfidence: match?.confidence || 0,
        isNewProduct: false,
        isEditing: false,
      };
    });
  };

  // Find best matching product by name
  const findBestProductMatch = (description: string): { product: Product; confidence: number } | null => {
    if (!description || products.length === 0) return null;
    
    const descLower = description.toLowerCase().trim();
    let bestMatch: { product: Product; confidence: number } | null = null;
    
    for (const product of products) {
      const nameLower = product.name.toLowerCase();
      
      // Exact match
      if (nameLower === descLower) {
        return { product, confidence: 1 };
      }
      
      // Contains match
      if (nameLower.includes(descLower) || descLower.includes(nameLower)) {
        const confidence = Math.min(nameLower.length, descLower.length) / Math.max(nameLower.length, descLower.length);
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { product, confidence: confidence * 0.8 };
        }
      }
      
      // Word match
      const descWords = descLower.split(/\s+/);
      const nameWords = nameLower.split(/\s+/);
      const matchingWords = descWords.filter(w => nameWords.some(nw => nw.includes(w) || w.includes(nw)));
      
      if (matchingWords.length > 0) {
        const confidence = matchingWords.length / Math.max(descWords.length, nameWords.length);
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { product, confidence: confidence * 0.6 };
        }
      }
    }
    
    // Only return if confidence is above threshold
    return bestMatch && bestMatch.confidence >= 0.3 ? bestMatch : null;
  };

  // Update line item
  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // Associate product to line item
  const associateProduct = (itemId: string, product: Product | null) => {
    updateLineItem(itemId, {
      productId: product?.id || null,
      productName: product?.name || null,
      matchConfidence: product ? 1 : 0,
      isNewProduct: false,
    });
    setShowProductDropdown(null);
    setSearchQuery('');
  };

  // Mark item as new product
  const markAsNewProduct = (itemId: string) => {
    updateLineItem(itemId, {
      productId: null,
      productName: null,
      matchConfidence: 0,
      isNewProduct: true,
    });
    setShowProductDropdown(null);
  };

  // Remove line item
  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  // Add manual line item
  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-new-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      productId: null,
      productName: null,
      matchConfidence: 0,
      isNewProduct: false,
      isEditing: true,
    };
    setLineItems(prev => [...prev, newItem]);
  };

  // Filter products for dropdown
  const filteredProducts = searchQuery.trim() === '' 
    ? products 
    : products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery)) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Calculate totals
  const calculatedTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Save stock movements
  const saveStockMovements = async () => {
    if (!establishment?.id) return;
    
    // Validate all items have product association or are marked as new
    const unassociatedItems = lineItems.filter(item => !item.productId && !item.isNewProduct);
    if (unassociatedItems.length > 0) {
      setSaveError('Todos los items deben estar asociados a un producto o marcados como nuevo producto');
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // First, create any new products
      const newProductItems = lineItems.filter(item => item.isNewProduct);
      const productIdMap: Record<string, string> = {};
      
      for (const item of newProductItems) {
        const newProduct = await apiClient.createProduct({
          establishmentId: establishment.id,
          name: item.description,
          costPrice: item.unitPrice,
          salePrice: item.unitPrice * 1.3, // 30% margin by default
          currentStock: 0,
          minStock: 0,
          unit: 'unidad',
          trackStock: true,
          isActive: true,
        }) as any;
        
        productIdMap[item.id] = newProduct.product.id;
      }
      
      // Create stock movements for each item
      for (const item of lineItems) {
        const productId = item.isNewProduct ? productIdMap[item.id] : item.productId;
        
        if (!productId) continue;
        
        await apiClient.createStockMovement({
          establishmentId: establishment.id,
          productId,
          type: 'entrada',
          quantity: item.quantity,
          unitCost: item.unitPrice,
          reason: 'Ingreso por factura',
          notes: `Factura: ${invoiceNumber || 'Sin número'} - Proveedor: ${selectedSupplier?.name || supplierFromOCR.name || 'Sin proveedor'}`,
          invoiceNumber: invoiceNumber || undefined,
        });
      }
      
      // Success - go to confirmation
      setCurrentStep('confirm');
    } catch (error: any) {
      console.error('Error saving stock movements:', error);
      setSaveError(error.message || 'Error al guardar los movimientos de stock');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrData(null);
    setOcrConfidence(0);
    setOcrWarnings([]);
    setLineItems([]);
    setInvoiceNumber('');
    setInvoiceDate('');
    setSelectedSupplier(null);
    setSupplierMatchConfidence(0);
    setSupplierFromOCR({ name: null, taxId: null });
    setNotes('');
    setCurrentStep('upload');
    setProcessingError(null);
    setSaveError(null);
  };

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/establecimientos/admin/stock')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Ingreso de Stock con OCR</h1>
            <p className="text-gray-400 text-sm">Cargá una factura y el sistema extraerá los productos automáticamente</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            {[
              { step: 'upload', label: 'Cargar Factura', icon: Upload },
              { step: 'review', label: 'Revisar Items', icon: Edit2 },
              { step: 'confirm', label: 'Confirmado', icon: Check },
            ].map((s, index) => {
              const Icon = s.icon;
              const isActive = currentStep === s.step;
              const isPast = ['upload', 'review', 'confirm'].indexOf(currentStep) > index;
              
              return (
                <div key={s.step} className="flex items-center">
                  {index > 0 && (
                    <div className={`w-12 h-0.5 ${isPast ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                  )}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isActive ? 'bg-emerald-500/20 text-emerald-400' : 
                    isPast ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-800 text-gray-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* OpenAI Integration Warning */}
              {hasOpenAIIntegration === false && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-medium">Integración de OpenAI no configurada</p>
                    <p className="text-yellow-300/70 text-sm mt-1">
                      Para usar el OCR necesitás configurar tu API Key de OpenAI en la sección de{' '}
                      <button 
                        onClick={() => router.push('/establecimientos/admin/integraciones')}
                        className="underline hover:text-yellow-300"
                      >
                        Integraciones
                      </button>.
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  selectedFile 
                    ? 'border-emerald-500 bg-emerald-500/5' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-lg overflow-hidden bg-gray-900">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-emerald-400 font-medium">{selectedFile?.name}</p>
                    <p className="text-gray-500 text-sm">Click para cambiar la imagen</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Arrastrá una imagen o hacé click para seleccionar</p>
                      <p className="text-gray-500 text-sm mt-1">Soporta JPG, PNG, WEBP</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {processingError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Error al procesar</p>
                    <p className="text-red-300 text-sm">{processingError}</p>
                  </div>
                </div>
              )}

              {/* Process Button */}
              <div className="flex justify-center">
                <button
                  onClick={processImage}
                  disabled={!selectedFile || isProcessing}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando con OCR...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Procesar Factura
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {currentStep === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* OCR Confidence & Warnings */}
              <div className="flex flex-wrap gap-4">
                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  ocrConfidence >= 0.8 ? 'bg-emerald-500/20 text-emerald-400' :
                  ocrConfidence >= 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {ocrConfidence >= 0.8 ? <CheckCircle className="w-4 h-4" /> :
                   ocrConfidence >= 0.5 ? <AlertTriangle className="w-4 h-4" /> :
                   <XCircle className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    Confianza: {Math.round(ocrConfidence * 100)}%
                  </span>
                </div>
                
                {ocrWarnings.map((warning, i) => (
                  <div key={i} className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {warning}
                  </div>
                ))}
              </div>

              {/* Invoice Info */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Datos de la Factura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Número de Factura</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="0001-00012345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Proveedor</label>
                    <div className="relative">
                      {selectedSupplier ? (
                        <div className="flex items-center gap-2">
                          <div className={`flex-1 px-3 py-2 rounded-lg flex items-center gap-2 ${
                            supplierMatchConfidence >= 0.8 ? 'bg-emerald-500/20 border border-emerald-500/30' :
                            supplierMatchConfidence >= 0.5 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                            'bg-gray-700 border border-gray-600'
                          }`}>
                            <Truck className="w-4 h-4 text-emerald-400" />
                            <span className="text-white">{selectedSupplier.name}</span>
                            {selectedSupplier.taxId && (
                              <span className="text-gray-400 text-sm">({selectedSupplier.taxId})</span>
                            )}
                            {supplierMatchConfidence < 1 && supplierMatchConfidence > 0 && (
                              <span className="text-xs text-yellow-400">
                                ({Math.round(supplierMatchConfidence * 100)}% match)
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedSupplier(null);
                              setShowSupplierDropdown(true);
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
                          className="w-full px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-left flex items-center justify-between hover:bg-yellow-500/20 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            {supplierFromOCR.name || 'Seleccionar proveedor'}
                            {supplierFromOCR.taxId && (
                              <span className="text-gray-400 text-sm">({supplierFromOCR.taxId})</span>
                            )}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Supplier Dropdown */}
                      {showSupplierDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="p-3 border-b border-gray-700">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                type="text"
                                value={supplierSearchQuery}
                                onChange={(e) => setSupplierSearchQuery(e.target.value)}
                                placeholder="Buscar proveedor..."
                                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                                autoFocus
                              />
                            </div>
                          </div>
                          
                          <div className="max-h-60 overflow-y-auto">
                            {/* Create New Option */}
                            <button
                              onClick={() => {
                                setShowSupplierDropdown(false);
                                setShowSupplierSidebar(true);
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-500/10 text-left border-b border-gray-700"
                            >
                              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Plus className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-blue-400 font-medium text-sm">Crear nuevo proveedor</p>
                                <p className="text-gray-500 text-xs">
                                  {supplierFromOCR.name ? `Con datos: ${supplierFromOCR.name}` : 'Agregar proveedor'}
                                </p>
                              </div>
                            </button>
                            
                            {/* Existing Suppliers */}
                            {filteredSuppliers.length === 0 ? (
                              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                No se encontraron proveedores
                              </div>
                            ) : (
                              filteredSuppliers.slice(0, 10).map((supplier) => (
                                <button
                                  key={supplier.id}
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setSupplierMatchConfidence(1);
                                    setShowSupplierDropdown(false);
                                    setSupplierSearchQuery('');
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 text-left"
                                >
                                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{supplier.name}</p>
                                    <p className="text-gray-500 text-xs truncate">
                                      {supplier.taxId || supplier.businessName || 'Sin CUIT'}
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Items de la Factura</h3>
                  <button
                    onClick={addLineItem}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Item
                  </button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-gray-900 rounded-lg p-4 border ${
                        item.productId ? 'border-emerald-500/30' :
                        item.isNewProduct ? 'border-blue-500/30' :
                        'border-yellow-500/30'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="Descripción del producto"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="w-24">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseFloat(e.target.value) || 0;
                              updateLineItem(item.id, { 
                                quantity: qty,
                                total: qty * item.unitPrice
                              });
                            }}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm text-center focus:ring-2 focus:ring-emerald-500"
                            min="0"
                            step="1"
                          />
                          <span className="text-xs text-gray-500 block text-center mt-1">Cantidad</span>
                        </div>

                        {/* Unit Price */}
                        <div className="w-32">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const price = parseFloat(e.target.value) || 0;
                                updateLineItem(item.id, { 
                                  unitPrice: price,
                                  total: item.quantity * price
                                });
                              }}
                              className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <span className="text-xs text-gray-500 block text-center mt-1">Precio Unit.</span>
                        </div>

                        {/* Total */}
                        <div className="w-32 text-right">
                          <p className="text-white font-medium">${item.total.toFixed(2)}</p>
                          <span className="text-xs text-gray-500">Total</span>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Product Association */}
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">Producto:</span>
                          
                          {item.productId ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center gap-2">
                                <Link2 className="w-3 h-3" />
                                {item.productName}
                                {item.matchConfidence < 1 && (
                                  <span className="text-xs opacity-70">
                                    ({Math.round(item.matchConfidence * 100)}% match)
                                  </span>
                                )}
                              </span>
                              <button
                                onClick={() => associateProduct(item.id, null)}
                                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : item.isNewProduct ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm flex items-center gap-2">
                                <Plus className="w-3 h-3" />
                                Crear nuevo producto
                              </span>
                              <button
                                onClick={() => updateLineItem(item.id, { isNewProduct: false })}
                                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative flex-1">
                              <button
                                onClick={() => setShowProductDropdown(showProductDropdown === item.id ? null : item.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/20 transition-colors"
                              >
                                <Unlink className="w-3 h-3" />
                                Sin asociar - Click para asociar
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              
                              {/* Product Dropdown */}
                              {showProductDropdown === item.id && (
                                <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                  <div className="p-3 border-b border-gray-700">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                      <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar producto..."
                                        className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="max-h-60 overflow-y-auto">
                                    {/* Create New Option */}
                                    <button
                                      onClick={() => {
                                        setCreateProductForItem(item);
                                        setShowCreateProductSidebar(true);
                                        setShowProductDropdown(null);
                                      }}
                                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-500/10 text-left border-b border-gray-700"
                                    >
                                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <Plus className="w-4 h-4 text-blue-400" />
                                      </div>
                                      <div>
                                        <p className="text-blue-400 font-medium text-sm">Crear nuevo producto</p>
                                        <p className="text-gray-500 text-xs">Abrir formulario completo</p>
                                      </div>
                                    </button>
                                    
                                    {/* Existing Products */}
                                    {products.length === 0 ? (
                                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                        {productsLoading ? 'Cargando productos...' : 'No hay productos cargados'}
                                      </div>
                                    ) : filteredProducts.length === 0 ? (
                                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                        No se encontraron productos con "{searchQuery}"
                                        <p className="text-xs mt-1">Total de productos: {products.length}</p>
                                      </div>
                                    ) : (
                                      filteredProducts.slice(0, 10).map((product) => (
                                        <button
                                          key={product.id}
                                          onClick={() => associateProduct(item.id, product)}
                                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 text-left"
                                        >
                                          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                            <Package className="w-4 h-4 text-gray-400" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{product.name}</p>
                                            <p className="text-gray-500 text-xs">
                                              Stock: {product.currentStock} | Costo: ${product.costPrice}
                                            </p>
                                          </div>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {lineItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No se detectaron items. Agregá items manualmente.
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-gray-400">Total calculado:</span>
                  <span className="text-2xl font-bold text-white">${calculatedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-800 rounded-xl p-6">
                <label className="block text-sm text-gray-400 mb-2">Notas adicionales</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Observaciones sobre este ingreso..."
                />
              </div>

              {/* Error */}
              {saveError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400">{saveError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Empezar de nuevo
                </button>
                
                <button
                  onClick={saveStockMovements}
                  disabled={isSaving || lineItems.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Confirmar Ingreso
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Ingreso Registrado!</h2>
              <p className="text-gray-400 mb-8">
                Se registraron {lineItems.length} movimientos de stock correctamente.
              </p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Ingreso
                </button>
                <button
                  onClick={() => router.push('/establecimientos/admin/stock')}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                >
                  <Package className="w-5 h-5" />
                  Ver Stock
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Supplier Sidebar */}
      <AnimatePresence>
        {showSupplierSidebar && establishment?.id && (
          <SupplierSidebar
            isOpen={showSupplierSidebar}
            onClose={() => setShowSupplierSidebar(false)}
            establishmentId={establishment.id}
            supplier={null}
            onSave={() => {
              loadSuppliers();
              // Try to match again after creating
              if (supplierFromOCR.name || supplierFromOCR.taxId) {
                setTimeout(() => {
                  matchSupplier(supplierFromOCR.name || '', supplierFromOCR.taxId || '');
                }, 500);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Create Product Sidebar */}
      <AnimatePresence>
        {showCreateProductSidebar && createProductForItem && establishment?.id && (
          <CreateProductSidebar
            isOpen={showCreateProductSidebar}
            onClose={() => {
              setShowCreateProductSidebar(false);
              setCreateProductForItem(null);
            }}
            establishmentId={establishment.id}
            initialName={createProductForItem.description}
            initialCostPrice={createProductForItem.unitPrice}
            onSave={(newProduct) => {
              // Associate the new product with the line item
              if (createProductForItem) {
                associateProduct(createProductForItem.id, {
                  id: newProduct.id,
                  name: newProduct.name,
                  barcode: newProduct.barcode,
                  sku: newProduct.sku,
                  costPrice: newProduct.costPrice,
                  salePrice: newProduct.salePrice,
                  currentStock: newProduct.currentStock,
                  unit: newProduct.unit,
                });
              }
              loadProducts();
              setShowCreateProductSidebar(false);
              setCreateProductForItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
