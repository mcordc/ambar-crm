import React, { useState, useEffect, useMemo, useCallback, useContext, createContext } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import {
  Users, Home, DollarSign, FileDown, Plus, Search, Edit3, Trash2,
  X, Check, Download, Upload, Filter, ChevronDown, ChevronRight,
  Building2, UserCircle, Shield, CreditCard, ClipboardList,
  AlertCircle, TrendingUp, Eye, ArrowLeft, MapPin, Calendar,
  FileText, Phone, Mail, Globe, Briefcase, Copy, Loader2,
  Settings, Printer, Receipt, Languages, LogOut, Lock,
  FolderOpen, File, FileImage, Paperclip, CalendarDays, AlertTriangle, Clock
} from "lucide-react";

// ------------------------- Supabase Client -------------------------
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* ========================================================================
   AMBAR LONGEVITY ESTATE — Client Relationship Management System
   Cumbre Azul Company SRL
   ======================================================================== */

// ------------------------- Constants & Seed Data -------------------------

const VILLA_MODELS = {
  amarillo: { name: "AMBAR Amarillo", sqft: 4305, sqm: 400, color: "#D4A24C", bedrooms: "4+", bathrooms: 5.5 },
  verde:    { name: "AMBAR Verde",    sqft: 5400, sqm: 500, color: "#7A9B76", bedrooms: 4,    bathrooms: 5.5 },
  azul:     { name: "AMBAR Azul",     sqft: 6673, sqm: 620, color: "#4A6FA5", bedrooms: 4,    bathrooms: 5.5 },
};

const PRICE_PER_SQFT = 271;  // USD per ft²
const PRICE_PER_SQM  = 2900; // USD per m²
const SMART_LIVING_PRICE = 71200;

const LOT_SIZES_FT2 = {
  1: 8024.38,  2: 6579.97,  3: 6524.32,  4: 6586.00,  5: 6025.74,
  6: 7214.50,  7: 5689.04,  8: 9352.11,  9: 7648.19, 10: 6957.34,
 11: 8096.93, 12: 8722.44, 13: 8058.29, 14: 5685.92, 15: 5479.90,
 16: 6257.70, 17:10676.71, 18: 6757.90, 19: 9109.27, 20: 8598.53,
 21: 8218.78, 22: 8184.87, 23: 7000.00, 24: 8604.45, 25: 6688.47,
 26:14041.18, 27:14245.05, 28: 7644.52, 29: 5998.83, 30: 7979.97,
 31: 6425.51, 32: 8400.58, 33: 8865.47, 34:16499.23, 35:16366.83,
};

const STATUS_CONFIG = {
  lead:       { label: "Prospecto",      color: "#8B8471", bg: "#EFEAE0" },
  interested: { label: "Interesado",     color: "#4A6FA5", bg: "#E3EBF5" },
  reserved:   { label: "Reservado",      color: "#C9A961", bg: "#F4EBD4" },
  contract:   { label: "Contratado",     color: "#1A2342", bg: "#D9DDE8" },
  active:     { label: "En Pagos",       color: "#7A9B76", bg: "#E2ECE0" },
  completed:  { label: "Completado",     color: "#2D5E3E", bg: "#D4E6D8" },
  cancelled:  { label: "Cancelado",      color: "#B04B3F", bg: "#F3DDD9" },
};

const STATUS_ORDER = ["lead","interested","reserved","contract","active","completed","cancelled"];

const PAYMENT_METHODS = [
  { v: "wire",      l: "Transferencia Bancaria / Wire Transfer" },
  { v: "check",     l: "Cheque Certificado / Certified Check" },
  { v: "cash",      l: "Efectivo / Cash" },
  { v: "crypto",    l: "Criptomoneda / Cryptocurrency" },
  { v: "other",     l: "Otro / Other" },
];

const ID_TYPES = [
  { v: "cedula",    l: "Cédula (Rep. Dom.)" },
  { v: "passport",  l: "Pasaporte / Passport" },
];

const MARITAL_STATUS = ["Soltero/a","Casado/a","Divorciado/a","Viudo/a","Unión Libre"];

const RISK_LEVELS = [
  { v: "low",     l: "Bajo / Low",       color: "#7A9B76" },
  { v: "medium",  l: "Medio / Medium",   color: "#C9A961" },
  { v: "high",    l: "Alto / High",      color: "#B04B3F" },
];

// ------------------------- Internationalization -------------------------

const MARITAL_STATUS_EN = ["Single","Married","Divorced","Widowed","Domestic Partnership"];

const TRANSLATIONS = {
  es: {
    // Brand
    subtitle: "Sistema de gestión de clientes · Blue Amber Zone · Santiago de los Caballeros",
    tagline: "Cumbre Azul Company SRL",
    // Nav
    nav_dashboard: "Dashboard",
    nav_clients: "Clientes",
    nav_villas: "Villas",
    nav_settings: "Ajustes",
    // Common actions
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    close: "Cerrar",
    back: "Volver",
    search: "Buscar",
    filter: "Filtrar",
    new_client: "Nuevo Cliente",
    new_client_short: "Cliente",
    view: "Ver",
    preview: "Previsualizar",
    add: "Añadir",
    saved: "Guardado",
    print_pdf: "Imprimir / Guardar PDF",
    // Toasts
    toast_created: "Cliente creado",
    toast_updated: "Cliente actualizado",
    toast_deleted: "Cliente eliminado",
    toast_excel: "Excel descargado",
    toast_settings: "Configuración guardada",
    // Status
    status_lead: "Prospecto",
    status_interested: "Interesado",
    status_reserved: "Reservado",
    status_contract: "Contratado",
    status_active: "En Pagos",
    status_completed: "Completado",
    status_cancelled: "Cancelado",
    // Risk
    risk_low: "Bajo",
    risk_medium: "Medio",
    risk_high: "Alto",
    // Dashboard
    dash_total_clients: "Clientes Totales",
    dash_total_clients_sub: "activos en pipeline",
    dash_pipeline_total: "Pipeline Total",
    dash_pipeline_total_sub: "Valor de villas contratadas",
    dash_collected: "Recaudado",
    dash_collected_sub: "del pipeline",
    dash_villas_assigned: "Villas Asignadas",
    dash_villas_assigned_sub: "disponibles",
    dash_pipeline_by_status: "Pipeline por Estado",
    dash_recent_activity: "Actividad Reciente",
    dash_no_activity: "Sin actividad aún. Crea tu primer cliente.",
    dash_top_pipeline: "Top Pipeline por Valor",
    dash_no_pipeline: "Sin clientes en pipeline.",
    dash_see_clients: "Ver Clientes",
    dash_villa_map: "Mapa de Villas",
    dash_export_excel: "Exportar a Excel",
    // Clients list
    clients_title: "Clientes",
    clients_count: "de",
    clients_count_label: "clientes",
    clients_search_ph: "Buscar por nombre, email, ID, teléfono, villa...",
    clients_filter_all_status: "Todos los estados",
    clients_filter_all_types: "Todos los tipos",
    clients_individual: "Persona Física",
    clients_entity: "Persona Jurídica",
    clients_sort_updated: "Más recientes",
    clients_sort_name: "Nombre A-Z",
    clients_sort_price: "Mayor precio",
    clients_sort_paid: "% pagado",
    clients_empty_title: "Sin clientes",
    clients_empty_filter: "Ningún cliente coincide con los filtros.",
    clients_empty_new: "Comienza añadiendo tu primer cliente al sistema.",
    clients_empty_action: "Crear primer cliente",
    col_client: "Cliente",
    col_status: "Estado",
    col_villa: "Villa",
    col_total_price: "Precio Total",
    col_progress: "Progreso",
    col_action: "Acción",
    no_villa_assigned: "Sin villa asignada",
    // Villas
    villa_map_title: "Mapa de Villas",
    villa_map_sub: "35 lotes · 12 acres · Blue Amber Zone",
    villa_legend_available: "Disponible",
    villa_models_available: "Modelos Disponibles",
    villa_model_bedrooms: "dorm",
    villa_model_bathrooms: "baños",
    villa_model_from: "Desde",
    villa_terrain: "Terreno",
    // Client form
    form_new_title: "Nuevo Cliente",
    form_edit_title: "Editar Cliente",
    tab_type: "Tipo & Estado",
    tab_personal: "Información",
    tab_villa: "Villa & Precio",
    tab_aml: "AML / PEP / UBOs",
    tab_payments: "Pagos",
    tab_notes: "Notas",
    form_buyer_type: "Tipo de Comprador",
    form_buyer_type_sub: "Selecciona el tipo de comprador según el formulario KYC",
    form_status: "Estado del Cliente",
    form_status_sub: "Etapa actual del cliente en el pipeline de ventas",
    sec_personal: "Información Personal",
    sec_personal_sub: "Datos personales requeridos por el formulario KYC",
    sec_corporate: "Información Corporativa",
    sec_corporate_sub: "Datos corporativos según el formulario KYC",
    sec_legal_rep: "Representante Legal",
    sec_legal_rep_sub: "Persona autorizada a firmar en nombre de la empresa",
    sec_contact: "Contacto",
    sec_villa_select: "Selección de Villa",
    sec_villa_select_sub: "Asignación de lote y modelo de villa",
    sec_packages: "Paquetes",
    sec_packages_sub: "Elementos adicionales opcionales",
    sec_price_adj: "Ajustes de Precio",
    sec_price_breakdown: "Desglose del Precio",
    sec_pep: "PEP · Persona Políticamente Expuesta",
    sec_pep_sub: "Cumplimiento con Ley No. 155-17 contra Lavado de Activos",
    sec_funds: "Origen de Fondos",
    sec_funds_sub: "Origen detallado de los fondos de la transacción",
    sec_ubos: "Beneficiarios Finales (UBOs)",
    sec_ubos_sub: "Propietarios con 10% o más de participación (para personas jurídicas)",
    sec_tx_declaration: "Declaración de la Transacción",
    sec_risk: "Nivel de Riesgo",
    sec_risk_sub: "Evaluación interna del oficial de cumplimiento",
    sec_initial_deposit: "Depósito Inicial",
    sec_initial_deposit_sub: "Depósito inicial del cliente (separado del historial de pagos)",
    sec_payment_history: "Historial de Pagos",
    sec_internal_notes: "Notas Internas",
    sec_internal_notes_sub: "Observaciones, historial de contactos, preferencias del cliente",
    // Form labels
    lbl_pep_is: "El cliente ES una Persona Políticamente Expuesta (PEP)",
    lbl_pep_name: "Nombre del PEP",
    lbl_pep_position: "Cargo y País",
    lbl_pep_relationship: "Relación con el comprador",
    lbl_funds_placeholder: "Ej.: ahorros de salario, venta de propiedad, ganancias de inversiones, herencia, etc.",
    lbl_smart_living: "Smart Living Package",
    lbl_smart_living_desc: "Smart home · multi-zone sound · thermostats · Wi-Fi · seguridad 24/7",
    lbl_furniture: "Paquete de Muebles (Furniture Package)",
    lbl_furniture_price: "Precio del Paquete (USD)",
    lbl_price_override: "Override Precio Base (USD)",
    lbl_price_override_ph: "Dejar vacío para usar modelo",
    lbl_discount: "Descuento (USD)",
    lbl_price_base: "Precio Base Villa",
    lbl_add_ubo: "Añadir Beneficiario",
    lbl_kyc_complete: "KYC Completo (documentos verificados)",
    lbl_initial_deposit: "Monto Depósito Inicial (USD)",
    lbl_initial_deposit_date: "Fecha Depósito Inicial",
    lbl_add_payment: "Añadir Pago",
    lbl_no_payments: "Sin pagos registrados. Añade el primer pago.",
    lbl_payment_progress: "Progreso del Pago",
    lbl_paid: "Pagado",
    lbl_balance: "Balance",
    lbl_total: "TOTAL",
    lbl_total_recorded: "Total registrado",
    lbl_of: "de",
    lbl_notes_ph: "Historial de conversaciones, preferencias, alertas...",
    lbl_assigned_to: "Asignado a (ventas)",
    lbl_lead_source: "Fuente del Lead",
    lbl_lead_source_ph: "Referido, Web, Evento...",
    lbl_save_client: "Guardar Cliente",
    lbl_id_label: "ID",
    lbl_created: "Creado",
    lbl_updated: "Actualizado",
    lbl_validation_name: "El cliente necesita un nombre o razón social antes de guardar.",
    lbl_confirm_delete: "¿Eliminar este cliente permanentemente?",
    lbl_no_clients_export: "No hay clientes para exportar.",
    lbl_export_error: "Error al exportar: ",
    // Ubo columns
    ubo_name: "Nombre",
    ubo_nationality: "Nacionalidad",
    ubo_id: "Número ID",
    ubo_pct: "% Part.",
    // Payment columns
    pay_date: "Fecha",
    pay_amount: "Monto USD",
    pay_type: "Tipo",
    pay_method: "Método",
    pay_reference: "Referencia",
    pay_reference_ph: "#Wire/Cheque",
    pay_type_deposit: "Depósito",
    pay_type_installment: "Cuota",
    pay_type_final: "Pago Final",
    // Client detail
    cd_villa_assigned: "Villa Asignada",
    cd_price_total: "Precio Total",
    cd_price_base: "Base",
    cd_price_smart: "+ Smart",
    cd_price_furniture: "+ Muebles",
    cd_price_discount: "− Desc",
    cd_pay_progress: "Progreso de Pago",
    cd_aml_compliance: "Cumplimiento AML",
    cd_ubos_list: "Beneficiarios Finales",
    cd_payment_history: "Historial de Pagos",
    cd_notes: "Notas Internas",
    cd_payment_instruction: "Instructivo de Pago",
    cd_gen_payment_btn: "Instructivo de Pago",
    cd_unnamed: "(Sin nombre)",
    // Info row labels
    info_name: "Nombre",
    info_nationality: "Nacionalidad",
    info_id: "ID",
    info_country_issue: "País Emisión",
    info_dob: "Nacimiento",
    info_pob: "Lugar Nacimiento",
    info_marital: "Estado Civil",
    info_spouse: "Cónyuge",
    info_profession: "Profesión",
    info_employer: "Empleador",
    info_position: "Cargo",
    info_tax_id: "ID Fiscal",
    info_legal_name: "Razón Social",
    info_rnc: "RNC",
    info_incorp: "Constitución",
    info_country: "País",
    info_activity: "Actividad",
    info_legal_rep: "Rep. Legal",
    info_legal_rep_pos: "Cargo Rep.",
    info_legal_rep_id: "ID Rep.",
    info_website: "Website",
    info_email: "Email",
    info_phone: "Teléfono",
    info_phone2: "Teléfono 2",
    info_address: "Dirección",
    info_pep: "PEP",
    info_pep_yes: "SÍ — ",
    info_pep_no: "NO",
    info_payment_method: "Método de Pago",
    info_origin_bank: "Banco Origen",
    info_source_funds: "Origen de Fondos",
    // Settings view
    settings_title: "Configuración",
    settings_sub: "Datos que aparecerán en los instructivos de pago y documentos oficiales",
    settings_company: "Datos de la Empresa",
    settings_company_sub: "Información legal del desarrollador del proyecto",
    settings_bank: "Datos Bancarios para Wire Transfer",
    settings_bank_sub: "Estos datos aparecerán exactamente así en los instructivos de pago que envíes al cliente",
    settings_payments: "Parámetros de Pago",
    settings_payments_sub: "Configuración de los instructivos de pago",
    settings_intermediary: "Banco Intermediario / Intermediary Bank (opcional)",
    settings_save: "Guardar Configuración",
    settings_validity: "Vigencia del Instructivo (días)",
    settings_email_comprobantes: "Email para envío de comprobantes",
    settings_legal_name: "Razón Social",
    settings_rnc: "RNC",
    settings_address: "Dirección",
    settings_phone: "Teléfono",
    settings_email_primary: "Email Principal",
    settings_website: "Website",
    // Payment instruction modal
    pi_modal_title: "Generar Instructivo de Pago",
    pi_client: "Cliente",
    pi_villa: "Villa",
    pi_villa_none: "no asignada",
    pi_total_price: "Precio total",
    pi_balance_pending: "Balance pendiente",
    pi_details: "Detalles del Pago Solicitado",
    pi_details_sub: "Los datos del banco se toman de Configuración",
    pi_concept: "Concepto del Pago",
    pi_amount: "Monto a Solicitar (USD)",
    pi_amount_suggested: "Sugerido",
    pi_custom_concept: "Especificar Concepto (ES / EN, separado por ' / ')",
    pi_custom_concept_ph: "Ej: Ajuste de precio / Price adjustment",
    pi_payment_number: "Número de Pago (opcional)",
    pi_payment_number_ph: "Ej: 2 de 5",
    pi_validity_label: "Vigencia",
    pi_validity_editable: "días (editable en Configuración)",
    pi_additional_notes: "Notas Adicionales (opcional)",
    pi_additional_notes_ph: "Cualquier instrucción especial que el cliente deba conocer...",
    pi_reference_unique: "Referencia Única para Reconciliación",
    pi_bank_incomplete: "Datos bancarios incompletos",
    pi_bank_incomplete_desc: "Completa el número de cuenta, SWIFT y demás datos bancarios en Configuración antes de generar instructivos.",
    // Loading
    loading: "Cargando AMBAR CRM...",
    exporting: "Exportando...",
    // Footer
    footer_copyright: "© 2026 Cumbre Azul Company SRL",
    footer_compliance: "Cumplimiento Ley 155-17 · Santiago, DR",
    // Concept options
    concept_reservation: "Depósito de Reserva / Reservation Deposit",
    concept_initial: "Depósito Inicial / Initial Deposit",
    concept_installment_1: "Cuota 1 de 3 / Installment 1 of 3",
    concept_installment_2: "Cuota 2 de 3 / Installment 2 of 3",
    concept_installment_3: "Cuota 3 de 3 / Installment 3 of 3",
    concept_final: "Pago Final / Final Payment",
    concept_other: "Otro / Other",
    // Marital status (for form dropdown)
    marital_single: "Soltero/a",
    marital_married: "Casado/a",
    marital_divorced: "Divorciado/a",
    marital_widowed: "Viudo/a",
    marital_partnership: "Unión Libre",
    // Documents
    tab_documents: "Documentos",
    doc_section: "Documentos Adjuntos",
    doc_section_sub: "Cédula, pasaporte, carta bancaria, y otros documentos de cumplimiento",
    doc_upload: "Subir Documento",
    doc_upload_help: "Arrastra archivos aquí o haz clic para seleccionar",
    doc_type: "Tipo de Documento",
    doc_type_placeholder: "Seleccionar tipo",
    doc_type_passport: "Pasaporte",
    doc_type_cedula: "Cédula",
    doc_type_drivers: "Licencia de Conducir",
    doc_type_bank_ref: "Carta de Referencia Bancaria",
    doc_type_proof_address: "Justificante de Domicilio",
    doc_type_funds_proof: "Evidencia de Origen de Fondos",
    doc_type_articles: "Artículos de Incorporación",
    doc_type_good_standing: "Certificado de Vigencia",
    doc_type_shareholders: "Lista de Accionistas",
    doc_type_contract: "Contrato",
    doc_type_kyc_form: "Formulario KYC",
    doc_type_other: "Otro",
    doc_no_documents: "No hay documentos adjuntos aún",
    doc_uploading: "Subiendo...",
    doc_uploaded_at: "Subido",
    doc_view: "Ver",
    doc_download: "Descargar",
    doc_delete: "Eliminar",
    doc_confirm_delete: "¿Eliminar este documento permanentemente?",
    doc_file_too_large: "El archivo excede 50 MB",
    doc_upload_error: "Error al subir el documento",
    doc_type_required: "Selecciona el tipo de documento primero",
    // Admin: pricing & villas
    settings_pricing: "Precios Globales",
    settings_pricing_sub: "Precio por área y paquete Smart Living (afecta a todos los cálculos)",
    settings_price_sqft: "Precio por ft² (USD)",
    settings_price_sqm: "Precio por m² (USD)",
    settings_smart_price: "Precio Smart Living (USD)",
    settings_villa_models: "Modelos de Villas",
    settings_villa_models_sub: "Tipos de villas disponibles. Al cambiar ft² se recalcula m² automáticamente",
    settings_add_model: "Añadir Modelo",
    settings_model_id: "ID (código corto, sin espacios)",
    settings_model_name: "Nombre del Modelo",
    settings_model_sqft: "Área ft²",
    settings_model_sqm: "Área m²",
    settings_model_color: "Color",
    settings_model_bedrooms: "Habitaciones",
    settings_model_bathrooms: "Baños",
    settings_model_no_models: "No hay modelos de villas. Agrega el primero.",
    settings_lots: "Lotes / Villas",
    settings_lots_sub: "Lista de los lotes disponibles en el proyecto con su área",
    settings_add_lot: "Añadir Lote",
    settings_lot_number: "Número",
    settings_lot_sqft: "ft²",
    settings_lot_sqm: "m²",
    settings_lots_total: "lotes",
    settings_confirm_delete_model: "¿Eliminar este modelo? Los clientes asignados a este modelo quedarán sin modelo.",
    settings_confirm_delete_lot: "¿Eliminar este lote? Los clientes asignados a él perderán la asignación.",
    settings_model_id_required: "El ID es obligatorio",
    settings_model_id_exists: "Ya existe un modelo con ese ID",
    settings_lot_number_required: "El número de lote es obligatorio",
    settings_lot_exists: "Ya existe un lote con ese número",
    // Commission
    sec_commission: "Comisión del Broker",
    sec_commission_sub: "Información del vendedor/broker externo y cálculo de comisión (no aparece en documentos del cliente)",
    lbl_broker_name: "Nombre del Broker",
    lbl_broker_phone: "Teléfono del Broker",
    lbl_broker_email: "Email del Broker",
    lbl_broker_company: "Empresa / Inmobiliaria",
    lbl_commission_pct: "% Comisión",
    lbl_commission_pct_ph: "Deja vacío para usar default",
    lbl_commission_total: "Comisión Total",
    lbl_commission_earned: "Ganado por Broker",
    lbl_commission_paid: "Pagado al Broker",
    lbl_commission_pending: "Pendiente al Broker",
    lbl_broker_paid_amount: "Monto Pagado al Broker (USD)",
    lbl_broker_notes: "Notas sobre el Broker",
    lbl_commission_base_note: "Calculada sobre precio base de villa (no incluye Smart Living ni muebles)",
    lbl_commission_progress_note: "La comisión se gana proporcionalmente según el cliente paga",
    settings_default_commission: "% Comisión Default para Brokers",
    settings_default_commission_sub: "Porcentaje por defecto al asignar un broker a un cliente (editable caso por caso)",
    // Excel
    excel_commission_sheet: "Comisiones",
    // Payment Plan
    tab_payment_plan: "Plan de Pagos",
    sec_payment_plan: "Plan de Pagos Contractual",
    sec_payment_plan_sub: "Cronograma de cuotas acordadas según el contrato de venta",
    plan_apply_template: "Aplicar Plantilla",
    plan_template_title: "Seleccionar Plantilla de Pagos",
    plan_template_sub: "Genera automáticamente las cuotas según el esquema elegido. Podrás editarlas luego.",
    plan_add_installment: "Añadir Cuota",
    plan_no_plan: "Este cliente no tiene plan de pagos. Aplica una plantilla o añade cuotas manualmente.",
    plan_concept: "Concepto",
    plan_concept_en: "Concepto (Inglés)",
    plan_due_date: "Fecha Vencimiento",
    plan_amount: "Monto (USD)",
    plan_percentage: "% del Total",
    plan_paid_amount: "Pagado",
    plan_status: "Estado",
    plan_notes: "Notas",
    plan_actions: "Acciones",
    plan_total_expected: "Total Plan",
    plan_total_received: "Recibido",
    plan_total_pending: "Pendiente",
    plan_villa_total: "Precio Villa",
    plan_mismatch_warning: "El total del plan no coincide con el precio de la villa",
    plan_confirm_replace: "¿Reemplazar el plan actual? Las cuotas existentes se borrarán.",
    plan_confirm_delete_inst: "¿Eliminar esta cuota?",
    plan_start_date: "Fecha de Inicio",
    plan_start_date_help: "La primera cuota usará esta fecha; las demás se espaciarán automáticamente",
    plan_apply: "Aplicar",
    plan_include_in_pdf: "Incluir cronograma en el PDF del instructivo",
    // Status
    plan_status_paid: "Pagada",
    plan_status_pending: "Pendiente",
    plan_status_partial: "Parcial",
    plan_status_overdue: "Vencida",
    plan_status_partial_overdue: "Parcial Vencida",
    // Dashboard alerts
    alert_overdue_installments: "cuotas vencidas",
    alert_upcoming_installments: "cuotas próximas a vencer",
    // PDF
    pdf_payment_schedule: "Cronograma de Pagos",
    pdf_payment_schedule_en: "Payment Schedule",
    pdf_current_payment: "ESTA CUOTA",
    pdf_current_payment_en: "THIS PAYMENT",
    // Payment instruction ↔ plan integration
    pi_select_installment: "Cuota del Plan",
    pi_select_installment_help: "Selecciona una cuota del plan de pagos para autocompletar los datos",
    pi_select_installment_ph: "— Seleccionar cuota —",
    pi_no_pending: "No hay cuotas pendientes en el plan",
    pi_linked_to: "Vinculado a Cuota",
    pi_unlock_amount: "Monto Diferente",
    pi_unlock_warning: "El monto fue modificado manualmente. Asegúrate de que esto sea correcto.",
    pi_relock: "Restaurar",
    pi_free_mode: "Instructivo Libre",
    pi_free_mode_note: "Este cliente no tiene plan de pagos. Puedes crear un instructivo con cualquier monto.",
    pi_plan_balance: "Balance pendiente",
    pi_inst_paid_already: "Ya pagado de esta cuota",
    // Post-print registration
    pi_register_payment: "¿Registrar este instructivo como pago pendiente en el cliente?",
    pi_register_yes: "Sí, registrar",
    pi_register_no: "No, solo imprimir",
    pi_registered: "Pago pendiente registrado y vinculado a la cuota",
    // Email & WhatsApp sending
    pi_send: "Enviar",
    pi_send_email: "Enviar por Email",
    pi_send_whatsapp: "Enviar por WhatsApp",
    pi_send_email_missing: "Este cliente no tiene email registrado. Agrégalo en la ficha antes de enviar.",
    pi_send_phone_missing: "Este cliente no tiene teléfono registrado. Agrégalo en la ficha antes de enviar.",
    pi_send_phone_invalid: "El teléfono registrado no parece válido. Revísalo en la ficha del cliente.",
    pi_pdf_downloaded: "PDF descargado. Adjúntalo al correo/mensaje antes de enviar.",
    pi_email_subject: "Instructivo de Pago AMBAR",
    pi_email_greeting_es: "Estimado/a",
    pi_email_greeting_en: "Dear",
    pi_email_body_intro_es: "Adjunto encontrará el instructivo de pago para su villa en AMBAR Longevity Estate.",
    pi_email_body_intro_en: "Please find attached the payment instruction for your villa at AMBAR Longevity Estate.",
    pi_email_body_ref_es: "Referencia",
    pi_email_body_amount_es: "Monto",
    pi_email_body_due_es: "Vencimiento",
    pi_email_body_concept_es: "Concepto",
    pi_email_body_note_es: "Por favor incluya la referencia exacta en el concepto del wire. Todas las comisiones bancarias son por cuenta del remitente (OUR). Envíe el comprobante a",
    pi_email_body_note_en: "Please include the exact reference in the wire memo. All bank fees are on the sender's account (OUR). Send the wire confirmation to",
    pi_email_body_closing_es: "Cordialmente,",
    pi_email_body_closing_en: "Sincerely,",
    pi_email_body_team_es: "Equipo AMBAR Longevity Estate",
    pi_email_body_team_en: "AMBAR Longevity Estate Team",
    pi_wa_greeting_es: "Hola",
    pi_wa_greeting_en: "Hello",
    pi_wa_body_es: "le envío el instructivo de pago AMBAR",
    pi_wa_body_en: "here is your AMBAR payment instruction",
    pi_wa_ref: "Ref",
    pi_wa_amount_es: "Monto",
    pi_wa_amount_en: "Amount",
    pi_wa_expires_es: "Vence",
    pi_wa_expires_en: "Expires",
    pi_wa_footer_es: "Por favor adjunte el comprobante del wire a",
    pi_wa_footer_en: "Please send the wire receipt to",
    pi_wa_footer_tail_es: "después de transferir.",
    pi_wa_footer_tail_en: "after transferring.",
    pi_send_help: "Se descargará el PDF y se abrirá la aplicación correspondiente con el mensaje prellenado. Solo adjunta el PDF y envía.",
    // Stage system
    stage_prospect: "Prospecto",
    stage_interested: "Interesado",
    stage_contracted: "Contratado",
    stage_active: "Activo",
    stage_progress: "Progreso del Cliente",
    stage_current: "Fase Actual",
    stage_next: "Próxima Fase",
    stage_requirements: "Requisitos para avanzar",
    stage_all_complete: "¡Listo para avanzar!",
    stage_missing: "Falta completar",
    stage_advance_to: "Marcar como",
    stage_go_to_tab: "Ir a esta sección",
    stage_confirm_advance: "¿Confirmar avance a la siguiente fase?",
    stage_advanced: "Cliente avanzado a la siguiente fase",
    // Quick create wizard
    qc_title: "Nuevo Prospecto",
    qc_sub: "Información básica para empezar. Podrás completar los demás datos cuando el cliente avance de fase.",
    qc_type: "Tipo de cliente",
    qc_type_individual: "Persona Física",
    qc_type_entity: "Empresa",
    qc_name: "Nombre completo",
    qc_company: "Razón social",
    qc_email: "Email",
    qc_phone: "Teléfono",
    qc_source: "¿Cómo nos conoció? (opcional)",
    qc_source_ph: "Referido, redes sociales, broker, etc.",
    qc_create: "Crear Prospecto",
    qc_need_name: "El nombre es obligatorio",
    qc_need_contact: "Al menos un email o teléfono es requerido",
    // Edit full
    edit_full: "Editar Completo (Vista Avanzada)",
    edit_full_help: "Abre el formulario completo con todas las pestañas para editar cualquier detalle",
    // Payment terms (phase 4)
    sec_payment_terms: "Términos de Pago Personalizados",
    sec_payment_terms_sub: "Configuración específica del contrato de este cliente",
    lbl_currency: "Moneda del Contrato",
    lbl_grace_days: "Días de Gracia antes de Vencer",
    lbl_grace_days_help: "Cuántos días después de la fecha de vencimiento aún no se considera atrasado",
    lbl_late_interest: "% Interés por Atraso (anual)",
    lbl_late_interest_help: "Tasa anual que se aplicaría por atrasos (informativo)",
    lbl_contract_notes: "Notas Contractuales Especiales",
    lbl_contract_notes_ph: "Cláusulas específicas, condiciones particulares, etc. Visible solo internamente.",
    lbl_contract_date: "Fecha de Firma del Contrato",
  },
  en: {
    // Brand
    subtitle: "Client management system · Blue Amber Zone · Santiago de los Caballeros",
    tagline: "Cumbre Azul Company SRL",
    // Nav
    nav_dashboard: "Dashboard",
    nav_clients: "Clients",
    nav_villas: "Villas",
    nav_settings: "Settings",
    // Common actions
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    back: "Back",
    search: "Search",
    filter: "Filter",
    new_client: "New Client",
    new_client_short: "Client",
    view: "View",
    preview: "Preview",
    add: "Add",
    saved: "Saved",
    print_pdf: "Print / Save PDF",
    // Toasts
    toast_created: "Client created",
    toast_updated: "Client updated",
    toast_deleted: "Client deleted",
    toast_excel: "Excel downloaded",
    toast_settings: "Settings saved",
    // Status
    status_lead: "Lead",
    status_interested: "Interested",
    status_reserved: "Reserved",
    status_contract: "Contracted",
    status_active: "In Payment",
    status_completed: "Completed",
    status_cancelled: "Cancelled",
    // Risk
    risk_low: "Low",
    risk_medium: "Medium",
    risk_high: "High",
    // Dashboard
    dash_total_clients: "Total Clients",
    dash_total_clients_sub: "active in pipeline",
    dash_pipeline_total: "Total Pipeline",
    dash_pipeline_total_sub: "Value of contracted villas",
    dash_collected: "Collected",
    dash_collected_sub: "of pipeline",
    dash_villas_assigned: "Assigned Villas",
    dash_villas_assigned_sub: "available",
    dash_pipeline_by_status: "Pipeline by Status",
    dash_recent_activity: "Recent Activity",
    dash_no_activity: "No activity yet. Create your first client.",
    dash_top_pipeline: "Top Pipeline by Value",
    dash_no_pipeline: "No clients in pipeline.",
    dash_see_clients: "View Clients",
    dash_villa_map: "Villa Map",
    dash_export_excel: "Export to Excel",
    // Clients list
    clients_title: "Clients",
    clients_count: "of",
    clients_count_label: "clients",
    clients_search_ph: "Search by name, email, ID, phone, villa...",
    clients_filter_all_status: "All statuses",
    clients_filter_all_types: "All types",
    clients_individual: "Individual",
    clients_entity: "Legal Entity",
    clients_sort_updated: "Most recent",
    clients_sort_name: "Name A-Z",
    clients_sort_price: "Highest price",
    clients_sort_paid: "% paid",
    clients_empty_title: "No clients",
    clients_empty_filter: "No clients match the filters.",
    clients_empty_new: "Start by adding your first client to the system.",
    clients_empty_action: "Create first client",
    col_client: "Client",
    col_status: "Status",
    col_villa: "Villa",
    col_total_price: "Total Price",
    col_progress: "Progress",
    col_action: "Action",
    no_villa_assigned: "No villa assigned",
    // Villas
    villa_map_title: "Villa Map",
    villa_map_sub: "35 lots · 12 acres · Blue Amber Zone",
    villa_legend_available: "Available",
    villa_models_available: "Available Models",
    villa_model_bedrooms: "bed",
    villa_model_bathrooms: "bath",
    villa_model_from: "From",
    villa_terrain: "Lot",
    // Client form
    form_new_title: "New Client",
    form_edit_title: "Edit Client",
    tab_type: "Type & Status",
    tab_personal: "Information",
    tab_villa: "Villa & Pricing",
    tab_aml: "AML / PEP / UBOs",
    tab_payments: "Payments",
    tab_notes: "Notes",
    form_buyer_type: "Buyer Type",
    form_buyer_type_sub: "Select the type of buyer according to the KYC form",
    form_status: "Client Status",
    form_status_sub: "Current stage of the client in the sales pipeline",
    sec_personal: "Personal Information",
    sec_personal_sub: "Personal data required by the KYC form",
    sec_corporate: "Corporate Information",
    sec_corporate_sub: "Corporate data per the KYC form",
    sec_legal_rep: "Legal Representative",
    sec_legal_rep_sub: "Person authorized to sign on behalf of the company",
    sec_contact: "Contact",
    sec_villa_select: "Villa Selection",
    sec_villa_select_sub: "Lot assignment and villa model",
    sec_packages: "Packages",
    sec_packages_sub: "Optional additional elements",
    sec_price_adj: "Price Adjustments",
    sec_price_breakdown: "Price Breakdown",
    sec_pep: "PEP · Politically Exposed Person",
    sec_pep_sub: "Compliance with Law No. 155-17 against Money Laundering",
    sec_funds: "Source of Funds",
    sec_funds_sub: "Detailed origin of the funds for the transaction",
    sec_ubos: "Ultimate Beneficial Owners (UBOs)",
    sec_ubos_sub: "Owners with 10% or more equity (for legal entities)",
    sec_tx_declaration: "Transaction Declaration",
    sec_risk: "Risk Level",
    sec_risk_sub: "Internal assessment by the compliance officer",
    sec_initial_deposit: "Initial Deposit",
    sec_initial_deposit_sub: "Client's initial deposit (separate from payment history)",
    sec_payment_history: "Payment History",
    sec_internal_notes: "Internal Notes",
    sec_internal_notes_sub: "Observations, contact history, client preferences",
    // Form labels
    lbl_pep_is: "The client IS a Politically Exposed Person (PEP)",
    lbl_pep_name: "PEP Name",
    lbl_pep_position: "Position and Country",
    lbl_pep_relationship: "Relationship to buyer",
    lbl_funds_placeholder: "E.g.: savings from salary, sale of property, investment profits, inheritance, etc.",
    lbl_smart_living: "Smart Living Package",
    lbl_smart_living_desc: "Smart home · multi-zone sound · thermostats · Wi-Fi · 24/7 security",
    lbl_furniture: "Furniture Package",
    lbl_furniture_price: "Package Price (USD)",
    lbl_price_override: "Base Price Override (USD)",
    lbl_price_override_ph: "Leave empty to use model default",
    lbl_discount: "Discount (USD)",
    lbl_price_base: "Villa Base Price",
    lbl_add_ubo: "Add Beneficial Owner",
    lbl_kyc_complete: "KYC Complete (documents verified)",
    lbl_initial_deposit: "Initial Deposit Amount (USD)",
    lbl_initial_deposit_date: "Initial Deposit Date",
    lbl_add_payment: "Add Payment",
    lbl_no_payments: "No payments recorded. Add the first payment.",
    lbl_payment_progress: "Payment Progress",
    lbl_paid: "Paid",
    lbl_balance: "Balance",
    lbl_total: "TOTAL",
    lbl_total_recorded: "Total recorded",
    lbl_of: "of",
    lbl_notes_ph: "Conversation history, preferences, alerts...",
    lbl_assigned_to: "Assigned to (sales)",
    lbl_lead_source: "Lead Source",
    lbl_lead_source_ph: "Referral, Web, Event...",
    lbl_save_client: "Save Client",
    lbl_id_label: "ID",
    lbl_created: "Created",
    lbl_updated: "Updated",
    lbl_validation_name: "The client needs a name or legal name before saving.",
    lbl_confirm_delete: "Permanently delete this client?",
    lbl_no_clients_export: "No clients to export.",
    lbl_export_error: "Export error: ",
    // Ubo columns
    ubo_name: "Name",
    ubo_nationality: "Nationality",
    ubo_id: "ID Number",
    ubo_pct: "% Share",
    // Payment columns
    pay_date: "Date",
    pay_amount: "Amount USD",
    pay_type: "Type",
    pay_method: "Method",
    pay_reference: "Reference",
    pay_reference_ph: "#Wire/Check",
    pay_type_deposit: "Deposit",
    pay_type_installment: "Installment",
    pay_type_final: "Final Payment",
    // Client detail
    cd_villa_assigned: "Assigned Villa",
    cd_price_total: "Total Price",
    cd_price_base: "Base",
    cd_price_smart: "+ Smart",
    cd_price_furniture: "+ Furniture",
    cd_price_discount: "− Disc",
    cd_pay_progress: "Payment Progress",
    cd_aml_compliance: "AML Compliance",
    cd_ubos_list: "Beneficial Owners",
    cd_payment_history: "Payment History",
    cd_notes: "Internal Notes",
    cd_payment_instruction: "Payment Instructions",
    cd_gen_payment_btn: "Payment Instructions",
    cd_unnamed: "(Unnamed)",
    // Info row labels
    info_name: "Name",
    info_nationality: "Nationality",
    info_id: "ID",
    info_country_issue: "Country of Issue",
    info_dob: "Date of Birth",
    info_pob: "Place of Birth",
    info_marital: "Marital Status",
    info_spouse: "Spouse",
    info_profession: "Profession",
    info_employer: "Employer",
    info_position: "Position",
    info_tax_id: "Tax ID",
    info_legal_name: "Legal Name",
    info_rnc: "RNC",
    info_incorp: "Incorporation",
    info_country: "Country",
    info_activity: "Activity",
    info_legal_rep: "Legal Rep.",
    info_legal_rep_pos: "Rep. Position",
    info_legal_rep_id: "Rep. ID",
    info_website: "Website",
    info_email: "Email",
    info_phone: "Phone",
    info_phone2: "Phone 2",
    info_address: "Address",
    info_pep: "PEP",
    info_pep_yes: "YES — ",
    info_pep_no: "NO",
    info_payment_method: "Payment Method",
    info_origin_bank: "Origin Bank",
    info_source_funds: "Source of Funds",
    // Settings view
    settings_title: "Settings",
    settings_sub: "Information that will appear on payment instructions and official documents",
    settings_company: "Company Information",
    settings_company_sub: "Legal information of the project developer",
    settings_bank: "Banking Details for Wire Transfer",
    settings_bank_sub: "This information will appear exactly as entered on payment instructions sent to clients",
    settings_payments: "Payment Parameters",
    settings_payments_sub: "Payment instruction configuration",
    settings_intermediary: "Intermediary Bank (optional)",
    settings_save: "Save Settings",
    settings_validity: "Instruction Validity (days)",
    settings_email_comprobantes: "Email for receipt submission",
    settings_legal_name: "Legal Name",
    settings_rnc: "RNC",
    settings_address: "Address",
    settings_phone: "Phone",
    settings_email_primary: "Primary Email",
    settings_website: "Website",
    // Payment instruction modal
    pi_modal_title: "Generate Payment Instructions",
    pi_client: "Client",
    pi_villa: "Villa",
    pi_villa_none: "not assigned",
    pi_total_price: "Total price",
    pi_balance_pending: "Pending balance",
    pi_details: "Requested Payment Details",
    pi_details_sub: "Bank details are taken from Settings",
    pi_concept: "Payment Concept",
    pi_amount: "Amount to Request (USD)",
    pi_amount_suggested: "Suggested",
    pi_custom_concept: "Specify Concept (ES / EN, separated by ' / ')",
    pi_custom_concept_ph: "E.g.: Ajuste de precio / Price adjustment",
    pi_payment_number: "Payment Number (optional)",
    pi_payment_number_ph: "E.g.: 2 of 5",
    pi_validity_label: "Validity",
    pi_validity_editable: "days (editable in Settings)",
    pi_additional_notes: "Additional Notes (optional)",
    pi_additional_notes_ph: "Any special instruction the client should know...",
    pi_reference_unique: "Unique Reconciliation Reference",
    pi_bank_incomplete: "Banking details incomplete",
    pi_bank_incomplete_desc: "Complete the account number, SWIFT and other banking details in Settings before generating instructions.",
    // Loading
    loading: "Loading AMBAR CRM...",
    exporting: "Exporting...",
    // Footer
    footer_copyright: "© 2026 Cumbre Azul Company SRL",
    footer_compliance: "Law 155-17 Compliance · Santiago, DR",
    // Concept options (keep bilingual anchor for legal instrument)
    concept_reservation: "Reservation Deposit / Depósito de Reserva",
    concept_initial: "Initial Deposit / Depósito Inicial",
    concept_installment_1: "Installment 1 of 3 / Cuota 1 de 3",
    concept_installment_2: "Installment 2 of 3 / Cuota 2 de 3",
    concept_installment_3: "Installment 3 of 3 / Cuota 3 de 3",
    concept_final: "Final Payment / Pago Final",
    concept_other: "Other / Otro",
    // Marital status
    marital_single: "Single",
    marital_married: "Married",
    marital_divorced: "Divorced",
    marital_widowed: "Widowed",
    marital_partnership: "Domestic Partnership",
    // Documents
    tab_documents: "Documents",
    doc_section: "Attached Documents",
    doc_section_sub: "ID, passport, bank letter, and other compliance documents",
    doc_upload: "Upload Document",
    doc_upload_help: "Drag files here or click to select",
    doc_type: "Document Type",
    doc_type_placeholder: "Select type",
    doc_type_passport: "Passport",
    doc_type_cedula: "Cédula (Dom. ID)",
    doc_type_drivers: "Driver's License",
    doc_type_bank_ref: "Bank Reference Letter",
    doc_type_proof_address: "Proof of Address",
    doc_type_funds_proof: "Source of Funds Evidence",
    doc_type_articles: "Articles of Incorporation",
    doc_type_good_standing: "Certificate of Good Standing",
    doc_type_shareholders: "Shareholders List",
    doc_type_contract: "Contract",
    doc_type_kyc_form: "KYC Form",
    doc_type_other: "Other",
    doc_no_documents: "No documents attached yet",
    doc_uploading: "Uploading...",
    doc_uploaded_at: "Uploaded",
    doc_view: "View",
    doc_download: "Download",
    doc_delete: "Delete",
    doc_confirm_delete: "Permanently delete this document?",
    doc_file_too_large: "File exceeds 50 MB",
    doc_upload_error: "Error uploading document",
    doc_type_required: "Select the document type first",
    // Admin: pricing & villas
    settings_pricing: "Global Pricing",
    settings_pricing_sub: "Price per area and Smart Living package (affects all calculations)",
    settings_price_sqft: "Price per ft² (USD)",
    settings_price_sqm: "Price per m² (USD)",
    settings_smart_price: "Smart Living Price (USD)",
    settings_villa_models: "Villa Models",
    settings_villa_models_sub: "Available villa types. Changing ft² auto-recalculates m²",
    settings_add_model: "Add Model",
    settings_model_id: "ID (short code, no spaces)",
    settings_model_name: "Model Name",
    settings_model_sqft: "Area ft²",
    settings_model_sqm: "Area m²",
    settings_model_color: "Color",
    settings_model_bedrooms: "Bedrooms",
    settings_model_bathrooms: "Bathrooms",
    settings_model_no_models: "No villa models. Add the first one.",
    settings_lots: "Lots / Villas",
    settings_lots_sub: "List of available lots in the project with their areas",
    settings_add_lot: "Add Lot",
    settings_lot_number: "Number",
    settings_lot_sqft: "ft²",
    settings_lot_sqm: "m²",
    settings_lots_total: "lots",
    settings_confirm_delete_model: "Delete this model? Clients assigned to this model will have no model.",
    settings_confirm_delete_lot: "Delete this lot? Clients assigned to it will lose their assignment.",
    settings_model_id_required: "ID is required",
    settings_model_id_exists: "A model with that ID already exists",
    settings_lot_number_required: "Lot number is required",
    settings_lot_exists: "A lot with that number already exists",
    // Commission
    sec_commission: "Broker Commission",
    sec_commission_sub: "External broker/agent information and commission calculation (does not appear in client documents)",
    lbl_broker_name: "Broker Name",
    lbl_broker_phone: "Broker Phone",
    lbl_broker_email: "Broker Email",
    lbl_broker_company: "Company / Agency",
    lbl_commission_pct: "Commission %",
    lbl_commission_pct_ph: "Leave empty to use default",
    lbl_commission_total: "Total Commission",
    lbl_commission_earned: "Earned by Broker",
    lbl_commission_paid: "Paid to Broker",
    lbl_commission_pending: "Pending to Broker",
    lbl_broker_paid_amount: "Amount Paid to Broker (USD)",
    lbl_broker_notes: "Broker Notes",
    lbl_commission_base_note: "Calculated on villa base price (excludes Smart Living and furniture)",
    lbl_commission_progress_note: "Commission is earned proportionally as client pays",
    settings_default_commission: "Default Broker Commission %",
    settings_default_commission_sub: "Default percentage when assigning a broker to a client (editable per case)",
    // Excel
    excel_commission_sheet: "Commissions",
    // Payment Plan
    tab_payment_plan: "Payment Plan",
    sec_payment_plan: "Contractual Payment Plan",
    sec_payment_plan_sub: "Schedule of installments agreed per the sales contract",
    plan_apply_template: "Apply Template",
    plan_template_title: "Select Payment Template",
    plan_template_sub: "Automatically generate installments from the chosen schedule. You can edit them afterwards.",
    plan_add_installment: "Add Installment",
    plan_no_plan: "This client has no payment plan. Apply a template or add installments manually.",
    plan_concept: "Concept",
    plan_concept_en: "Concept (English)",
    plan_due_date: "Due Date",
    plan_amount: "Amount (USD)",
    plan_percentage: "% of Total",
    plan_paid_amount: "Paid",
    plan_status: "Status",
    plan_notes: "Notes",
    plan_actions: "Actions",
    plan_total_expected: "Plan Total",
    plan_total_received: "Received",
    plan_total_pending: "Pending",
    plan_villa_total: "Villa Price",
    plan_mismatch_warning: "Plan total does not match villa price",
    plan_confirm_replace: "Replace the current plan? Existing installments will be deleted.",
    plan_confirm_delete_inst: "Delete this installment?",
    plan_start_date: "Start Date",
    plan_start_date_help: "First installment uses this date; others will be spaced automatically",
    plan_apply: "Apply",
    plan_include_in_pdf: "Include schedule in the instruction PDF",
    // Status
    plan_status_paid: "Paid",
    plan_status_pending: "Pending",
    plan_status_partial: "Partial",
    plan_status_overdue: "Overdue",
    plan_status_partial_overdue: "Partial Overdue",
    // Dashboard alerts
    alert_overdue_installments: "overdue installments",
    alert_upcoming_installments: "upcoming installments",
    // PDF
    pdf_payment_schedule: "Payment Schedule",
    pdf_payment_schedule_en: "Cronograma de Pagos",
    pdf_current_payment: "THIS PAYMENT",
    pdf_current_payment_en: "ESTA CUOTA",
    // Payment instruction ↔ plan integration
    pi_select_installment: "Plan Installment",
    pi_select_installment_help: "Select an installment from the payment plan to auto-fill the fields",
    pi_select_installment_ph: "— Select installment —",
    pi_no_pending: "No pending installments in the plan",
    pi_linked_to: "Linked to Installment",
    pi_unlock_amount: "Different Amount",
    pi_unlock_warning: "The amount was manually changed. Make sure this is correct.",
    pi_relock: "Restore",
    pi_free_mode: "Free Instruction",
    pi_free_mode_note: "This client has no payment plan. You can create an instruction with any amount.",
    pi_plan_balance: "Pending balance",
    pi_inst_paid_already: "Already paid on this installment",
    // Post-print registration
    pi_register_payment: "Register this instruction as pending payment on the client?",
    pi_register_yes: "Yes, register",
    pi_register_no: "No, only print",
    pi_registered: "Pending payment registered and linked to installment",
    // Email & WhatsApp sending
    pi_send: "Send",
    pi_send_email: "Send via Email",
    pi_send_whatsapp: "Send via WhatsApp",
    pi_send_email_missing: "This client has no email. Add it to the client file before sending.",
    pi_send_phone_missing: "This client has no phone. Add it to the client file before sending.",
    pi_send_phone_invalid: "The registered phone does not look valid. Check it on the client file.",
    pi_pdf_downloaded: "PDF downloaded. Attach it to the email/message before sending.",
    pi_email_subject: "AMBAR Payment Instruction",
    pi_email_greeting_es: "Estimado/a",
    pi_email_greeting_en: "Dear",
    pi_email_body_intro_es: "Adjunto encontrará el instructivo de pago para su villa en AMBAR Longevity Estate.",
    pi_email_body_intro_en: "Please find attached the payment instruction for your villa at AMBAR Longevity Estate.",
    pi_email_body_ref_es: "Referencia",
    pi_email_body_amount_es: "Monto",
    pi_email_body_due_es: "Vencimiento",
    pi_email_body_concept_es: "Concepto",
    pi_email_body_note_es: "Por favor incluya la referencia exacta en el concepto del wire. Todas las comisiones bancarias son por cuenta del remitente (OUR). Envíe el comprobante a",
    pi_email_body_note_en: "Please include the exact reference in the wire memo. All bank fees are on the sender's account (OUR). Send the wire confirmation to",
    pi_email_body_closing_es: "Cordialmente,",
    pi_email_body_closing_en: "Sincerely,",
    pi_email_body_team_es: "Equipo AMBAR Longevity Estate",
    pi_email_body_team_en: "AMBAR Longevity Estate Team",
    pi_wa_greeting_es: "Hola",
    pi_wa_greeting_en: "Hello",
    pi_wa_body_es: "le envío el instructivo de pago AMBAR",
    pi_wa_body_en: "here is your AMBAR payment instruction",
    pi_wa_ref: "Ref",
    pi_wa_amount_es: "Monto",
    pi_wa_amount_en: "Amount",
    pi_wa_expires_es: "Vence",
    pi_wa_expires_en: "Expires",
    pi_wa_footer_es: "Por favor adjunte el comprobante del wire a",
    pi_wa_footer_en: "Please send the wire receipt to",
    pi_wa_footer_tail_es: "después de transferir.",
    pi_wa_footer_tail_en: "after transferring.",
    pi_send_help: "The PDF will download and the corresponding app will open with the message pre-filled. Just attach the PDF and send.",
    // Stage system
    stage_prospect: "Prospect",
    stage_interested: "Interested",
    stage_contracted: "Contracted",
    stage_active: "Active",
    stage_progress: "Client Progress",
    stage_current: "Current Stage",
    stage_next: "Next Stage",
    stage_requirements: "Requirements to advance",
    stage_all_complete: "Ready to advance!",
    stage_missing: "Still to complete",
    stage_advance_to: "Mark as",
    stage_go_to_tab: "Go to this section",
    stage_confirm_advance: "Confirm advance to next stage?",
    stage_advanced: "Client advanced to next stage",
    // Quick create wizard
    qc_title: "New Prospect",
    qc_sub: "Basic information to start. You can complete the other details as the client progresses.",
    qc_type: "Client type",
    qc_type_individual: "Individual",
    qc_type_entity: "Company",
    qc_name: "Full name",
    qc_company: "Company name",
    qc_email: "Email",
    qc_phone: "Phone",
    qc_source: "How did they hear about us? (optional)",
    qc_source_ph: "Referral, social media, broker, etc.",
    qc_create: "Create Prospect",
    qc_need_name: "Name is required",
    qc_need_contact: "At least email or phone is required",
    // Edit full
    edit_full: "Edit Complete (Advanced View)",
    edit_full_help: "Opens the full form with all tabs to edit any detail",
    // Payment terms (phase 4)
    sec_payment_terms: "Custom Payment Terms",
    sec_payment_terms_sub: "Contract-specific configuration for this client",
    lbl_currency: "Contract Currency",
    lbl_grace_days: "Grace Days before Overdue",
    lbl_grace_days_help: "How many days after the due date before considered overdue",
    lbl_late_interest: "Late Interest % (annual)",
    lbl_late_interest_help: "Annual rate that would apply for delays (informational)",
    lbl_contract_notes: "Special Contract Notes",
    lbl_contract_notes_ph: "Specific clauses, particular conditions, etc. Internal view only.",
    lbl_contract_date: "Contract Signing Date",
  },
};

const LanguageContext = createContext({ lang: "es", t: (k) => k, setLang: () => {} });
const useT = () => useContext(LanguageContext);

const SettingsContext = createContext(DEFAULT_SETTINGS);
const useSettings = () => useContext(SettingsContext);

// ------------------------- Utilities -------------------------

const uid = () => "cli_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const fmtUSD = (n) => {
  const v = Number(n) || 0;
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString("es-DO", { year: "numeric", month: "short", day: "numeric" });
  } catch { return "—"; }
};

// Format phone number for WhatsApp (returns digits-only with country code, or null if invalid)
// Examples:
//  "+1 809 555 1234" -> "18095551234"
//  "809-555-1234"    -> "18095551234"
//  "(829) 555 1234"  -> "18295551234"
//  "+34 611 22 33 44"-> "34611223344"
//  "123"             -> null (too short)
const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return null;
  const raw = String(phone).trim();
  // If starts with +, strip it and keep the rest
  if (raw.startsWith("+")) {
    const digits = raw.slice(1).replace(/\D/g, "");
    return digits.length >= 10 ? digits : null;
  }
  // Otherwise strip all non-digits
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  // 10 digits → assume DR, prepend +1
  if (digits.length === 10) {
    // DR area codes start with 8 or 9 typically; even if not, we default to DR
    return "1" + digits;
  }
  // 11 digits starting with 1 → already US/DR format
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits;
  }
  // Longer numbers → assume they already have country code
  return digits;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

// Format area with language-aware units (ft² for EN, m² for ES)
const fmtArea = (lot, lang) => {
  if (!lot) return "—";
  const sqft = Number(lot.sqft) || 0;
  const sqm = Number(lot.sqm) || (sqft * 0.0929);
  if (lang === "en") return `${sqft.toLocaleString(undefined, { maximumFractionDigits: 2 })} ft²`;
  return `${sqm.toLocaleString(undefined, { maximumFractionDigits: 2 })} m²`;
};

// Format villa model area with language-aware units
const fmtModelArea = (model, lang) => {
  if (!model) return "—";
  const sqft = Number(model.sqft) || 0;
  const sqm = Number(model.sqm) || (sqft * 0.0929);
  if (lang === "en") return `${sqft.toLocaleString()} ft²`;
  return `${sqm.toLocaleString()} m²`;
};

// ------------------------- Client Stages (simplified UX flow) -------------------------

const STAGES = ["prospect", "interested", "contracted", "active"];

const STAGE_CONFIG = {
  prospect: {
    label: "Prospecto",
    labelEn: "Prospect",
    color: "#4A6FA5",
    bg: "#E3EBF5",
    description: "Primer contacto, información básica",
    descriptionEn: "First contact, basic information",
  },
  interested: {
    label: "Interesado",
    labelEn: "Interested",
    color: "#C9A961",
    bg: "#F4EBD4",
    description: "Villa identificada, precio discutido",
    descriptionEn: "Villa identified, price discussed",
  },
  contracted: {
    label: "Contratado",
    labelEn: "Contracted",
    color: "#2D5E3E",
    bg: "#D4E6D8",
    description: "KYC completo, contrato firmado, plan de pagos",
    descriptionEn: "KYC complete, contract signed, payment plan",
  },
  active: {
    label: "Activo",
    labelEn: "Active",
    color: "#1A2342",
    bg: "#D9DDE8",
    description: "Pagos en curso, villa en construcción/entregada",
    descriptionEn: "Payments in progress, villa under construction/delivered",
  },
};

const getClientStage = (client) => {
  if (!client) return "prospect";
  if (client.stage && STAGES.includes(client.stage)) return client.stage;
  if (client.status === "active" || client.status === "completed") return "active";
  if (client.status === "contract" || client.status === "reserved") return "contracted";
  if (client.status === "interested" && client.lotNumber) return "interested";
  return "prospect";
};

const getStageRequirements = (client, targetStage) => {
  const items = [];
  if (targetStage === "interested") {
    const name = client.type === "entity" ? client.companyName : client.fullName;
    items.push({ key: "name", label: "Nombre completo del cliente", labelEn: "Client full name", done: !!name, tab: "personal" });
    items.push({ key: "contact", label: "Email o teléfono", labelEn: "Email or phone", done: !!(client.email || client.phone), tab: "personal" });
    items.push({ key: "villa", label: "Villa asignada", labelEn: "Villa assigned", done: !!client.lotNumber, tab: "villa" });
    items.push({ key: "model", label: "Modelo de villa seleccionado", labelEn: "Villa model selected", done: !!client.villaModel, tab: "villa" });
  }
  if (targetStage === "contracted") {
    items.push({ key: "email", label: "Email confirmado", labelEn: "Email confirmed", done: !!client.email, tab: "personal" });
    items.push({ key: "phone", label: "Teléfono confirmado", labelEn: "Phone confirmed", done: !!client.phone, tab: "personal" });
    items.push({ key: "id", label: "Documento de identidad (cédula o pasaporte)", labelEn: "Identity document (ID or passport)", done: !!(client.idNumber || client.passportNumber || client.rnc), tab: "personal" });
    items.push({ key: "address", label: "Dirección del cliente", labelEn: "Client address", done: !!client.address, tab: "personal" });
    items.push({ key: "kyc", label: "Formulario KYC completado (Ley 155-17)", labelEn: "KYC form complete (Law 155-17)", done: !!client.kycComplete, tab: "aml" });
    items.push({ key: "plan", label: "Plan de pagos definido", labelEn: "Payment plan defined", done: !!(client.paymentPlan && client.paymentPlan.installments && client.paymentPlan.installments.length > 0), tab: "payment_plan" });
    items.push({ key: "contract_doc", label: "Contrato firmado (subido en documentos)", labelEn: "Signed contract (uploaded in documents)", done: !!(client.documents && client.documents.some(d => d.type === "contract")), tab: "documents" });
  }
  if (targetStage === "active") {
    items.push({ key: "initial_payment", label: "Al menos un pago recibido", labelEn: "At least one payment received", done: !!(client.payments && client.payments.some(p => Number(p.amount) > 0)), tab: "payments" });
  }
  return items;
};

const canAdvanceToStage = (client, targetStage) => {
  const reqs = getStageRequirements(client, targetStage);
  if (reqs.length === 0) return false;
  return reqs.every(r => r.done);
};

const getNextStage = (currentStage) => {
  const idx = STAGES.indexOf(currentStage);
  if (idx === -1 || idx === STAGES.length - 1) return null;
  return STAGES[idx + 1];
};

const stageToStatus = (stage) => {
  switch (stage) {
    case "prospect":   return "lead";
    case "interested": return "interested";
    case "contracted": return "contract";
    case "active":     return "active";
    default: return "lead";
  }
};

// Compute villa pricing — takes optional settings (falls back to defaults)
const computePrice = (client, settings) => {
  const models = settings?.villaModels || DEFAULT_SETTINGS.villaModels;
  const pricing = settings?.pricing || DEFAULT_SETTINGS.pricing;
  const pricePerSqft = Number(pricing.pricePerSqft) || 271;
  const smartPrice = Number(pricing.smartLivingPrice) || 71200;

  const model = models[client.villaModel];
  let base = 0;
  if (model) base = Number(model.sqft || 0) * pricePerSqft;
  if (client.basePriceOverride && Number(client.basePriceOverride) > 0) {
    base = Number(client.basePriceOverride);
  }
  const smart = client.smartLivingPackage ? smartPrice : 0;
  const furniture = client.furniturePackage ? (Number(client.furniturePackagePrice) || 0) : 0;
  const discount = Number(client.discount) || 0;
  const subtotal = base + smart + furniture;
  const total = subtotal - discount;
  return { base, smart, furniture, discount, subtotal, total };
};

const paidAmount = (client) => {
  const payments = client.payments || [];
  return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

const paidPercentage = (client, settings) => {
  const { total } = computePrice(client, settings);
  if (!total) return 0;
  return Math.min(100, (paidAmount(client) / total) * 100);
};

// Compute broker commission — calculated on BASE villa price only (not smart living/furniture)
// Returns { pct, totalCommission, earnedByBroker, paidToBroker, pendingToBroker }
const computeCommission = (client, settings) => {
  if (!client.brokerName) {
    return { pct: 0, totalCommission: 0, earnedByBroker: 0, paidToBroker: 0, pendingToBroker: 0 };
  }
  const defaultPct = settings?.pricing?.defaultCommissionPct ?? DEFAULT_SETTINGS.pricing.defaultCommissionPct;
  const pct = client.brokerCommissionPct != null && client.brokerCommissionPct !== ""
    ? Number(client.brokerCommissionPct)
    : defaultPct;

  const price = computePrice(client, settings);
  const totalCommission = (price.base * pct) / 100;

  // Proportional: if client paid X% of total villa price, broker has earned X% of commission
  const paid = paidAmount(client);
  const progress = price.total > 0 ? Math.min(1, paid / price.total) : 0;
  const earnedByBroker = totalCommission * progress;

  const paidToBroker = Number(client.brokerPaidAmount) || 0;
  const pendingToBroker = Math.max(0, earnedByBroker - paidToBroker);

  return { pct, totalCommission, earnedByBroker, paidToBroker, pendingToBroker };
};

// ------------------------- Payment Plan Helpers -------------------------

// Determine status of a single installment based on due date and paid amount
// graceDays (optional) extends the due date before "overdue" kicks in
const getInstallmentStatus = (inst, graceDays = 0) => {
  const amount = Number(inst.amount) || 0;
  const paid = Number(inst.paidAmount) || 0;
  if (paid >= amount && amount > 0) return "paid";
  const today = new Date().toISOString().slice(0, 10);
  const due = inst.dueDate;
  if (due) {
    // Apply grace days: effective due date = due + graceDays
    const grace = Number(graceDays) || 0;
    if (grace > 0) {
      const d = new Date(due);
      d.setDate(d.getDate() + grace);
      const effectiveDue = d.toISOString().slice(0, 10);
      if (today > effectiveDue) return paid > 0 ? "partial_overdue" : "overdue";
    } else if (due < today) {
      return paid > 0 ? "partial_overdue" : "overdue";
    }
  }
  if (paid > 0) return "partial";
  return "pending";
};

// Compute plan totals: expected, received against plan, pending
const computePlanTotals = (plan, graceDays = 0) => {
  if (!plan || !plan.installments || plan.installments.length === 0) {
    return { expected: 0, received: 0, pending: 0, count: 0, paidCount: 0, overdueCount: 0, upcomingCount: 0 };
  }
  let expected = 0, received = 0, paidCount = 0, overdueCount = 0, upcomingCount = 0;
  const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  plan.installments.forEach(inst => {
    const amt = Number(inst.amount) || 0;
    const paid = Number(inst.paidAmount) || 0;
    expected += amt;
    received += Math.min(paid, amt);
    const status = getInstallmentStatus(inst, graceDays);
    if (status === "paid") paidCount++;
    if (status === "overdue" || status === "partial_overdue") overdueCount++;
    if (status === "pending" && inst.dueDate && inst.dueDate <= weekFromNow) upcomingCount++;
  });

  return {
    expected,
    received,
    pending: expected - received,
    count: plan.installments.length,
    paidCount,
    overdueCount,
    upcomingCount,
  };
};

// Apply a template to generate installments. Returns new array.
// totalPrice = full villa price to distribute
// startDate = ISO date (YYYY-MM-DD) for first installment
const applyPaymentTemplate = (templateId, totalPrice, startDate) => {
  const total = Number(totalPrice) || 0;
  const start = startDate || new Date().toISOString().slice(0, 10);

  const addDays = (isoDate, days) => {
    const d = new Date(isoDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const addMonths = (isoDate, months) => {
    const d = new Date(isoDate);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  };

  const mk = (concept, conceptEn, pct, dueDate) => ({
    id: uid(),
    concept,
    conceptEn,
    percentage: pct,
    amount: Math.round(total * pct / 100 * 100) / 100,
    dueDate,
    paidAmount: 0,
    notes: "",
    linkedPaymentIds: [],
  });

  switch (templateId) {
    case "30_70":
      return [
        mk("Depósito de Reserva", "Reservation Deposit", 30, start),
        mk("Saldo al Firmar Escritura", "Balance at Closing", 70, addMonths(start, 3)),
      ];
    case "30_30_40":
      return [
        mk("Depósito de Reserva", "Reservation Deposit", 30, start),
        mk("Firma de Contrato", "Contract Signing", 30, addMonths(start, 2)),
        mk("Entrega", "Delivery", 40, addMonths(start, 6)),
      ];
    case "10_30_30_30":
      return [
        mk("Depósito de Reserva", "Reservation Deposit", 10, start),
        mk("Depósito Inicial", "Initial Deposit", 30, addMonths(start, 1)),
        mk("Pago Intermedio", "Intermediate Payment", 30, addMonths(start, 4)),
        mk("Pago Final", "Final Payment", 30, addMonths(start, 8)),
      ];
    case "5_25_70":
      return [
        mk("Reserva", "Reservation", 5, start),
        mk("Depósito Inicial", "Initial Deposit", 25, addMonths(start, 1)),
        mk("Saldo", "Balance", 70, addMonths(start, 6)),
      ];
    case "5_monthly":
      return Array.from({ length: 5 }, (_, i) =>
        mk(`Cuota ${i + 1} de 5`, `Installment ${i + 1} of 5`, 20, addMonths(start, i))
      );
    case "12_monthly":
      return Array.from({ length: 12 }, (_, i) =>
        mk(`Cuota ${i + 1} de 12`, `Installment ${i + 1} of 12`, 100 / 12, addMonths(start, i))
      );
    default:
      return [];
  }
};

const PAYMENT_TEMPLATES = [
  { id: "30_70",        labelEs: "30% / 70%",              descEs: "Reserva 30%, saldo al firmar",        labelEn: "30% / 70%",            descEn: "30% deposit, 70% at closing" },
  { id: "30_30_40",     labelEs: "30% / 30% / 40%",        descEs: "Reserva, contrato, entrega",          labelEn: "30% / 30% / 40%",      descEn: "Deposit, contract, delivery" },
  { id: "10_30_30_30",  labelEs: "10% / 30% / 30% / 30%",  descEs: "Reserva, inicial, intermedio, final", labelEn: "10% / 30% / 30% / 30%",descEn: "Deposit, initial, intermediate, final" },
  { id: "5_25_70",      labelEs: "5% / 25% / 70%",         descEs: "Reserva mínima, inicial, saldo",      labelEn: "5% / 25% / 70%",       descEn: "Minimum deposit, initial, balance" },
  { id: "5_monthly",    labelEs: "5 cuotas mensuales",     descEs: "20% cada mes por 5 meses",            labelEn: "5 monthly installments",descEn: "20% each for 5 months" },
  { id: "12_monthly",   labelEs: "12 cuotas mensuales",    descEs: "~8.33% cada mes por 12 meses",        labelEn: "12 monthly installments",descEn: "~8.33% each for 12 months" },
  { id: "custom",       labelEs: "Personalizado",          descEs: "Definir cuotas manualmente",           labelEn: "Custom",               descEn: "Define installments manually" },
];

// ------------------------- Paid Percentage -------------------------

// ------------------------- Storage Layer (Supabase) -------------------------

// Cargar todos los clientes desde Supabase
async function loadClientsFromDB() {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("id, data")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(row => row.data);
  } catch (e) {
    console.error("Load clients error:", e);
    return [];
  }
}

// Guardar (crear o actualizar) un cliente en Supabase
async function saveClientToDB(client) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    const { error } = await supabase
      .from("clients")
      .upsert({
        id: client.id,
        data: client,
        updated_by: userId,
        ...(client.createdAt ? {} : { created_by: userId })
      }, { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Save client error:", e);
    return false;
  }
}

// Eliminar un cliente
async function deleteClientFromDB(clientId) {
  try {
    const { error } = await supabase.from("clients").delete().eq("id", clientId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Delete client error:", e);
    return false;
  }
}

// Cargar configuración global
async function loadSettingsFromDB() {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("data")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return data?.data || null;
  } catch (e) {
    console.error("Load settings error:", e);
    return null;
  }
}

// Guardar configuración global
async function saveSettingsToDB(settings) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    const { error } = await supabase
      .from("settings")
      .update({ data: settings, updated_by: userId })
      .eq("id", 1);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Save settings error:", e);
    return false;
  }
}

// ------------------------- Document Storage (Supabase Storage) -------------------------

const DOCUMENTS_BUCKET = "client-documents";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// Subir un documento para un cliente
async function uploadClientDocument(clientId, file, documentType) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds 50 MB");
  }
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${clientId}/${timestamp}_${documentType}_${sanitizedName}`;

  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  return {
    path,
    name: file.name,
    type: documentType,
    mimeType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

// Obtener URL firmada para ver/descargar un documento (válida 1 hora)
async function getDocumentUrl(path) {
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

// Eliminar un documento
async function deleteDocument(path) {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([path]);
  if (error) throw error;
  return true;
}

// Listar documentos de un cliente (por si la lista local se pierde)
async function listClientDocuments(clientId) {
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .list(clientId);
  if (error) {
    console.error("List documents error:", error);
    return [];
  }
  return data || [];
}

// Cargar preferencia de idioma desde localStorage (esto se queda local, es preferencia de UI)
function loadLanguage() {
  try {
    return localStorage.getItem("ambar_lang") || "es";
  } catch {
    return "es";
  }
}

function saveLanguage(lang) {
  try {
    localStorage.setItem("ambar_lang", lang);
  } catch {}
}

const DEFAULT_SETTINGS = {
  company: {
    legalName: "Cumbre Azul Company SRL",
    rnc: "",
    address: "Santiago de los Caballeros, República Dominicana",
    phone: "",
    email: "sales@ambarestate.do",
    website: "ambarestate.do",
  },
  bank: {
    beneficiary: "Cumbre Azul Company SRL",
    bankName: "",
    bankAddress: "",
    accountNumber: "",
    accountType: "Corriente / Checking",
    swift: "",
    aba: "",
    iban: "",
    intermediaryBank: "",
    intermediarySwift: "",
  },
  payments: {
    validityDays: 15,
    remittanceEmail: "payments@ambarestate.do",
  },
  pricing: {
    pricePerSqft: 271,
    pricePerSqm: 2900,
    smartLivingPrice: 71200,
    defaultCommissionPct: 5,
  },
  villaModels: {
    amarillo: { name: "AMBAR Amarillo", sqft: 4305, sqm: 400, color: "#D4A24C", bedrooms: "4+", bathrooms: "5.5" },
    verde:    { name: "AMBAR Verde",    sqft: 5400, sqm: 500, color: "#7A9B76", bedrooms: "4",  bathrooms: "5.5" },
    azul:     { name: "AMBAR Azul",     sqft: 6673, sqm: 620, color: "#4A6FA5", bedrooms: "4",  bathrooms: "5.5" },
  },
  lots: {
    1: { sqft: 8024.38, sqm: 745.50 },   2: { sqft: 6579.97, sqm: 611.30 },
    3: { sqft: 6524.32, sqm: 606.12 },   4: { sqft: 6586.00, sqm: 611.86 },
    5: { sqft: 6025.74, sqm: 559.81 },   6: { sqft: 7214.50, sqm: 670.24 },
    7: { sqft: 5689.04, sqm: 528.53 },   8: { sqft: 9352.11, sqm: 868.87 },
    9: { sqft: 7648.19, sqm: 710.53 },  10: { sqft: 6957.34, sqm: 646.35 },
    11: { sqft: 8096.93, sqm: 752.23 }, 12: { sqft: 8722.44, sqm: 810.34 },
    13: { sqft: 8058.29, sqm: 748.64 }, 14: { sqft: 5685.92, sqm: 528.24 },
    15: { sqft: 5479.90, sqm: 509.10 }, 16: { sqft: 6257.70, sqm: 581.36 },
    17: { sqft: 10676.71, sqm: 991.90 }, 18: { sqft: 6757.90, sqm: 627.82 },
    19: { sqft: 9109.27, sqm: 846.31 }, 20: { sqft: 8598.53, sqm: 798.83 },
    21: { sqft: 8218.78, sqm: 763.54 }, 22: { sqft: 8184.87, sqm: 760.39 },
    23: { sqft: 7000.00, sqm: 650.32 }, 24: { sqft: 8604.45, sqm: 799.38 },
    25: { sqft: 6688.47, sqm: 621.37 }, 26: { sqft: 14041.18, sqm: 1304.46 },
    27: { sqft: 14245.05, sqm: 1323.40 }, 28: { sqft: 7644.52, sqm: 710.19 },
    29: { sqft: 5998.83, sqm: 557.31 }, 30: { sqft: 7979.97, sqm: 741.35 },
    31: { sqft: 6425.51, sqm: 596.96 }, 32: { sqft: 8400.58, sqm: 780.44 },
    33: { sqft: 8865.47, sqm: 823.63 }, 34: { sqft: 16499.23, sqm: 1532.84 },
    35: { sqft: 16366.83, sqm: 1520.54 },
  },
};

async function storageGet(key) {
  try {
    const res = await window.storage.get(key);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}

async function storageSet(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("Storage set failed:", e);
    return false;
  }
}

// ------------------------- Excel Export -------------------------

async function exportToExcel(clients, settings) {
  const sheetjs = XLSX;
  const villaModels = settings?.villaModels || DEFAULT_SETTINGS.villaModels;
  const lots = settings?.lots || DEFAULT_SETTINGS.lots;

  const wb = sheetjs.utils.book_new();

  // Sheet 1: Resumen General de Clientes
  const summary = clients.map(c => {
    const p = computePrice(c, settings);
    const paid = paidAmount(c);
    return {
      "ID Cliente": c.id,
      "Nombre/Razón Social": c.fullName || c.companyName || "",
      "Tipo": c.type === "entity" ? "Persona Jurídica" : "Persona Física",
      "Email": c.email || "",
      "Teléfono": c.phone || "",
      "País": c.nationality || c.incorporationCountry || "",
      "Estado": STATUS_CONFIG[c.status]?.label || c.status,
      "Villa #": c.lotNumber || "",
      "Modelo": villaModels[c.villaModel]?.name || "",
      "Precio Base": p.base,
      "Smart Living": p.smart,
      "Muebles": p.furniture,
      "Descuento": p.discount,
      "Precio Total": p.total,
      "Pagado": paid,
      "Balance": p.total - paid,
      "% Pagado": p.total ? ((paid / p.total) * 100).toFixed(1) + "%" : "0%",
      "Método de Pago": PAYMENT_METHODS.find(m => m.v === c.paymentMethod)?.l || "",
      "Banco Origen": c.originBank || "",
      "PEP": c.isPep ? "SÍ" : "NO",
      "Nivel de Riesgo": RISK_LEVELS.find(r => r.v === c.riskLevel)?.l || "",
      "Fecha Creación": fmtDate(c.createdAt),
      "Notas": c.notes || "",
    };
  });
  const ws1 = sheetjs.utils.json_to_sheet(summary);
  sheetjs.utils.book_append_sheet(wb, ws1, "Resumen");

  // Sheet 2: Información Personal (Individuals)
  const individuals = clients.filter(c => c.type !== "entity").map(c => ({
    "ID": c.id,
    "Nombre Completo": c.fullName || "",
    "Nacionalidad": c.nationality || "",
    "Tipo de ID": ID_TYPES.find(t => t.v === c.idType)?.l || "",
    "Número de ID": c.idNumber || "",
    "País Emisión": c.countryOfIssue || "",
    "Fecha Vencimiento ID": fmtDate(c.idExpiration),
    "ID Fiscal (Extranjero)": c.taxId || "",
    "Fecha de Nacimiento": fmtDate(c.dateOfBirth),
    "Lugar de Nacimiento": c.placeOfBirth || "",
    "Estado Civil": c.maritalStatus || "",
    "Cónyuge": c.spouseName || "",
    "ID del Cónyuge": c.spouseId || "",
    "Profesión": c.profession || "",
    "Empleador": c.employer || "",
    "Cargo": c.position || "",
    "Dirección": c.address || "",
    "Teléfono Principal": c.phone || "",
    "Teléfono Secundario": c.phoneSecondary || "",
    "Email": c.email || "",
  }));
  if (individuals.length) {
    const ws2 = sheetjs.utils.json_to_sheet(individuals);
    sheetjs.utils.book_append_sheet(wb, ws2, "Personas Físicas");
  }

  // Sheet 3: Persona Jurídica
  const entities = clients.filter(c => c.type === "entity").map(c => ({
    "ID": c.id,
    "Razón Social": c.companyName || "",
    "RNC": c.rnc || "",
    "ID Fiscal Negocio": c.businessTaxId || "",
    "Fecha Constitución": fmtDate(c.incorporationDate),
    "País Constitución": c.incorporationCountry || "",
    "Actividad Comercial": c.businessActivity || "",
    "Dirección Comercial": c.address || "",
    "Teléfono": c.phone || "",
    "Email": c.email || "",
    "Website": c.website || "",
    "Rep. Legal": c.legalRepName || "",
    "Nacionalidad Rep.": c.legalRepNationality || "",
    "ID Rep. Legal": c.legalRepId || "",
    "Cargo Rep.": c.legalRepPosition || "",
  }));
  if (entities.length) {
    const ws3 = sheetjs.utils.json_to_sheet(entities);
    sheetjs.utils.book_append_sheet(wb, ws3, "Personas Jurídicas");
  }

  // Sheet 4: Pagos (uno por fila)
  const paymentsRows = [];
  clients.forEach(c => {
    const name = c.fullName || c.companyName || "(Sin nombre)";
    (c.payments || []).forEach(p => {
      paymentsRows.push({
        "ID Cliente": c.id,
        "Cliente": name,
        "Villa #": c.lotNumber || "",
        "Fecha Pago": fmtDate(p.date),
        "Monto (USD)": Number(p.amount) || 0,
        "Tipo": p.type || "",
        "Método": PAYMENT_METHODS.find(m => m.v === p.method)?.l || p.method || "",
        "Referencia": p.reference || "",
        "Estado": p.status || "",
        "Notas": p.notes || "",
      });
    });
  });
  if (paymentsRows.length) {
    const ws4 = sheetjs.utils.json_to_sheet(paymentsRows);
    sheetjs.utils.book_append_sheet(wb, ws4, "Historial de Pagos");
  }

  // Sheet 5: UBOs (Beneficiarios Finales)
  const ubosRows = [];
  clients.forEach(c => {
    (c.ubos || []).forEach(u => {
      if (u.name) {
        ubosRows.push({
          "ID Cliente": c.id,
          "Cliente": c.fullName || c.companyName || "",
          "Nombre UBO": u.name,
          "Nacionalidad": u.nationality || "",
          "Número de ID": u.idNumber || "",
          "% Participación": u.percentage || "",
        });
      }
    });
  });
  if (ubosRows.length) {
    const ws5 = sheetjs.utils.json_to_sheet(ubosRows);
    sheetjs.utils.book_append_sheet(wb, ws5, "Beneficiarios Finales");
  }

  // Sheet 6: Inventario de Villas
  const villasRows = Object.entries(lots).map(([num, lot]) => {
    const assigned = clients.find(c => String(c.lotNumber) === String(num));
    const size = typeof lot === "number" ? lot : lot.sqft;
    const sqm = typeof lot === "number" ? (lot * 0.0929) : (lot.sqm || lot.sqft * 0.0929);
    return {
      "Villa #": Number(num),
      "Tamaño Terreno (ft²)": size,
      "Tamaño Terreno (m²)": sqm,
      "Estado": assigned ? (STATUS_CONFIG[assigned.status]?.label || assigned.status) : "Disponible",
      "Cliente": assigned ? (assigned.fullName || assigned.companyName || "") : "",
      "Modelo": assigned ? (villaModels[assigned.villaModel]?.name || "") : "",
      "Precio Total": assigned ? computePrice(assigned, settings).total : "",
      "Pagado": assigned ? paidAmount(assigned) : "",
    };
  });
  const ws6 = sheetjs.utils.json_to_sheet(villasRows);
  sheetjs.utils.book_append_sheet(wb, ws6, "Inventario Villas");

  // Sheet 7: Comisiones de Brokers
  const commissionRows = clients.filter(c => c.brokerName).map(c => {
    const comm = computeCommission(c, settings);
    return {
      "ID Cliente": c.id,
      "Cliente": c.fullName || c.companyName || "",
      "Villa #": c.lotNumber || "",
      "Broker": c.brokerName,
      "Empresa Broker": c.brokerCompany || "",
      "Teléfono Broker": c.brokerPhone || "",
      "Email Broker": c.brokerEmail || "",
      "% Comisión": comm.pct,
      "Comisión Total": comm.totalCommission,
      "Ganado por Broker": comm.earnedByBroker,
      "Pagado al Broker": comm.paidToBroker,
      "Pendiente al Broker": comm.pendingToBroker,
      "Notas": c.brokerNotes || "",
    };
  });
  if (commissionRows.length > 0) {
    const ws7 = sheetjs.utils.json_to_sheet(commissionRows);
    sheetjs.utils.book_append_sheet(wb, ws7, "Comisiones");
  }

  const fname = `AMBAR_Clientes_${new Date().toISOString().slice(0,10)}.xlsx`;
  sheetjs.writeFile(wb, fname);
}

// ------------------------- Reusable UI Components -------------------------

const Button = ({ children, onClick, variant = "primary", size = "md", type = "button", disabled, className = "", icon: Icon }) => {
  const variants = {
    primary: "bg-[#1A2342] text-[#F5F1E8] hover:bg-[#2A3556] border border-[#1A2342]",
    ghost:   "bg-transparent text-[#1A2342] hover:bg-[#1A2342]/5 border border-transparent",
    outline: "bg-transparent text-[#1A2342] hover:bg-[#1A2342]/5 border border-[#1A2342]/20",
    accent:  "bg-[#4A6FA5] text-white hover:bg-[#3A5A8A] border border-[#4A6FA5]",
    gold:    "bg-[#C9A961] text-[#1A2342] hover:bg-[#B99A52] border border-[#C9A961]",
    danger:  "bg-transparent text-[#B04B3F] hover:bg-[#B04B3F]/10 border border-[#B04B3F]/20",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-sm" };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: "'Manrope', sans-serif" }}>
      {Icon && <Icon className="w-4 h-4" strokeWidth={1.8} />}
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, required, className = "", textarea, rows = 3, disabled, ...rest }) => (
  <div className={className}>
    {label && (
      <label className="block text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-1.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {label} {required && <span className="text-[#B04B3F]">*</span>}
      </label>
    )}
    {textarea ? (
      <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        disabled={disabled}
        className={`w-full px-3 py-2 border focus:outline-none text-sm text-[#1A2342] placeholder:text-[#1A2342]/30 ${disabled ? "bg-[#1A2342]/5 border-[#1A2342]/10 cursor-not-allowed text-[#1A2342]/70" : "bg-[#FDFBF6] border-[#1A2342]/15 focus:border-[#4A6FA5]"}`}
        style={{ fontFamily: "'Manrope', sans-serif" }}
        {...rest} />
    ) : (
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border focus:outline-none text-sm text-[#1A2342] placeholder:text-[#1A2342]/30 ${disabled ? "bg-[#1A2342]/5 border-[#1A2342]/10 cursor-not-allowed text-[#1A2342]/70" : "bg-[#FDFBF6] border-[#1A2342]/15 focus:border-[#4A6FA5]"}`}
        style={{ fontFamily: "'Manrope', sans-serif" }}
        {...rest} />
    )}
  </div>
);

const Select = ({ label, value, onChange, options, required, placeholder = "—", className = "", disabled }) => (
  <div className={className}>
    {label && (
      <label className="block text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-1.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {label} {required && <span className="text-[#B04B3F]">*</span>}
      </label>
    )}
    <select value={value || ""} onChange={e => onChange(e.target.value)} disabled={disabled}
      className={`w-full px-3 py-2 border focus:outline-none text-sm text-[#1A2342] ${disabled ? "bg-[#1A2342]/5 border-[#1A2342]/10 cursor-not-allowed text-[#1A2342]/70" : "bg-[#FDFBF6] border-[#1A2342]/15 focus:border-[#4A6FA5]"}`}
      style={{ fontFamily: "'Manrope', sans-serif" }}>
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>
      ))}
    </select>
  </div>
);

const Checkbox = ({ label, checked, onChange, className = "" }) => (
  <label className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-4 h-4 border flex items-center justify-center transition-colors ${checked ? "bg-[#1A2342] border-[#1A2342]" : "bg-[#FDFBF6] border-[#1A2342]/30"}`}>
      {checked && <Check className="w-3 h-3 text-[#F5F1E8]" strokeWidth={3} />}
    </button>
    <span className="text-sm text-[#1A2342]" style={{ fontFamily: "'Manrope', sans-serif" }}>{label}</span>
  </label>
);

const Badge = ({ children, color = "#1A2342", bg = "#D9DDE8" }) => (
  <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] font-medium"
    style={{ color, backgroundColor: bg, fontFamily: "'Manrope', sans-serif" }}>
    {children}
  </span>
);

const SectionTitle = ({ children, subtitle, className = "" }) => (
  <div className={`border-b border-[#1A2342]/10 pb-2 mb-4 ${className}`}>
    <h3 className="text-xs uppercase tracking-[0.2em] text-[#1A2342]/70" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {children}
    </h3>
    {subtitle && <p className="text-[11px] text-[#1A2342]/50 mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>{subtitle}</p>}
  </div>
);

const Modal = ({ open, onClose, children, title, size = "lg" }) => {
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-5xl", xl: "max-w-6xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2342]/40 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${widths[size]} max-h-[92vh] bg-[#F5F1E8] border border-[#1A2342]/20 shadow-2xl flex flex-col`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A2342]/10">
          <h2 className="text-lg tracking-wide text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, letterSpacing: "0.04em" }}>
            {title}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#1A2342]/10 transition-colors">
            <X className="w-4 h-4 text-[#1A2342]" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const { t } = useT();
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.lead;
  return <Badge color={cfg.color} bg={cfg.bg}>{t("status_" + status)}</Badge>;
};

const ProgressBar = ({ percent, color = "#4A6FA5" }) => (
  <div className="w-full h-1 bg-[#1A2342]/8">
    <div className="h-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: color }} />
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="py-16 flex flex-col items-center justify-center text-center">
    <div className="w-14 h-14 rounded-full bg-[#1A2342]/5 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-[#1A2342]/40" strokeWidth={1.5} />
    </div>
    <h3 className="text-[#1A2342] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }}>{title}</h3>
    {subtitle && <p className="text-sm text-[#1A2342]/60 mb-4 max-w-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>{subtitle}</p>}
    {action}
  </div>
);

// ------------------------- Client Form -------------------------

// ------------------------- Payment Plan Section -------------------------

function PaymentPlanSection({ clientId, villaTotal, plan, onPlanChange }) {
  const { t, lang } = useT();
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const installments = plan?.installments || [];
  const includeInPdf = plan?.includeInPdf !== false; // default true
  const totals = computePlanTotals(plan);

  const updatePlan = (updates) => {
    onPlanChange({ ...(plan || { includeInPdf: true, installments: [] }), ...updates });
  };

  const updateInstallment = (id, field, value) => {
    const next = installments.map(inst => {
      if (inst.id !== id) return inst;
      const updated = { ...inst, [field]: value };
      // Auto-recalculate amount if percentage changes and we have villa total
      if (field === "percentage" && villaTotal > 0) {
        updated.amount = Math.round(villaTotal * Number(value) / 100 * 100) / 100;
      }
      // Auto-recalculate percentage if amount changes and we have villa total
      if (field === "amount" && villaTotal > 0) {
        updated.percentage = Math.round(Number(value) / villaTotal * 100 * 100) / 100;
      }
      return updated;
    });
    updatePlan({ installments: next });
  };

  const addInstallment = () => {
    const newInst = {
      id: uid(),
      concept: "",
      conceptEn: "",
      percentage: 0,
      amount: 0,
      dueDate: todayISO(),
      paidAmount: 0,
      notes: "",
      linkedPaymentIds: [],
    };
    updatePlan({ installments: [...installments, newInst] });
  };

  const removeInstallment = (id) => {
    if (!confirm(t("plan_confirm_delete_inst"))) return;
    updatePlan({ installments: installments.filter(i => i.id !== id) });
  };

  const applyTemplate = (templateId, startDate) => {
    if (installments.length > 0 && !confirm(t("plan_confirm_replace"))) return;
    const newInstallments = applyPaymentTemplate(templateId, villaTotal, startDate);
    updatePlan({ installments: newInstallments });
    setShowTemplateModal(false);
  };

  const STATUS_STYLES = {
    paid:             { color: "#2D5E3E", bg: "#D4E6D8", label: t("plan_status_paid") },
    pending:          { color: "#1A2342", bg: "#D9DDE8", label: t("plan_status_pending") },
    partial:          { color: "#C9A961", bg: "#F4EBD4", label: t("plan_status_partial") },
    overdue:          { color: "#B04B3F", bg: "#F3DDD9", label: t("plan_status_overdue") },
    partial_overdue:  { color: "#B04B3F", bg: "#F3DDD9", label: t("plan_status_partial_overdue") },
  };

  const mismatch = installments.length > 0 && Math.abs(totals.expected - villaTotal) > 1 && villaTotal > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SectionTitle className="mb-0 border-0 pb-0" subtitle={t("sec_payment_plan_sub")}>{t("sec_payment_plan")}</SectionTitle>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplateModal(true)} variant="gold" icon={CalendarDays} size="sm">
            {t("plan_apply_template")}
          </Button>
          <Button onClick={addInstallment} variant="outline" icon={Plus} size="sm">
            {t("plan_add_installment")}
          </Button>
        </div>
      </div>

      {/* Include in PDF toggle */}
      <Checkbox label={t("plan_include_in_pdf")} checked={includeInPdf}
        onChange={v => updatePlan({ includeInPdf: v })} />

      {installments.length === 0 ? (
        <div className="p-6 text-center text-sm text-[#1A2342]/50 bg-[#FDFBF6] border border-dashed border-[#1A2342]/20"
          style={{ fontFamily: "'Manrope', sans-serif" }}>
          {t("plan_no_plan")}
        </div>
      ) : (
        <>
          {/* Installments table */}
          <div className="border border-[#1A2342]/10 overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-24 gap-2 px-3 py-2 bg-[#1A2342]/5 text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <div className="col-span-5">{t("plan_concept")}</div>
                <div className="col-span-3">{t("plan_due_date")}</div>
                <div className="col-span-3">{t("plan_percentage")}</div>
                <div className="col-span-4 text-right">{t("plan_amount")}</div>
                <div className="col-span-3 text-right">{t("plan_paid_amount")}</div>
                <div className="col-span-4">{t("plan_status")}</div>
                <div className="col-span-2 text-right"></div>
              </div>
              {installments.map((inst, idx) => {
                const status = getInstallmentStatus(inst);
                const cfg = STATUS_STYLES[status];
                return (
                  <div key={inst.id} className="grid grid-cols-24 gap-2 px-3 py-2 border-t border-[#1A2342]/10 items-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    <div className="col-span-5">
                      <input value={inst.concept || ""} onChange={e => updateInstallment(inst.id, "concept", e.target.value)}
                        placeholder={`${lang === "es" ? "Cuota" : "Installment"} ${idx + 1}`}
                        className="w-full px-2 py-1 bg-transparent border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm" />
                      <input value={inst.conceptEn || ""} onChange={e => updateInstallment(inst.id, "conceptEn", e.target.value)}
                        placeholder={`${lang === "es" ? "Inglés:" : "English:"} Installment ${idx + 1}`}
                        className="w-full px-2 py-1 mt-1 bg-transparent border border-[#1A2342]/10 focus:border-[#4A6FA5] focus:outline-none text-[11px] text-[#1A2342]/70" />
                    </div>
                    <div className="col-span-3">
                      <input type="date" value={inst.dueDate || ""} onChange={e => updateInstallment(inst.id, "dueDate", e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm" />
                    </div>
                    <div className="col-span-3">
                      <input type="number" step="0.01" value={inst.percentage || 0} onChange={e => updateInstallment(inst.id, "percentage", e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm text-right" />
                    </div>
                    <div className="col-span-4">
                      <input type="number" value={inst.amount || 0} onChange={e => updateInstallment(inst.id, "amount", e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm text-right font-medium" />
                    </div>
                    <div className="col-span-3">
                      <input type="number" value={inst.paidAmount || 0} onChange={e => updateInstallment(inst.id, "paidAmount", e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm text-right" />
                    </div>
                    <div className="col-span-4">
                      <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <button onClick={() => removeInstallment(inst.id)} className="p-1.5 text-[#1A2342]/40 hover:text-[#B04B3F] hover:bg-[#B04B3F]/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 bg-[#1A2342] text-[#F5F1E8] grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#F5F1E8]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("plan_villa_total")}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }}>{fmtUSD(villaTotal)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#F5F1E8]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("plan_total_expected")}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }} className={mismatch ? "text-[#D4A24C]" : ""}>{fmtUSD(totals.expected)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#F5F1E8]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("plan_total_received")}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }} className="text-[#C9A961]">{fmtUSD(totals.received)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#F5F1E8]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("plan_total_pending")}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }}>{fmtUSD(totals.pending)}</div>
            </div>
          </div>

          {mismatch && (
            <div className="p-3 bg-[#F3DDD9] border-l-2 border-[#B04B3F] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B04B3F] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="text-sm text-[#B04B3F]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {t("plan_mismatch_warning")}: {fmtUSD(Math.abs(totals.expected - villaTotal))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Template selection modal */}
      {showTemplateModal && (
        <TemplateModal villaTotal={villaTotal} onApply={applyTemplate} onClose={() => setShowTemplateModal(false)} />
      )}
    </div>
  );
}

function TemplateModal({ villaTotal, onApply, onClose }) {
  const { t, lang } = useT();
  const [selected, setSelected] = useState("");
  const [startDate, setStartDate] = useState(todayISO());

  const isES = lang === "es";

  return (
    <div className="fixed inset-0 bg-[#1A2342]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#F5F1E8] border border-[#1A2342]/15 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#1A2342]/10 flex items-center justify-between">
          <div>
            <h2 className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 500 }}>
              {t("plan_template_title")}
            </h2>
            <p className="text-[11px] text-[#1A2342]/60 mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t("plan_template_sub")}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1A2342]/10 transition-colors">
            <X className="w-4 h-4 text-[#1A2342]/60" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-2">
          {PAYMENT_TEMPLATES.map(tpl => {
            const label = isES ? tpl.labelEs : tpl.labelEn;
            const desc = isES ? tpl.descEs : tpl.descEn;
            const active = selected === tpl.id;
            // Preview of amounts (only for non-custom)
            let preview = null;
            if (tpl.id !== "custom" && villaTotal > 0) {
              const sample = applyPaymentTemplate(tpl.id, villaTotal, todayISO());
              preview = sample.map(s => fmtUSD(s.amount)).join(" · ");
            }
            return (
              <button key={tpl.id} onClick={() => setSelected(tpl.id)}
                className={`w-full text-left p-4 border transition-all ${active ? "border-[#1A2342] bg-[#FDFBF6]" : "border-[#1A2342]/15 hover:border-[#1A2342]/40"}`}
                style={{ fontFamily: "'Manrope', sans-serif" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#1A2342]">{label}</div>
                    <div className="text-[11px] text-[#1A2342]/60 mt-0.5">{desc}</div>
                    {preview && <div className="text-[10px] text-[#1A2342]/50 mt-1 font-mono">{preview}</div>}
                  </div>
                  {active && <Check className="w-4 h-4 text-[#1A2342] mt-0.5" strokeWidth={2} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          <Input label={t("plan_start_date")} type="date" value={startDate} onChange={setStartDate} />
          <div className="text-[11px] text-[#1A2342]/50 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("plan_start_date_help")}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1A2342]/10 flex justify-end gap-2">
          <Button onClick={onClose} variant="ghost">{t("cancel")}</Button>
          <Button onClick={() => selected && onApply(selected, startDate)} variant="primary" disabled={!selected} icon={Check}>
            {t("plan_apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}



function DocumentsSection({ clientId, documents, onDocumentsChange }) {
  const { t } = useT();
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const DOC_TYPES = [
    { v: "passport",        l: t("doc_type_passport") },
    { v: "cedula",          l: t("doc_type_cedula") },
    { v: "drivers_license", l: t("doc_type_drivers") },
    { v: "bank_reference",  l: t("doc_type_bank_ref") },
    { v: "proof_address",   l: t("doc_type_proof_address") },
    { v: "funds_proof",     l: t("doc_type_funds_proof") },
    { v: "articles",        l: t("doc_type_articles") },
    { v: "good_standing",   l: t("doc_type_good_standing") },
    { v: "shareholders",    l: t("doc_type_shareholders") },
    { v: "contract",        l: t("doc_type_contract") },
    { v: "kyc_form",        l: t("doc_type_kyc_form") },
    { v: "other",           l: t("doc_type_other") },
  ];

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    if (!selectedType) {
      setError(t("doc_type_required"));
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const newDocs = [];
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`${file.name}: ${t("doc_file_too_large")}`);
        }
        const doc = await uploadClientDocument(clientId, file, selectedType);
        newDocs.push(doc);
      }
      onDocumentsChange([...(documents || []), ...newDocs]);
      setSelectedType(""); // reset after upload
    } catch (e) {
      console.error(e);
      setError(e.message || t("doc_upload_error"));
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    handleFiles(Array.from(e.target.files || []));
    e.target.value = ""; // reset para permitir subir el mismo archivo otra vez
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files || []));
  };

  const handleView = async (doc) => {
    try {
      const url = await getDocumentUrl(doc.path);
      window.open(url, "_blank");
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(t("doc_confirm_delete"))) return;
    try {
      await deleteDocument(doc.path);
      onDocumentsChange(documents.filter(d => d.path !== doc.path));
    } catch (e) {
      alert(e.message);
    }
  };

  const getIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return FileImage;
    return File;
  };

  const fmtFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getDocTypeLabel = (type) => {
    const opt = DOC_TYPES.find(d => d.v === type);
    return opt ? opt.l : type;
  };

  return (
    <div className="space-y-6">
      <SectionTitle subtitle={t("doc_section_sub")}>{t("doc_section")}</SectionTitle>

      {/* Upload zone */}
      <div className="space-y-3">
        <Select label={t("doc_type")} value={selectedType} onChange={setSelectedType}
          options={DOC_TYPES} placeholder={t("doc_type_placeholder")} />

        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? "border-[#4A6FA5] bg-[#E3EBF5]"
              : uploading
              ? "border-[#C9A961] bg-[#F4EBD4]"
              : "border-[#1A2342]/20 bg-[#FDFBF6] hover:border-[#1A2342]/40"
          }`}
        >
          <input type="file" multiple onChange={handleFileInput} disabled={uploading || !selectedType}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-[#C9A961] animate-spin" strokeWidth={1.5} />
                <div className="text-sm text-[#1A2342]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {t("doc_uploading")}
                </div>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-[#1A2342]/50" strokeWidth={1.5} />
                <div className="text-sm text-[#1A2342]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {t("doc_upload_help")}
                </div>
                <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  PDF · JPG · PNG · DOC · XLS · Max 50 MB
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#F3DDD9] border-l-2 border-[#B04B3F] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#B04B3F] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="text-sm text-[#B04B3F]" style={{ fontFamily: "'Manrope', sans-serif" }}>{error}</div>
          </div>
        )}
      </div>

      {/* Documents list */}
      <div>
        {(!documents || documents.length === 0) ? (
          <div className="p-6 text-center text-sm text-[#1A2342]/50 bg-[#FDFBF6] border border-dashed border-[#1A2342]/20"
            style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("doc_no_documents")}
          </div>
        ) : (
          <div className="space-y-1.5">
            {documents.map((doc, idx) => {
              const Icon = getIcon(doc.mimeType);
              return (
                <div key={doc.path || idx}
                  className="flex items-center gap-3 p-3 bg-[#FDFBF6] border border-[#1A2342]/10 hover:border-[#1A2342]/25 transition-colors group">
                  <Icon className="w-5 h-5 text-[#4A6FA5] flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#1A2342] truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        {doc.name}
                      </span>
                      <Badge color="#1A2342" bg="#D9DDE8">{getDocTypeLabel(doc.type)}</Badge>
                    </div>
                    <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {fmtFileSize(doc.size || 0)} · {t("doc_uploaded_at")} {fmtDate(doc.uploadedAt)}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleView(doc)}
                      className="p-2 hover:bg-[#1A2342]/10 transition-colors"
                      title={t("doc_view")}>
                      <Eye className="w-4 h-4 text-[#1A2342]" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => handleDelete(doc)}
                      className="p-2 hover:bg-[#B04B3F]/10 text-[#1A2342] hover:text-[#B04B3F] transition-colors"
                      title={t("doc_delete")}>
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


function ClientForm({ initial, initialTab, onSave, onCancel }) {
  const { t, lang } = useT();
  const settings = useSettings();
  const villaModels = settings.villaModels || DEFAULT_SETTINGS.villaModels;
  const lots = settings.lots || DEFAULT_SETTINGS.lots;
  const pricing_cfg = settings.pricing || DEFAULT_SETTINGS.pricing;
  const [tab, setTab] = useState(initialTab || "type");
  const [data, setData] = useState(() => initial || {
    id: uid(),
    createdAt: new Date().toISOString(),
    type: "individual",
    status: "lead",
    ubos: [],
    payments: [],
    isPep: false,
    smartLivingPackage: false,
    furniturePackage: false,
    furniturePackagePrice: 0,
    discount: 0,
    riskLevel: "low",
    kycComplete: false,
  });

  const update = (patch) => setData(d => ({ ...d, ...patch, updatedAt: new Date().toISOString() }));

  const tabs = [
    { v: "type",         l: t("tab_type"),         icon: UserCircle },
    { v: "personal",     l: t("tab_personal"),     icon: FileText },
    { v: "villa",        l: t("tab_villa"),        icon: Home },
    { v: "aml",          l: t("tab_aml"),          icon: Shield },
    { v: "payment_plan", l: t("tab_payment_plan"), icon: CalendarDays },
    { v: "payments",     l: t("tab_payments"),     icon: CreditCard },
    { v: "commission",   l: t("sec_commission"),   icon: Briefcase },
    { v: "documents",    l: t("tab_documents"),    icon: Paperclip },
    { v: "notes",        l: t("tab_notes"),        icon: ClipboardList },
  ];

  const pricing = computePrice(data, settings);

  // UBO helpers
  const addUbo = () => update({ ubos: [...(data.ubos || []), { name: "", nationality: "", idNumber: "", percentage: "" }] });
  const removeUbo = (i) => update({ ubos: data.ubos.filter((_, idx) => idx !== i) });
  const updateUbo = (i, patch) => update({ ubos: data.ubos.map((u, idx) => idx === i ? { ...u, ...patch } : u) });

  // Payment helpers
  const addPayment = () => update({
    payments: [...(data.payments || []), {
      id: "pay_" + Date.now().toString(36),
      date: todayISO(), amount: "", method: "wire", reference: "", notes: "",
      type: "installment", status: "confirmed",
    }]
  });
  const removePayment = (id) => update({ payments: data.payments.filter(p => p.id !== id) });
  const updatePayment = (id, patch) => update({ payments: data.payments.map(p => p.id === id ? { ...p, ...patch } : p) });

  const save = () => {
    const name = data.type === "entity" ? data.companyName : data.fullName;
    if (!name) {
      alert(t("lbl_validation_name"));
      setTab("personal");
      return;
    }
    // Sync installment paidAmount from linked payments
    let finalData = data;
    if (data.paymentPlan && data.paymentPlan.installments && data.paymentPlan.installments.length > 0) {
      const syncedInstallments = data.paymentPlan.installments.map(inst => {
        const linkedPayments = (data.payments || []).filter(p => p.linkedInstallmentId === inst.id);
        const paidForThis = linkedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return {
          ...inst,
          paidAmount: paidForThis,
          linkedPaymentIds: linkedPayments.map(p => p.id),
        };
      });
      finalData = {
        ...data,
        paymentPlan: { ...data.paymentPlan, installments: syncedInstallments },
      };
    }
    onSave(finalData);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-0 mb-5 border-b border-[#1A2342]/10 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.v;
          return (
            <button key={t.v} onClick={() => setTab(t.v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] uppercase tracking-[0.12em] whitespace-nowrap transition-all ${active ? "text-[#1A2342] border-b-2 border-[#1A2342] -mb-px" : "text-[#1A2342]/50 hover:text-[#1A2342]/80"}`}
              style={{ fontFamily: "'Manrope', sans-serif" }}>
              <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
              {t.l}
            </button>
          );
        })}
      </div>

      {/* Tab: Type & Status */}
      {tab === "type" && (
        <div className="space-y-6">
          <SectionTitle subtitle={t("form_buyer_type_sub")}>{t("form_buyer_type")}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => update({ type: "individual" })}
              className={`p-4 border text-left transition-all ${data.type === "individual" ? "border-[#1A2342] bg-[#FDFBF6]" : "border-[#1A2342]/15 hover:border-[#1A2342]/40"}`}>
              <UserCircle className="w-5 h-5 text-[#1A2342] mb-2" strokeWidth={1.5} />
              <div className="text-sm font-medium text-[#1A2342]" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("clients_individual")}</div>
              <div className="text-[11px] text-[#1A2342]/60 mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>Individual Person</div>
            </button>
            <button type="button" onClick={() => update({ type: "entity" })}
              className={`p-4 border text-left transition-all ${data.type === "entity" ? "border-[#1A2342] bg-[#FDFBF6]" : "border-[#1A2342]/15 hover:border-[#1A2342]/40"}`}>
              <Building2 className="w-5 h-5 text-[#1A2342] mb-2" strokeWidth={1.5} />
              <div className="text-sm font-medium text-[#1A2342]" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("clients_entity")}</div>
              <div className="text-[11px] text-[#1A2342]/60 mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>Company / Corporation</div>
            </button>
          </div>

          <SectionTitle subtitle={t("form_status_sub")}>{t("form_status")}</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_ORDER.map(s => {
              const cfg = STATUS_CONFIG[s];
              const active = data.status === s;
              return (
                <button key={s} type="button" onClick={() => update({ status: s })}
                  className={`px-3 py-2.5 text-xs text-left transition-all border ${active ? "border-[#1A2342]" : "border-[#1A2342]/15 hover:border-[#1A2342]/40"}`}
                  style={{ fontFamily: "'Manrope', sans-serif", backgroundColor: active ? cfg.bg : "transparent" }}>
                  <span style={{ color: cfg.color }} className="font-medium">{t("status_" + s)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Personal / Entity */}
      {tab === "personal" && (
        <div className="space-y-6">
          {data.type === "individual" ? (
            <>
              <SectionTitle subtitle={t("sec_personal_sub")}>{t("sec_personal")}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={lang === "es" ? "Nombre Completo / Full Name" : "Full Name / Nombre Completo"} value={data.fullName} onChange={v => update({ fullName: v })} required />
                <Input label={lang === "es" ? "Nacionalidad / Nationality" : "Nationality / Nacionalidad"} value={data.nationality} onChange={v => update({ nationality: v })} />
                <Select label={lang === "es" ? "Tipo de Documento" : "Document Type"} value={data.idType} onChange={v => update({ idType: v })} options={ID_TYPES} />
                <Input label={lang === "es" ? "Número de ID" : "ID Number"} value={data.idNumber} onChange={v => update({ idNumber: v })} />
                <Input label={lang === "es" ? "País de Emisión" : "Country of Issue"} value={data.countryOfIssue} onChange={v => update({ countryOfIssue: v })} />
                <Input label={lang === "es" ? "Fecha Vencimiento ID" : "ID Expiration Date"} type="date" value={data.idExpiration} onChange={v => update({ idExpiration: v })} />
                <Input label={lang === "es" ? "ID Fiscal (SSN/extranjero)" : "Tax ID (SSN/foreign)"} value={data.taxId} onChange={v => update({ taxId: v })} />
                <Input label={lang === "es" ? "Fecha de Nacimiento" : "Date of Birth"} type="date" value={data.dateOfBirth} onChange={v => update({ dateOfBirth: v })} />
                <Input label={lang === "es" ? "Lugar de Nacimiento" : "Place of Birth"} value={data.placeOfBirth} onChange={v => update({ placeOfBirth: v })} placeholder={lang === "es" ? "Ciudad, País" : "City, Country"} />
                <Select label={lang === "es" ? "Estado Civil" : "Marital Status"} value={data.maritalStatus} onChange={v => update({ maritalStatus: v })} options={lang === "es" ? MARITAL_STATUS : MARITAL_STATUS_EN} />
                <Input label={lang === "es" ? "Nombre del Cónyuge" : "Spouse Name"} value={data.spouseName} onChange={v => update({ spouseName: v })} />
                <Input label={lang === "es" ? "ID del Cónyuge" : "Spouse ID"} value={data.spouseId} onChange={v => update({ spouseId: v })} />
                <Input label={lang === "es" ? "Profesión u Ocupación" : "Profession or Occupation"} value={data.profession} onChange={v => update({ profession: v })} />
                <Input label={lang === "es" ? "Empresa donde labora" : "Employer"} value={data.employer} onChange={v => update({ employer: v })} />
                <Input label={lang === "es" ? "Cargo que ocupa" : "Position Held"} value={data.position} onChange={v => update({ position: v })} />
              </div>
            </>
          ) : (
            <>
              <SectionTitle subtitle={t("sec_corporate_sub")}>{t("sec_corporate")}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={lang === "es" ? "Razón Social Completa" : "Full Legal Name"} value={data.companyName} onChange={v => update({ companyName: v })} required />
                <Input label={lang === "es" ? "RNC (Rep. Dom.)" : "RNC (Dom. Rep.)"} value={data.rnc} onChange={v => update({ rnc: v })} />
                <Input label={lang === "es" ? "ID Fiscal del Negocio (EIN/Otro)" : "Business Tax ID (EIN/Other)"} value={data.businessTaxId} onChange={v => update({ businessTaxId: v })} />
                <Input label={lang === "es" ? "Fecha de Constitución" : "Incorporation Date"} type="date" value={data.incorporationDate} onChange={v => update({ incorporationDate: v })} />
                <Input label={lang === "es" ? "País de Constitución" : "Country of Incorporation"} value={data.incorporationCountry} onChange={v => update({ incorporationCountry: v })} />
                <Input label={lang === "es" ? "Actividad Comercial Principal" : "Primary Business Activity"} value={data.businessActivity} onChange={v => update({ businessActivity: v })} className="col-span-2" />
                <Input label={lang === "es" ? "Website" : "Website"} value={data.website} onChange={v => update({ website: v })} />
                <div />
              </div>
              <SectionTitle subtitle={t("sec_legal_rep_sub")}>{t("sec_legal_rep")}</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={lang === "es" ? "Nombre Completo" : "Full Name"} value={data.legalRepName} onChange={v => update({ legalRepName: v })} />
                <Input label={lang === "es" ? "Nacionalidad" : "Nationality"} value={data.legalRepNationality} onChange={v => update({ legalRepNationality: v })} />
                <Input label={lang === "es" ? "Número de ID" : "ID Number"} value={data.legalRepId} onChange={v => update({ legalRepId: v })} />
                <Input label={lang === "es" ? "Cargo" : "Position"} value={data.legalRepPosition} onChange={v => update({ legalRepPosition: v })} />
              </div>
            </>
          )}

          <SectionTitle>{t("sec_contact")}</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Email" value={data.email} onChange={v => update({ email: v })} type="email" />
            <Input label={lang === "es" ? "Teléfono Principal" : "Primary Phone"} value={data.phone} onChange={v => update({ phone: v })} />
            <Input label={lang === "es" ? "Teléfono Secundario" : "Secondary Phone"} value={data.phoneSecondary} onChange={v => update({ phoneSecondary: v })} />
            <div />
            <Input label={lang === "es" ? "Dirección Completa" : "Full Address"} value={data.address} onChange={v => update({ address: v })} textarea rows={2} className="col-span-2"
              placeholder={lang === "es" ? "Calle, Número, Ciudad, Provincia/Estado, País, Código Postal" : "Street, Number, City, State/Province, Country, Postal Code"} />
          </div>
        </div>
      )}

      {/* Tab: Villa & Pricing */}
      {tab === "villa" && (
        <div className="space-y-6">
          <SectionTitle subtitle={t("sec_villa_select_sub")}>{t("sec_villa_select")}</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label={lang === "es" ? "Número de Villa / Lote" : "Villa / Lot Number"} value={data.lotNumber} onChange={v => update({ lotNumber: v })}
              options={Object.keys(lots).map(n => {
                const lot = lots[n];
                const sqft = typeof lot === "number" ? lot : lot.sqft;
                const sqm = typeof lot === "number" ? (lot * 0.0929) : (lot.sqm || sqft * 0.0929);
                const sizeDisplay = lang === "en" ? `${sqft.toLocaleString()} ft²` : `${sqm.toLocaleString(undefined, { maximumFractionDigits: 2 })} m²`;
                return { v: n, l: `Villa #${n} — ${sizeDisplay} ${lang === "es" ? "terreno" : "lot"}` };
              })} />
            <Select label={lang === "es" ? "Modelo de Villa" : "Villa Model"} value={data.villaModel} onChange={v => update({ villaModel: v })}
              options={Object.entries(villaModels).map(([k, m]) => ({ v: k, l: `${m.name} — ${fmtModelArea(m, lang)}` }))} />
          </div>

          <SectionTitle subtitle={t("sec_packages_sub")}>{t("sec_packages")}</SectionTitle>
          <div className="space-y-3 p-4 bg-[#FDFBF6] border border-[#1A2342]/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Checkbox label={`${t("lbl_smart_living")} — ${fmtUSD(pricing_cfg.smartLivingPrice)}`} checked={data.smartLivingPackage} onChange={v => update({ smartLivingPackage: v })} />
                <p className="text-[11px] text-[#1A2342]/60 mt-1 ml-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {t("lbl_smart_living_desc")}
                </p>
              </div>
            </div>
            <div className="border-t border-[#1A2342]/10 pt-3">
              <Checkbox label={t("lbl_furniture")} checked={data.furniturePackage} onChange={v => update({ furniturePackage: v })} />
              {data.furniturePackage && (
                <div className="ml-6 mt-2 max-w-xs">
                  <Input label={t("lbl_furniture_price")} type="number" value={data.furniturePackagePrice} onChange={v => update({ furniturePackagePrice: v })} />
                </div>
              )}
            </div>
          </div>

          <SectionTitle>{t("sec_price_adj")}</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t("lbl_price_override")} type="number" value={data.basePriceOverride} onChange={v => update({ basePriceOverride: v })}
              placeholder={t("lbl_price_override_ph")} />
            <Input label={t("lbl_discount")} type="number" value={data.discount} onChange={v => update({ discount: v })} placeholder="0" />
          </div>

          {/* Price Breakdown */}
          <div className="p-4 bg-[#1A2342] text-[#F5F1E8] space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#F5F1E8]/60 mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("sec_price_breakdown")}</div>
            <div className="flex justify-between text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <span className="text-[#F5F1E8]/80">{t("lbl_price_base")}</span>
              <span>{fmtUSD(pricing.base)}</span>
            </div>
            {pricing.smart > 0 && (
              <div className="flex justify-between text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <span className="text-[#F5F1E8]/80">+ Smart Living</span>
                <span>{fmtUSD(pricing.smart)}</span>
              </div>
            )}
            {pricing.furniture > 0 && (
              <div className="flex justify-between text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <span className="text-[#F5F1E8]/80">+ {lang === "es" ? "Muebles" : "Furniture"}</span>
                <span>{fmtUSD(pricing.furniture)}</span>
              </div>
            )}
            {pricing.discount > 0 && (
              <div className="flex justify-between text-sm text-[#C9A961]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <span>− {lang === "es" ? "Descuento" : "Discount"}</span>
                <span>−{fmtUSD(pricing.discount)}</span>
              </div>
            )}
            <div className="border-t border-[#F5F1E8]/20 pt-2 mt-2 flex justify-between" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }}>
              <span>{t("lbl_total")}</span>
              <span>{fmtUSD(pricing.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: AML / PEP / UBOs */}
      {tab === "aml" && (
        <div className="space-y-6">
          <SectionTitle subtitle={t("sec_pep_sub")}>{t("sec_pep")}</SectionTitle>
          <div className="p-4 bg-[#FDFBF6] border border-[#1A2342]/10">
            <Checkbox label={t("lbl_pep_is")} checked={data.isPep} onChange={v => update({ isPep: v })} />
            {data.isPep && (
              <div className="grid grid-cols-2 gap-3 mt-3 pl-6">
                <Input label={t("lbl_pep_name")} value={data.pepName} onChange={v => update({ pepName: v })} />
                <Input label={t("lbl_pep_position")} value={data.pepPosition} onChange={v => update({ pepPosition: v })} />
                <Input label={t("lbl_pep_relationship")} value={data.pepRelationship} onChange={v => update({ pepRelationship: v })} className="col-span-2" />
              </div>
            )}
          </div>

          <SectionTitle subtitle={t("sec_funds_sub")}>{t("sec_funds")}</SectionTitle>
          <Input textarea rows={3} value={data.sourceOfFunds} onChange={v => update({ sourceOfFunds: v })}
            placeholder={t("lbl_funds_placeholder")} />

          <SectionTitle subtitle={t("sec_ubos_sub")}>{t("sec_ubos")}</SectionTitle>
          <div className="space-y-2">
            {(data.ubos || []).map((u, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 bg-[#FDFBF6] border border-[#1A2342]/10">
                <Input label={t("ubo_name")} value={u.name} onChange={v => updateUbo(i, { name: v })} className="col-span-4" />
                <Input label={t("ubo_nationality")} value={u.nationality} onChange={v => updateUbo(i, { nationality: v })} className="col-span-3" />
                <Input label={t("ubo_id")} value={u.idNumber} onChange={v => updateUbo(i, { idNumber: v })} className="col-span-3" />
                <Input label={t("ubo_pct")} value={u.percentage} onChange={v => updateUbo(i, { percentage: v })} type="number" className="col-span-1" />
                <button type="button" onClick={() => removeUbo(i)} className="col-span-1 h-[34px] text-[#B04B3F] hover:bg-[#B04B3F]/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
            <Button onClick={addUbo} variant="outline" size="sm" icon={Plus}>{t("lbl_add_ubo")}</Button>
          </div>

          <SectionTitle>{t("sec_tx_declaration")}</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label={lang === "es" ? "Método de Pago Principal" : "Primary Payment Method"} value={data.paymentMethod} onChange={v => update({ paymentMethod: v })} options={PAYMENT_METHODS} />
            <Input label={lang === "es" ? "Entidad Financiera (Origen)" : "Financial Institution (Origin)"} value={data.originBank} onChange={v => update({ originBank: v })} placeholder={lang === "es" ? "Banco, País" : "Bank, Country"} />
          </div>

          <SectionTitle subtitle={t("sec_risk_sub")}>{t("sec_risk")}</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {RISK_LEVELS.map(r => (
              <button key={r.v} type="button" onClick={() => update({ riskLevel: r.v })}
                className={`px-3 py-2.5 text-sm text-left border transition-all ${data.riskLevel === r.v ? "border-[#1A2342]" : "border-[#1A2342]/15 hover:border-[#1A2342]/40"}`}
                style={{ fontFamily: "'Manrope', sans-serif", color: r.color, backgroundColor: data.riskLevel === r.v ? r.color + "15" : "transparent" }}>
                {t("risk_" + r.v)}
              </button>
            ))}
          </div>
          <Checkbox label={t("lbl_kyc_complete")} checked={data.kycComplete} onChange={v => update({ kycComplete: v })} />
        </div>
      )}

      {/* Tab: Payment Plan */}
      {tab === "payment_plan" && (
        <div className="space-y-8">
          <PaymentPlanSection
            clientId={data.id}
            villaTotal={pricing.total}
            plan={data.paymentPlan}
            onPlanChange={newPlan => update({ paymentPlan: newPlan })}
          />

          {/* Custom Payment Terms (Phase 4) */}
          <div className="pt-6 border-t border-[#1A2342]/10">
            <SectionTitle subtitle={t("sec_payment_terms_sub")}>{t("sec_payment_terms")}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label={t("lbl_currency")} value={data.contractCurrency || "USD"} onChange={v => update({ contractCurrency: v })}
                options={[
                  { v: "USD", l: "USD — US Dollar" },
                  { v: "DOP", l: "DOP — Peso Dominicano" },
                  { v: "EUR", l: "EUR — Euro" },
                ]} />
              <Input label={t("lbl_contract_date")} type="date" value={data.contractDate || ""} onChange={v => update({ contractDate: v })} />
              <div>
                <Input label={t("lbl_grace_days")} type="number" value={data.graceDays ?? ""} onChange={v => update({ graceDays: v })}
                  placeholder="5" />
                <div className="text-[11px] text-[#1A2342]/50 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {t("lbl_grace_days_help")}
                </div>
              </div>
              <div>
                <Input label={t("lbl_late_interest")} type="number" value={data.lateInterestPct ?? ""} onChange={v => update({ lateInterestPct: v })}
                  placeholder="0" />
                <div className="text-[11px] text-[#1A2342]/50 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {t("lbl_late_interest_help")}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Input textarea rows={4} label={t("lbl_contract_notes")} value={data.contractNotes || ""} onChange={v => update({ contractNotes: v })}
                placeholder={t("lbl_contract_notes_ph")} />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Payments */}
      {tab === "payments" && (
        <div className="space-y-6">
          <SectionTitle subtitle={t("sec_initial_deposit_sub")}>{t("sec_initial_deposit")}</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t("lbl_initial_deposit")} type="number" value={data.initialDeposit} onChange={v => update({ initialDeposit: v })} />
            <Input label={t("lbl_initial_deposit_date")} type="date" value={data.initialDepositDate} onChange={v => update({ initialDepositDate: v })} />
          </div>

          <div className="flex items-center justify-between">
            <SectionTitle className="mb-0 border-0 pb-0" subtitle={`${t("lbl_total_recorded")}: ${fmtUSD(paidAmount(data))} ${t("lbl_of")} ${fmtUSD(pricing.total)}`}>
              {t("sec_payment_history")}
            </SectionTitle>
            <Button onClick={addPayment} variant="outline" size="sm" icon={Plus}>{t("lbl_add_payment")}</Button>
          </div>

          <div className="space-y-2">
            {(data.payments || []).length === 0 ? (
              <div className="p-6 text-center text-sm text-[#1A2342]/50 bg-[#FDFBF6] border border-dashed border-[#1A2342]/20" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {t("lbl_no_payments")}
              </div>
            ) : (
              data.payments.map(p => {
                const planInstallments = data.paymentPlan?.installments || [];
                return (
                <div key={p.id} className="p-3 bg-[#FDFBF6] border border-[#1A2342]/10 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <Input label={t("pay_date")} type="date" value={p.date} onChange={v => updatePayment(p.id, { date: v })} className="col-span-2" />
                    <Input label={t("pay_amount")} type="number" value={p.amount} onChange={v => updatePayment(p.id, { amount: v })} className="col-span-2" />
                    <Select label={t("pay_type")} value={p.type} onChange={v => updatePayment(p.id, { type: v })}
                      options={[{v:"deposit",l:t("pay_type_deposit")},{v:"installment",l:t("pay_type_installment")},{v:"final",l:t("pay_type_final")}]}
                      className="col-span-2" />
                    <Select label={t("pay_method")} value={p.method} onChange={v => updatePayment(p.id, { method: v })} options={PAYMENT_METHODS} className="col-span-2" />
                    <Input label={t("pay_reference")} value={p.reference} onChange={v => updatePayment(p.id, { reference: v })} className="col-span-3" placeholder={t("pay_reference_ph")} />
                    <button type="button" onClick={() => removePayment(p.id)}
                      className="col-span-1 h-[34px] text-[#B04B3F] hover:bg-[#B04B3F]/10 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  {planInstallments.length > 0 && (
                    <div className="grid grid-cols-12 gap-2">
                      <Select
                        label={lang === "es" ? "Vincular a cuota del plan (opcional)" : "Link to plan installment (optional)"}
                        value={p.linkedInstallmentId || ""}
                        onChange={v => updatePayment(p.id, { linkedInstallmentId: v || null })}
                        options={[
                          { v: "", l: lang === "es" ? "— Sin vincular —" : "— Not linked —" },
                          ...planInstallments.map((inst, idx) => ({
                            v: inst.id,
                            l: `${idx + 1}. ${inst.concept || (lang === "es" ? `Cuota ${idx + 1}` : `Installment ${idx + 1}`)} — ${fmtUSD(inst.amount)}${inst.dueDate ? ` (${inst.dueDate})` : ""}`
                          }))
                        ]}
                        className="col-span-12"
                      />
                    </div>
                  )}
                </div>
                );
              })
            )}
          </div>

          {data.payments && data.payments.length > 0 && (
            <div className="p-4 bg-[#1A2342] text-[#F5F1E8]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#F5F1E8]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("lbl_payment_progress")}</span>
                <span className="text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>{paidPercentage(data).toFixed(1)}%</span>
              </div>
              <ProgressBar percent={paidPercentage(data)} color="#C9A961" />
              <div className="flex justify-between mt-3 text-xs" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <span className="text-[#F5F1E8]/70">{t("lbl_paid")}: {fmtUSD(paidAmount(data))}</span>
                <span className="text-[#F5F1E8]/70">{t("lbl_balance")}: {fmtUSD(pricing.total - paidAmount(data))}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Commission */}
      {tab === "commission" && (
        <div className="space-y-6">
          <SectionTitle subtitle={t("sec_commission_sub")}>{t("sec_commission")}</SectionTitle>

          <div className="p-4 bg-[#FDFBF6] border border-[#1A2342]/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("lbl_broker_name")} value={data.brokerName} onChange={v => update({ brokerName: v })} />
              <Input label={t("lbl_broker_company")} value={data.brokerCompany} onChange={v => update({ brokerCompany: v })} />
              <Input label={t("lbl_broker_phone")} value={data.brokerPhone} onChange={v => update({ brokerPhone: v })} placeholder="+1 809 555 1234" />
              <Input label={t("lbl_broker_email")} type="email" value={data.brokerEmail} onChange={v => update({ brokerEmail: v })} />
            </div>
          </div>

          {data.brokerName && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t("lbl_commission_pct")} type="number" value={data.brokerCommissionPct} onChange={v => update({ brokerCommissionPct: v })}
                  placeholder={`${t("lbl_commission_pct_ph")} (${settings.pricing?.defaultCommissionPct ?? 5}%)`} />
                <Input label={t("lbl_broker_paid_amount")} type="number" value={data.brokerPaidAmount} onChange={v => update({ brokerPaidAmount: v })} />
              </div>

              {/* Commission breakdown — internal only */}
              <div className="p-4 bg-[#1A2342] text-[#F5F1E8] space-y-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#F5F1E8]/60 mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {t("sec_commission")}
                </div>
                {(() => {
                  const c = computeCommission(data, settings);
                  return (
                    <>
                      <div className="flex justify-between text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        <span className="text-[#F5F1E8]/80">{t("lbl_commission_pct")}</span>
                        <span>{c.pct}%</span>
                      </div>
                      <div className="flex justify-between text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        <span className="text-[#F5F1E8]/80">{t("lbl_commission_total")}</span>
                        <span>{fmtUSD(c.totalCommission)}</span>
                      </div>
                      <div className="flex justify-between text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        <span className="text-[#F5F1E8]/80">{t("lbl_commission_earned")}</span>
                        <span className="text-[#C9A961]">{fmtUSD(c.earnedByBroker)}</span>
                      </div>
                      <div className="flex justify-between text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        <span className="text-[#F5F1E8]/80">{t("lbl_commission_paid")}</span>
                        <span>{fmtUSD(c.paidToBroker)}</span>
                      </div>
                      <div className="border-t border-[#F5F1E8]/20 pt-2 mt-2 flex justify-between" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }}>
                        <span>{t("lbl_commission_pending")}</span>
                        <span className={c.pendingToBroker > 0 ? "text-[#D4A24C]" : ""}>{fmtUSD(c.pendingToBroker)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="p-3 bg-[#FDFBF6] border-l-2 border-[#C9A961]">
                <div className="text-[11px] text-[#1A2342]/70 mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  ℹ {t("lbl_commission_base_note")}
                </div>
                <div className="text-[11px] text-[#1A2342]/70" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  ℹ {t("lbl_commission_progress_note")}
                </div>
              </div>

              <Input textarea rows={3} label={t("lbl_broker_notes")} value={data.brokerNotes} onChange={v => update({ brokerNotes: v })} />
            </>
          )}
        </div>
      )}

      {/* Tab: Documents */}
      {tab === "documents" && (
        <DocumentsSection
          clientId={data.id}
          documents={data.documents || []}
          onDocumentsChange={(docs) => update({ documents: docs })}
        />
      )}

      {/* Tab: Notes */}
      {tab === "notes" && (
        <div className="space-y-6">
          <SectionTitle subtitle={t("sec_internal_notes_sub")}>{t("sec_internal_notes")}</SectionTitle>
          <Input textarea rows={10} value={data.notes} onChange={v => update({ notes: v })}
            placeholder={t("lbl_notes_ph")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t("lbl_assigned_to")} value={data.assignedTo} onChange={v => update({ assignedTo: v })} />
            <Input label={t("lbl_lead_source")} value={data.leadSource} onChange={v => update({ leadSource: v })}
              placeholder={t("lbl_lead_source_ph")} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#1A2342]/10">
        <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {t("lbl_id_label")}: {data.id} · {t("lbl_created")}: {fmtDate(data.createdAt)}
        </div>
        <div className="flex gap-2">
          <Button onClick={onCancel} variant="ghost">{t("cancel")}</Button>
          <Button onClick={save} variant="primary" icon={Check}>{t("lbl_save_client")}</Button>
        </div>
      </div>
    </div>
  );
}

// ------------------------- Client Detail View -------------------------

// ------------------------- Stage System Components -------------------------

function StageStepper({ currentStage, lang }) {
  const currentIdx = STAGES.indexOf(currentStage);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-0 relative">
        {STAGES.map((stage, idx) => {
          const cfg = STAGE_CONFIG[stage];
          const isActive = idx === currentIdx;
          const isPast = idx < currentIdx;
          const isFuture = idx > currentIdx;
          const label = lang === "es" ? cfg.label : cfg.labelEn;
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center flex-1 min-w-0 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isActive ? "ring-4" : ""
                }`}
                  style={{
                    backgroundColor: isPast || isActive ? cfg.color : "#FDFBF6",
                    color: isPast || isActive ? "#F5F1E8" : "#1A2342",
                    border: `2px solid ${isPast || isActive ? cfg.color : "rgba(26,35,66,0.2)"}`,
                    ringColor: cfg.bg,
                  }}>
                  {isPast ? <Check className="w-4 h-4" strokeWidth={2.5} /> : idx + 1}
                </div>
                <div className="text-center mt-2 px-1">
                  <div className={`text-[10px] uppercase tracking-[0.12em] ${isActive ? "font-semibold" : ""}`}
                    style={{ color: isActive ? cfg.color : "#1A2342", opacity: isFuture ? 0.5 : 1, fontFamily: "'Manrope', sans-serif" }}>
                    {label}
                  </div>
                </div>
              </div>
              {idx < STAGES.length - 1 && (
                <div className="flex-1 h-0.5 -mx-1 mt-4 relative z-0" style={{
                  backgroundColor: idx < currentIdx ? STAGE_CONFIG[STAGES[idx]].color : "rgba(26,35,66,0.15)",
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function StageRequirementsChecklist({ client, targetStage, onGoToTab, lang }) {
  const { t } = useT();
  const items = getStageRequirements(client, targetStage);
  const allDone = items.every(i => i.done);
  const nextCfg = STAGE_CONFIG[targetStage];

  if (items.length === 0) return null;

  return (
    <div className="p-4 bg-[#FDFBF6] border border-[#1A2342]/15 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("stage_next")}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nextCfg.color }} />
            <span className="text-[#1A2342] font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem" }}>
              {lang === "es" ? nextCfg.label : nextCfg.labelEn}
            </span>
          </div>
        </div>
        {allDone && (
          <Badge color="#2D5E3E" bg="#D4E6D8">
            <Check className="w-3 h-3 inline mr-1" strokeWidth={2.5} />
            {t("stage_all_complete")}
          </Badge>
        )}
      </div>

      <div className="text-[11px] uppercase tracking-[0.12em] text-[#1A2342]/60 pt-2 border-t border-[#1A2342]/10" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {t("stage_requirements")}:
      </div>

      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item.key} className="flex items-start gap-2 text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {item.done ? (
              <Check className="w-4 h-4 text-[#2D5E3E] flex-shrink-0 mt-0.5" strokeWidth={2} />
            ) : (
              <div className="w-4 h-4 border-2 border-[#1A2342]/25 flex-shrink-0 mt-0.5" />
            )}
            <span className={`flex-1 ${item.done ? "text-[#1A2342]/60 line-through" : "text-[#1A2342]"}`}>
              {lang === "es" ? item.label : item.labelEn}
            </span>
            {!item.done && onGoToTab && (
              <button onClick={() => onGoToTab(item.tab)}
                className="text-[11px] text-[#4A6FA5] hover:text-[#1A2342] underline underline-offset-2"
                style={{ fontFamily: "'Manrope', sans-serif" }}>
                {t("stage_go_to_tab")}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Quick create wizard — 3 simple fields for new prospect
function QuickCreateModal({ open, onClose, onCreate }) {
  const { t, lang } = useT();
  const [type, setType] = useState("individual");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    const finalName = name.trim();
    if (!finalName) {
      alert(t("qc_need_name"));
      return;
    }
    if (!email.trim() && !phone.trim()) {
      alert(t("qc_need_contact"));
      return;
    }
    const baseClient = {
      id: uid(),
      type,
      fullName: type === "individual" ? finalName : "",
      companyName: type === "entity" ? finalName : "",
      email: email.trim(),
      phone: phone.trim(),
      status: "lead",
      stage: "prospect",
      notes: source.trim() ? `${lang === "es" ? "Origen" : "Source"}: ${source.trim()}` : "",
      createdAt: new Date().toISOString(),
      payments: [],
      documents: [],
    };
    onCreate(baseClient);
    // Reset form
    setType("individual");
    setName("");
    setEmail("");
    setPhone("");
    setSource("");
  };

  return (
    <div className="fixed inset-0 bg-[#1A2342]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#F5F1E8] border border-[#1A2342]/15 w-full max-w-md">
        <div className="px-6 py-4 border-b border-[#1A2342]/10 flex items-center justify-between">
          <div>
            <h2 className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 500 }}>
              {t("qc_title")}
            </h2>
            <p className="text-[11px] text-[#1A2342]/60 mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t("qc_sub")}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1A2342]/10 transition-colors">
            <X className="w-4 h-4 text-[#1A2342]/60" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Select label={t("qc_type")} value={type} onChange={setType}
            options={[
              { v: "individual", l: t("qc_type_individual") },
              { v: "entity",     l: t("qc_type_entity") },
            ]} />

          <Input label={type === "entity" ? t("qc_company") : t("qc_name")} value={name} onChange={setName} required />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label={t("qc_email")} type="email" value={email} onChange={setEmail} placeholder="cliente@email.com" />
            <Input label={t("qc_phone")} value={phone} onChange={setPhone} placeholder="+1 809 555 1234" />
          </div>

          <Input label={t("qc_source")} value={source} onChange={setSource} placeholder={t("qc_source_ph")} />
        </div>

        <div className="px-6 py-4 border-t border-[#1A2342]/10 flex justify-end gap-2">
          <Button onClick={onClose} variant="ghost">{t("cancel")}</Button>
          <Button onClick={handleCreate} variant="primary" icon={Plus}>{t("qc_create")}</Button>
        </div>
      </div>
    </div>
  );
}

function ClientDetail({ client, onEdit, onEditTab, onAdvanceStage, onClose, onDelete, onGeneratePayment }) {
  const { t, lang } = useT();
  const settings = useSettings();
  const villaModels = settings.villaModels || DEFAULT_SETTINGS.villaModels;
  const lots = settings.lots || DEFAULT_SETTINGS.lots;
  const pricing = computePrice(client, settings);
  const paid = paidAmount(client);
  const pct = paidPercentage(client, settings);
  const model = villaModels[client.villaModel];
  const name = client.type === "entity" ? client.companyName : client.fullName;

  const InfoRow = ({ label, value, icon: Icon }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex items-start gap-3 py-1.5 text-sm">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#1A2342]/40 mt-1 flex-shrink-0" strokeWidth={1.5} />}
        <div className="w-44 text-[11px] uppercase tracking-[0.08em] text-[#1A2342]/50 pt-0.5 flex-shrink-0" style={{ fontFamily: "'Manrope', sans-serif" }}>{label}</div>
        <div className="flex-1 text-[#1A2342]" style={{ fontFamily: "'Manrope', sans-serif" }}>{value || "—"}</div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {client.type === "entity" ? <Building2 className="w-5 h-5 text-[#1A2342]/50" strokeWidth={1.3} /> : <UserCircle className="w-5 h-5 text-[#1A2342]/50" strokeWidth={1.3} />}
            <h1 className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 500, letterSpacing: "0.02em" }}>
              {name || t("cd_unnamed")}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={client.status} />
            {client.isPep && <Badge color="#B04B3F" bg="#F3DDD9">PEP</Badge>}
            {client.kycComplete && <Badge color="#2D5E3E" bg="#D4E6D8">KYC ✓</Badge>}
            {client.riskLevel && (
              <Badge color={RISK_LEVELS.find(r => r.v === client.riskLevel)?.color} bg="#EFEAE0">
                {lang === "es" ? "Riesgo" : "Risk"} {t("risk_" + client.riskLevel)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => onGeneratePayment(client)} variant="gold" icon={Receipt}>{t("cd_gen_payment_btn")}</Button>
          <Button onClick={onEdit} variant="primary" icon={Edit3} title={t("edit_full_help")}>{t("edit_full")}</Button>
          <Button onClick={() => { if (confirm(t("lbl_confirm_delete"))) onDelete(client.id); }} variant="danger" icon={Trash2}>{t("delete")}</Button>
        </div>
      </div>

      {/* Stage Progress */}
      {(() => {
        const currentStage = getClientStage(client);
        const nextStage = getNextStage(currentStage);
        const canAdvance = nextStage ? canAdvanceToStage(client, nextStage) : false;
        return (
          <div className="bg-[#FDFBF6] border border-[#1A2342]/10 p-5 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {t("stage_progress")}
                </div>
                <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }}>
                  {lang === "es" ? STAGE_CONFIG[currentStage].label : STAGE_CONFIG[currentStage].labelEn}
                </div>
              </div>
              {nextStage && canAdvance && (
                <Button onClick={onAdvanceStage} variant="gold" icon={Check}>
                  {t("stage_advance_to")} {lang === "es" ? STAGE_CONFIG[nextStage].label : STAGE_CONFIG[nextStage].labelEn}
                </Button>
              )}
            </div>
            <StageStepper currentStage={currentStage} lang={lang} />
            {nextStage && !canAdvance && (
              <StageRequirementsChecklist
                client={client}
                targetStage={nextStage}
                onGoToTab={onEditTab}
                lang={lang}
              />
            )}
          </div>
        );
      })()}

      {/* Villa & Price Summary */}
      {(client.lotNumber || client.villaModel) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#1A2342]/15">
          <div className="p-5 border-b md:border-b-0 md:border-r border-[#1A2342]/15">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("cd_villa_assigned")}</div>
            <div className="text-2xl text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {client.lotNumber ? `#${client.lotNumber}` : "—"}
            </div>
            {model && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2" style={{ backgroundColor: model.color }} />
                <span className="text-sm text-[#1A2342]/70" style={{ fontFamily: "'Manrope', sans-serif" }}>{model.name}</span>
              </div>
            )}
            {client.lotNumber && (
              <div className="text-[11px] text-[#1A2342]/50 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {t("villa_terrain")}: {fmtArea(lots[client.lotNumber], lang)}
              </div>
            )}
          </div>
          <div className="p-5 border-b md:border-b-0 md:border-r border-[#1A2342]/15">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("cd_price_total")}</div>
            <div className="text-2xl text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{fmtUSD(pricing.total)}</div>
            <div className="text-[11px] text-[#1A2342]/60 mt-1 space-y-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <div>{t("cd_price_base")}: {fmtUSD(pricing.base)}</div>
              {pricing.smart > 0 && <div>{t("cd_price_smart")}: {fmtUSD(pricing.smart)}</div>}
              {pricing.furniture > 0 && <div>{t("cd_price_furniture")}: {fmtUSD(pricing.furniture)}</div>}
              {pricing.discount > 0 && <div className="text-[#C9A961]">{t("cd_price_discount")}: {fmtUSD(pricing.discount)}</div>}
            </div>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("cd_pay_progress")}</div>
            <div className="text-2xl text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{pct.toFixed(1)}%</div>
            <ProgressBar percent={pct} color="#C9A961" />
            <div className="flex justify-between text-[11px] text-[#1A2342]/60 mt-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <span>{t("lbl_paid")}: {fmtUSD(paid)}</span>
              <span>{t("lbl_balance")}: {fmtUSD(pricing.total - paid)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Personal Info */}
      <div>
        <SectionTitle>{client.type === "entity" ? t("sec_corporate") : t("sec_personal")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {client.type === "entity" ? (
            <>
              <InfoRow label={t("info_legal_name")} value={client.companyName} />
              <InfoRow label={t("info_rnc")} value={client.rnc} />
              <InfoRow label={t("info_tax_id")} value={client.businessTaxId} />
              <InfoRow label={t("info_incorp")} value={fmtDate(client.incorporationDate)} />
              <InfoRow label={t("info_country")} value={client.incorporationCountry} />
              <InfoRow label={t("info_activity")} value={client.businessActivity} />
              <InfoRow label={t("info_legal_rep")} value={client.legalRepName} />
              <InfoRow label={t("info_legal_rep_pos")} value={client.legalRepPosition} />
              <InfoRow label={t("info_legal_rep_id")} value={client.legalRepId} />
              <InfoRow label={t("info_website")} value={client.website} icon={Globe} />
            </>
          ) : (
            <>
              <InfoRow label={t("info_name")} value={client.fullName} />
              <InfoRow label={t("info_nationality")} value={client.nationality} />
              <InfoRow label={t("info_id")} value={client.idNumber ? `${ID_TYPES.find(tp => tp.v === client.idType)?.l || ""} — ${client.idNumber}` : ""} />
              <InfoRow label={t("info_country_issue")} value={client.countryOfIssue} />
              <InfoRow label={t("info_dob")} value={fmtDate(client.dateOfBirth)} />
              <InfoRow label={t("info_pob")} value={client.placeOfBirth} />
              <InfoRow label={t("info_marital")} value={client.maritalStatus} />
              <InfoRow label={t("info_spouse")} value={client.spouseName} />
              <InfoRow label={t("info_profession")} value={client.profession} icon={Briefcase} />
              <InfoRow label={t("info_employer")} value={client.employer} />
              <InfoRow label={t("info_position")} value={client.position} />
              <InfoRow label={t("info_tax_id")} value={client.taxId} />
            </>
          )}
        </div>
      </div>

      {/* Contact */}
      <div>
        <SectionTitle>{t("sec_contact")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <InfoRow label={t("info_email")} value={client.email} icon={Mail} />
          <InfoRow label={t("info_phone")} value={client.phone} icon={Phone} />
          <InfoRow label={t("info_phone2")} value={client.phoneSecondary} icon={Phone} />
          <InfoRow label={t("info_address")} value={client.address} icon={MapPin} />
        </div>
      </div>

      {/* AML */}
      <div>
        <SectionTitle>{t("cd_aml_compliance")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <InfoRow label={t("info_pep")} value={client.isPep ? t("info_pep_yes") + (client.pepPosition || "") : t("info_pep_no")} />
          <InfoRow label={t("info_payment_method")} value={PAYMENT_METHODS.find(m => m.v === client.paymentMethod)?.l} />
          <InfoRow label={t("info_origin_bank")} value={client.originBank} />
          <InfoRow label={t("info_source_funds")} value={client.sourceOfFunds} />
        </div>
        {(client.ubos && client.ubos.filter(u => u.name).length > 0) && (
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("cd_ubos_list")}</div>
            <div className="space-y-1">
              {client.ubos.filter(u => u.name).map((u, i) => (
                <div key={i} className="flex gap-3 text-sm p-2 bg-[#FDFBF6]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  <span className="text-[#1A2342] font-medium">{u.name}</span>
                  <span className="text-[#1A2342]/60">{u.nationality}</span>
                  <span className="text-[#1A2342]/60">{u.idNumber}</span>
                  <span className="ml-auto text-[#C9A961] font-medium">{u.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      {client.payments && client.payments.length > 0 && (
        <div>
          <SectionTitle>{t("cd_payment_history")}</SectionTitle>
          <div className="border border-[#1A2342]/10 overflow-x-auto">
            <div className="min-w-[600px]">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[#1A2342]/5 text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <div className="col-span-2">{t("pay_date")}</div>
              <div className="col-span-2">{t("pay_type")}</div>
              <div className="col-span-3">{t("pay_method")}</div>
              <div className="col-span-3">{t("pay_reference")}</div>
              <div className="col-span-2 text-right">{lang === "es" ? "Monto" : "Amount"}</div>
            </div>
            {client.payments.map(p => (
              <div key={p.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 border-t border-[#1A2342]/10 text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                <div className="col-span-2 text-[#1A2342]">{fmtDate(p.date)}</div>
                <div className="col-span-2 text-[#1A2342]/70 capitalize">{p.type === "deposit" ? t("pay_type_deposit") : p.type === "installment" ? t("pay_type_installment") : p.type === "final" ? t("pay_type_final") : p.type}</div>
                <div className="col-span-3 text-[#1A2342]/70">{PAYMENT_METHODS.find(m => m.v === p.method)?.l || p.method}</div>
                <div className="col-span-3 text-[#1A2342]/70">{p.reference || "—"}</div>
                <div className="col-span-2 text-right text-[#1A2342] font-medium">{fmtUSD(p.amount)}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div>
          <SectionTitle>{t("cd_notes")}</SectionTitle>
          <div className="p-4 bg-[#FDFBF6] text-sm text-[#1A2342] whitespace-pre-wrap border border-[#1A2342]/10" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {client.notes}
          </div>
        </div>
      )}

      {/* Payment Plan — read-only view */}
      {client.paymentPlan && client.paymentPlan.installments && client.paymentPlan.installments.length > 0 && (() => {
        const planTotals = computePlanTotals(client.paymentPlan);
        const STATUS_STYLES = {
          paid:             { color: "#2D5E3E", bg: "#D4E6D8", label: t("plan_status_paid") },
          pending:          { color: "#1A2342", bg: "#D9DDE8", label: t("plan_status_pending") },
          partial:          { color: "#C9A961", bg: "#F4EBD4", label: t("plan_status_partial") },
          overdue:          { color: "#B04B3F", bg: "#F3DDD9", label: t("plan_status_overdue") },
          partial_overdue:  { color: "#B04B3F", bg: "#F3DDD9", label: t("plan_status_partial_overdue") },
        };
        return (
          <div>
            <SectionTitle>{t("sec_payment_plan")}</SectionTitle>
            <div className="border border-[#1A2342]/10 overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[#1A2342]/5 text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">{t("plan_concept")}</div>
                  <div className="col-span-2">{t("plan_due_date")}</div>
                  <div className="col-span-2 text-right">{t("plan_amount")}</div>
                  <div className="col-span-2 text-right">{t("plan_paid_amount")}</div>
                  <div className="col-span-1">{t("plan_status")}</div>
                </div>
                {client.paymentPlan.installments.map((inst, idx) => {
                  const status = getInstallmentStatus(inst);
                  const cfg = STATUS_STYLES[status];
                  return (
                    <div key={inst.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-[#1A2342]/10 items-center text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      <div className="col-span-1 text-[#1A2342]/60">{idx + 1}</div>
                      <div className="col-span-4 text-[#1A2342]">{inst.concept || `Cuota ${idx + 1}`}</div>
                      <div className="col-span-2 text-[#1A2342]/70">{inst.dueDate ? fmtDate(inst.dueDate) : "—"}</div>
                      <div className="col-span-2 text-right text-[#1A2342] font-medium">{fmtUSD(inst.amount)}</div>
                      <div className="col-span-2 text-right text-[#1A2342]/70">{fmtUSD(inst.paidAmount)}</div>
                      <div className="col-span-1">
                        <span className="inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em]" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[#1A2342]/15 mt-3">
              <div className="p-3 border-r border-b md:border-b-0 border-[#1A2342]/15">
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("plan_total_expected")}</div>
                <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>{fmtUSD(planTotals.expected)}</div>
              </div>
              <div className="p-3 md:border-r border-b md:border-b-0 border-[#1A2342]/15">
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("plan_total_received")}</div>
                <div className="text-[#C9A961]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>{fmtUSD(planTotals.received)}</div>
              </div>
              <div className="p-3 border-r border-[#1A2342]/15">
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("plan_total_pending")}</div>
                <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>{fmtUSD(planTotals.pending)}</div>
              </div>
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>{lang === "es" ? "Cuotas Pagadas" : "Installments Paid"}</div>
                <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>{planTotals.paidCount}/{planTotals.count}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Broker Commission — internal view */}
      {client.brokerName && (() => {
        const c = computeCommission(client, settings);
        return (
          <div>
            <SectionTitle subtitle={t("sec_commission_sub")}>{t("sec_commission")}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-4">
              <InfoRow label={t("lbl_broker_name")} value={client.brokerName} icon={Briefcase} />
              <InfoRow label={t("lbl_broker_company")} value={client.brokerCompany} />
              <InfoRow label={t("lbl_broker_phone")} value={client.brokerPhone} icon={Phone} />
              <InfoRow label={t("lbl_broker_email")} value={client.brokerEmail} icon={Mail} />
            </div>
            <div className="p-4 bg-[#FDFBF6] border border-[#1A2342]/10 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/50 mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("lbl_commission_total")}</div>
                <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}>{fmtUSD(c.totalCommission)}</div>
                <div className="text-[10px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>{c.pct}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/50 mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("lbl_commission_earned")}</div>
                <div className="text-[#C9A961]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}>{fmtUSD(c.earnedByBroker)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/50 mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("lbl_commission_paid")}</div>
                <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}>{fmtUSD(c.paidToBroker)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/50 mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("lbl_commission_pending")}</div>
                <div className={c.pendingToBroker > 0 ? "text-[#D4A24C]" : "text-[#1A2342]"} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem" }}>{fmtUSD(c.pendingToBroker)}</div>
              </div>
            </div>
            {client.brokerNotes && (
              <div className="p-3 bg-[#FDFBF6] text-sm text-[#1A2342] whitespace-pre-wrap border border-[#1A2342]/10 mt-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {client.brokerNotes}
              </div>
            )}
          </div>
        );
      })()}

      {/* Documents */}
      {client.documents && client.documents.length > 0 && (
        <div>
          <SectionTitle>{t("doc_section")}</SectionTitle>
          <div className="space-y-1.5">
            {client.documents.map((doc, idx) => (
              <div key={doc.path || idx}
                className="flex items-center gap-3 p-3 bg-[#FDFBF6] border border-[#1A2342]/10">
                <Paperclip className="w-4 h-4 text-[#4A6FA5] flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1A2342] truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {doc.name}
                    </span>
                    <Badge color="#1A2342" bg="#D9DDE8">
                      {t("doc_type_" + (
                        doc.type === "drivers_license" ? "drivers" :
                        doc.type === "bank_reference" ? "bank_ref" :
                        doc.type === "proof_address" ? "proof_address" :
                        doc.type === "funds_proof" ? "funds_proof" :
                        doc.type === "good_standing" ? "good_standing" :
                        doc.type === "kyc_form" ? "kyc_form" :
                        doc.type
                      )) || doc.type}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {fmtDate(doc.uploadedAt)}
                  </div>
                </div>
                <button onClick={async () => {
                  try {
                    const url = await getDocumentUrl(doc.path);
                    window.open(url, "_blank");
                  } catch (e) { alert(e.message); }
                }}
                  className="p-2 hover:bg-[#1A2342]/10 transition-colors"
                  title={t("doc_view")}>
                  <Eye className="w-4 h-4 text-[#1A2342]/60" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[11px] text-[#1A2342]/40 pt-6 border-t border-[#1A2342]/10" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {t("lbl_id_label")}: {client.id} · {t("lbl_created")}: {fmtDate(client.createdAt)} · {t("lbl_updated")}: {fmtDate(client.updatedAt)}
      </div>
    </div>
  );
}

// ------------------------- Dashboard -------------------------

function Dashboard({ clients, onNewClient, onExport, onGoToClients, onGoToVillas }) {
  const { t } = useT();
  const settings = useSettings();
  const totalLots = Object.keys(settings.lots || DEFAULT_SETTINGS.lots).length;
  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((s, c) => s + computePrice(c, settings).total, 0);
    const totalPaid = clients.reduce((s, c) => s + paidAmount(c), 0);
    const active = clients.filter(c => ["reserved","contract","active"].includes(c.status)).length;
    const byStatus = STATUS_ORDER.reduce((acc, s) => { acc[s] = clients.filter(c => c.status === s).length; return acc; }, {});
    const soldLots = new Set(clients.filter(c => c.lotNumber && c.status !== "cancelled").map(c => String(c.lotNumber)));
    // Commission totals
    let totalCommissions = 0, earnedCommissions = 0, pendingCommissions = 0;
    // Installment alerts across all active clients
    let totalOverdue = 0, totalUpcoming = 0;
    const overdueClients = [], upcomingClients = [];
    clients.forEach(c => {
      if (c.brokerName) {
        const comm = computeCommission(c, settings);
        totalCommissions += comm.totalCommission;
        earnedCommissions += comm.earnedByBroker;
        pendingCommissions += comm.pendingToBroker;
      }
      if (c.paymentPlan && !["cancelled","completed"].includes(c.status)) {
        const pt = computePlanTotals(c.paymentPlan);
        if (pt.overdueCount > 0) {
          totalOverdue += pt.overdueCount;
          overdueClients.push({ id: c.id, name: c.fullName || c.companyName, count: pt.overdueCount });
        }
        if (pt.upcomingCount > 0) {
          totalUpcoming += pt.upcomingCount;
          upcomingClients.push({ id: c.id, name: c.fullName || c.companyName, count: pt.upcomingCount });
        }
      }
    });
    return { totalRevenue, totalPaid, active, byStatus, soldLots: soldLots.size, availableLots: totalLots - soldLots.size, totalCommissions, earnedCommissions, pendingCommissions, totalOverdue, totalUpcoming, overdueClients, upcomingClients };
  }, [clients, settings, totalLots]);

  const recentClients = useMemo(() => [...clients].sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "")).slice(0, 5), [clients]);
  const topPipeline = useMemo(() => clients.filter(c => !["cancelled","completed"].includes(c.status)).sort((a,b) => computePrice(b, settings).total - computePrice(a, settings).total).slice(0, 5), [clients, settings]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 py-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#1A2342]/50 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("tagline")}</div>
          <h1 className="text-[#1A2342] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "3rem", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1 }}>
            AMBAR <span className="text-[#4A6FA5]">Longevity Estate</span>
          </h1>
          <p className="text-[#1A2342]/60 text-sm max-w-xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[#1A2342]/15">
        {[
          { label: t("dash_total_clients"), value: clients.length, sub: `${stats.active} ${t("dash_total_clients_sub")}` },
          { label: t("dash_pipeline_total"), value: fmtUSD(stats.totalRevenue), sub: t("dash_pipeline_total_sub") },
          { label: t("dash_collected"), value: fmtUSD(stats.totalPaid), sub: stats.totalRevenue ? `${((stats.totalPaid/stats.totalRevenue)*100).toFixed(1)}% ${t("dash_collected_sub")}` : "0%" },
          { label: t("dash_villas_assigned"), value: `${stats.soldLots}/35`, sub: `${stats.availableLots} ${t("dash_villas_assigned_sub")}` },
        ].map((k, i) => (
          <div key={i} className={`p-4 md:p-6 ${i % 2 === 0 ? "md:border-r border-r border-[#1A2342]/15" : ""} ${i < 2 ? "border-b md:border-b-0 border-[#1A2342]/15" : ""} ${i === 2 ? "md:border-r border-[#1A2342]/15" : ""}`}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>{k.label}</div>
            <div className="text-[#1A2342] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 500 }}>{k.value}</div>
            <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Installment Alerts — shown only if there are overdue or upcoming */}
      {(stats.totalOverdue > 0 || stats.totalUpcoming > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.totalOverdue > 0 && (
            <button onClick={onGoToClients}
              className="p-4 bg-[#F3DDD9] border-l-4 border-[#B04B3F] flex items-start gap-3 text-left hover:bg-[#EECFC8] transition-colors">
              <AlertTriangle className="w-5 h-5 text-[#B04B3F] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#B04B3F]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {stats.totalOverdue} {t("alert_overdue_installments")}
                </div>
                <div className="text-[11px] text-[#1A2342]/70 mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {stats.overdueClients.slice(0, 3).map(c => c.name).join(" · ")}
                  {stats.overdueClients.length > 3 ? ` · +${stats.overdueClients.length - 3}` : ""}
                </div>
              </div>
            </button>
          )}
          {stats.totalUpcoming > 0 && (
            <button onClick={onGoToClients}
              className="p-4 bg-[#F4EBD4] border-l-4 border-[#C9A961] flex items-start gap-3 text-left hover:bg-[#EEE2C2] transition-colors">
              <Clock className="w-5 h-5 text-[#C9A961] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#8B7430]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {stats.totalUpcoming} {t("alert_upcoming_installments")}
                </div>
                <div className="text-[11px] text-[#1A2342]/70 mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {stats.upcomingClients.slice(0, 3).map(c => c.name).join(" · ")}
                  {stats.upcomingClients.length > 3 ? ` · +${stats.upcomingClients.length - 3}` : ""}
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Commissions Summary — shown only if there are brokers */}
      {stats.totalCommissions > 0 && (
        <div>
          <SectionTitle subtitle={t("sec_commission_sub")}>{t("sec_commission")}</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-[#1A2342]/15">
            <div className="p-5 border-b sm:border-b-0 sm:border-r border-[#1A2342]/15">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("lbl_commission_total")}</div>
              <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 500 }}>{fmtUSD(stats.totalCommissions)}</div>
            </div>
            <div className="p-5 border-b sm:border-b-0 sm:border-r border-[#1A2342]/15">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("lbl_commission_earned")}</div>
              <div className="text-[#C9A961]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 500 }}>{fmtUSD(stats.earnedCommissions)}</div>
            </div>
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("lbl_commission_pending")}</div>
              <div className={stats.pendingCommissions > 0 ? "text-[#D4A24C]" : "text-[#1A2342]"} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 500 }}>{fmtUSD(stats.pendingCommissions)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline breakdown */}
      <div>
        <SectionTitle>{t("dash_pipeline_by_status")}</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {STATUS_ORDER.map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = stats.byStatus[s] || 0;
            return (
              <div key={s} className="p-3 border border-[#1A2342]/10" style={{ backgroundColor: cfg.bg }}>
                <div className="text-[9px] uppercase tracking-[0.12em] mb-1" style={{ color: cfg.color, fontFamily: "'Manrope', sans-serif" }}>{t("status_" + s)}</div>
                <div className="text-2xl text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Recent & Top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <SectionTitle>{t("dash_recent_activity")}</SectionTitle>
          {recentClients.length === 0 ? (
            <div className="text-sm text-[#1A2342]/50 py-6" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("dash_no_activity")}</div>
          ) : (
            <div className="space-y-1">
              {recentClients.map(c => (
                <button key={c.id} onClick={onGoToClients} className="w-full flex items-center gap-3 p-3 hover:bg-[#1A2342]/5 border border-transparent hover:border-[#1A2342]/10 transition-all text-left">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#1A2342] truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {c.fullName || c.companyName || t("cd_unnamed")}
                    </div>
                    <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
                      {c.lotNumber ? `Villa #${c.lotNumber} · ` : ""}{fmtDate(c.updatedAt || c.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionTitle>{t("dash_top_pipeline")}</SectionTitle>
          {topPipeline.length === 0 ? (
            <div className="text-sm text-[#1A2342]/50 py-6" style={{ fontFamily: "'Manrope', sans-serif" }}>{t("dash_no_pipeline")}</div>
          ) : (
            <div className="space-y-1">
              {topPipeline.map(c => {
                const p = computePrice(c, settings);
                const pct = paidPercentage(c, settings);
                return (
                  <div key={c.id} className="p-3 border border-[#1A2342]/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-[#1A2342] truncate flex-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        {c.fullName || c.companyName}
                      </div>
                      <div className="text-sm text-[#1A2342] ml-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{fmtUSD(p.total)}</div>
                    </div>
                    <ProgressBar percent={pct} color={STATUS_CONFIG[c.status]?.color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap pt-4 border-t border-[#1A2342]/10">
        <Button onClick={onNewClient} variant="primary" icon={Plus}>{t("new_client")}</Button>
        <Button onClick={onGoToClients} variant="outline" icon={Users}>{t("dash_see_clients")}</Button>
        <Button onClick={onGoToVillas} variant="outline" icon={Home}>{t("dash_villa_map")}</Button>
        <Button onClick={onExport} variant="gold" icon={FileDown}>{t("dash_export_excel")}</Button>
      </div>
    </div>
  );
}

// ------------------------- Villas Grid View -------------------------

function VillasView({ clients, onClickClient }) {
  const { t, lang } = useT();
  const settings = useSettings();
  const lots = settings.lots || DEFAULT_SETTINGS.lots;
  const villaModels = settings.villaModels || DEFAULT_SETTINGS.villaModels;
  const pricing = settings.pricing || DEFAULT_SETTINGS.pricing;
  const villaStatus = useMemo(() => {
    const map = {};
    Object.keys(lots).forEach(n => { map[n] = { available: true, client: null }; });
    clients.forEach(c => {
      if (c.lotNumber && c.status !== "cancelled") {
        map[c.lotNumber] = { available: false, client: c };
      }
    });
    return map;
  }, [clients, lots]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[#1A2342] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 400, letterSpacing: "0.02em" }}>
          {t("villa_map_title")}
        </h1>
        <p className="text-sm text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {Object.keys(lots).length} {lang === "es" ? "lotes" : "lots"} · 12 acres · Blue Amber Zone
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <div className="flex items-center gap-2"><div className="w-3 h-3 border border-[#1A2342]/30 bg-[#FDFBF6]" /><span className="text-[#1A2342]/70">{t("villa_legend_available")}</span></div>
        {STATUS_ORDER.filter(s => s !== "cancelled" && s !== "lead").map(s => {
          const cfg = STATUS_CONFIG[s];
          return <div key={s} className="flex items-center gap-2"><div className="w-3 h-3" style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}` }} /><span className="text-[#1A2342]/70">{t("status_" + s)}</span></div>;
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
        {Object.keys(LOT_SIZES_FT2).map(n => {
          const v = villaStatus[n];
          const cfg = v.client ? STATUS_CONFIG[v.client.status] : null;
          const model = v.client ? villaModels[v.client.villaModel] : null;
          return (
            <button key={n}
              onClick={() => v.client && onClickClient(v.client.id)}
              disabled={!v.client}
              className={`aspect-square p-3 border text-left transition-all flex flex-col ${v.client ? "hover:shadow-md cursor-pointer" : "cursor-default"}`}
              style={{
                backgroundColor: cfg ? cfg.bg : "#FDFBF6",
                borderColor: cfg ? cfg.color : "rgba(26,35,66,0.15)",
                borderWidth: cfg ? "1px" : "1px",
              }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>#{n}</span>
                {model && <div className="w-2 h-2" style={{ backgroundColor: model.color }} />}
              </div>
              <div className="text-2xl text-[#1A2342] mb-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {v.client ? "●" : "○"}
              </div>
              <div className="text-[9px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {fmtArea(lots[n], lang)}
              </div>
              {v.client && (
                <div className="text-[10px] text-[#1A2342] truncate mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {(v.client.fullName || v.client.companyName || "").split(" ")[0]}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Models Legend */}
      <div className="pt-4 border-t border-[#1A2342]/10">
        <SectionTitle>{t("villa_models_available")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(villaModels).map(([k, m]) => {
            const base = Number(m.sqft || 0) * Number(pricing.pricePerSqft || 271);
            return (
              <div key={k} className="p-4 border border-[#1A2342]/15">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3" style={{ backgroundColor: m.color }} />
                  <span className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>{m.name}</span>
                </div>
                <div className="text-[11px] text-[#1A2342]/60 space-y-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  <div>{Number(m.sqft || 0).toLocaleString()} ft² · {Number(m.sqm || 0).toLocaleString()} m²</div>
                  <div>{m.bedrooms} {t("villa_model_bedrooms")} · {m.bathrooms} {t("villa_model_bathrooms")}</div>
                  <div className="text-[#1A2342] font-medium pt-1">{t("villa_model_from")} {fmtUSD(base)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ------------------------- Clients List View -------------------------

function ClientsList({ clients, onSelect, onNew, onExport, onDelete }) {
  const { t } = useT();
  const settings = useSettings();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("updated");

  const filtered = useMemo(() => {
    let list = [...clients];
    if (filterStatus !== "all") list = list.filter(c => c.status === filterStatus);
    if (filterType !== "all") list = list.filter(c => c.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.fullName || "").toLowerCase().includes(q) ||
        (c.companyName || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.idNumber || "").toLowerCase().includes(q) ||
        (c.rnc || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        String(c.lotNumber || "").includes(q)
      );
    }
    if (sortBy === "updated") list.sort((a,b) => (b.updatedAt||b.createdAt||"").localeCompare(a.updatedAt||a.createdAt||""));
    if (sortBy === "name") list.sort((a,b) => (a.fullName||a.companyName||"").localeCompare(b.fullName||b.companyName||""));
    if (sortBy === "price") list.sort((a,b) => computePrice(b, settings).total - computePrice(a, settings).total);
    if (sortBy === "paid") list.sort((a,b) => paidPercentage(b, settings) - paidPercentage(a, settings));
    return list;
  }, [clients, filterStatus, filterType, search, sortBy, settings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 400, letterSpacing: "0.02em" }}>{t("clients_title")}</h1>
          <p className="text-sm text-[#1A2342]/60 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {filtered.length} {t("clients_count")} {clients.length} {t("clients_count_label")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onExport} variant="outline" icon={FileDown}>Excel</Button>
          <Button onClick={onNew} variant="primary" icon={Plus}>{t("new_client")}</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center p-3 bg-[#FDFBF6] border border-[#1A2342]/10">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A2342]/40" strokeWidth={1.8} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("clients_search_ph")}
            className="w-full pl-9 pr-3 py-2 bg-transparent border-none text-sm focus:outline-none placeholder:text-[#1A2342]/40"
            style={{ fontFamily: "'Manrope', sans-serif" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-transparent border border-[#1A2342]/15 text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <option value="all">{t("clients_filter_all_status")}</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{t("status_" + s)}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 bg-transparent border border-[#1A2342]/15 text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <option value="all">{t("clients_filter_all_types")}</option>
          <option value="individual">{t("clients_individual")}</option>
          <option value="entity">{t("clients_entity")}</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 bg-transparent border border-[#1A2342]/15 text-sm" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <option value="updated">{t("clients_sort_updated")}</option>
          <option value="name">{t("clients_sort_name")}</option>
          <option value="price">{t("clients_sort_price")}</option>
          <option value="paid">{t("clients_sort_paid")}</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title={t("clients_empty_title")}
          subtitle={search || filterStatus !== "all" ? t("clients_empty_filter") : t("clients_empty_new")}
          action={!search && filterStatus === "all" && <Button onClick={onNew} variant="primary" icon={Plus}>{t("clients_empty_action")}</Button>} />
      ) : (
        <div className="border border-[#1A2342]/10 overflow-x-auto">
          <div className="min-w-[800px]">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#1A2342]/5 text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
            <div className="col-span-3">{t("col_client")}</div>
            <div className="col-span-2">{t("col_status")}</div>
            <div className="col-span-1 text-center">{t("col_villa")}</div>
            <div className="col-span-2 text-right">{t("col_total_price")}</div>
            <div className="col-span-3">{t("col_progress")}</div>
            <div className="col-span-1 text-right">{t("col_action")}</div>
          </div>
          {filtered.map(c => {
            const p = computePrice(c, settings);
            const pct = paidPercentage(c, settings);
            const cfg = STATUS_CONFIG[c.status];
            return (
              <div key={c.id} onClick={() => onSelect(c.id)}
                className="grid grid-cols-12 gap-3 px-4 py-3 border-t border-[#1A2342]/10 hover:bg-[#1A2342]/5 cursor-pointer items-center transition-colors"
                style={{ fontFamily: "'Manrope', sans-serif" }}>
                <div className="col-span-3 min-w-0">
                  <div className="flex items-center gap-2">
                    {c.type === "entity" ? <Building2 className="w-3.5 h-3.5 text-[#1A2342]/40 flex-shrink-0" strokeWidth={1.5} /> : <UserCircle className="w-3.5 h-3.5 text-[#1A2342]/40 flex-shrink-0" strokeWidth={1.5} />}
                    <span className="text-sm text-[#1A2342] truncate">{c.fullName || c.companyName || t("cd_unnamed")}</span>
                    {c.isPep && <span className="text-[9px] px-1 bg-[#B04B3F]/10 text-[#B04B3F]">PEP</span>}
                  </div>
                  <div className="text-[11px] text-[#1A2342]/50 truncate ml-5">{c.email || c.phone || "—"}</div>
                </div>
                <div className="col-span-2"><StatusBadge status={c.status} /></div>
                <div className="col-span-1 text-center text-sm text-[#1A2342]">{c.lotNumber ? `#${c.lotNumber}` : "—"}</div>
                <div className="col-span-2 text-right text-sm text-[#1A2342]">{p.total ? fmtUSD(p.total) : "—"}</div>
                <div className="col-span-3">
                  {p.total > 0 ? (
                    <div>
                      <div className="flex justify-between text-[11px] text-[#1A2342]/60 mb-1">
                        <span>{fmtUSD(paidAmount(c))}</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                      <ProgressBar percent={pct} color={cfg?.color} />
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#1A2342]/30">{t("no_villa_assigned")}</span>
                  )}
                </div>
                <div className="col-span-1 text-right flex justify-end gap-1">
                  <button onClick={(e) => { e.stopPropagation(); onSelect(c.id); }}
                    className="p-1.5 hover:bg-[#1A2342]/10 transition-colors">
                    <Eye className="w-3.5 h-3.5 text-[#1A2342]/60" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------- Settings View -------------------------

function SettingsView({ settings, onSave }) {
  const { t, lang } = useT();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const update = (section, field, value) => {
    setDraft(d => ({ ...d, [section]: { ...d[section], [field]: value } }));
    setSaved(false);
  };

  const save = async () => {
    await onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 400, letterSpacing: "0.02em" }}>
          {t("settings_title")}
        </h1>
        <p className="text-sm text-[#1A2342]/60 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {t("settings_sub")}
        </p>
      </div>

      {/* Company Info */}
      <div>
        <SectionTitle subtitle={t("settings_company_sub")}>{t("settings_company")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t("settings_legal_name")} value={draft.company.legalName} onChange={v => update("company","legalName",v)} />
          <Input label={t("settings_rnc")} value={draft.company.rnc} onChange={v => update("company","rnc",v)} />
          <Input label={t("settings_address")} value={draft.company.address} onChange={v => update("company","address",v)} className="col-span-2" />
          <Input label={t("settings_phone")} value={draft.company.phone} onChange={v => update("company","phone",v)} />
          <Input label={t("settings_email_primary")} value={draft.company.email} onChange={v => update("company","email",v)} type="email" />
          <Input label={t("settings_website")} value={draft.company.website} onChange={v => update("company","website",v)} />
        </div>
      </div>

      {/* Bank Info */}
      <div>
        <SectionTitle subtitle={t("settings_bank_sub")}>{t("settings_bank")}</SectionTitle>
        <div className="p-4 bg-[#FDFBF6] border border-[#1A2342]/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={lang === "es" ? "Beneficiario / Beneficiary" : "Beneficiary / Beneficiario"} value={draft.bank.beneficiary} onChange={v => update("bank","beneficiary",v)} />
            <Input label={lang === "es" ? "Tipo de Cuenta / Account Type" : "Account Type / Tipo de Cuenta"} value={draft.bank.accountType} onChange={v => update("bank","accountType",v)} />
            <Input label={lang === "es" ? "Nombre del Banco / Bank Name" : "Bank Name / Nombre del Banco"} value={draft.bank.bankName} onChange={v => update("bank","bankName",v)} className="col-span-2" />
            <Input label={lang === "es" ? "Dirección del Banco / Bank Address" : "Bank Address / Dirección del Banco"} value={draft.bank.bankAddress} onChange={v => update("bank","bankAddress",v)} className="col-span-2" />
            <Input label={lang === "es" ? "Número de Cuenta / Account Number" : "Account Number / Número de Cuenta"} value={draft.bank.accountNumber} onChange={v => update("bank","accountNumber",v)} />
            <Input label="SWIFT / BIC" value={draft.bank.swift} onChange={v => update("bank","swift",v)} />
            <Input label={lang === "es" ? "ABA / Routing Number (US)" : "ABA / Routing Number (US)"} value={draft.bank.aba} onChange={v => update("bank","aba",v)} placeholder={lang === "es" ? "Si aplica" : "If applicable"} />
            <Input label="IBAN" value={draft.bank.iban} onChange={v => update("bank","iban",v)} placeholder={lang === "es" ? "Si aplica" : "If applicable"} />
          </div>
          <div className="border-t border-[#1A2342]/10 pt-4">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t("settings_intermediary")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={lang === "es" ? "Banco Intermediario" : "Intermediary Bank"} value={draft.bank.intermediaryBank} onChange={v => update("bank","intermediaryBank",v)} />
              <Input label={lang === "es" ? "SWIFT del Intermediario" : "Intermediary SWIFT"} value={draft.bank.intermediarySwift} onChange={v => update("bank","intermediarySwift",v)} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div>
        <SectionTitle subtitle={t("settings_payments_sub")}>{t("settings_payments")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t("settings_validity")} type="number" value={draft.payments.validityDays} onChange={v => update("payments","validityDays",Number(v))} />
          <Input label={t("settings_email_comprobantes")} value={draft.payments.remittanceEmail} onChange={v => update("payments","remittanceEmail",v)} type="email" />
        </div>
      </div>

      {/* Pricing Globals */}
      <div>
        <SectionTitle subtitle={t("settings_pricing_sub")}>{t("settings_pricing")}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label={t("settings_price_sqft")} type="number" value={draft.pricing?.pricePerSqft || ""}
            onChange={v => {
              const sqft = Number(v) || 0;
              const sqm = Math.round(sqft / 0.0929);
              setDraft(d => ({ ...d, pricing: { ...d.pricing, pricePerSqft: sqft, pricePerSqm: sqm } }));
              setSaved(false);
            }} />
          <Input label={t("settings_price_sqm")} type="number" value={draft.pricing?.pricePerSqm || ""}
            onChange={v => {
              const sqm = Number(v) || 0;
              const sqft = Math.round(sqm * 0.0929 * 100) / 100;
              setDraft(d => ({ ...d, pricing: { ...d.pricing, pricePerSqm: sqm, pricePerSqft: sqft } }));
              setSaved(false);
            }} />
          <Input label={t("settings_smart_price")} type="number" value={draft.pricing?.smartLivingPrice || ""}
            onChange={v => update("pricing","smartLivingPrice", Number(v) || 0)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Input label={t("settings_default_commission")} type="number" value={draft.pricing?.defaultCommissionPct ?? ""}
              onChange={v => update("pricing","defaultCommissionPct", Number(v) || 0)} placeholder="5" />
            <div className="text-[11px] text-[#1A2342]/50 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t("settings_default_commission_sub")}
            </div>
          </div>
        </div>
      </div>

      {/* Villa Models */}
      <VillaModelsEditor draft={draft} setDraft={setDraft} setSaved={setSaved} />

      {/* Lots */}
      <LotsEditor draft={draft} setDraft={setDraft} setSaved={setSaved} />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A2342]/10">
        {saved && (
          <span className="text-xs text-[#2D5E3E] flex items-center gap-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
            <Check className="w-3.5 h-3.5" strokeWidth={2} /> {t("saved")}
          </span>
        )}
        <Button onClick={save} variant="primary" icon={Check}>{t("settings_save")}</Button>
      </div>
    </div>
  );
}

// ------------------------- Villa Models Editor -------------------------

function VillaModelsEditor({ draft, setDraft, setSaved }) {
  const { t } = useT();
  const models = draft.villaModels || {};
  const [addingId, setAddingId] = useState("");
  const [error, setError] = useState("");

  const updateModel = (id, field, value) => {
    const m = { ...models[id], [field]: value };
    if (field === "sqft") {
      const sqft = Number(value) || 0;
      m.sqm = Math.round(sqft * 0.0929);
    } else if (field === "sqm") {
      const sqm = Number(value) || 0;
      m.sqft = Math.round(sqm / 0.0929 * 100) / 100;
    }
    setDraft(d => ({ ...d, villaModels: { ...d.villaModels, [id]: m } }));
    setSaved(false);
  };

  const addModel = () => {
    const id = addingId.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!id) { setError(t("settings_model_id_required")); return; }
    if (models[id]) { setError(t("settings_model_id_exists")); return; }
    setError("");
    setDraft(d => ({
      ...d,
      villaModels: {
        ...d.villaModels,
        [id]: { name: "", sqft: 0, sqm: 0, color: "#4A6FA5", bedrooms: "", bathrooms: "" }
      }
    }));
    setAddingId("");
    setSaved(false);
  };

  const deleteModel = (id) => {
    if (!confirm(t("settings_confirm_delete_model"))) return;
    setDraft(d => {
      const next = { ...d.villaModels };
      delete next[id];
      return { ...d, villaModels: next };
    });
    setSaved(false);
  };

  const modelEntries = Object.entries(models);

  return (
    <div>
      <SectionTitle subtitle={t("settings_villa_models_sub")}>{t("settings_villa_models")}</SectionTitle>

      {modelEntries.length === 0 ? (
        <div className="p-6 text-center text-sm text-[#1A2342]/50 bg-[#FDFBF6] border border-dashed border-[#1A2342]/20" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {t("settings_model_no_models")}
        </div>
      ) : (
        <div className="space-y-2">
          {modelEntries.map(([id, m]) => (
            <div key={id} className="p-3 bg-[#FDFBF6] border border-[#1A2342]/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: m.color || "#4A6FA5" }} />
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 font-semibold" style={{ fontFamily: "'Manrope', sans-serif" }}>{id}</span>
                <button onClick={() => deleteModel(id)} className="ml-auto p-1 text-[#1A2342]/40 hover:text-[#B04B3F] hover:bg-[#B04B3F]/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <Input label={t("settings_model_name")} value={m.name} onChange={v => updateModel(id, "name", v)} className="col-span-2" />
                <Input label={t("settings_model_sqft")} type="number" value={m.sqft} onChange={v => updateModel(id, "sqft", v)} />
                <Input label={t("settings_model_sqm")} type="number" value={m.sqm} onChange={v => updateModel(id, "sqm", v)} />
                <Input label={t("settings_model_bedrooms")} value={m.bedrooms} onChange={v => updateModel(id, "bedrooms", v)} />
                <Input label={t("settings_model_bathrooms")} value={m.bathrooms} onChange={v => updateModel(id, "bathrooms", v)} />
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {t("settings_model_color")}
                  </label>
                  <input type="color" value={m.color || "#4A6FA5"} onChange={e => updateModel(id, "color", e.target.value)}
                    className="w-full h-[34px] border border-[#1A2342]/15 bg-transparent cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new model */}
      <div className="mt-3 flex items-end gap-2">
        <div className="flex-1 max-w-xs">
          <Input label={t("settings_model_id")} value={addingId} onChange={v => { setAddingId(v); setError(""); }}
            placeholder="ej: amarillo, verde, azul" />
        </div>
        <Button onClick={addModel} variant="outline" icon={Plus}>{t("settings_add_model")}</Button>
      </div>
      {error && (
        <div className="mt-2 text-xs text-[#B04B3F]" style={{ fontFamily: "'Manrope', sans-serif" }}>{error}</div>
      )}
    </div>
  );
}

// ------------------------- Lots Editor -------------------------

function LotsEditor({ draft, setDraft, setSaved }) {
  const { t } = useT();
  const lots = draft.lots || {};
  const [addingNum, setAddingNum] = useState("");
  const [error, setError] = useState("");

  const updateLot = (num, field, value) => {
    const existing = lots[num];
    const lot = typeof existing === "number" ? { sqft: existing, sqm: existing * 0.0929 } : { ...existing };
    lot[field] = Number(value) || 0;
    if (field === "sqft") {
      lot.sqm = Math.round(lot.sqft * 0.0929 * 100) / 100;
    } else if (field === "sqm") {
      lot.sqft = Math.round(lot.sqm / 0.0929 * 100) / 100;
    }
    setDraft(d => ({ ...d, lots: { ...d.lots, [num]: lot } }));
    setSaved(false);
  };

  const addLot = () => {
    const num = String(addingNum).trim();
    if (!num) { setError(t("settings_lot_number_required")); return; }
    if (lots[num]) { setError(t("settings_lot_exists")); return; }
    setError("");
    setDraft(d => ({
      ...d,
      lots: { ...d.lots, [num]: { sqft: 0, sqm: 0 } }
    }));
    setAddingNum("");
    setSaved(false);
  };

  const deleteLot = (num) => {
    if (!confirm(t("settings_confirm_delete_lot"))) return;
    setDraft(d => {
      const next = { ...d.lots };
      delete next[num];
      return { ...d, lots: next };
    });
    setSaved(false);
  };

  // Sort by lot number numerically
  const lotEntries = Object.entries(lots).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div>
      <SectionTitle subtitle={t("settings_lots_sub")}>
        {t("settings_lots")} <span className="text-[11px] text-[#1A2342]/50 font-normal">({lotEntries.length} {t("settings_lots_total")})</span>
      </SectionTitle>

      <div className="border border-[#1A2342]/10 overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[#1A2342]/5 text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
            <div className="col-span-2">{t("settings_lot_number")}</div>
            <div className="col-span-4">{t("settings_lot_sqft")}</div>
            <div className="col-span-4">{t("settings_lot_sqm")}</div>
            <div className="col-span-2 text-right"></div>
          </div>
          {lotEntries.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
              —
            </div>
          ) : (
            lotEntries.map(([num, lot]) => {
              const sqft = typeof lot === "number" ? lot : lot.sqft;
              const sqm = typeof lot === "number" ? (lot * 0.0929) : (lot.sqm || sqft * 0.0929);
              return (
                <div key={num} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-[#1A2342]/10 items-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  <div className="col-span-2 text-sm text-[#1A2342] font-medium">#{num}</div>
                  <div className="col-span-4">
                    <input type="number" step="0.01" value={sqft} onChange={e => updateLot(num, "sqft", e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm" />
                  </div>
                  <div className="col-span-4">
                    <input type="number" step="0.01" value={sqm} onChange={e => updateLot(num, "sqm", e.target.value)}
                      className="w-full px-2 py-1 bg-transparent border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm" />
                  </div>
                  <div className="col-span-2 text-right">
                    <button onClick={() => deleteLot(num)} className="p-1.5 text-[#1A2342]/40 hover:text-[#B04B3F] hover:bg-[#B04B3F]/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add new lot */}
      <div className="mt-3 flex items-end gap-2">
        <div className="flex-1 max-w-xs">
          <Input label={t("settings_lot_number")} type="number" value={addingNum} onChange={v => { setAddingNum(v); setError(""); }}
            placeholder="36" />
        </div>
        <Button onClick={addLot} variant="outline" icon={Plus}>{t("settings_add_lot")}</Button>
      </div>
      {error && (
        <div className="mt-2 text-xs text-[#B04B3F]" style={{ fontFamily: "'Manrope', sans-serif" }}>{error}</div>
      )}
    </div>
  );
}

// ------------------------- Payment Instruction Generator -------------------------

function PaymentInstructionModal({ client, settings, onClose, onSaveClient }) {
  const { t, lang } = useT();
  const [selectedInstallmentId, setSelectedInstallmentId] = useState("");
  const [concept, setConcept] = useState("Depósito de Reserva / Reservation Deposit");
  const [customConcept, setCustomConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("form"); // 'form' | 'preview'
  const [amountUnlocked, setAmountUnlocked] = useState(false);

  const pricing = computePrice(client, settings);
  const pending = pricing.total - paidAmount(client);

  // Determine if client has an active payment plan
  const hasPlan = client.paymentPlan && client.paymentPlan.installments && client.paymentPlan.installments.length > 0;
  const planInstallments = hasPlan ? client.paymentPlan.installments : [];

  // Only show installments that are not fully paid
  const billableInstallments = planInstallments.map((inst, idx) => {
    const status = getInstallmentStatus(inst);
    const balance = Math.max(0, (Number(inst.amount) || 0) - (Number(inst.paidAmount) || 0));
    return { ...inst, index: idx, status, balance };
  }).filter(inst => inst.status !== "paid" && inst.balance > 0);

  const selectedInstallment = selectedInstallmentId
    ? planInstallments.find(i => i.id === selectedInstallmentId)
    : null;
  const selectedInstallmentIdx = selectedInstallment
    ? planInstallments.findIndex(i => i.id === selectedInstallmentId)
    : -1;

  // When user selects an installment, auto-fill concept/amount/number
  useEffect(() => {
    if (!selectedInstallment) return;
    const balance = Math.max(0, (Number(selectedInstallment.amount) || 0) - (Number(selectedInstallment.paidAmount) || 0));
    // Build bilingual concept: "ES Concept / EN Concept"
    const esConcept = selectedInstallment.concept || `Cuota ${selectedInstallmentIdx + 1}`;
    const enConcept = selectedInstallment.conceptEn || `Installment ${selectedInstallmentIdx + 1}`;
    setConcept(`${esConcept} / ${enConcept}`);
    setCustomConcept("");
    setAmount(String(balance));
    setPaymentNumber(`${selectedInstallmentIdx + 1} / ${planInstallments.length}`);
    setAmountUnlocked(false); // re-lock when switching installments
  }, [selectedInstallmentId]);

  const CONCEPT_OPTIONS = [
    t("concept_reservation"),
    t("concept_initial"),
    t("concept_installment_1"),
    t("concept_installment_2"),
    t("concept_installment_3"),
    t("concept_final"),
    t("concept_other"),
  ];

  const finalConcept = (concept === "Otro / Other" || concept === "Other / Otro") ? customConcept : concept;

  // Reference includes installment number if linked: AMBAR-V007-C02-20260419-3XHI
  const reference = useMemo(() => {
    const lot = String(client.lotNumber || "XXX").padStart(3, "0");
    const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const suffix = (client.id || "").slice(-4).toUpperCase();
    const instSegment = selectedInstallment ? `-C${String(selectedInstallmentIdx + 1).padStart(2, "0")}` : "";
    return `AMBAR-V${lot}${instSegment}-${date}-${suffix}`;
  }, [client, selectedInstallment, selectedInstallmentIdx]);

  const issueDate = new Date();
  const validityDays = settings.payments.validityDays || 15;
  const validUntil = new Date(issueDate.getTime() + validityDays * 24 * 60 * 60 * 1000);

  const clientName = client.type === "entity" ? client.companyName : client.fullName;

  const handlePrint = () => {
    // Abrir ventana limpia con solo el contenido del PDF - evita duplicación
    // causada por los wrappers del modal en el DOM principal
    const pdfElement = document.querySelector(".print-instruction .pdf-page");
    if (!pdfElement) {
      window.print();
      return;
    }
    const content = pdfElement.outerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) {
      alert(lang === "es"
        ? "Por favor permite ventanas emergentes para imprimir el instructivo."
        : "Please allow pop-ups to print the instruction.");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Instruction - ${reference}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Manrope', sans-serif;
            color: #1A2342;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page { size: A4; margin: 12mm; }
          .pdf-page {
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }
          .pdf-section, .pdf-footer {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table, tr, ol, ul, li {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          h1, h2 {
            page-break-after: avoid;
            break-after: avoid;
          }
          .no-print { display: none !important; }
          @media screen {
            body { padding: 20px; background: #f5f1e8; }
            .pdf-page { max-width: 210mm; margin: 0 auto; background: white; padding: 15mm 20mm; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          }
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 500);
          });
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();

    // After printing, offer to register this instruction as a pending payment on the client
    // Only ask if it's linked to an installment (otherwise it's a free instruction)
    if (selectedInstallment && onSaveClient) {
      // Small delay so the print dialog appears first
      setTimeout(() => {
        const msg = t("pi_register_payment");
        if (confirm(msg)) {
          const newPayment = {
            id: uid(),
            date: new Date().toISOString().slice(0, 10),
            amount: Number(amount) || 0,
            type: "installment",
            method: "wire",
            reference: reference,
            linkedInstallmentId: selectedInstallment.id,
            status: "pending",
            notes: `Instructivo generado ${new Date().toISOString().slice(0, 10)}${notes ? " · " + notes : ""}`,
          };
          const updatedClient = {
            ...client,
            payments: [...(client.payments || []), newPayment],
          };
          onSaveClient(updatedClient);
          alert(t("pi_registered"));
        }
      }, 1500);
    }
  };

  // Build email body (plain text, bilingual always for safety)
  const buildEmailBody = () => {
    const issueDateStr = issueDate.toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" });
    const validUntilStr = validUntil.toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" });

    const bodyEs = [
      `${t("pi_email_greeting_es")} ${clientName || ""},`,
      "",
      t("pi_email_body_intro_es"),
      "",
      `  ${t("pi_email_body_ref_es")}: ${reference}`,
      `  ${t("pi_email_body_amount_es")}: ${fmtUSD(amount)} USD`,
      `  ${t("pi_email_body_due_es")}: ${validUntilStr}`,
      `  ${t("pi_email_body_concept_es")}: ${finalConcept}`,
      "",
      `${t("pi_email_body_note_es")} ${settings.payments.remittanceEmail || "payments@ambarestate.do"} inmediatamente después de ejecutar la transferencia.`,
      "",
      t("pi_email_body_closing_es"),
      t("pi_email_body_team_es"),
      settings.company.email || "sales@ambarestate.do",
    ].join("\n");

    const bodyEn = [
      "",
      "— — —",
      "",
      `${t("pi_email_greeting_en")} ${clientName || ""},`,
      "",
      t("pi_email_body_intro_en"),
      "",
      `  Reference: ${reference}`,
      `  Amount: ${fmtUSD(amount)} USD`,
      `  Due date: ${validUntilStr}`,
      `  Concept: ${finalConcept}`,
      "",
      `${t("pi_email_body_note_en")} ${settings.payments.remittanceEmail || "payments@ambarestate.do"} immediately after the transfer.`,
      "",
      t("pi_email_body_closing_en"),
      t("pi_email_body_team_en"),
      settings.company.email || "sales@ambarestate.do",
    ].join("\n");

    return bodyEs + bodyEn;
  };

  // Build WhatsApp body (plain text, bilingual compact)
  const buildWhatsAppBody = () => {
    const firstName = (clientName || "").split(" ")[0] || "";
    const validUntilStr = validUntil.toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" });

    const lines = [
      `${t("pi_wa_greeting_es")} ${firstName}, ${t("pi_wa_body_es")}.`,
      "",
      `${t("pi_wa_ref")}: ${reference}`,
      `${t("pi_wa_amount_es")}: ${fmtUSD(amount)} USD`,
      `${t("pi_wa_expires_es")}: ${validUntilStr}`,
      "",
      `${t("pi_wa_footer_es")} ${settings.payments.remittanceEmail || "payments@ambarestate.do"} ${t("pi_wa_footer_tail_es")}`,
      "",
      "— — —",
      "",
      `${t("pi_wa_greeting_en")} ${firstName}, ${t("pi_wa_body_en")}.`,
      "",
      `${t("pi_wa_ref")}: ${reference}`,
      `${t("pi_wa_amount_en")}: ${fmtUSD(amount)} USD`,
      `${t("pi_wa_expires_en")}: ${validUntilStr}`,
      "",
      `${t("pi_wa_footer_en")} ${settings.payments.remittanceEmail || "payments@ambarestate.do"} ${t("pi_wa_footer_tail_en")}`,
    ];
    return lines.join("\n");
  };

  const handleSendEmail = () => {
    if (!client.email) {
      alert(t("pi_send_email_missing"));
      return;
    }
    // First: trigger print so user saves the PDF for attachment
    handlePrint();
    // Then: open mailto after a brief delay so print dialog appears first
    setTimeout(() => {
      const subject = `${t("pi_email_subject")} — ${reference}`;
      const body = buildEmailBody();
      const mailto = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    }, 800);
  };

  const handleSendWhatsApp = () => {
    if (!client.phone) {
      alert(t("pi_send_phone_missing"));
      return;
    }
    const formatted = formatPhoneForWhatsApp(client.phone);
    if (!formatted) {
      alert(t("pi_send_phone_invalid"));
      return;
    }
    // First: trigger print so user saves the PDF for attachment
    handlePrint();
    // Then: open WhatsApp with pre-filled message
    setTimeout(() => {
      const body = buildWhatsAppBody();
      const waUrl = `https://wa.me/${formatted}?text=${encodeURIComponent(body)}`;
      window.open(waUrl, "_blank");
    }, 800);
  };

  const canPreview = finalConcept && Number(amount) > 0;

  if (mode === "preview") {
    return (
      <div className="print-instruction">
        {/* Non-print controls */}
        <div className="no-print mb-6 pb-4 border-b border-[#1A2342]/10 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button onClick={() => setMode("form")} variant="ghost" icon={ArrowLeft}>{t("edit")}</Button>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handlePrint} variant="primary" icon={Printer}>{t("print_pdf")}</Button>
              <Button onClick={handleSendEmail} variant="outline" icon={Mail} disabled={!client.email}>{t("pi_send_email")}</Button>
              <Button onClick={handleSendWhatsApp} variant="outline" icon={Phone} disabled={!client.phone}>{t("pi_send_whatsapp")}</Button>
              <Button onClick={onClose} variant="ghost" icon={X}>{t("close")}</Button>
            </div>
          </div>
          <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("pi_send_help")}
          </div>
        </div>

        {/* Printable content */}
        <div className="pdf-page bg-white text-[#1A2342] mx-auto" style={{ maxWidth: "210mm", fontFamily: "'Manrope', sans-serif", fontSize: "10pt", padding: "15mm 20mm" }}>
          {/* Header */}
          <div className="pdf-section flex items-center justify-between pb-5 mb-6 border-b-2 border-[#1A2342]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img src="/logo.svg" alt="AMBAR" style={{ width: "32px", height: "32px" }} />
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22pt", fontWeight: 500, letterSpacing: "0.12em", lineHeight: 1 }}>
                    AMBAR
                  </div>
                  <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6FA5", marginTop: "2pt" }}>
                    Longevity Estate
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: "7pt", letterSpacing: "0.15em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6 }}>
                {settings.company.legalName}
              </div>
              {settings.company.rnc && (
                <div style={{ fontSize: "8pt", marginTop: "2pt" }}>RNC: {settings.company.rnc}</div>
              )}
              <div style={{ fontSize: "8pt", opacity: 0.7 }}>{settings.company.website}</div>
            </div>
          </div>

          {/* Title - bilingual */}
          <div className="pdf-section grid grid-cols-2 gap-8 mb-6">
            <div>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6FA5", marginBottom: "4pt" }}>Español</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24pt", fontWeight: 400, lineHeight: 1.1, letterSpacing: "0.02em" }}>
                Instructivo<br/>de Pago
              </h1>
            </div>
            <div>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6FA5", marginBottom: "4pt" }}>English</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24pt", fontWeight: 400, lineHeight: 1.1, letterSpacing: "0.02em" }}>
                Payment<br/>Instructions
              </h1>
            </div>
          </div>

          {/* Reference & dates */}
          <div className="pdf-section grid grid-cols-3 gap-4 mb-6 p-4 bg-[#F5F1E8]" style={{ border: "1px solid rgba(26,35,66,0.15)" }}>
            <div>
              <div style={{ fontSize: "6.5pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6 }}>Referencia / Reference</div>
              <div style={{ fontSize: "11pt", fontWeight: 600, marginTop: "3pt", letterSpacing: "0.05em" }}>{reference}</div>
            </div>
            <div>
              <div style={{ fontSize: "6.5pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6 }}>Fecha Emisión / Issue Date</div>
              <div style={{ fontSize: "11pt", fontWeight: 500, marginTop: "3pt" }}>
                {issueDate.toLocaleDateString("es-DO", { year:"numeric", month:"long", day:"numeric" })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "6.5pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6 }}>Válido Hasta / Valid Until</div>
              <div style={{ fontSize: "11pt", fontWeight: 500, marginTop: "3pt", color: "#B04B3F" }}>
                {validUntil.toLocaleDateString("es-DO", { year:"numeric", month:"long", day:"numeric" })}
              </div>
            </div>
          </div>

          {/* Client & Payment bilingual */}
          <div className="pdf-section grid grid-cols-2 gap-8 mb-6">
            {/* ES */}
            <div>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, borderBottom: "1px solid rgba(26,35,66,0.2)", paddingBottom: "4pt", marginBottom: "8pt" }}>
                Detalles de la Transacción
              </div>
              <table style={{ width: "100%", fontSize: "9pt", lineHeight: 1.6 }}>
                <tbody>
                  <tr><td style={{ opacity: 0.6, paddingRight: "12pt", verticalAlign: "top", width: "45%" }}>Cliente</td><td style={{ fontWeight: 500 }}>{clientName || "—"}</td></tr>
                  {client.lotNumber && <tr><td style={{ opacity: 0.6 }}>Villa / Lote</td><td style={{ fontWeight: 500 }}>No. {client.lotNumber} {(settings.villaModels || DEFAULT_SETTINGS.villaModels)[client.villaModel] ? `— ${(settings.villaModels || DEFAULT_SETTINGS.villaModels)[client.villaModel].name}` : ""}</td></tr>}
                  <tr><td style={{ opacity: 0.6 }}>Concepto</td><td style={{ fontWeight: 500 }}>{finalConcept.split(" / ")[0]}</td></tr>
                  {paymentNumber && <tr><td style={{ opacity: 0.6 }}>Número de Pago</td><td style={{ fontWeight: 500 }}>{paymentNumber}</td></tr>}
                  <tr><td style={{ opacity: 0.6 }}>Precio Total Villa</td><td>{fmtUSD(pricing.total)}</td></tr>
                  <tr><td style={{ opacity: 0.6 }}>Pagado a la Fecha</td><td>{fmtUSD(paidAmount(client))}</td></tr>
                </tbody>
              </table>
            </div>
            {/* EN */}
            <div>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, borderBottom: "1px solid rgba(26,35,66,0.2)", paddingBottom: "4pt", marginBottom: "8pt" }}>
                Transaction Details
              </div>
              <table style={{ width: "100%", fontSize: "9pt", lineHeight: 1.6 }}>
                <tbody>
                  <tr><td style={{ opacity: 0.6, paddingRight: "12pt", verticalAlign: "top", width: "45%" }}>Client</td><td style={{ fontWeight: 500 }}>{clientName || "—"}</td></tr>
                  {client.lotNumber && <tr><td style={{ opacity: 0.6 }}>Villa / Lot</td><td style={{ fontWeight: 500 }}>No. {client.lotNumber} {(settings.villaModels || DEFAULT_SETTINGS.villaModels)[client.villaModel] ? `— ${(settings.villaModels || DEFAULT_SETTINGS.villaModels)[client.villaModel].name}` : ""}</td></tr>}
                  <tr><td style={{ opacity: 0.6 }}>Concept</td><td style={{ fontWeight: 500 }}>{finalConcept.split(" / ")[1] || finalConcept}</td></tr>
                  {paymentNumber && <tr><td style={{ opacity: 0.6 }}>Payment Number</td><td style={{ fontWeight: 500 }}>{paymentNumber}</td></tr>}
                  <tr><td style={{ opacity: 0.6 }}>Total Villa Price</td><td>{fmtUSD(pricing.total)}</td></tr>
                  <tr><td style={{ opacity: 0.6 }}>Paid to Date</td><td>{fmtUSD(paidAmount(client))}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount highlight */}
          <div className="pdf-section" style={{ backgroundColor: "#1A2342", color: "#F5F1E8", padding: "16pt 20pt", marginBottom: "20pt" }}>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>Monto a Transferir</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28pt", fontWeight: 500, marginTop: "4pt", lineHeight: 1 }}>
                  {fmtUSD(amount)} <span style={{ fontSize: "14pt", opacity: 0.7 }}>USD</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6 }}>Amount to Transfer</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28pt", fontWeight: 500, marginTop: "4pt", lineHeight: 1 }}>
                  {fmtUSD(amount)} <span style={{ fontSize: "14pt", opacity: 0.7 }}>USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details - bilingual */}
          <div className="pdf-section mb-6">
            <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, marginBottom: "8pt" }}>
              Datos Bancarios / Banking Details
            </div>
            <table style={{ width: "100%", fontSize: "9pt", lineHeight: 1.7, borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                  <td style={{ padding: "6pt 0", opacity: 0.6, width: "38%" }}>Beneficiario / Beneficiary</td>
                  <td style={{ padding: "6pt 0", fontWeight: 600 }}>{settings.bank.beneficiary || "—"}</td>
                </tr>
                {settings.bank.bankName && (
                  <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                    <td style={{ padding: "6pt 0", opacity: 0.6 }}>Banco / Bank</td>
                    <td style={{ padding: "6pt 0", fontWeight: 500 }}>{settings.bank.bankName}</td>
                  </tr>
                )}
                {settings.bank.bankAddress && (
                  <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                    <td style={{ padding: "6pt 0", opacity: 0.6 }}>Dirección del Banco / Bank Address</td>
                    <td style={{ padding: "6pt 0" }}>{settings.bank.bankAddress}</td>
                  </tr>
                )}
                {settings.bank.accountNumber && (
                  <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                    <td style={{ padding: "6pt 0", opacity: 0.6 }}>Número de Cuenta / Account Number</td>
                    <td style={{ padding: "6pt 0", fontWeight: 600, fontFamily: "monospace", letterSpacing: "0.05em" }}>{settings.bank.accountNumber}</td>
                  </tr>
                )}
                {settings.bank.accountType && (
                  <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                    <td style={{ padding: "6pt 0", opacity: 0.6 }}>Tipo de Cuenta / Account Type</td>
                    <td style={{ padding: "6pt 0" }}>{settings.bank.accountType}</td>
                  </tr>
                )}
                {settings.bank.swift && (
                  <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                    <td style={{ padding: "6pt 0", opacity: 0.6 }}>SWIFT / BIC</td>
                    <td style={{ padding: "6pt 0", fontWeight: 600, fontFamily: "monospace" }}>{settings.bank.swift}</td>
                  </tr>
                )}
                {settings.bank.aba && (
                  <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                    <td style={{ padding: "6pt 0", opacity: 0.6 }}>ABA / Routing (US)</td>
                    <td style={{ padding: "6pt 0", fontFamily: "monospace" }}>{settings.bank.aba}</td>
                  </tr>
                )}
                {settings.bank.iban && (
                  <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                    <td style={{ padding: "6pt 0", opacity: 0.6 }}>IBAN</td>
                    <td style={{ padding: "6pt 0", fontFamily: "monospace" }}>{settings.bank.iban}</td>
                  </tr>
                )}
                {settings.bank.intermediaryBank && (
                  <>
                    <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                      <td style={{ padding: "6pt 0", opacity: 0.6 }}>Banco Intermediario / Intermediary Bank</td>
                      <td style={{ padding: "6pt 0" }}>{settings.bank.intermediaryBank}</td>
                    </tr>
                    {settings.bank.intermediarySwift && (
                      <tr style={{ borderBottom: "1px solid rgba(26,35,66,0.1)" }}>
                        <td style={{ padding: "6pt 0", opacity: 0.6 }}>SWIFT Intermediario</td>
                        <td style={{ padding: "6pt 0", fontFamily: "monospace" }}>{settings.bank.intermediarySwift}</td>
                      </tr>
                    )}
                  </>
                )}
                <tr style={{ backgroundColor: "#F4EBD4", borderLeft: "3px solid #C9A961" }}>
                  <td style={{ padding: "10pt", opacity: 0.6 }}>Concepto / Reference (obligatorio)</td>
                  <td style={{ padding: "10pt", fontWeight: 700, letterSpacing: "0.05em" }}>{reference}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Instructions - bilingual */}
          <div className="pdf-section grid grid-cols-2 gap-8 mb-6">
            <div>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, borderBottom: "1px solid rgba(26,35,66,0.2)", paddingBottom: "4pt", marginBottom: "8pt" }}>
                Instrucciones Importantes
              </div>
              <ol style={{ fontSize: "8.5pt", lineHeight: 1.6, paddingLeft: "14pt" }}>
                <li style={{ marginBottom: "5pt" }}>Incluya la <strong>referencia exacta</strong> en el concepto del wire. Sin ella, la aplicación de su pago puede retrasarse.</li>
                <li style={{ marginBottom: "5pt" }}>Todas las comisiones bancarias son por cuenta del remitente (<strong>OUR</strong>). El beneficiario debe recibir el monto exacto indicado.</li>
                <li style={{ marginBottom: "5pt" }}>Envíe el comprobante del wire a <strong>{settings.payments.remittanceEmail}</strong> inmediatamente después de ejecutar la transferencia.</li>
                <li style={{ marginBottom: "5pt" }}>Este instructivo vence el <strong>{validUntil.toLocaleDateString("es-DO")}</strong>. Después de esa fecha solicite uno actualizado.</li>
                <li style={{ marginBottom: "5pt" }}>Cumplimiento con Ley No. 155-17 contra el Lavado de Activos requiere que los fondos provengan de fuentes verificadas.</li>
              </ol>
            </div>
            <div>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, borderBottom: "1px solid rgba(26,35,66,0.2)", paddingBottom: "4pt", marginBottom: "8pt" }}>
                Important Instructions
              </div>
              <ol style={{ fontSize: "8.5pt", lineHeight: 1.6, paddingLeft: "14pt" }}>
                <li style={{ marginBottom: "5pt" }}>Include the <strong>exact reference</strong> in the wire memo. Without it, application of your payment may be delayed.</li>
                <li style={{ marginBottom: "5pt" }}>All bank fees are on the sender's account (<strong>OUR</strong>). The beneficiary must receive the exact amount indicated.</li>
                <li style={{ marginBottom: "5pt" }}>Send the wire confirmation to <strong>{settings.payments.remittanceEmail}</strong> immediately after executing the transfer.</li>
                <li style={{ marginBottom: "5pt" }}>This instruction expires on <strong>{validUntil.toLocaleDateString("en-US")}</strong>. Request an updated one after that date.</li>
                <li style={{ marginBottom: "5pt" }}>Compliance with Law No. 155-17 against Money Laundering requires that funds come from verified sources.</li>
              </ol>
            </div>
          </div>

          {/* Payment Schedule (bilingual, if plan exists and enabled) */}
          {client.paymentPlan && client.paymentPlan.installments && client.paymentPlan.installments.length > 0 && client.paymentPlan.includeInPdf !== false && (
            <div className="pdf-section" style={{ marginBottom: "20pt" }}>
              <div className="grid grid-cols-2 gap-8 mb-3">
                <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, borderBottom: "1px solid rgba(26,35,66,0.2)", paddingBottom: "4pt" }}>
                  Cronograma de Pagos
                </div>
                <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, borderBottom: "1px solid rgba(26,35,66,0.2)", paddingBottom: "4pt" }}>
                  Payment Schedule
                </div>
              </div>
              <table style={{ width: "100%", fontSize: "8.5pt", lineHeight: 1.5, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F5F1E8" }}>
                    <th style={{ padding: "6pt 8pt", textAlign: "left", fontWeight: 600, fontSize: "7pt", letterSpacing: "0.08em", textTransform: "uppercase", color: "#1A2342", opacity: 0.7, borderBottom: "1px solid rgba(26,35,66,0.2)" }}>#</th>
                    <th style={{ padding: "6pt 8pt", textAlign: "left", fontWeight: 600, fontSize: "7pt", letterSpacing: "0.08em", textTransform: "uppercase", color: "#1A2342", opacity: 0.7, borderBottom: "1px solid rgba(26,35,66,0.2)" }}>Concepto / Concept</th>
                    <th style={{ padding: "6pt 8pt", textAlign: "left", fontWeight: 600, fontSize: "7pt", letterSpacing: "0.08em", textTransform: "uppercase", color: "#1A2342", opacity: 0.7, borderBottom: "1px solid rgba(26,35,66,0.2)" }}>Fecha / Date</th>
                    <th style={{ padding: "6pt 8pt", textAlign: "right", fontWeight: 600, fontSize: "7pt", letterSpacing: "0.08em", textTransform: "uppercase", color: "#1A2342", opacity: 0.7, borderBottom: "1px solid rgba(26,35,66,0.2)" }}>Monto / Amount</th>
                    <th style={{ padding: "6pt 8pt", textAlign: "center", fontWeight: 600, fontSize: "7pt", letterSpacing: "0.08em", textTransform: "uppercase", color: "#1A2342", opacity: 0.7, borderBottom: "1px solid rgba(26,35,66,0.2)" }}>Estado / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {client.paymentPlan.installments.map((inst, idx) => {
                    const status = getInstallmentStatus(inst);
                    const isCurrent = Math.abs(Number(amount) - Number(inst.amount)) < 1 && status !== "paid";
                    const statusMap = {
                      paid:            { label: "Pagada / Paid",        color: "#2D5E3E" },
                      pending:         { label: "Pendiente / Pending",  color: "#1A2342" },
                      partial:         { label: "Parcial / Partial",    color: "#C9A961" },
                      overdue:         { label: "Vencida / Overdue",    color: "#B04B3F" },
                      partial_overdue: { label: "Parcial Venc. / Partial Overdue", color: "#B04B3F" },
                    };
                    const sMap = statusMap[status] || statusMap.pending;
                    return (
                      <tr key={inst.id} style={{ borderBottom: "1px solid rgba(26,35,66,0.08)", backgroundColor: isCurrent ? "#F4EBD4" : "transparent" }}>
                        <td style={{ padding: "6pt 8pt", fontWeight: 500 }}>{idx + 1}{isCurrent ? " ⬅" : ""}</td>
                        <td style={{ padding: "6pt 8pt" }}>
                          <div>{inst.concept || `Cuota ${idx + 1}`}</div>
                          {inst.conceptEn && <div style={{ fontSize: "7.5pt", color: "rgba(26,35,66,0.6)" }}>{inst.conceptEn}</div>}
                        </td>
                        <td style={{ padding: "6pt 8pt" }}>
                          {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString("es-DO", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                        </td>
                        <td style={{ padding: "6pt 8pt", textAlign: "right", fontWeight: 500 }}>
                          {fmtUSD(inst.amount)}
                        </td>
                        <td style={{ padding: "6pt 8pt", textAlign: "center" }}>
                          <span style={{ color: sMap.color, fontSize: "7.5pt", fontWeight: 500 }}>{sMap.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: "#1A2342", color: "#F5F1E8" }}>
                    <td colSpan="3" style={{ padding: "8pt", fontSize: "8pt", letterSpacing: "0.1em", textTransform: "uppercase" }}>TOTAL</td>
                    <td style={{ padding: "8pt", textAlign: "right", fontWeight: 600, fontSize: "10pt" }}>
                      {fmtUSD(client.paymentPlan.installments.reduce((s, i) => s + (Number(i.amount) || 0), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="pdf-section" style={{ padding: "10pt 14pt", backgroundColor: "#FDFBF6", border: "1px solid rgba(26,35,66,0.15)", marginBottom: "20pt" }}>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, marginBottom: "4pt" }}>Notas Adicionales / Additional Notes</div>
              <div style={{ fontSize: "9pt", whiteSpace: "pre-wrap" }}>{notes}</div>
            </div>
          )}

          {/* Footer — stays with last content, won't overflow */}
          <div className="pdf-footer" style={{ marginTop: "20pt", paddingTop: "10pt", borderTop: "1px solid rgba(26,35,66,0.2)", fontSize: "7.5pt", color: "rgba(26,35,66,0.6)", letterSpacing: "0.05em" }}>
            <div className="grid grid-cols-3 gap-4">
              <div>{settings.company.legalName}<br/>{settings.company.address}</div>
              <div className="text-center">
                Documento generado el<br/>
                {issueDate.toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" })}
              </div>
              <div className="text-right">
                {settings.company.email}<br/>
                {settings.company.website}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form mode
  return (
    <div className="space-y-6">
      <div className="p-4 bg-[#FDFBF6] border border-[#1A2342]/10">
        <div className="flex items-center gap-3 mb-1">
          <Receipt className="w-4 h-4 text-[#4A6FA5]" strokeWidth={1.5} />
          <div className="text-sm font-medium text-[#1A2342]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("pi_client")}: {clientName || t("cd_unnamed")}
          </div>
        </div>
        <div className="text-[11px] text-[#1A2342]/60 ml-7" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {t("pi_villa")} {client.lotNumber ? `#${client.lotNumber}` : t("pi_villa_none")} · {t("pi_total_price")}: {fmtUSD(pricing.total)} · {t("pi_balance_pending")}: {fmtUSD(pending)}
        </div>
      </div>

      <SectionTitle subtitle={t("pi_details_sub")}>{t("pi_details")}</SectionTitle>

      {/* Plan installment selector — only when client has plan */}
      {hasPlan && (
        <div className="p-4 bg-[#F4EBD4] border-l-2 border-[#C9A961] space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#8B7430]" strokeWidth={1.8} />
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#8B7430] font-semibold" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t("pi_linked_to")}
            </span>
          </div>
          {billableInstallments.length === 0 ? (
            <div className="text-sm text-[#1A2342]/70" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t("pi_no_pending")}
            </div>
          ) : (
            <>
              <Select label={t("pi_select_installment")} value={selectedInstallmentId} onChange={setSelectedInstallmentId}
                options={[
                  { v: "", l: t("pi_select_installment_ph") },
                  ...billableInstallments.map(inst => {
                    const statusLabel = {
                      pending: t("plan_status_pending"),
                      partial: t("plan_status_partial"),
                      overdue: t("plan_status_overdue"),
                      partial_overdue: t("plan_status_partial_overdue"),
                    }[inst.status] || inst.status;
                    return {
                      v: inst.id,
                      l: `${inst.index + 1}. ${inst.concept || `Cuota ${inst.index + 1}`} — ${fmtUSD(inst.balance)} (${statusLabel})`
                    };
                  })
                ]}
                required={false} />
              <div className="text-[11px] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {t("pi_select_installment_help")}
              </div>
              {selectedInstallment && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px] pt-2 border-t border-[#C9A961]/30" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  <div>
                    <div className="text-[#1A2342]/50 uppercase tracking-[0.1em] text-[9px]">{t("plan_amount")}</div>
                    <div className="text-[#1A2342] font-medium">{fmtUSD(selectedInstallment.amount)}</div>
                  </div>
                  <div>
                    <div className="text-[#1A2342]/50 uppercase tracking-[0.1em] text-[9px]">{t("pi_inst_paid_already")}</div>
                    <div className="text-[#1A2342]">{fmtUSD(selectedInstallment.paidAmount || 0)}</div>
                  </div>
                  <div>
                    <div className="text-[#1A2342]/50 uppercase tracking-[0.1em] text-[9px]">{t("pi_plan_balance")}</div>
                    <div className="text-[#C9A961] font-semibold">{fmtUSD(Math.max(0, (selectedInstallment.amount || 0) - (selectedInstallment.paidAmount || 0)))}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!hasPlan && (
        <div className="p-3 bg-[#FDFBF6] border-l-2 border-[#1A2342]/30">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#1A2342]/60 font-semibold mb-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("pi_free_mode")}
          </div>
          <div className="text-[11px] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("pi_free_mode_note")}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select label={t("pi_concept")} value={concept} onChange={setConcept}
            options={CONCEPT_OPTIONS.map(o => ({ v: o, l: o }))} required
            disabled={!!selectedInstallment} />
        </div>
        <div>
          <div className="relative">
            <Input label={t("pi_amount")} type="number" value={amount} onChange={setAmount}
              placeholder={pending > 0 ? `${t("pi_amount_suggested")}: ${pending}` : "0"} required
              disabled={!!selectedInstallment && !amountUnlocked} />
            {selectedInstallment && (
              <button type="button" onClick={() => setAmountUnlocked(!amountUnlocked)}
                className="absolute right-0 top-0 text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 text-[#8B7430] hover:text-[#1A2342] transition-colors"
                style={{ fontFamily: "'Manrope', sans-serif" }}>
                {amountUnlocked ? t("pi_relock") : t("pi_unlock_amount")}
              </button>
            )}
          </div>
          {amountUnlocked && selectedInstallment && (
            <div className="text-[11px] text-[#B04B3F] mt-1 flex items-center gap-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <AlertTriangle className="w-3 h-3" strokeWidth={1.8} />
              {t("pi_unlock_warning")}
            </div>
          )}
        </div>
        {(concept === "Otro / Other" || concept === "Other / Otro") && !selectedInstallment && (
          <Input label={t("pi_custom_concept")} value={customConcept} onChange={setCustomConcept}
            placeholder={t("pi_custom_concept_ph")} className="md:col-span-2" />
        )}
        <Input label={t("pi_payment_number")} value={paymentNumber} onChange={setPaymentNumber}
          placeholder={t("pi_payment_number_ph")}
          disabled={!!selectedInstallment} />
        <div className="flex items-end">
          <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("pi_validity_label")}: {settings.payments.validityDays} {t("pi_validity_editable")}
          </div>
        </div>
        <Input label={t("pi_additional_notes")} value={notes} onChange={setNotes} textarea rows={3}
          placeholder={t("pi_additional_notes_ph")} className="md:col-span-2" />
      </div>

      {/* Reference preview */}
      <div className="p-3 bg-[#F4EBD4] border-l-2 border-[#C9A961]">
        <div className="text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/70 mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {t("pi_reference_unique")}
        </div>
        <div className="text-sm font-semibold text-[#1A2342]" style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
          {reference}
        </div>
      </div>

      {/* Warning if settings incomplete */}
      {!settings.bank.accountNumber && (
        <div className="p-3 bg-[#F3DDD9] border-l-2 border-[#B04B3F] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#B04B3F] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <div className="text-sm font-medium text-[#B04B3F]" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t("pi_bank_incomplete")}
            </div>
            <div className="text-[11px] text-[#1A2342]/70 mt-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t("pi_bank_incomplete_desc")}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1A2342]/10">
        <Button onClick={onClose} variant="ghost">{t("cancel")}</Button>
        <Button onClick={() => setMode("preview")} variant="primary" icon={Eye} disabled={!canPreview}>
          {t("preview")}
        </Button>
      </div>
    </div>
  );
}



// ------------------------- Login View -------------------------

function LoginView({ language, onToggleLanguage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isES = language === "es";

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setError(err.message || (isES ? "Error de inicio de sesión" : "Login error"));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-6 relative"
      style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Language toggle top-right */}
      <button onClick={onToggleLanguage}
        className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 border border-[#1A2342]/15 hover:border-[#1A2342]/40 transition-colors text-[11px] uppercase tracking-[0.12em] text-[#1A2342]/80 bg-white/50">
        <Languages className="w-3.5 h-3.5" strokeWidth={1.8} />
        <span className={language === "es" ? "text-[#1A2342] font-semibold" : "text-[#1A2342]/40"}>ES</span>
        <span className="text-[#1A2342]/30">/</span>
        <span className={language === "en" ? "text-[#1A2342] font-semibold" : "text-[#1A2342]/40"}>EN</span>
      </button>

      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="AMBAR" className="w-14 h-14" />
          </div>
          <h1 className="text-[#1A2342]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.25rem", fontWeight: 400, letterSpacing: "0.12em", lineHeight: 1 }}>
            AMBAR
          </h1>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#4A6FA5] mt-2">
            Longevity Estate
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mt-6">
            {isES ? "Sistema de gestión de clientes" : "Client management system"}
          </div>
        </div>

        {/* Login card */}
        <div className="bg-white border border-[#1A2342]/15 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-[#1A2342]/60" strokeWidth={1.5} />
            <h2 className="text-[#1A2342] text-sm uppercase tracking-[0.15em]">
              {isES ? "Iniciar Sesión" : "Sign In"}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-1.5">
                {isES ? "Correo Electrónico" : "Email"}
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKeyDown}
                placeholder={isES ? "tu@email.com" : "you@email.com"} autoComplete="email" autoFocus
                className="w-full px-3 py-2.5 bg-[#FDFBF6] border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm text-[#1A2342]" />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-1.5">
                {isES ? "Contraseña" : "Password"}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKeyDown}
                autoComplete="current-password"
                className="w-full px-3 py-2.5 bg-[#FDFBF6] border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm text-[#1A2342]" />
            </div>

            {error && (
              <div className="p-3 bg-[#F3DDD9] border-l-2 border-[#B04B3F] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#B04B3F] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-xs text-[#B04B3F]">{error}</div>
              </div>
            )}

            <button onClick={handleLogin} disabled={loading || !email || !password}
              className="w-full py-3 bg-[#1A2342] text-[#F5F1E8] text-xs uppercase tracking-[0.15em] hover:bg-[#2A3556] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                  {isES ? "Verificando..." : "Verifying..."}
                </>
              ) : (
                isES ? "Entrar" : "Sign In"
              )}
            </button>

            <div className="text-[11px] text-[#1A2342]/50 text-center pt-2">
              {isES
                ? "Solo personal autorizado. Contacta al administrador si necesitas acceso."
                : "Authorized personnel only. Contact the administrator if you need access."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-[10px] uppercase tracking-[0.15em] text-[#1A2342]/40">
          © 2026 Cumbre Azul Company SRL
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [clients, setClients] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [language, setLanguage] = useState("es");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [paymentInstructionFor, setPaymentInstructionFor] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);

  // Translation function
  const t = useCallback((key) => {
    return (TRANSLATIONS[language] && TRANSLATIONS[language][key]) || TRANSLATIONS.es[key] || key;
  }, [language]);

  // --------- Auth: check session & subscribe to changes ---------
  useEffect(() => {
    // Cargar idioma (local, no requiere auth)
    setLanguage(loadLanguage());

    // Verificar sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });

    // Suscribirse a cambios de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --------- Cargar datos de Supabase cuando hay sesión ---------
  useEffect(() => {
    if (!session) return;

    (async () => {
      setLoading(true);
      const loadedClients = await loadClientsFromDB();
      setClients(loadedClients);

      const s = await loadSettingsFromDB();
      if (s && Object.keys(s).length > 0) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...s,
          company: { ...DEFAULT_SETTINGS.company, ...(s.company || {}) },
          bank: { ...DEFAULT_SETTINGS.bank, ...(s.bank || {}) },
          payments: { ...DEFAULT_SETTINGS.payments, ...(s.payments || {}) }
        });
      }
      setLoading(false);
    })();
  }, [session]);

  // --------- Realtime: sync cuando otro usuario hace cambios ---------
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel("clients-realtime")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        async () => {
          const fresh = await loadClientsFromDB();
          setClients(fresh);
        }
      )
      .on("postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        async () => {
          const s = await loadSettingsFromDB();
          if (s && Object.keys(s).length > 0) {
            setSettings(prev => ({
              ...prev,
              ...s,
              company: { ...prev.company, ...(s.company || {}) },
              bank: { ...prev.bank, ...(s.bank || {}) },
              payments: { ...prev.payments, ...(s.payments || {}) }
            }));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === "es" ? "en" : "es";
      saveLanguage(next);
      return next;
    });
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const saveSettings = useCallback(async (next) => {
    setSettings(next);
    await saveSettingsToDB(next);
  }, []);

  const handleSave = async (client) => {
    const existing = clients.findIndex(c => c.id === client.id);
    const ok = await saveClientToDB(client);
    if (!ok) {
      alert(language === "es" ? "Error al guardar. Verifica tu conexión." : "Save failed. Check your connection.");
      return;
    }
    let next;
    if (existing >= 0) {
      next = clients.map(c => c.id === client.id ? client : c);
    } else {
      next = [...clients, client];
    }
    setClients(next);
    setFormOpen(false);
    setFormInitial(null);
    showToast(existing >= 0 ? t("toast_updated") : t("toast_created"));
  };

  const handleDelete = async (id) => {
    const client = clients.find(c => c.id === id);
    // Limpiar documentos en storage antes de borrar el cliente
    if (client?.documents && client.documents.length > 0) {
      try {
        await Promise.all(client.documents.map(doc => deleteDocument(doc.path).catch(() => {})));
      } catch (e) {
        console.error("Error cleaning documents:", e);
      }
    }
    const ok = await deleteClientFromDB(id);
    if (!ok) {
      alert(language === "es" ? "Error al eliminar." : "Delete failed.");
      return;
    }
    setClients(clients.filter(c => c.id !== id));
    setSelectedClientId(null);
    showToast(t("toast_deleted"));
  };

  const handleExport = async () => {
    if (clients.length === 0) {
      alert(t("lbl_no_clients_export"));
      return;
    }
    setExporting(true);
    try {
      await exportToExcel(clients, settings);
      showToast(t("toast_excel"));
    } catch (e) {
      console.error(e);
      alert(t("lbl_export_error") + e.message);
    }
    setExporting(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setClients([]);
    setSettings(DEFAULT_SETTINGS);
    setView("dashboard");
    setSelectedClientId(null);
  };

  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [formInitialTab, setFormInitialTab] = useState(null);

  const openNew = () => { setQuickCreateOpen(true); };
  const openEdit = (client) => { setFormInitial(client); setFormInitialTab(null); setFormOpen(true); };
  const openEditTab = (client, tab) => { setFormInitial(client); setFormInitialTab(tab); setFormOpen(true); };

  const handleQuickCreate = async (newClient) => {
    setQuickCreateOpen(false);
    const saved = await saveClientToDB(newClient);
    if (!saved) {
      alert(language === "es" ? "Error al crear cliente." : "Error creating client.");
      return;
    }
    setClients([...clients, saved]);
    setSelectedClientId(saved.id);
    showToast(language === "es" ? "Prospecto creado" : "Prospect created");
  };

  const handleAdvanceStage = async (client) => {
    const current = getClientStage(client);
    const next = getNextStage(current);
    if (!next) return;
    if (!canAdvanceToStage(client, next)) {
      alert(language === "es"
        ? "Faltan requisitos para avanzar. Completa los campos marcados."
        : "Requirements missing to advance. Complete the marked fields.");
      return;
    }
    const msg = t("stage_confirm_advance") + "\n\n" +
      (language === "es" ? STAGE_CONFIG[current].label : STAGE_CONFIG[current].labelEn) +
      " → " +
      (language === "es" ? STAGE_CONFIG[next].label : STAGE_CONFIG[next].labelEn);
    if (!confirm(msg)) return;
    const updated = {
      ...client,
      stage: next,
      status: stageToStatus(next),
      updatedAt: new Date().toISOString(),
    };
    const saved = await saveClientToDB(updated);
    if (!saved) {
      alert(language === "es" ? "Error al guardar." : "Error saving.");
      return;
    }
    setClients(clients.map(c => c.id === saved.id ? saved : c));
    showToast(t("stage_advanced"));
  };

  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;

  // Auth: verificando sesión inicial
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="flex items-center gap-3 text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          <span className="text-sm">{language === "es" ? "Verificando sesión..." : "Checking session..."}</span>
        </div>
      </div>
    );
  }

  // Auth: no hay sesión → mostrar login
  if (!session) {
    return <LoginView language={language} onToggleLanguage={toggleLanguage} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="flex items-center gap-3 text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          <span className="text-sm">{t("loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang: language, t, setLang: setLanguage }}>
    <SettingsContext.Provider value={settings}>
    <div className="min-h-screen bg-[#F5F1E8]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Manrope', sans-serif; background: #F5F1E8; }
        input, select, textarea, button { font-family: inherit; }
        /* Subtle scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26,35,66,0.15); }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26,35,66,0.3); }

        /* Print fallback — only applies if direct window.print() is triggered */
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .pdf-section, .pdf-footer {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .pdf-page table, .pdf-page tr,
          .pdf-page ol, .pdf-page ul, .pdf-page li {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }

        /* Responsive helpers for mobile */
        @media (max-width: 767px) {
          /* Tables that were grid-based become scrollable on mobile */
          .mobile-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
      `}</style>

      {/* Top Nav */}
      <div className="border-b border-[#1A2342]/10 bg-[#F5F1E8] sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-2">
          <button onClick={() => { setView("dashboard"); setSelectedClientId(null); }} className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <img src="/logo.svg" alt="AMBAR" className="w-7 h-7 flex-shrink-0" />
            <div className="text-left hidden sm:block">
              <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 500, letterSpacing: "0.12em", lineHeight: 1 }}>
                AMBAR
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#1A2342]/50 mt-0.5 hidden md:block">Client Management</div>
            </div>
          </button>

          <nav className="flex gap-0.5 md:gap-1 overflow-x-auto">
            {[
              { v: "dashboard", l: t("nav_dashboard"), icon: TrendingUp },
              { v: "clients",   l: t("nav_clients"),   icon: Users },
              { v: "villas",    l: t("nav_villas"),    icon: Home },
              { v: "settings",  l: t("nav_settings"),  icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              const active = view === item.v;
              return (
                <button key={item.v} onClick={() => { setView(item.v); setSelectedClientId(null); }}
                  title={item.l}
                  className={`flex items-center gap-2 px-2 md:px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors flex-shrink-0 ${active ? "text-[#1A2342] bg-[#1A2342]/5" : "text-[#1A2342]/60 hover:text-[#1A2342]"}`}>
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  <span className="hidden lg:inline">{item.l}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {/* Language toggle */}
            <button onClick={toggleLanguage}
              className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 border border-[#1A2342]/15 hover:border-[#1A2342]/40 transition-colors text-[11px] uppercase tracking-[0.12em] text-[#1A2342]/80"
              title={language === "es" ? "Switch to English" : "Cambiar a Español"}>
              <Languages className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span className={`hidden sm:inline ${language === "es" ? "text-[#1A2342] font-semibold" : "text-[#1A2342]/40"}`}>ES</span>
              <span className="text-[#1A2342]/30 hidden sm:inline">/</span>
              <span className={`hidden sm:inline ${language === "en" ? "text-[#1A2342] font-semibold" : "text-[#1A2342]/40"}`}>EN</span>
              <span className="sm:hidden text-[#1A2342] font-semibold">{language.toUpperCase()}</span>
            </button>
            <Button onClick={handleExport} variant="ghost" size="sm" icon={exporting ? Loader2 : FileDown} disabled={exporting}>
              <span className="hidden md:inline">{exporting ? t("exporting") : "Excel"}</span>
            </Button>
            <Button onClick={openNew} variant="primary" size="sm" icon={Plus}>
              <span className="hidden md:inline">{t("new_client_short")}</span>
            </Button>

            {/* User indicator & logout */}
            <div className="flex items-center gap-1 md:gap-2 pl-1 md:pl-2 ml-0.5 md:ml-1 border-l border-[#1A2342]/15">
              <div className="text-[10px] text-[#1A2342]/60 hidden xl:block max-w-[140px] truncate" title={session?.user?.email}>
                {session?.user?.email}
              </div>
              <button onClick={handleSignOut}
                className="p-1.5 hover:bg-[#1A2342]/5 text-[#1A2342]/60 hover:text-[#B04B3F] transition-colors"
                title={language === "es" ? "Cerrar sesión" : "Sign out"}>
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {selectedClient ? (
          <div>
            <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#1A2342]/60 hover:text-[#1A2342] mb-6 no-print">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
              {t("back")}
            </button>
            <ClientDetail
              client={selectedClient}
              onEdit={() => openEdit(selectedClient)}
              onEditTab={(tab) => openEditTab(selectedClient, tab)}
              onAdvanceStage={() => handleAdvanceStage(selectedClient)}
              onClose={() => setSelectedClientId(null)}
              onDelete={handleDelete}
              onGeneratePayment={(c) => setPaymentInstructionFor(c)}
            />
          </div>
        ) : view === "dashboard" ? (
          <Dashboard
            clients={clients}
            onNewClient={openNew}
            onExport={handleExport}
            onGoToClients={() => setView("clients")}
            onGoToVillas={() => setView("villas")}
          />
        ) : view === "clients" ? (
          <ClientsList
            clients={clients}
            onSelect={setSelectedClientId}
            onNew={openNew}
            onExport={handleExport}
            onDelete={handleDelete}
          />
        ) : view === "villas" ? (
          <VillasView
            clients={clients}
            onClickClient={setSelectedClientId}
          />
        ) : view === "settings" ? (
          <SettingsView settings={settings} onSave={saveSettings} />
        ) : null}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 border-t border-[#1A2342]/10 mt-12 no-print">
        <div className="flex items-center justify-between text-[10px] text-[#1A2342]/40 uppercase tracking-[0.15em]">
          <span>{t("footer_copyright")}</span>
          <span>{t("footer_compliance")}</span>
        </div>
      </div>

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setFormInitial(null); }}
        title={formInitial ? t("form_edit_title") : t("form_new_title")} size="xl">
        {formOpen && <ClientForm initial={formInitial} initialTab={formInitialTab} onSave={handleSave} onCancel={() => { setFormOpen(false); setFormInitial(null); setFormInitialTab(null); }} />}
      </Modal>

      {/* Quick Create Modal (for new prospects) */}
      <QuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreate={handleQuickCreate}
      />

      {/* Payment Instruction Modal */}
      <Modal open={!!paymentInstructionFor} onClose={() => setPaymentInstructionFor(null)}
        title={t("pi_modal_title")} size="xl">
        {paymentInstructionFor && (
          <PaymentInstructionModal
            client={paymentInstructionFor}
            settings={settings}
            onClose={() => setPaymentInstructionFor(null)}
            onSaveClient={handleSave}
          />
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#1A2342] text-[#F5F1E8] text-sm shadow-lg flex items-center gap-2"
          style={{ fontFamily: "'Manrope', sans-serif" }}>
          <Check className="w-4 h-4 text-[#C9A961]" strokeWidth={2} />
          {toast.msg}
        </div>
      )}
    </div>
    </SettingsContext.Provider>
    </LanguageContext.Provider>
  );
}