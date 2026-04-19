import React, { useState, useEffect, useMemo, useCallback, useContext, createContext } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import {
  Users, Home, DollarSign, FileDown, Plus, Search, Edit3, Trash2,
  X, Check, Download, Upload, Filter, ChevronDown, ChevronRight,
  Building2, UserCircle, Shield, CreditCard, ClipboardList,
  AlertCircle, TrendingUp, Eye, ArrowLeft, MapPin, Calendar,
  FileText, Phone, Mail, Globe, Briefcase, Copy, Loader2,
  Settings, Printer, Receipt, Languages, LogOut, Lock
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
  },
};

const LanguageContext = createContext({ lang: "es", t: (k) => k, setLang: () => {} });
const useT = () => useContext(LanguageContext);

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

const todayISO = () => new Date().toISOString().slice(0, 10);

// Compute villa pricing
const computePrice = (client) => {
  const model = VILLA_MODELS[client.villaModel];
  let base = 0;
  if (model) base = model.sqft * PRICE_PER_SQFT;
  if (client.basePriceOverride && Number(client.basePriceOverride) > 0) {
    base = Number(client.basePriceOverride);
  }
  const smart = client.smartLivingPackage ? SMART_LIVING_PRICE : 0;
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

const paidPercentage = (client) => {
  const { total } = computePrice(client);
  if (!total) return 0;
  return Math.min(100, (paidAmount(client) / total) * 100);
};

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

async function exportToExcel(clients) {
  const sheetjs = XLSX;

  const wb = sheetjs.utils.book_new();

  // Sheet 1: Resumen General de Clientes
  const summary = clients.map(c => {
    const p = computePrice(c);
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
      "Modelo": VILLA_MODELS[c.villaModel]?.name || "",
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
  const villasRows = Object.entries(LOT_SIZES_FT2).map(([num, size]) => {
    const assigned = clients.find(c => String(c.lotNumber) === String(num));
    return {
      "Villa #": Number(num),
      "Tamaño Terreno (ft²)": size,
      "Estado": assigned ? (STATUS_CONFIG[assigned.status]?.label || assigned.status) : "Disponible",
      "Cliente": assigned ? (assigned.fullName || assigned.companyName || "") : "",
      "Modelo": assigned ? (VILLA_MODELS[assigned.villaModel]?.name || "") : "",
      "Precio Total": assigned ? computePrice(assigned).total : "",
      "Pagado": assigned ? paidAmount(assigned) : "",
    };
  });
  const ws6 = sheetjs.utils.json_to_sheet(villasRows);
  sheetjs.utils.book_append_sheet(wb, ws6, "Inventario Villas");

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

const Input = ({ label, value, onChange, type = "text", placeholder, required, className = "", textarea, rows = 3, ...rest }) => (
  <div className={className}>
    {label && (
      <label className="block text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-1.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {label} {required && <span className="text-[#B04B3F]">*</span>}
      </label>
    )}
    {textarea ? (
      <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2 bg-[#FDFBF6] border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm text-[#1A2342] placeholder:text-[#1A2342]/30"
        style={{ fontFamily: "'Manrope', sans-serif" }}
        {...rest} />
    ) : (
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#FDFBF6] border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm text-[#1A2342] placeholder:text-[#1A2342]/30"
        style={{ fontFamily: "'Manrope', sans-serif" }}
        {...rest} />
    )}
  </div>
);

const Select = ({ label, value, onChange, options, required, placeholder = "—", className = "" }) => (
  <div className={className}>
    {label && (
      <label className="block text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60 mb-1.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {label} {required && <span className="text-[#B04B3F]">*</span>}
      </label>
    )}
    <select value={value || ""} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-[#FDFBF6] border border-[#1A2342]/15 focus:border-[#4A6FA5] focus:outline-none text-sm text-[#1A2342]"
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

function ClientForm({ initial, onSave, onCancel }) {
  const { t, lang } = useT();
  const [tab, setTab] = useState("type");
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
    { v: "type",     l: t("tab_type"),     icon: UserCircle },
    { v: "personal", l: t("tab_personal"), icon: FileText },
    { v: "villa",    l: t("tab_villa"),    icon: Home },
    { v: "aml",      l: t("tab_aml"),      icon: Shield },
    { v: "payments", l: t("tab_payments"), icon: CreditCard },
    { v: "notes",    l: t("tab_notes"),    icon: ClipboardList },
  ];

  const pricing = computePrice(data);

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
    onSave(data);
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
                <Input label={lang === "es" ? "Nombre Completo" : "Full Name"} value={data.legalRepName} onChange={v => update({ legalRepName: v })} />
                <Input label={lang === "es" ? "Nacionalidad" : "Nationality"} value={data.legalRepNationality} onChange={v => update({ legalRepNationality: v })} />
                <Input label={lang === "es" ? "Número de ID" : "ID Number"} value={data.legalRepId} onChange={v => update({ legalRepId: v })} />
                <Input label={lang === "es" ? "Cargo" : "Position"} value={data.legalRepPosition} onChange={v => update({ legalRepPosition: v })} />
              </div>
            </>
          )}

          <SectionTitle>{t("sec_contact")}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            <Select label={lang === "es" ? "Número de Villa / Lote" : "Villa / Lot Number"} value={data.lotNumber} onChange={v => update({ lotNumber: v })}
              options={Object.keys(LOT_SIZES_FT2).map(n => ({ v: n, l: `Villa #${n} — ${LOT_SIZES_FT2[n].toLocaleString()} ft² ${lang === "es" ? "terreno" : "lot"}` }))} />
            <Select label={lang === "es" ? "Modelo de Villa" : "Villa Model"} value={data.villaModel} onChange={v => update({ villaModel: v })}
              options={Object.entries(VILLA_MODELS).map(([k, m]) => ({ v: k, l: `${m.name} — ${m.sqft.toLocaleString()} ft²` }))} />
          </div>

          <SectionTitle subtitle={t("sec_packages_sub")}>{t("sec_packages")}</SectionTitle>
          <div className="space-y-3 p-4 bg-[#FDFBF6] border border-[#1A2342]/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Checkbox label={`${t("lbl_smart_living")} — ${fmtUSD(SMART_LIVING_PRICE)}`} checked={data.smartLivingPackage} onChange={v => update({ smartLivingPackage: v })} />
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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

      {/* Tab: Payments */}
      {tab === "payments" && (
        <div className="space-y-6">
          <SectionTitle subtitle={t("sec_initial_deposit_sub")}>{t("sec_initial_deposit")}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
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
              data.payments.map(p => (
                <div key={p.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-[#FDFBF6] border border-[#1A2342]/10">
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
              ))
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

      {/* Tab: Notes */}
      {tab === "notes" && (
        <div className="space-y-6">
          <SectionTitle subtitle={t("sec_internal_notes_sub")}>{t("sec_internal_notes")}</SectionTitle>
          <Input textarea rows={10} value={data.notes} onChange={v => update({ notes: v })}
            placeholder={t("lbl_notes_ph")} />
          <div className="grid grid-cols-2 gap-4">
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

function ClientDetail({ client, onEdit, onClose, onDelete, onGeneratePayment }) {
  const { t, lang } = useT();
  const pricing = computePrice(client);
  const paid = paidAmount(client);
  const pct = paidPercentage(client);
  const model = VILLA_MODELS[client.villaModel];
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
      <div className="flex items-start justify-between">
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
        <div className="flex gap-2">
          <Button onClick={() => onGeneratePayment(client)} variant="gold" icon={Receipt}>{t("cd_gen_payment_btn")}</Button>
          <Button onClick={onEdit} variant="primary" icon={Edit3}>{t("edit")}</Button>
          <Button onClick={() => { if (confirm(t("lbl_confirm_delete"))) onDelete(client.id); }} variant="danger" icon={Trash2}>{t("delete")}</Button>
        </div>
      </div>

      {/* Villa & Price Summary */}
      {(client.lotNumber || client.villaModel) && (
        <div className="grid grid-cols-3 gap-0 border border-[#1A2342]/15">
          <div className="p-5 border-r border-[#1A2342]/15">
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
                {t("villa_terrain")}: {LOT_SIZES_FT2[client.lotNumber]?.toLocaleString()} ft²
              </div>
            )}
          </div>
          <div className="p-5 border-r border-[#1A2342]/15">
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
        <div className="grid grid-cols-2 gap-x-8">
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
        <div className="grid grid-cols-2 gap-x-8">
          <InfoRow label={t("info_email")} value={client.email} icon={Mail} />
          <InfoRow label={t("info_phone")} value={client.phone} icon={Phone} />
          <InfoRow label={t("info_phone2")} value={client.phoneSecondary} icon={Phone} />
          <InfoRow label={t("info_address")} value={client.address} icon={MapPin} />
        </div>
      </div>

      {/* AML */}
      <div>
        <SectionTitle>{t("cd_aml_compliance")}</SectionTitle>
        <div className="grid grid-cols-2 gap-x-8">
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
          <div className="border border-[#1A2342]/10">
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

      <div className="text-[11px] text-[#1A2342]/40 pt-6 border-t border-[#1A2342]/10" style={{ fontFamily: "'Manrope', sans-serif" }}>
        {t("lbl_id_label")}: {client.id} · {t("lbl_created")}: {fmtDate(client.createdAt)} · {t("lbl_updated")}: {fmtDate(client.updatedAt)}
      </div>
    </div>
  );
}

// ------------------------- Dashboard -------------------------

function Dashboard({ clients, onNewClient, onExport, onGoToClients, onGoToVillas }) {
  const { t } = useT();
  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((s, c) => s + computePrice(c).total, 0);
    const totalPaid = clients.reduce((s, c) => s + paidAmount(c), 0);
    const active = clients.filter(c => ["reserved","contract","active"].includes(c.status)).length;
    const byStatus = STATUS_ORDER.reduce((acc, s) => { acc[s] = clients.filter(c => c.status === s).length; return acc; }, {});
    const soldLots = new Set(clients.filter(c => c.lotNumber && c.status !== "cancelled").map(c => String(c.lotNumber)));
    return { totalRevenue, totalPaid, active, byStatus, soldLots: soldLots.size, availableLots: 35 - soldLots.size };
  }, [clients]);

  const recentClients = useMemo(() => [...clients].sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "")).slice(0, 5), [clients]);
  const topPipeline = useMemo(() => clients.filter(c => !["cancelled","completed"].includes(c.status)).sort((a,b) => computePrice(b).total - computePrice(a).total).slice(0, 5), [clients]);

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
      <div className="grid grid-cols-4 gap-0 border border-[#1A2342]/15">
        {[
          { label: t("dash_total_clients"), value: clients.length, sub: `${stats.active} ${t("dash_total_clients_sub")}` },
          { label: t("dash_pipeline_total"), value: fmtUSD(stats.totalRevenue), sub: t("dash_pipeline_total_sub") },
          { label: t("dash_collected"), value: fmtUSD(stats.totalPaid), sub: stats.totalRevenue ? `${((stats.totalPaid/stats.totalRevenue)*100).toFixed(1)}% ${t("dash_collected_sub")}` : "0%" },
          { label: t("dash_villas_assigned"), value: `${stats.soldLots}/35`, sub: `${stats.availableLots} ${t("dash_villas_assigned_sub")}` },
        ].map((k, i) => (
          <div key={i} className={`p-6 ${i < 3 ? "border-r border-[#1A2342]/15" : ""}`}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#1A2342]/50 mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>{k.label}</div>
            <div className="text-[#1A2342] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 500 }}>{k.value}</div>
            <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline breakdown */}
      <div>
        <SectionTitle>{t("dash_pipeline_by_status")}</SectionTitle>
        <div className="grid grid-cols-7 gap-2">
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
      <div className="grid grid-cols-2 gap-8">
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
                const p = computePrice(c);
                const pct = paidPercentage(c);
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
  const { t } = useT();
  const villaStatus = useMemo(() => {
    const map = {};
    Object.keys(LOT_SIZES_FT2).forEach(n => { map[n] = { available: true, client: null }; });
    clients.forEach(c => {
      if (c.lotNumber && c.status !== "cancelled") {
        map[c.lotNumber] = { available: false, client: c };
      }
    });
    return map;
  }, [clients]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[#1A2342] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 400, letterSpacing: "0.02em" }}>
          {t("villa_map_title")}
        </h1>
        <p className="text-sm text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
          {t("villa_map_sub")}
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
      <div className="grid grid-cols-7 gap-2">
        {Object.keys(LOT_SIZES_FT2).map(n => {
          const v = villaStatus[n];
          const cfg = v.client ? STATUS_CONFIG[v.client.status] : null;
          const model = v.client ? VILLA_MODELS[v.client.villaModel] : null;
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
                {LOT_SIZES_FT2[n].toLocaleString()} ft²
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
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(VILLA_MODELS).map(([k, m]) => {
            const base = m.sqft * PRICE_PER_SQFT;
            return (
              <div key={k} className="p-4 border border-[#1A2342]/15">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3" style={{ backgroundColor: m.color }} />
                  <span className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>{m.name}</span>
                </div>
                <div className="text-[11px] text-[#1A2342]/60 space-y-0.5" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  <div>{m.sqft.toLocaleString()} ft² · {m.sqm} m²</div>
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
    if (sortBy === "price") list.sort((a,b) => computePrice(b).total - computePrice(a).total);
    if (sortBy === "paid") list.sort((a,b) => paidPercentage(b) - paidPercentage(a));
    return list;
  }, [clients, filterStatus, filterType, search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
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
        <div className="border border-[#1A2342]/10">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#1A2342]/5 text-[10px] uppercase tracking-[0.12em] text-[#1A2342]/60" style={{ fontFamily: "'Manrope', sans-serif" }}>
            <div className="col-span-3">{t("col_client")}</div>
            <div className="col-span-2">{t("col_status")}</div>
            <div className="col-span-1 text-center">{t("col_villa")}</div>
            <div className="col-span-2 text-right">{t("col_total_price")}</div>
            <div className="col-span-3">{t("col_progress")}</div>
            <div className="col-span-1 text-right">{t("col_action")}</div>
          </div>
          {filtered.map(c => {
            const p = computePrice(c);
            const pct = paidPercentage(c);
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
        <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
              <Input label={lang === "es" ? "Banco Intermediario" : "Intermediary Bank"} value={draft.bank.intermediaryBank} onChange={v => update("bank","intermediaryBank",v)} />
              <Input label={lang === "es" ? "SWIFT del Intermediario" : "Intermediary SWIFT"} value={draft.bank.intermediarySwift} onChange={v => update("bank","intermediarySwift",v)} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div>
        <SectionTitle subtitle={t("settings_payments_sub")}>{t("settings_payments")}</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Input label={t("settings_validity")} type="number" value={draft.payments.validityDays} onChange={v => update("payments","validityDays",Number(v))} />
          <Input label={t("settings_email_comprobantes")} value={draft.payments.remittanceEmail} onChange={v => update("payments","remittanceEmail",v)} type="email" />
        </div>
      </div>

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

// ------------------------- Payment Instruction Generator -------------------------

function PaymentInstructionModal({ client, settings, onClose }) {
  const { t, lang } = useT();
  const [concept, setConcept] = useState("Depósito de Reserva / Reservation Deposit");
  const [customConcept, setCustomConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("form"); // 'form' | 'preview'

  const pricing = computePrice(client);
  const pending = pricing.total - paidAmount(client);

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

  // Reference: AMBAR-V023-20260418-A7B3
  const reference = useMemo(() => {
    const lot = String(client.lotNumber || "XXX").padStart(3, "0");
    const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const suffix = (client.id || "").slice(-4).toUpperCase();
    return `AMBAR-V${lot}-${date}-${suffix}`;
  }, [client]);

  const issueDate = new Date();
  const validityDays = settings.payments.validityDays || 15;
  const validUntil = new Date(issueDate.getTime() + validityDays * 24 * 60 * 60 * 1000);

  const clientName = client.type === "entity" ? client.companyName : client.fullName;

  const handlePrint = () => {
    window.print();
  };

  const canPreview = finalConcept && Number(amount) > 0;

  if (mode === "preview") {
    return (
      <div className="print-instruction">
        {/* Non-print controls */}
        <div className="no-print flex items-center justify-between mb-6 pb-4 border-b border-[#1A2342]/10">
          <Button onClick={() => setMode("form")} variant="ghost" icon={ArrowLeft}>{t("edit")}</Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="primary" icon={Printer}>{t("print_pdf")}</Button>
            <Button onClick={onClose} variant="outline" icon={X}>{t("close")}</Button>
          </div>
        </div>

        {/* Printable content */}
        <div className="pdf-page bg-white text-[#1A2342] p-10 mx-auto" style={{ maxWidth: "210mm", minHeight: "297mm", fontFamily: "'Manrope', sans-serif", fontSize: "10pt" }}>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b-2 border-[#1A2342]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                  <path d="M20 70 Q 50 30, 80 70 L 65 70 Q 50 50, 35 70 Z" fill="#1A2342" />
                </svg>
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
          <div className="grid grid-cols-2 gap-8 mb-6">
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
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[#F5F1E8]" style={{ border: "1px solid rgba(26,35,66,0.15)" }}>
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
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* ES */}
            <div>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, borderBottom: "1px solid rgba(26,35,66,0.2)", paddingBottom: "4pt", marginBottom: "8pt" }}>
                Detalles de la Transacción
              </div>
              <table style={{ width: "100%", fontSize: "9pt", lineHeight: 1.6 }}>
                <tbody>
                  <tr><td style={{ opacity: 0.6, paddingRight: "12pt", verticalAlign: "top", width: "45%" }}>Cliente</td><td style={{ fontWeight: 500 }}>{clientName || "—"}</td></tr>
                  {client.lotNumber && <tr><td style={{ opacity: 0.6 }}>Villa / Lote</td><td style={{ fontWeight: 500 }}>No. {client.lotNumber} {VILLA_MODELS[client.villaModel] ? `— ${VILLA_MODELS[client.villaModel].name}` : ""}</td></tr>}
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
                  {client.lotNumber && <tr><td style={{ opacity: 0.6 }}>Villa / Lot</td><td style={{ fontWeight: 500 }}>No. {client.lotNumber} {VILLA_MODELS[client.villaModel] ? `— ${VILLA_MODELS[client.villaModel].name}` : ""}</td></tr>}
                  <tr><td style={{ opacity: 0.6 }}>Concept</td><td style={{ fontWeight: 500 }}>{finalConcept.split(" / ")[1] || finalConcept}</td></tr>
                  {paymentNumber && <tr><td style={{ opacity: 0.6 }}>Payment Number</td><td style={{ fontWeight: 500 }}>{paymentNumber}</td></tr>}
                  <tr><td style={{ opacity: 0.6 }}>Total Villa Price</td><td>{fmtUSD(pricing.total)}</td></tr>
                  <tr><td style={{ opacity: 0.6 }}>Paid to Date</td><td>{fmtUSD(paidAmount(client))}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount highlight */}
          <div style={{ backgroundColor: "#1A2342", color: "#F5F1E8", padding: "16pt 20pt", marginBottom: "20pt" }}>
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
          <div className="mb-6">
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
          <div className="grid grid-cols-2 gap-8 mb-6">
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

          {/* Notes */}
          {notes && (
            <div style={{ padding: "10pt 14pt", backgroundColor: "#FDFBF6", border: "1px solid rgba(26,35,66,0.15)", marginBottom: "20pt" }}>
              <div style={{ fontSize: "7pt", letterSpacing: "0.2em", textTransform: "uppercase", color: "#1A2342", opacity: 0.6, marginBottom: "4pt" }}>Notas Adicionales / Additional Notes</div>
              <div style={{ fontSize: "9pt", whiteSpace: "pre-wrap" }}>{notes}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ position: "absolute", bottom: "15mm", left: "20mm", right: "20mm", paddingTop: "10pt", borderTop: "1px solid rgba(26,35,66,0.2)", fontSize: "7.5pt", color: "rgba(26,35,66,0.6)", letterSpacing: "0.05em" }} className="grid grid-cols-3 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
        <Select label={t("pi_concept")} value={concept} onChange={setConcept}
          options={CONCEPT_OPTIONS.map(o => ({ v: o, l: o }))} required />
        <Input label={t("pi_amount")} type="number" value={amount} onChange={setAmount}
          placeholder={pending > 0 ? `${t("pi_amount_suggested")}: ${pending}` : "0"} required />
        {(concept === "Otro / Other" || concept === "Other / Otro") && (
          <Input label={t("pi_custom_concept")} value={customConcept} onChange={setCustomConcept}
            placeholder={t("pi_custom_concept_ph")} className="col-span-2" />
        )}
        <Input label={t("pi_payment_number")} value={paymentNumber} onChange={setPaymentNumber}
          placeholder={t("pi_payment_number_ph")} />
        <div className="flex items-end">
          <div className="text-[11px] text-[#1A2342]/50" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {t("pi_validity_label")}: {settings.payments.validityDays} {t("pi_validity_editable")}
          </div>
        </div>
        <Input label={t("pi_additional_notes")} value={notes} onChange={setNotes} textarea rows={3}
          placeholder={t("pi_additional_notes_ph")} className="col-span-2" />
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
            <svg width="56" height="56" viewBox="0 0 100 100" fill="none">
              <path d="M20 70 Q 50 30, 80 70 L 65 70 Q 50 50, 35 70 Z" fill="#1A2342" />
            </svg>
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
      await exportToExcel(clients);
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

  const openNew = () => { setFormInitial(null); setFormOpen(true); };
  const openEdit = (client) => { setFormInitial(client); setFormOpen(true); };

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

        /* Print styles for payment instruction PDF */
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white !important; }
          body * { visibility: hidden !important; }
          .print-instruction, .print-instruction * { visibility: visible !important; }
          .print-instruction {
            position: absolute !important;
            left: 0; top: 0; width: 100%;
            background: white !important;
          }
          .print-instruction .no-print { display: none !important; }
          .pdf-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            max-width: 100% !important;
          }
          /* Hide app chrome */
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Top Nav */}
      <div className="border-b border-[#1A2342]/10 bg-[#F5F1E8] sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button onClick={() => { setView("dashboard"); setSelectedClientId(null); }} className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" className="flex-shrink-0">
              <path d="M20 70 Q 50 30, 80 70 L 65 70 Q 50 50, 35 70 Z" fill="#1A2342" />
            </svg>
            <div className="text-left">
              <div className="text-[#1A2342]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 500, letterSpacing: "0.12em", lineHeight: 1 }}>
                AMBAR
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#1A2342]/50 mt-0.5">Client Management</div>
            </div>
          </button>

          <nav className="flex gap-1">
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
                  className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors ${active ? "text-[#1A2342] bg-[#1A2342]/5" : "text-[#1A2342]/60 hover:text-[#1A2342]"}`}>
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  {item.l}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1A2342]/15 hover:border-[#1A2342]/40 transition-colors text-[11px] uppercase tracking-[0.12em] text-[#1A2342]/80"
              title={language === "es" ? "Switch to English" : "Cambiar a Español"}>
              <Languages className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span className={language === "es" ? "text-[#1A2342] font-semibold" : "text-[#1A2342]/40"}>ES</span>
              <span className="text-[#1A2342]/30">/</span>
              <span className={language === "en" ? "text-[#1A2342] font-semibold" : "text-[#1A2342]/40"}>EN</span>
            </button>
            <Button onClick={handleExport} variant="ghost" size="sm" icon={exporting ? Loader2 : FileDown} disabled={exporting}>
              {exporting ? t("exporting") : "Excel"}
            </Button>
            <Button onClick={openNew} variant="primary" size="sm" icon={Plus}>{t("new_client_short")}</Button>

            {/* User indicator & logout */}
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[#1A2342]/15">
              <div className="text-[10px] text-[#1A2342]/60 hidden md:block max-w-[140px] truncate" title={session?.user?.email}>
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
      <div className="max-w-7xl mx-auto px-8 py-10">
        {selectedClient ? (
          <div>
            <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#1A2342]/60 hover:text-[#1A2342] mb-6 no-print">
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
              {t("back")}
            </button>
            <ClientDetail
              client={selectedClient}
              onEdit={() => openEdit(selectedClient)}
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
      <div className="max-w-7xl mx-auto px-8 py-6 border-t border-[#1A2342]/10 mt-12 no-print">
        <div className="flex items-center justify-between text-[10px] text-[#1A2342]/40 uppercase tracking-[0.15em]">
          <span>{t("footer_copyright")}</span>
          <span>{t("footer_compliance")}</span>
        </div>
      </div>

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setFormInitial(null); }}
        title={formInitial ? t("form_edit_title") : t("form_new_title")} size="xl">
        {formOpen && <ClientForm initial={formInitial} onSave={handleSave} onCancel={() => { setFormOpen(false); setFormInitial(null); }} />}
      </Modal>

      {/* Payment Instruction Modal */}
      <Modal open={!!paymentInstructionFor} onClose={() => setPaymentInstructionFor(null)}
        title={t("pi_modal_title")} size="xl">
        {paymentInstructionFor && (
          <PaymentInstructionModal
            client={paymentInstructionFor}
            settings={settings}
            onClose={() => setPaymentInstructionFor(null)}
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
    </LanguageContext.Provider>
  );
}