import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  DashboardRounded,
  DirectionsCarRounded,
  BuildCircleRounded,
  EventAvailableRounded,
  AssignmentRounded,
  EngineeringRounded,
  Inventory2Rounded,
  ReceiptLongRounded,
  InsertChartRounded,
  BadgeRounded,
  AddCircleRounded,
  EditRounded,
  DeleteOutlineRounded,
  CheckCircleRounded,
  CancelRounded,
  ScheduleRounded,
  SearchRounded,
  LogoutRounded,
  OpenInNewRounded,
  WarningAmberRounded,
  PaidRounded,
  PrintRounded,
  DownloadRounded,
  SwapVertRounded,
  HistoryRounded,
  StarRounded,
  CloseRounded,
  PlayArrowRounded,
  ErrorOutlineRounded,
  PersonAddAlt1Rounded,
  LockRounded
} from '@mui/icons-material';
import {
  FALLBACK_VEHICLES,
  FALLBACK_SERVICES,
  FALLBACK_MECHANICS,
  FALLBACK_APPOINTMENTS,
  FALLBACK_JOB_CARDS,
  FALLBACK_INVENTORY,
  FALLBACK_INVOICES,
  FALLBACK_STAFF
} from './adminDataFallback';
import useAuth from '../hooks/useAuth';

const API_BASE = 'http://localhost:5000/admin';

const PROGRESS_BY_STATUS = {
  Open: 15,
  Assigned: 25,
  'Waiting for Parts': 45,
  'In Progress': 65,
  'Quality Check': 85,
  Completed: 100,
  Delivered: 100
};

const PLATE_REGEX = /^[A-Za-z0-9\s-]{4,12}$/;
const PHONE_REGEX = /^0[0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Core Data States
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('sr_admin_vehicles');
    return saved ? JSON.parse(saved) : FALLBACK_VEHICLES;
  });
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('sr_admin_services');
    return saved ? JSON.parse(saved) : FALLBACK_SERVICES;
  });
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('sr_admin_appointments');
    return saved ? JSON.parse(saved) : FALLBACK_APPOINTMENTS;
  });
  const [jobCards, setJobCards] = useState(() => {
    const saved = localStorage.getItem('sr_admin_jobcards');
    return saved ? JSON.parse(saved) : FALLBACK_JOB_CARDS;
  });
  const [mechanics, setMechanics] = useState(() => {
    const saved = localStorage.getItem('sr_admin_mechanics');
    return saved ? JSON.parse(saved) : FALLBACK_MECHANICS;
  });
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('sr_admin_inventory');
    return saved ? JSON.parse(saved) : FALLBACK_INVENTORY;
  });
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('sr_admin_invoices');
    return saved ? JSON.parse(saved) : FALLBACK_INVOICES;
  });
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('sr_admin_staff');
    return saved ? JSON.parse(saved) : FALLBACK_STAFF;
  });

  // Filters
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState('All');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');
  const [appointmentFilter, setAppointmentFilter] = useState('All');
  const [jobCardFilter, setJobCardFilter] = useState('All');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [staffRoleFilter, setStaffRoleFilter] = useState('All');

  // Modals State
  const [vehicleModal, setVehicleModal] = useState({ open: false, data: null });
  const [serviceModal, setServiceModal] = useState({ open: false, data: null });
  const [appointmentModal, setAppointmentModal] = useState({ open: false, data: null, isReschedule: false });
  const [jobCardModal, setJobCardModal] = useState({ open: false, data: null });
  const [mechanicModal, setMechanicModal] = useState({ open: false, data: null });
  const [inventoryModal, setInventoryModal] = useState({ open: false, data: null });
  const [stockMovementModal, setStockMovementModal] = useState({ open: false, part: null });
  const [movementHistoryModal, setMovementHistoryModal] = useState({ open: false, part: null });
  const [invoiceModal, setInvoiceModal] = useState({ open: false, data: null });
  const [paymentModal, setPaymentModal] = useState({ open: false, invoice: null, amount: 0, method: 'Cash' });
  const [printInvoiceModal, setPrintInvoiceModal] = useState({ open: false, invoice: null });
  const [staffModal, setStaffModal] = useState({ open: false, data: null });

  const clearErrorsAndClose = (setter, closedState) => {
    setFormErrors({});
    setter(closedState);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('jwtToken');
    return { Authorization: `Bearer ${token}` };
  };

  // Persist to localStorage as backup
  useEffect(() => {
    localStorage.setItem('sr_admin_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);
  useEffect(() => {
    localStorage.setItem('sr_admin_services', JSON.stringify(services));
  }, [services]);
  useEffect(() => {
    localStorage.setItem('sr_admin_appointments', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem('sr_admin_jobcards', JSON.stringify(jobCards));
  }, [jobCards]);
  useEffect(() => {
    localStorage.setItem('sr_admin_mechanics', JSON.stringify(mechanics));
  }, [mechanics]);
  useEffect(() => {
    localStorage.setItem('sr_admin_inventory', JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem('sr_admin_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('sr_admin_staff', JSON.stringify(staffList));
  }, [staffList]);

  // Check Admin Authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'admin') {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch all data from MERN Backend
  const fetchAllAdminData = useCallback(async () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('jwtToken');
    if (!token || token === 'offline-admin-session-token') return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [vRes, sRes, aRes, jcRes, mRes, invRes, billRes, stRes] = await Promise.all([
        axios.get(`${API_BASE}/vehicles`, { headers }),
        axios.get(`${API_BASE}/services`, { headers }),
        axios.get(`${API_BASE}/appointments`, { headers }),
        axios.get(`${API_BASE}/jobcards`, { headers }),
        axios.get(`${API_BASE}/mechanics`, { headers }),
        axios.get(`${API_BASE}/inventory`, { headers }),
        axios.get(`${API_BASE}/invoices`, { headers }),
        axios.get(`${API_BASE}/staff`, { headers }).catch(() => ({ data: null }))
      ]);

      if (vRes.data?.data) setVehicles(vRes.data.data);
      if (sRes.data?.data) setServices(sRes.data.data);
      if (aRes.data?.data) setAppointments(aRes.data.data);
      if (jcRes.data?.data) setJobCards(jcRes.data.data);
      if (mRes.data?.data) setMechanics(mRes.data.data);
      if (invRes.data?.data) setInventory(invRes.data.data);
      if (billRes.data?.data) setInvoices(billRes.data.data);
      if (stRes.data?.data) setStaffList(stRes.data.data);
    } catch {
      // Uses local synchronized state if backend is offline
    }
  }, []);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminUser');
    if (refreshAuth) refreshAuth();
    toast.info('Logged out of Admin Command Center');
    navigate('/admin/login');
  };

  // Helper to check if a vehicle has any appointments or active job cards
  const getVehicleDependencies = (vehicleNumber) => {
    const plate = (vehicleNumber || '').toUpperCase().trim();
    const linkedAppointments = appointments.filter(
      (a) =>
        (a.vehicleNumber || '').toUpperCase().trim() === plate &&
        a.status !== 'Rejected' &&
        a.status !== 'Cancelled'
    );
    const linkedJobCards = jobCards.filter(
      (jc) =>
        (jc.vehicleNumber || '').toUpperCase().trim() === plate &&
        jc.status !== 'Delivered'
    );
    return {
      hasDependencies: linkedAppointments.length > 0 || linkedJobCards.length > 0,
      appointmentCount: linkedAppointments.length,
      jobCardCount: linkedJobCards.length
    };
  };

  const renderFieldError = (key) =>
    formErrors[key] ? (
      <div className="pro-error-text">
        <ErrorOutlineRounded sx={{ fontSize: 14 }} />
        <span>{formErrors[key]}</span>
      </div>
    ) : null;

  // ==========================================================================
  // VEHICLE MANAGEMENT HANDLERS & VALIDATIONS
  // ==========================================================================
  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const existing = vehicleModal.data;

    const vehicleNumber = (formData.get('vehicleNumber') || '').toUpperCase().trim();
    const brand = (formData.get('brand') || '').trim();
    const model = (formData.get('model') || '').trim();
    const vehicleType = formData.get('vehicleType') || 'Car';
    const year = Number(formData.get('year'));
    const fuelType = formData.get('fuelType') || 'Petrol';
    const color = (formData.get('color') || '').trim();
    const mileageRaw = formData.get('mileage');
    const mileage = Number(mileageRaw);
    const ownerName = (formData.get('ownerName') || '').trim();
    const ownerPhone = (formData.get('ownerPhone') || '').trim();
    const ownerEmail = (formData.get('ownerEmail') || '').trim();
    const ownerAddress = (formData.get('ownerAddress') || '').trim();
    const notes = (formData.get('notes') || '').trim();

    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!vehicleNumber) {
      errors.vehicleNumber = 'Vehicle registration plate is required';
    } else if (!PLATE_REGEX.test(vehicleNumber)) {
      errors.vehicleNumber = 'Enter a valid registration plate (e.g. WP CAB-4582)';
    } else {
      const duplicate = vehicles.find(
        (v) =>
          (v.vehicleNumber || '').toUpperCase().trim() === vehicleNumber &&
          v._id !== existing?._id
      );
      if (duplicate) {
        errors.vehicleNumber = `Vehicle plate ${vehicleNumber} is already registered`;
      }
      if (existing && existing.vehicleNumber !== vehicleNumber) {
        const deps = getVehicleDependencies(existing.vehicleNumber);
        if (deps.hasDependencies) {
          errors.vehicleNumber = `Cannot change plate number while ${existing.vehicleNumber} has active appointments or job cards`;
        }
      }
    }

    if (!brand || brand.length < 2) {
      errors.brand = 'Brand / Make must be at least 2 characters (e.g. Toyota)';
    }
    if (!model || model.length < 2) {
      errors.model = 'Vehicle model must be at least 2 characters (e.g. Premio)';
    }
    if (!year || year < 1980 || year > currentYear + 1) {
      errors.year = `Year must be between 1980 and ${currentYear}`;
    }
    if (mileageRaw === '' || isNaN(mileage) || mileage < 0) {
      errors.mileage = 'Enter a valid mileage in km (0 or greater)';
    } else if (existing && mileage < Number(existing.mileage || 0)) {
      errors.mileage = `Updated mileage cannot be less than previous recorded mileage (${Number(existing.mileage).toLocaleString()} km)`;
    }
    if (!ownerName || ownerName.length < 3) {
      errors.ownerName = 'Owner full name must be at least 3 characters';
    }
    if (!ownerPhone || !PHONE_REGEX.test(ownerPhone)) {
      errors.ownerPhone = 'Enter a valid 10-digit mobile number starting with 0 (e.g. 0771234567)';
    }
    if (ownerEmail && !EMAIL_REGEX.test(ownerEmail)) {
      errors.ownerEmail = 'Enter a valid email address (e.g. customer@email.com)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Vehicle form.');
      return;
    }

    setFormErrors({});
    const payload = {
      vehicleNumber,
      brand,
      model,
      vehicleType,
      year,
      fuelType,
      color: color || 'Silver',
      mileage,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      notes
    };

    try {
      if (existing?._id) {
        const res = await axios.put(`${API_BASE}/vehicles/${existing._id}`, payload, {
          headers: getAuthHeaders()
        });
        setVehicles((prev) =>
          prev.map((v) => (v._id === existing._id ? res.data.data || { ...v, ...payload } : v))
        );
        toast.success(`Vehicle ${payload.vehicleNumber} updated!`);
      } else {
        const res = await axios.post(`${API_BASE}/vehicles`, payload, {
          headers: getAuthHeaders()
        });
        setVehicles((prev) => [res.data.data || { _id: 'veh-' + Date.now(), ...payload }, ...prev]);
        toast.success(`Vehicle ${payload.vehicleNumber} registered!`);
      }
    } catch {
      if (existing?._id) {
        setVehicles((prev) =>
          prev.map((v) => (v._id === existing._id ? { ...v, ...payload } : v))
        );
        toast.success(`Vehicle ${payload.vehicleNumber} updated!`);
      } else {
        setVehicles((prev) => [{ _id: 'veh-' + Date.now(), ...payload }, ...prev]);
        toast.success(`Vehicle ${payload.vehicleNumber} registered!`);
      }
    }
    setVehicleModal({ open: false, data: null });
  };

  const handleDeleteVehicle = async (vehicle) => {
    const deps = getVehicleDependencies(vehicle.vehicleNumber);
    if (deps.hasDependencies) {
      toast.error(
        `Cannot delete vehicle ${vehicle.vehicleNumber}! It has ${deps.appointmentCount} appointment(s) and ${deps.jobCardCount} active job card(s).`
      );
      return;
    }

    setVehicles((prev) => prev.filter((v) => v._id !== vehicle._id));
    try {
      await axios.delete(`${API_BASE}/vehicles/${vehicle._id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Vehicle ${vehicle.vehicleNumber} removed from registry.`);
  };

  // ==========================================================================
  // SERVICE MANAGEMENT HANDLERS & VALIDATIONS
  // ==========================================================================
  const handleSaveService = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const existing = serviceModal.data;

    const serviceCode = (formData.get('serviceCode') || '').toUpperCase().trim();
    const name = (formData.get('name') || '').trim();
    const category = formData.get('category') || 'Wash & Detailing';
    const description = (formData.get('description') || '').trim();
    const priceRaw = formData.get('price');
    const price = Number(priceRaw);
    const duration = (formData.get('duration') || '').trim();
    const warranty = (formData.get('warranty') || '').trim();
    const isActive = formData.get('isActive') === 'true';

    const errors = {};
    if (!serviceCode || !/^[A-Z0-9-]{3,12}$/.test(serviceCode)) {
      errors.serviceCode = 'Service code must be 3–12 alphanumeric characters (e.g. SRV-001)';
    } else {
      const dup = services.find(
        (s) => (s.serviceCode || '').toUpperCase() === serviceCode && s._id !== existing?._id
      );
      if (dup) errors.serviceCode = `Service code ${serviceCode} already exists`;
    }
    if (!name || name.length < 4) {
      errors.name = 'Service title must be at least 4 characters';
    }
    if (!description || description.length < 15) {
      errors.description = 'Description must be at least 15 characters explaining the service';
    }
    if (priceRaw === '' || isNaN(price) || price < 100) {
      errors.price = 'Price must be at least Rs. 100';
    }
    if (!duration || duration.length < 3) {
      errors.duration = 'Specify estimated duration (e.g. 45 mins or 2 hrs)';
    }
    if (!warranty || warranty.length < 2) {
      errors.warranty = 'Specify warranty terms (or N/A)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Service form.');
      return;
    }

    setFormErrors({});
    const payload = {
      serviceCode,
      name,
      category,
      description,
      price,
      duration,
      warranty,
      isActive
    };

    try {
      if (existing?._id) {
        const res = await axios.put(`${API_BASE}/services/${existing._id}`, payload, {
          headers: getAuthHeaders()
        });
        setServices((prev) =>
          prev.map((s) => (s._id === existing._id ? res.data.data || { ...s, ...payload } : s))
        );
        toast.success(`Service "${payload.name}" updated!`);
      } else {
        const res = await axios.post(`${API_BASE}/services`, payload, {
          headers: getAuthHeaders()
        });
        setServices((prev) => [res.data.data || { _id: 'srv-' + Date.now(), ...payload }, ...prev]);
        toast.success(`New service "${payload.name}" created!`);
      }
    } catch {
      if (existing?._id) {
        setServices((prev) =>
          prev.map((s) => (s._id === existing._id ? { ...s, ...payload } : s))
        );
        toast.success(`Service "${payload.name}" updated!`);
      } else {
        setServices((prev) => [{ _id: 'srv-' + Date.now(), ...payload }, ...prev]);
        toast.success(`New service "${payload.name}" created!`);
      }
    }
    setServiceModal({ open: false, data: null });
  };

  const handleToggleServiceActive = async (srv) => {
    const updated = { ...srv, isActive: !srv.isActive };
    setServices((prev) => prev.map((s) => (s._id === srv._id ? updated : s)));
    try {
      await axios.put(`${API_BASE}/services/${srv._id}`, { isActive: updated.isActive }, { headers: getAuthHeaders() });
    } catch {
      // Updated locally
    }
    toast.info(`Service "${srv.name}" ${updated.isActive ? 'activated' : 'paused'}.`);
  };

  const handleDeleteService = async (srv) => {
    const activeBooked = appointments.some(
      (a) =>
        (a.washPackage || '').toLowerCase() === (srv.name || '').toLowerCase() &&
        !['Completed', 'Rejected', 'Cancelled'].includes(a.status)
    );
    if (activeBooked) {
      toast.error(
        `Cannot delete service "${srv.name}" because there are active appointments booked for it.`
      );
      return;
    }

    setServices((prev) => prev.filter((s) => s._id !== srv._id));
    try {
      await axios.delete(`${API_BASE}/services/${srv._id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Service "${srv.name}" deleted.`);
  };

  // ==========================================================================
  // APPOINTMENT MANAGEMENT HANDLERS & VALIDATIONS
  // ==========================================================================
  const handleAppointmentAction = async (apt, updates, actionLabel) => {
    if (
      updates.approvalStatus === 'Rejected' &&
      ['In Service Bay', 'Quality Check', 'Ready for Pickup', 'Completed'].includes(apt.status)
    ) {
      toast.error(
        `Cannot reject appointment for ${apt.vehicleNumber} because the vehicle is already "${apt.status}".`
      );
      return;
    }

    const updatedItem = { ...apt, ...updates };
    setAppointments((prev) => prev.map((a) => (a._id === apt._id ? updatedItem : a)));
    try {
      await axios.put(`${API_BASE}/appointments/${apt._id}`, updates, {
        headers: getAuthHeaders()
      });
    } catch {
      // Updated locally
    }
    toast.success(actionLabel);
  };

  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const existing = appointmentModal.data;

    const name = (formData.get('name') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const vehicleNumber = (formData.get('vehicleNumber') || '').toUpperCase().trim();
    const vehicleType = formData.get('vehicleType') || 'Car';
    const washPackage = (formData.get('washPackage') || '').trim();
    const date = formData.get('date') || '';
    const time = formData.get('time') || '';
    const estimatedPriceRaw = formData.get('estimatedPrice');
    const estimatedPrice = Number(estimatedPriceRaw);
    const assignedMechanic = formData.get('assignedMechanic') || '';
    const approvalStatus = formData.get('approvalStatus') || 'Approved';
    const status = formData.get('status') || 'Confirmed';
    const adminNotes = (formData.get('adminNotes') || '').trim();

    const errors = {};
    const todayStr = new Date().toISOString().split('T')[0];

    if (!name || name.length < 3) {
      errors.name = 'Customer name must be at least 3 characters';
    }
    if (!phone || !PHONE_REGEX.test(phone)) {
      errors.phone = 'Enter a valid 10-digit mobile number (e.g. 0771234567)';
    }
    if (!vehicleNumber || !PLATE_REGEX.test(vehicleNumber)) {
      errors.vehicleNumber = 'Enter a valid vehicle plate (e.g. WP CAB-4582)';
    }
    if (!washPackage || washPackage.length < 3) {
      errors.washPackage = 'Service package name is required';
    }
    if (!estimatedPriceRaw || isNaN(estimatedPrice) || estimatedPrice <= 0) {
      errors.estimatedPrice = 'Estimated price must be greater than Rs. 0';
    }
    if (!date) {
      errors.date = 'Appointment date is required';
    } else if (date < todayStr && !existing) {
      errors.date = 'Appointment date cannot be in the past';
    }
    if (!time) {
      errors.time = 'Bay time slot is required';
    } else if (time < '07:30' || time > '19:00') {
      errors.time = 'Bay time must be within workshop hours (07:30 AM – 07:00 PM)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Appointment form.');
      return;
    }

    setFormErrors({});
    const payload = {
      name,
      phone,
      vehicleNumber,
      vehicleType,
      washPackage,
      date,
      time,
      estimatedPrice,
      assignedMechanic,
      approvalStatus,
      status,
      notes: existing?.notes || '',
      adminNotes
    };

    try {
      if (existing?._id) {
        const res = await axios.put(`${API_BASE}/appointments/${existing._id}`, payload, {
          headers: getAuthHeaders()
        });
        setAppointments((prev) =>
          prev.map((a) => (a._id === existing._id ? res.data.data || { ...a, ...payload } : a))
        );
        toast.success('Appointment updated successfully!');
      } else {
        const res = await axios.post(`${API_BASE}/appointments`, payload, {
          headers: getAuthHeaders()
        });
        setAppointments((prev) => [res.data.data || { _id: 'apt-' + Date.now(), ...payload }, ...prev]);
        toast.success('New service appointment scheduled!');
      }
    } catch {
      if (existing?._id) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === existing._id ? { ...a, ...payload } : a))
        );
        toast.success('Appointment updated successfully!');
      } else {
        setAppointments((prev) => [{ _id: 'apt-' + Date.now(), ...payload }, ...prev]);
        toast.success('New service appointment scheduled!');
      }
    }
    setAppointmentModal({ open: false, data: null, isReschedule: false });
  };

  const handleConvertAppointmentToJobCard = (apt) => {
    setFormErrors({});
    const newJobCardDraft = {
      jobCardNumber: `JC-2026-${Math.floor(100 + Math.random() * 900)}`,
      vehicleNumber: apt.vehicleNumber || 'WP CAB-0000',
      vehicleModel: apt.vehicleType || 'Car',
      customerName: apt.name,
      customerPhone: apt.phone,
      assignedMechanic: apt.assignedMechanic || mechanics[0]?.name || 'Nuwan Bandara',
      bayNumber: 'Bay 1 - Mechanical',
      priority: 'Normal',
      status: 'In Progress',
      progressPercent: 55,
      odometerReading: 50000,
      estimatedCompletion: '04:30 PM',
      reportedIssues: apt.notes || `Scheduled package: ${apt.washPackage}`,
      tasks: [
        { description: apt.washPackage || 'Full Service Package', completed: false, cost: Number(apt.estimatedPrice) || 4500 },
        { description: '24-Point Multi-System Safety Inspection', completed: false, cost: 0 }
      ],
      partsUsed: [],
      laborCost: 1500,
      estimatedTotal: (Number(apt.estimatedPrice) || 4500) + 1500,
      technicianNotes: apt.adminNotes || ''
    };
    setActiveTab('jobcards');
    setJobCardModal({ open: true, data: newJobCardDraft });
  };

  // ==========================================================================
  // JOB CARD MANAGEMENT HANDLERS & VALIDATIONS
  // ==========================================================================
  const handleSaveJobCard = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const existing = jobCardModal.data;

    const jobCardNumber = (formData.get('jobCardNumber') || '').toUpperCase().trim();
    const vehicleNumber = (formData.get('vehicleNumber') || '').toUpperCase().trim();
    const vehicleModel = (formData.get('vehicleModel') || '').trim();
    const customerName = (formData.get('customerName') || '').trim();
    const customerPhone = (formData.get('customerPhone') || '').trim();
    const assignedMechanic = formData.get('assignedMechanic') || '';
    const bayNumber = (formData.get('bayNumber') || '').trim();
    const priority = formData.get('priority') || 'Normal';
    const status = formData.get('status') || 'In Progress';
    const odometerReading = Number(formData.get('odometerReading'));
    const estimatedCompletion = (formData.get('estimatedCompletion') || '').trim();
    const reportedIssues = (formData.get('reportedIssues') || '').trim();
    const rawTasks = (formData.get('tasksText') || '').trim();
    const laborCostRaw = formData.get('laborCost');
    const laborCost = Number(laborCostRaw);
    const technicianNotes = (formData.get('technicianNotes') || '').trim();

    const errors = {};
    if (!jobCardNumber || !/^JC-[A-Z0-9-]+$/i.test(jobCardNumber)) {
      errors.jobCardNumber = 'Job Card number must start with JC- (e.g. JC-2026-105)';
    } else {
      const dup = jobCards.find(
        (j) => (j.jobCardNumber || '').toUpperCase() === jobCardNumber && j._id !== existing?._id
      );
      if (dup) errors.jobCardNumber = `Job Card ${jobCardNumber} already exists`;
    }
    if (!vehicleNumber || !PLATE_REGEX.test(vehicleNumber)) {
      errors.vehicleNumber = 'Enter a valid vehicle plate (e.g. WP CAB-4582)';
    }
    if (!vehicleModel || vehicleModel.length < 2) {
      errors.vehicleModel = 'Vehicle make & model is required';
    }
    if (!customerName || customerName.length < 3) {
      errors.customerName = 'Customer name must be at least 3 characters';
    }
    if (!customerPhone || !PHONE_REGEX.test(customerPhone)) {
      errors.customerPhone = 'Enter a valid 10-digit mobile number (e.g. 0771234567)';
    }
    if (!assignedMechanic) {
      errors.assignedMechanic = 'Please assign a mechanic';
    }
    if (!odometerReading || isNaN(odometerReading) || odometerReading <= 0) {
      errors.odometerReading = 'Enter a valid positive odometer reading in km';
    }
    if (!reportedIssues || reportedIssues.length < 5) {
      errors.reportedIssues = 'Please enter reported issues or service instructions (min 5 chars)';
    }
    if (!rawTasks) {
      errors.tasksText = 'At least one repair task line is required';
    }
    if (laborCostRaw === '' || isNaN(laborCost) || laborCost < 0) {
      errors.laborCost = 'Labor charge must be 0 or greater';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Job Card form.');
      return;
    }

    setFormErrors({});
    const progressPercent = PROGRESS_BY_STATUS[status] || 50;
    const tasks = rawTasks
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [desc, costStr] = line.split('|');
        return {
          description: desc.trim(),
          completed: status === 'Completed' || status === 'Delivered',
          cost: Math.max(0, Number(costStr) || 0)
        };
      });

    const tasksCost = tasks.reduce((s, t) => s + (t.cost || 0), 0);
    const existingParts = existing?.partsUsed || [];
    const partsCost = existingParts.reduce((s, p) => s + (p.quantity || 1) * (p.unitPrice || 0), 0);
    const estimatedTotal =
      Number(formData.get('estimatedTotal')) > 0
        ? Number(formData.get('estimatedTotal'))
        : tasksCost + partsCost + laborCost;

    const payload = {
      jobCardNumber,
      vehicleNumber,
      vehicleModel,
      customerName,
      customerPhone,
      assignedMechanic,
      bayNumber: bayNumber || 'Bay 1 - Mechanical',
      priority,
      status,
      progressPercent,
      odometerReading,
      estimatedCompletion: estimatedCompletion || '04:00 PM',
      reportedIssues,
      tasks,
      partsUsed: existingParts,
      laborCost,
      estimatedTotal,
      technicianNotes
    };

    try {
      if (existing?._id) {
        const res = await axios.put(`${API_BASE}/jobcards/${existing._id}`, payload, {
          headers: getAuthHeaders()
        });
        setJobCards((prev) =>
          prev.map((j) => (j._id === existing._id ? res.data.data || { ...j, ...payload } : j))
        );
        toast.success(`Job Card ${payload.jobCardNumber} updated!`);
      } else {
        const res = await axios.post(`${API_BASE}/jobcards`, payload, {
          headers: getAuthHeaders()
        });
        setJobCards((prev) => [res.data.data || { _id: 'jc-' + Date.now(), ...payload }, ...prev]);
        toast.success(`Job Card ${payload.jobCardNumber} created!`);
      }
    } catch {
      if (existing?._id) {
        setJobCards((prev) =>
          prev.map((j) => (j._id === existing._id ? { ...j, ...payload } : j))
        );
        toast.success(`Job Card ${payload.jobCardNumber} updated!`);
      } else {
        setJobCards((prev) => [{ _id: 'jc-' + Date.now(), ...payload }, ...prev]);
        toast.success(`Job Card ${payload.jobCardNumber} created!`);
      }
    }
    setJobCardModal({ open: false, data: null });
  };

  const handleJobCardStatusChange = async (jc, newStatus) => {
    const progressPercent = PROGRESS_BY_STATUS[newStatus] || 50;
    const updated = { ...jc, status: newStatus, progressPercent };
    setJobCards((prev) => prev.map((j) => (j._id === jc._id ? updated : j)));
    try {
      await axios.put(
        `${API_BASE}/jobcards/${jc._id}`,
        { status: newStatus, progressPercent },
        { headers: getAuthHeaders() }
      );
    } catch {
      // Updated locally
    }
    toast.success(`${jc.jobCardNumber} moved to "${newStatus}" (${progressPercent}%)`);
  };

  const handleToggleJobTask = async (jc, taskIndex) => {
    const updatedTasks = (jc.tasks || []).map((t, i) =>
      i === taskIndex ? { ...t, completed: !t.completed } : t
    );
    const doneCount = updatedTasks.filter((t) => t.completed).length;
    const progressPercent =
      updatedTasks.length > 0 ? Math.max(15, Math.round((doneCount / updatedTasks.length) * 100)) : jc.progressPercent;

    const updated = { ...jc, tasks: updatedTasks, progressPercent };
    setJobCards((prev) => prev.map((j) => (j._id === jc._id ? updated : j)));
    try {
      await axios.put(
        `${API_BASE}/jobcards/${jc._id}`,
        { tasks: updatedTasks, progressPercent },
        { headers: getAuthHeaders() }
      );
    } catch {
      // Updated locally
    }
  };

  const handleGenerateInvoiceFromJobCard = (jc) => {
    setFormErrors({});
    const serviceLines = (jc.tasks || []).map((t) => ({
      description: t.description,
      itemType: 'Service',
      quantity: 1,
      unitPrice: Number(t.cost) || 3500,
      total: Number(t.cost) || 3500
    }));
    const partLines = (jc.partsUsed || []).map((p) => ({
      description: p.name,
      itemType: 'Part',
      quantity: Number(p.quantity) || 1,
      unitPrice: Number(p.unitPrice) || 0,
      total: (Number(p.quantity) || 1) * (Number(p.unitPrice) || 0)
    }));
    const laborLine =
      Number(jc.laborCost) > 0
        ? [
            {
              description: `Workshop Technician Labor (${jc.assignedMechanic})`,
              itemType: 'Labor',
              quantity: 1,
              unitPrice: Number(jc.laborCost),
              total: Number(jc.laborCost)
            }
          ]
        : [];

    const allItems = [...serviceLines, ...partLines, ...laborLine];
    const subtotal = allItems.reduce((s, i) => s + i.total, 0) || jc.estimatedTotal || 5000;

    setActiveTab('billing');
    setInvoiceModal({
      open: true,
      data: {
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        jobCardNumber: jc.jobCardNumber,
        customerName: jc.customerName,
        customerPhone: jc.customerPhone,
        vehicleNumber: jc.vehicleNumber,
        items: allItems.length
          ? allItems
          : [{ description: 'Full Mechanical & Detailing Service', itemType: 'Service', quantity: 1, unitPrice: subtotal, total: subtotal }],
        subtotal,
        discount: 0,
        tax: 0,
        grandTotal: subtotal,
        paidAmount: 0,
        paymentMethod: 'Card',
        notes: `Generated from Job Card ${jc.jobCardNumber}`
      }
    });
  };

  // ==========================================================================
  // MECHANIC MANAGEMENT HANDLERS & VALIDATIONS
  // ==========================================================================
  const handleSaveMechanic = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const existing = mechanicModal.data;

    const employeeId = (formData.get('employeeId') || '').toUpperCase().trim();
    const name = (formData.get('name') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const email = (formData.get('email') || '').trim();
    const rawSpecs = (formData.get('specializations') || '').trim();
    const assignedBay = (formData.get('assignedBay') || '').trim();
    const availability = formData.get('availability') || 'Available';
    const experienceYears = Number(formData.get('experienceYears'));
    const hourlyRate = Number(formData.get('hourlyRate'));

    const specs = rawSpecs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const errors = {};
    if (!employeeId || !/^MEC-[0-9]{3,6}$/i.test(employeeId)) {
      errors.employeeId = 'Employee ID must follow format MEC-001';
    } else {
      const dup = mechanics.find(
        (m) => (m.employeeId || '').toUpperCase() === employeeId && m._id !== existing?._id
      );
      if (dup) errors.employeeId = `Employee ID ${employeeId} already exists`;
    }
    if (!name || name.length < 3) {
      errors.name = 'Mechanic full name must be at least 3 characters';
    }
    if (!phone || !PHONE_REGEX.test(phone)) {
      errors.phone = 'Enter a valid 10-digit mobile number starting with 0 (e.g. 0771234567)';
    }
    if (email && !EMAIL_REGEX.test(email)) {
      errors.email = 'Enter a valid email address';
    }
    if (specs.length === 0) {
      errors.specializations = 'Enter at least one specialization (comma-separated)';
    }
    if (!assignedBay || assignedBay.length < 3) {
      errors.assignedBay = 'Assigned bay is required (e.g. Bay 1 - Mechanical)';
    }
    if (isNaN(experienceYears) || experienceYears < 0 || experienceYears > 50) {
      errors.experienceYears = 'Experience must be between 0 and 50 years';
    }
    if (isNaN(hourlyRate) || hourlyRate < 500) {
      errors.hourlyRate = 'Hourly labor rate must be at least Rs. 500';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Mechanic form.');
      return;
    }

    setFormErrors({});
    const payload = {
      employeeId,
      name,
      phone,
      email,
      specializations: specs,
      experienceYears,
      availability,
      assignedBay,
      hourlyRate,
      rating: existing?.rating || 4.8
    };

    try {
      if (existing?._id) {
        const res = await axios.put(`${API_BASE}/mechanics/${existing._id}`, payload, {
          headers: getAuthHeaders()
        });
        setMechanics((prev) =>
          prev.map((m) => (m._id === existing._id ? res.data.data || { ...m, ...payload } : m))
        );
        toast.success(`Mechanic ${payload.name} updated!`);
      } else {
        const res = await axios.post(`${API_BASE}/mechanics`, payload, {
          headers: getAuthHeaders()
        });
        setMechanics((prev) => [
          ...prev,
          res.data.data || { _id: 'mech-' + Date.now(), ...payload, completedJobsCount: 0 }
        ]);
        toast.success(`Mechanic ${payload.name} added to roster!`);
      }
    } catch {
      if (existing?._id) {
        setMechanics((prev) =>
          prev.map((m) => (m._id === existing._id ? { ...m, ...payload } : m))
        );
        toast.success(`Mechanic ${payload.name} updated!`);
      } else {
        setMechanics((prev) => [
          ...prev,
          { _id: 'mech-' + Date.now(), ...payload, completedJobsCount: 0 }
        ]);
        toast.success(`Mechanic ${payload.name} added to roster!`);
      }
    }
    setMechanicModal({ open: false, data: null });
  };

  const handleMechanicAvailabilityChange = async (mech, availability) => {
    const updated = { ...mech, availability };
    setMechanics((prev) => prev.map((m) => (m._id === mech._id ? updated : m)));
    try {
      await axios.put(`${API_BASE}/mechanics/${mech._id}`, { availability }, { headers: getAuthHeaders() });
    } catch {
      // Updated locally
    }
    toast.info(`${mech.name} status set to ${availability}`);
  };

  const handleDeleteMechanic = async (mech) => {
    const activeJobs = jobCards.filter(
      (jc) =>
        (jc.assignedMechanic || '').toLowerCase() === (mech.name || '').toLowerCase() &&
        jc.status !== 'Completed' &&
        jc.status !== 'Delivered'
    );
    const activeApts = appointments.filter(
      (a) =>
        (a.assignedMechanic || '').toLowerCase() === (mech.name || '').toLowerCase() &&
        !['Completed', 'Rejected', 'Cancelled'].includes(a.status)
    );

    if (mech.availability === 'On Job' || activeJobs.length > 0 || activeApts.length > 0) {
      toast.error(
        `Cannot delete mechanic ${mech.name} while they have ${activeJobs.length} active job card(s) or ${activeApts.length} scheduled appointment(s).`
      );
      return;
    }

    setMechanics((prev) => prev.filter((m) => m._id !== mech._id));
    try {
      await axios.delete(`${API_BASE}/mechanics/${mech._id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Mechanic ${mech.name} removed.`);
  };

  // ==========================================================================
  // INVENTORY MANAGEMENT & STOCK MOVEMENT HANDLERS & VALIDATIONS
  // ==========================================================================
  const handleSaveInventoryPart = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const existing = inventoryModal.data;

    const partCode = (formData.get('partCode') || '').toUpperCase().trim();
    const name = (formData.get('name') || '').trim();
    const category = formData.get('category') || 'Engine Oil & Fluids';
    const brand = (formData.get('brand') || '').trim();
    const quantityRaw = formData.get('quantity');
    const quantity = Number(quantityRaw);
    const unit = (formData.get('unit') || '').trim();
    const reorderLevel = Number(formData.get('reorderLevel'));
    const costPrice = Number(formData.get('costPrice'));
    const unitPrice = Number(formData.get('unitPrice'));
    const supplierName = (formData.get('supplierName') || '').trim();
    const supplierPhone = (formData.get('supplierPhone') || '').trim();
    const supplierEmail = (formData.get('supplierEmail') || '').trim();
    const locationBin = (formData.get('locationBin') || '').trim();

    const errors = {};
    if (!partCode || !/^[A-Z0-9-]{3,15}$/.test(partCode)) {
      errors.partCode = 'Part SKU must be 3–15 alphanumeric characters (e.g. PRT-OIL-01)';
    } else {
      const dup = inventory.find(
        (p) => (p.partCode || '').toUpperCase() === partCode && p._id !== existing?._id
      );
      if (dup) errors.partCode = `Part SKU ${partCode} already exists in inventory`;
    }
    if (!name || name.length < 3) {
      errors.name = 'Spare part name must be at least 3 characters';
    }
    if (!brand || brand.length < 2) {
      errors.brand = 'Brand / Manufacturer name is required';
    }
    if (quantityRaw === '' || isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      errors.quantity = 'Stock quantity must be a whole number (0 or greater)';
    }
    if (!unit || unit.length < 2) {
      errors.unit = 'Unit is required (e.g. Units, Cans, Sets)';
    }
    if (isNaN(reorderLevel) || reorderLevel < 1) {
      errors.reorderLevel = 'Minimum reorder alert level must be at least 1';
    }
    if (isNaN(costPrice) || costPrice <= 0) {
      errors.costPrice = 'Supplier cost price must be greater than Rs. 0';
    }
    if (isNaN(unitPrice) || unitPrice <= 0) {
      errors.unitPrice = 'Customer retail price must be greater than Rs. 0';
    } else if (unitPrice < costPrice) {
      errors.unitPrice = `Retail price (Rs. ${unitPrice}) cannot be lower than supplier cost price (Rs. ${costPrice})`;
    }
    if (!supplierName || supplierName.length < 3) {
      errors.supplierName = 'Supplier company name must be at least 3 characters';
    }
    if (!supplierPhone || !PHONE_REGEX.test(supplierPhone)) {
      errors.supplierPhone = 'Enter a valid 10-digit supplier phone number (e.g. 0112345678)';
    }
    if (supplierEmail && !EMAIL_REGEX.test(supplierEmail)) {
      errors.supplierEmail = 'Enter a valid supplier email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Spare Part form.');
      return;
    }

    setFormErrors({});
    const payload = {
      partCode,
      name,
      category,
      brand,
      quantity,
      unit,
      reorderLevel,
      costPrice,
      unitPrice,
      supplierName,
      supplierPhone,
      supplierEmail,
      locationBin: locationBin || 'Rack A-01'
    };

    try {
      if (existing?._id) {
        const res = await axios.put(`${API_BASE}/inventory/${existing._id}`, payload, {
          headers: getAuthHeaders()
        });
        setInventory((prev) =>
          prev.map((p) => (p._id === existing._id ? res.data.data || { ...p, ...payload } : p))
        );
        toast.success(`Part ${payload.partCode} updated!`);
      } else {
        const res = await axios.post(`${API_BASE}/inventory`, payload, {
          headers: getAuthHeaders()
        });
        setInventory((prev) => [
          res.data.data || {
            _id: 'inv-' + Date.now(),
            ...payload,
            movements: [
              {
                type: 'IN',
                quantity: payload.quantity,
                reason: 'Initial Stock Entry',
                reference: 'INIT',
                date: new Date().toISOString(),
                performedBy: 'Admin'
              }
            ]
          },
          ...prev
        ]);
        toast.success(`Spare part "${payload.name}" added to inventory!`);
      }
    } catch {
      if (existing?._id) {
        setInventory((prev) =>
          prev.map((p) => (p._id === existing._id ? { ...p, ...payload } : p))
        );
      } else {
        setInventory((prev) => [
          {
            _id: 'inv-' + Date.now(),
            ...payload,
            movements: [
              {
                type: 'IN',
                quantity: payload.quantity,
                reason: 'Initial Stock Entry',
                reference: 'INIT',
                date: new Date().toISOString(),
                performedBy: 'Admin'
              }
            ]
          },
          ...prev
        ]);
      }
      toast.success(`Inventory item ${payload.partCode} saved!`);
    }
    setInventoryModal({ open: false, data: null });
  };

  const handleRecordStockMovement = async (e) => {
    e.preventDefault();
    const part = stockMovementModal.part;
    if (!part) return;

    const formData = new FormData(e.target);
    const type = formData.get('type');
    const quantity = Number(formData.get('quantity'));
    const reason = (formData.get('reason') || '').trim();
    const reference = (formData.get('reference') || '').trim();
    const performedBy = (formData.get('performedBy') || '').trim();

    const errors = {};
    if (!quantity || isNaN(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
      errors.quantity = 'Movement quantity must be a whole number of at least 1';
    } else if (type === 'OUT' && quantity > Number(part.quantity)) {
      errors.quantity = `Cannot issue ${quantity} ${part.unit}. Only ${part.quantity} available in stock.`;
    }
    if (!reference || reference.length < 3) {
      errors.reference = 'Enter a PO Number or Job Card reference (min 3 characters)';
    }
    if (!reason || reason.length < 4) {
      errors.reason = 'Please provide a reason for this stock movement';
    }
    if (!performedBy || performedBy.length < 2) {
      errors.performedBy = 'Specify staff member recording this movement';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Stock Movement form.');
      return;
    }

    setFormErrors({});
    const newQty =
      type === 'IN'
        ? part.quantity + quantity
        : type === 'OUT'
        ? Math.max(0, part.quantity - quantity)
        : quantity;

    const movementRecord = {
      type,
      quantity,
      reason,
      reference,
      date: new Date().toISOString(),
      performedBy
    };

    try {
      const res = await axios.post(
        `${API_BASE}/inventory/${part._id}/movement`,
        movementRecord,
        { headers: getAuthHeaders() }
      );
      setInventory((prev) =>
        prev.map((p) => (p._id === part._id ? res.data.data : p))
      );
    } catch {
      setInventory((prev) =>
        prev.map((p) =>
          p._id === part._id
            ? {
                ...p,
                quantity: newQty,
                movements: [movementRecord, ...(p.movements || [])]
              }
            : p
        )
      );
    }

    toast.success(
      `Stock ${type === 'IN' ? 'Restocked (+' : 'Issued (-'}${quantity}) for ${part.partCode}. New balance: ${newQty}`
    );
    setStockMovementModal({ open: false, part: null });
  };

  const handleDeleteInventoryPart = async (part) => {
    if (Number(part.quantity) > 0) {
      toast.error(
        `Cannot delete "${part.name}" (${part.partCode}) because it still has ${part.quantity} ${part.unit || 'units'} in stock! Stock must be 0 before deleting.`
      );
      return;
    }

    setInventory((prev) => prev.filter((p) => p._id !== part._id));
    try {
      await axios.delete(`${API_BASE}/inventory/${part._id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Part ${part.partCode} removed from inventory.`);
  };

  // ==========================================================================
  // BILLING & PAYMENTS HANDLERS & VALIDATIONS
  // ==========================================================================
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const invoiceNumber = (formData.get('invoiceNumber') || '').toUpperCase().trim();
    const jobCardNumber = (formData.get('jobCardNumber') || '').toUpperCase().trim();
    const customerName = (formData.get('customerName') || '').trim();
    const customerPhone = (formData.get('customerPhone') || '').trim();
    const vehicleNumber = (formData.get('vehicleNumber') || '').toUpperCase().trim();
    const paymentMethod = formData.get('paymentMethod') || 'Cash';
    const rawLines = (formData.get('itemsText') || '').trim();
    const discount = Number(formData.get('discount') || 0);
    const paidAmount = Number(formData.get('paidAmount') || 0);
    const notes = (formData.get('notes') || '').trim();

    const items = rawLines
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [desc, qtyStr, priceStr, typeStr] = line.split('|');
        const quantity = Number(qtyStr) || 1;
        const unitPrice = Number(priceStr) || 0;
        return {
          description: (desc || '').trim(),
          itemType: (typeStr || 'Service').trim(),
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      });

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const grandTotal = Math.max(0, subtotal - discount);

    const errors = {};
    if (!invoiceNumber || !/^INV-[A-Z0-9-]+$/i.test(invoiceNumber)) {
      errors.invoiceNumber = 'Invoice number must start with INV- (e.g. INV-2026-105)';
    } else if (invoices.some((i) => (i.invoiceNumber || '').toUpperCase() === invoiceNumber)) {
      errors.invoiceNumber = `Invoice ${invoiceNumber} already exists`;
    }
    if (!customerName || customerName.length < 3) {
      errors.customerName = 'Customer name must be at least 3 characters';
    }
    if (!customerPhone || !PHONE_REGEX.test(customerPhone)) {
      errors.customerPhone = 'Enter a valid 10-digit customer phone number';
    }
    if (!vehicleNumber || !PLATE_REGEX.test(vehicleNumber)) {
      errors.vehicleNumber = 'Enter a valid vehicle plate (e.g. WP CAB-4582)';
    }
    if (items.length === 0 || subtotal <= 0) {
      errors.itemsText = 'Enter at least one valid billing line item with a positive price';
    }
    if (isNaN(discount) || discount < 0 || discount > subtotal) {
      errors.discount = `Discount must be between Rs. 0 and Subtotal (Rs. ${subtotal.toLocaleString()})`;
    }
    if (isNaN(paidAmount) || paidAmount < 0 || paidAmount > grandTotal) {
      errors.paidAmount = `Paid amount must be between Rs. 0 and Grand Total (Rs. ${grandTotal.toLocaleString()})`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Invoice form.');
      return;
    }

    setFormErrors({});
    const balanceDue = Math.max(0, grandTotal - paidAmount);
    const paymentStatus =
      balanceDue <= 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';

    const payload = {
      invoiceNumber,
      jobCardNumber,
      customerName,
      customerPhone,
      vehicleNumber,
      items,
      subtotal,
      discount,
      tax: 0,
      grandTotal,
      paidAmount,
      balanceDue,
      paymentMethod,
      paymentStatus,
      notes,
      issuedDate: new Date().toISOString()
    };

    try {
      const res = await axios.post(`${API_BASE}/invoices`, payload, {
        headers: getAuthHeaders()
      });
      setInvoices((prev) => [res.data.data || { _id: 'inv-doc-' + Date.now(), ...payload }, ...prev]);
    } catch {
      setInvoices((prev) => [{ _id: 'inv-doc-' + Date.now(), ...payload }, ...prev]);
    }
    toast.success(`Invoice ${payload.invoiceNumber} generated!`);
    setInvoiceModal({ open: false, data: null });
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    const inv = paymentModal.invoice;
    if (!inv) return;

    const addAmount = Number(paymentModal.amount);
    if (isNaN(addAmount) || addAmount <= 0 || addAmount > Number(inv.balanceDue)) {
      setFormErrors({
        paymentAmount: `Payment must be between Rs. 1 and Rs. ${Number(inv.balanceDue).toLocaleString()}`
      });
      toast.error('Enter a valid payment amount within the balance due.');
      return;
    }

    setFormErrors({});
    const newPaid = Math.min(inv.grandTotal, (Number(inv.paidAmount) || 0) + addAmount);
    const newBalance = Math.max(0, inv.grandTotal - newPaid);
    const newStatus = newBalance <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';

    const updates = {
      paidAmount: newPaid,
      balanceDue: newBalance,
      paymentStatus: newStatus,
      paymentMethod: paymentModal.method
    };

    setInvoices((prev) =>
      prev.map((i) => (i._id === inv._id ? { ...i, ...updates } : i))
    );

    try {
      await axios.put(`${API_BASE}/invoices/${inv._id}`, updates, {
        headers: getAuthHeaders()
      });
    } catch {
      // Updated locally
    }

    toast.success(`Payment of Rs. ${addAmount.toLocaleString()} recorded for ${inv.invoiceNumber}!`);
    setPaymentModal({ open: false, invoice: null, amount: 0, method: 'Cash' });
  };

  // ==========================================================================
  // STAFF REGISTRATION HANDLERS (ADMIN, MECHANIC, SALES PERSON)
  // ==========================================================================
  const handleSaveStaff = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const fullname = (formData.get('fullname') || '').trim();
    const staffRole = formData.get('staffRole') || 'Admin';
    const email = (formData.get('email') || '').trim().toLowerCase();
    const phone = (formData.get('phone') || '').trim();
    const password = formData.get('password') || '';
    const confirmPassword = formData.get('confirmPassword') || '';
    const specializations = (formData.get('specializations') || '').trim();
    const assignedBay = (formData.get('assignedBay') || '').trim();

    const errors = {};
    if (!fullname || fullname.length < 3) {
      errors.fullname = 'Full name must be at least 3 characters';
    }
    if (!['Admin', 'Mechanic', 'Sales Person'].includes(staffRole)) {
      errors.staffRole = 'Please select a valid role (Admin, Mechanic, or Sales Person)';
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      errors.email = 'Enter a valid staff email address (e.g. name@soapyride.com)';
    } else if (staffList.some((s) => (s.email || '').toLowerCase() === email)) {
      errors.email = `Email ${email} is already registered`;
    }
    if (!phone || !PHONE_REGEX.test(phone)) {
      errors.phone = 'Enter a valid 10-digit mobile number starting with 0 (e.g. 0771234567)';
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, and at least one number';
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the validation errors in the Staff Registration form.');
      return;
    }

    setFormErrors({});
    const payload = {
      fullname,
      staffRole,
      email,
      phone,
      password,
      confirmPassword
    };

    try {
      const res = await axios.post(`${API_BASE}/staff`, payload, {
        headers: getAuthHeaders()
      });
      setStaffList((prev) => [
        { ...(res.data.data || payload), _id: res.data.data?._id || 'staff-' + Date.now(), password, createdAt: new Date().toISOString() },
        ...prev
      ]);
    } catch {
      setStaffList((prev) => [
        {
          _id: 'staff-' + Date.now(),
          fullname,
          staffRole,
          role: staffRole === 'Admin' ? 'admin' : staffRole === 'Mechanic' ? 'mechanic' : 'sales',
          email,
          phone,
          password,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }

    // If registering a Mechanic, also add them to the Workshop Mechanics roster if not present
    if (staffRole === 'Mechanic' && !mechanics.some((m) => m.name.toLowerCase() === fullname.toLowerCase())) {
      const newMech = {
        _id: 'mech-' + Date.now(),
        employeeId: `MEC-00${mechanics.length + 1}`,
        name: fullname,
        phone,
        email,
        specializations: specializations
          ? specializations.split(',').map((s) => s.trim()).filter(Boolean)
          : ['General Mechanical', 'Diagnostics'],
        experienceYears: 3,
        availability: 'Available',
        assignedBay: assignedBay || `Bay ${mechanics.length + 1}`,
        completedJobsCount: 0,
        rating: 4.8,
        hourlyRate: 1800
      };
      setMechanics((prev) => [...prev, newMech]);
    }

    toast.success(`${staffRole} account for "${fullname}" registered successfully!`);
    setStaffModal({ open: false, data: null });
  };

  const handleDeleteStaff = async (member) => {
    if ((member.email || '').toLowerCase() === 'admin@soapyride.com') {
      toast.error('Cannot delete the primary Shop Owner account.');
      return;
    }
    if (member.staffRole === 'Mechanic') {
      const hasActiveJobs = jobCards.some(
        (jc) =>
          (jc.assignedMechanic || '').toLowerCase() === (member.fullname || '').toLowerCase() &&
          jc.status !== 'Completed' &&
          jc.status !== 'Delivered'
      );
      if (hasActiveJobs) {
        toast.error(`Cannot remove ${member.fullname} while they have active workshop job cards assigned.`);
        return;
      }
    }

    setStaffList((prev) => prev.filter((s) => s._id !== member._id));
    try {
      await axios.delete(`${API_BASE}/staff/${member._id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Staff account for ${member.fullname} removed.`);
  };

  // ==========================================================================
  // COMPUTED METRICS & ANALYTICS
  // ==========================================================================
  const totalRevenueBilled = invoices.reduce((s, i) => s + (Number(i.grandTotal) || 0), 0);
  const totalRevenueCollected = invoices.reduce((s, i) => s + (Number(i.paidAmount) || 0), 0);
  const totalOutstandingBalance = invoices.reduce((s, i) => s + (Number(i.balanceDue) || 0), 0);
  const totalDiscountsGiven = invoices.reduce((s, i) => s + (Number(i.discount) || 0), 0);
  const lowStockParts = inventory.filter((p) => Number(p.quantity) <= Number(p.reorderLevel));
  const totalInventoryRetailValue = inventory.reduce(
    (s, p) => s + (Number(p.quantity) || 0) * (Number(p.unitPrice) || 0),
    0
  );
  const totalInventoryCostValue = inventory.reduce(
    (s, p) => s + (Number(p.quantity) || 0) * (Number(p.costPrice) || 0),
    0
  );

  const handleExportCSVReport = () => {
    const rows = [
      ['Report Section', 'Metric / Item', 'Value / Status', 'Additional Info'],
      ['Financial Summary', 'Total Billed Revenue (Rs.)', totalRevenueBilled, 'All Invoices'],
      ['Financial Summary', 'Total Collected Payments (Rs.)', totalRevenueCollected, 'Cash/Card/Online'],
      ['Financial Summary', 'Total Outstanding Balances (Rs.)', totalOutstandingBalance, 'Receivables'],
      ['Financial Summary', 'Total Discounts Granted (Rs.)', totalDiscountsGiven, 'Promotions'],
      ['Inventory Summary', 'Total Retail Valuation (Rs.)', totalInventoryRetailValue, `${inventory.length} SKUs`],
      ['Inventory Summary', 'Low Stock Alert Count', lowStockParts.length, 'Needs Reorder'],
      ...invoices.map((inv) => [
        'Invoice Record',
        inv.invoiceNumber,
        `Rs. ${inv.grandTotal}`,
        `${inv.customerName} (${inv.paymentStatus})`
      ]),
      ...mechanics.map((m) => [
        'Mechanic Performance',
        m.name,
        `${m.completedJobsCount} Jobs Completed`,
        `Rating: ${m.rating}/5.0`
      ])
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SoapyRide_Admin_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Executive CSV Report downloaded!');
  };

  // Sidebar Navigation Items (Clean section names without numbers)
  const navModules = [
    { id: 'overview', label: 'Command Overview', icon: <DashboardRounded fontSize="small" /> },
    { id: 'vehicles', label: 'Vehicle Management', icon: <DirectionsCarRounded fontSize="small" />, badge: vehicles.length },
    { id: 'services', label: 'Service Management', icon: <BuildCircleRounded fontSize="small" />, badge: services.length },
    { id: 'appointments', label: 'Appointment Management', icon: <EventAvailableRounded fontSize="small" />, badge: appointments.length },
    { id: 'jobcards', label: 'Job Card Management', icon: <AssignmentRounded fontSize="small" />, badge: jobCards.length },
    { id: 'mechanics', label: 'Mechanic Management', icon: <EngineeringRounded fontSize="small" />, badge: mechanics.length },
    {
      id: 'inventory',
      label: 'Inventory Management',
      icon: <Inventory2Rounded fontSize="small" />,
      badge: lowStockParts.length > 0 ? `${lowStockParts.length} Low` : inventory.length,
      alert: lowStockParts.length > 0
    },
    { id: 'billing', label: 'Billing & Payments', icon: <ReceiptLongRounded fontSize="small" />, badge: invoices.length },
    { id: 'reports', label: 'Reports & Analytics', icon: <InsertChartRounded fontSize="small" /> },
    { id: 'staff', label: 'Staff Registration', icon: <BadgeRounded fontSize="small" />, badge: staffList.length }
  ];

  // Filtered Lists
  const filteredVehicles = vehicles.filter((v) => {
    const matchesCat = vehicleCategoryFilter === 'All' || v.vehicleType === vehicleCategoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (v.vehicleNumber || '').toLowerCase().includes(q) ||
      (v.brand || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.ownerName || '').toLowerCase().includes(q) ||
      (v.ownerPhone || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const filteredServices = services.filter((s) => {
    const matchesCat = serviceCategoryFilter === 'All' || s.category === serviceCategoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.serviceCode || '').toLowerCase().includes(q) ||
      (s.category || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus =
      appointmentFilter === 'All' ||
      a.approvalStatus === appointmentFilter ||
      a.status === appointmentFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (a.name || '').toLowerCase().includes(q) ||
      (a.vehicleNumber || '').toLowerCase().includes(q) ||
      (a.washPackage || '').toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filteredJobCards = jobCards.filter((jc) => {
    const matchesStatus = jobCardFilter === 'All' || jc.status === jobCardFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (jc.jobCardNumber || '').toLowerCase().includes(q) ||
      (jc.vehicleNumber || '').toLowerCase().includes(q) ||
      (jc.customerName || '').toLowerCase().includes(q) ||
      (jc.assignedMechanic || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filteredInventory = inventory.filter((p) => {
    const matchesCat =
      inventoryCategoryFilter === 'All'
        ? true
        : inventoryCategoryFilter === 'Low Stock'
        ? Number(p.quantity) <= Number(p.reorderLevel)
        : p.category === inventoryCategoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (p.partCode || '').toLowerCase().includes(q) ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.supplierName || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = invoiceStatusFilter === 'All' || inv.paymentStatus === invoiceStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (inv.invoiceNumber || '').toLowerCase().includes(q) ||
      (inv.customerName || '').toLowerCase().includes(q) ||
      (inv.vehicleNumber || '').toLowerCase().includes(q) ||
      (inv.jobCardNumber || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filteredStaff = staffList.filter((s) => {
    const matchesRole = staffRoleFilter === 'All' || s.staffRole === staffRoleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (s.fullname || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.staffRole || '').toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="admin-shell">
      {/* ====================================================================
          LEFT SIDEBAR NAVIGATION
          ==================================================================== */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="logo-emblem" style={{ width: 40, height: 40 }}>
            <BuildCircleRounded sx={{ fontSize: 24 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', lineHeight: 1.1 }}>
              <span style={{ color: '#38bdf8' }}>Soapy</span>Ride
            </div>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.15em', fontWeight: 700 }}>
              ADMIN & WORKSHOP ERP
            </span>
          </div>
        </div>

        <div className="admin-nav-list">
          {navModules.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                setActiveTab(mod.id);
                setSearchQuery('');
                setFormErrors({});
              }}
              className={`admin-nav-btn ${activeTab === mod.id ? 'active' : ''}`}
            >
              <span className="admin-nav-btn-left">
                {mod.icon}
                <span>{mod.label}</span>
              </span>
              {mod.badge !== undefined && (
                <span className={`admin-nav-badge ${mod.alert ? 'alert' : ''}`}>
                  {mod.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-QuickLink-btn">
            <OpenInNewRounded sx={{ fontSize: 16 }} />
            <span>View Customer Site</span>
          </Link>
          <button type="button" onClick={handleAdminLogout} className="admin-logout-btn">
            <LogoutRounded sx={{ fontSize: 16 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ====================================================================
          MAIN WORKSPACE AREA
          ==================================================================== */}
      <div className="admin-main">
        {/* Top Command Header */}
        <header className="admin-topbar">
          <div>
            <h1 className="admin-topbar-title">
              {navModules.find((n) => n.id === activeTab)?.label || 'Workshop Command Center'}
            </h1>
            <p className="admin-topbar-sub">
              Logged in as <strong>{localStorage.getItem('userName') || 'Shop Owner'}</strong> • SoapyRide Management Suite
            </p>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-search-box">
              <SearchRounded sx={{ fontSize: 19, color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search plate, customer, job card, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} style={{ color: '#64748b' }}>
                  <CloseRounded sx={{ fontSize: 16 }} />
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="admin-content-body">
          {/* ================================================================
              TAB: COMMAND OVERVIEW
              ================================================================ */}
          {activeTab === 'overview' && (
            <div>
              {/* Top KPI Cards */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card" onClick={() => setActiveTab('vehicles')}>
                  <div className="admin-kpi-icon blue">
                    <DirectionsCarRounded />
                  </div>
                  <div>
                    <span>Registered Vehicles</span>
                    <strong>{vehicles.length}</strong>
                    <small>Active Fleet & Customer Registry</small>
                  </div>
                </div>

                <div className="admin-kpi-card" onClick={() => setActiveTab('appointments')}>
                  <div className="admin-kpi-icon cyan">
                    <EventAvailableRounded />
                  </div>
                  <div>
                    <span>Service Appointments</span>
                    <strong>{appointments.length}</strong>
                    <small>
                      {appointments.filter((a) => a.approvalStatus === 'Pending').length} Pending Approval
                    </small>
                  </div>
                </div>

                <div className="admin-kpi-card" onClick={() => setActiveTab('jobcards')}>
                  <div className="admin-kpi-icon amber">
                    <AssignmentRounded />
                  </div>
                  <div>
                    <span>Active Job Cards</span>
                    <strong>{jobCards.filter((j) => j.status !== 'Delivered').length}</strong>
                    <small>{mechanics.filter((m) => m.availability === 'Available').length} Mechanics Available</small>
                  </div>
                </div>

                <div className="admin-kpi-card" onClick={() => setActiveTab('billing')}>
                  <div className="admin-kpi-icon green">
                    <PaidRounded />
                  </div>
                  <div>
                    <span>Collected Revenue</span>
                    <strong>Rs. {totalRevenueCollected.toLocaleString()}</strong>
                    <small>Rs. {totalOutstandingBalance.toLocaleString()} Outstanding</small>
                  </div>
                </div>
              </div>

              {/* Quick Module Launcher Grid */}
              <h3 className="admin-section-heading" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                Workshop & Store Management Modules
              </h3>
              <div className="admin-module-cards-grid">
                <div className="admin-module-tile" onClick={() => setActiveTab('vehicles')}>
                  <div className="tile-head">
                    <span className="tile-num">Registry</span>
                    <DirectionsCarRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Vehicle Management</h4>
                  <p>Register vehicles, plate numbers, brand, model, mileage (km), and owner details.</p>
                  <span className="tile-cta">Manage {vehicles.length} Vehicles &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('services')}>
                  <div className="tile-head">
                    <span className="tile-num">Catalog</span>
                    <BuildCircleRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Service Management</h4>
                  <p>Create & manage service packages, categories, durations, warranties, and pricing.</p>
                  <span className="tile-cta">Manage {services.length} Services &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('appointments')}>
                  <div className="tile-head">
                    <span className="tile-num">Bookings</span>
                    <EventAvailableRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Appointment Management</h4>
                  <p>View, approve, reject, reschedule, and track live bay appointments.</p>
                  <span className="tile-cta">Manage {appointments.length} Bookings &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('jobcards')}>
                  <div className="tile-head">
                    <span className="tile-num">Workshop</span>
                    <AssignmentRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Job Card Management</h4>
                  <p>Create job cards, assign mechanics, log spare parts, and track repair progress.</p>
                  <span className="tile-cta">Track {jobCards.length} Job Cards &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('mechanics')}>
                  <div className="tile-head">
                    <span className="tile-num">Technicians</span>
                    <EngineeringRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Mechanic Management</h4>
                  <p>Manage mechanics, specializations, bay assignments, availability, and jobs.</p>
                  <span className="tile-cta">Manage {mechanics.length} Mechanics &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('inventory')}>
                  <div className="tile-head">
                    <span className="tile-num">Warehouse</span>
                    <Inventory2Rounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Inventory Management</h4>
                  <p>Manage spare parts, stock levels, low-stock alerts, suppliers, and stock movements.</p>
                  <span className="tile-cta">Manage {inventory.length} Spare Parts &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('billing')}>
                  <div className="tile-head">
                    <span className="tile-num">Accounts</span>
                    <ReceiptLongRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Billing & Payments</h4>
                  <p>Generate invoices, apply discounts, record payments, and track outstanding balances.</p>
                  <span className="tile-cta">Manage {invoices.length} Invoices &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('staff')}>
                  <div className="tile-head">
                    <span className="tile-num">HR & Access</span>
                    <BadgeRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Staff Registration</h4>
                  <p>Register and manage login credentials for Admins, Mechanics, and Sales Persons.</p>
                  <span className="tile-cta">Manage {staffList.length} Staff Accounts &rarr;</span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: VEHICLE MANAGEMENT
              ================================================================ */}
          {activeTab === 'vehicles' && (
            <div className="admin-panel-card">
              <div className="admin-panel-toolbar">
                <div className="admin-filter-pills">
                  {['All', 'Car', 'SUV', 'Van', 'Bike'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setVehicleCategoryFilter(cat)}
                      className={`admin-pill-btn ${vehicleCategoryFilter === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary-pro"
                  onClick={() => {
                    setFormErrors({});
                    setVehicleModal({ open: true, data: null });
                  }}
                >
                  <AddCircleRounded fontSize="small" />
                  <span>Register New Vehicle</span>
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Vehicle Plate</th>
                      <th>Brand & Model</th>
                      <th>Category & Fuel</th>
                      <th>Mileage (km)</th>
                      <th>Owner Details</th>
                      <th>Booking Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map((v) => {
                      const deps = getVehicleDependencies(v.vehicleNumber);
                      return (
                        <tr key={v._id}>
                          <td>
                            <span className="plate-badge">{v.vehicleNumber}</span>
                          </td>
                          <td>
                            <strong>{v.brand} {v.model}</strong>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Year: {v.year || 2021} • Color: {v.color || 'Silver'}
                            </div>
                          </td>
                          <td>
                            <span className="status-chip info">{v.vehicleType}</span>
                            <span style={{ fontSize: '0.8rem', marginLeft: 6, color: '#475569' }}>
                              {v.fuelType}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#0284c7' }}>
                              {Number(v.mileage || 0).toLocaleString()} km
                            </strong>
                          </td>
                          <td>
                            <strong>{v.ownerName}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                              {v.ownerPhone} {v.ownerEmail ? `• ${v.ownerEmail}` : ''}
                            </div>
                          </td>
                          <td>
                            {deps.hasDependencies ? (
                              <span
                                className="status-chip warning"
                                title="Deletion locked while appointments/jobs exist"
                              >
                                <LockRounded sx={{ fontSize: 13, mr: 0.4 }} />
                                {deps.appointmentCount} Apt / {deps.jobCardCount} Job
                              </span>
                            ) : (
                              <span className="status-chip neutral">No Active Bookings</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-group">
                              <button
                                type="button"
                                className="icon-btn-sm blue"
                                title="Edit Vehicle / Update Mileage"
                                onClick={() => {
                                  setFormErrors({});
                                  setVehicleModal({ open: true, data: v });
                                }}
                              >
                                <EditRounded fontSize="small" />
                              </button>
                              <button
                                type="button"
                                className="icon-btn-sm red"
                                style={
                                  deps.hasDependencies
                                    ? { opacity: 0.45, cursor: 'not-allowed' }
                                    : undefined
                                }
                                title={
                                  deps.hasDependencies
                                    ? `Cannot delete ${v.vehicleNumber}: Has active appointments/job cards`
                                    : 'Delete Vehicle'
                                }
                                onClick={() => handleDeleteVehicle(v)}
                              >
                                <DeleteOutlineRounded fontSize="small" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredVehicles.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No vehicles match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: SERVICE MANAGEMENT
              ================================================================ */}
          {activeTab === 'services' && (
            <div className="admin-panel-card">
              <div className="admin-panel-toolbar">
                <div className="admin-filter-pills">
                  {[
                    'All',
                    'Wash & Detailing',
                    'Mechanical & Lube',
                    'Diagnostics & Electrical',
                    'Wheel & Alignment',
                    'Paint & Ceramic'
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setServiceCategoryFilter(cat)}
                      className={`admin-pill-btn ${serviceCategoryFilter === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary-pro"
                  onClick={() => {
                    setFormErrors({});
                    setServiceModal({ open: true, data: null });
                  }}
                >
                  <AddCircleRounded fontSize="small" />
                  <span>Create New Service</span>
                </button>
              </div>

              <div className="admin-services-cards-grid">
                {filteredServices.map((srv) => (
                  <div
                    key={srv._id}
                    className={`admin-srv-card ${!srv.isActive ? 'inactive' : ''}`}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span className="status-chip info">{srv.category}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                          {srv.serviceCode}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                        {srv.name}
                      </h4>
                      <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.55 }}>
                        {srv.description}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 0',
                          borderTop: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                          marginBottom: '0.85rem'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                            PACKAGE PRICE
                          </span>
                          <strong style={{ fontSize: '1.25rem', color: '#0284c7', fontWeight: 800 }}>
                            Rs. {Number(srv.price || 0).toLocaleString()}
                          </strong>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.78rem', color: '#475569', display: 'block', fontWeight: 600 }}>
                            Est. {srv.duration || '60 mins'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                            {srv.warranty || 'Standard Warranty'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleServiceActive(srv)}
                          className={`status-chip ${srv.isActive ? 'success' : 'neutral'}`}
                          style={{ cursor: 'pointer' }}
                        >
                          {srv.isActive ? '● Active in Catalog' : '○ Hidden / Paused'}
                        </button>

                        <div className="table-action-group">
                          <button
                            type="button"
                            className="icon-btn-sm blue"
                            onClick={() => {
                              setFormErrors({});
                              setServiceModal({ open: true, data: srv });
                            }}
                            title="Edit Service"
                          >
                            <EditRounded fontSize="small" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn-sm red"
                            onClick={() => handleDeleteService(srv)}
                            title="Delete Service"
                          >
                            <DeleteOutlineRounded fontSize="small" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: APPOINTMENT MANAGEMENT
              ================================================================ */}
          {activeTab === 'appointments' && (
            <div className="admin-panel-card">
              <div className="admin-panel-toolbar">
                <div className="admin-filter-pills">
                  {['All', 'Pending', 'Approved', 'Rescheduled', 'Rejected'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAppointmentFilter(st)}
                      className={`admin-pill-btn ${appointmentFilter === st ? 'active' : ''}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary-pro"
                  onClick={() => {
                    setFormErrors({});
                    setAppointmentModal({ open: true, data: null, isReschedule: false });
                  }}
                >
                  <AddCircleRounded fontSize="small" />
                  <span>New Walk-In Appointment</span>
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer & Plate</th>
                      <th>Service Package</th>
                      <th>Date & Bay Time</th>
                      <th>Approval Decision</th>
                      <th>Live Bay Status</th>
                      <th>Mechanic</th>
                      <th style={{ textAlign: 'right' }}>Manage Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((apt) => {
                      const approval = apt.approvalStatus || 'Pending';
                      return (
                        <tr key={apt._id}>
                          <td>
                            <strong>{apt.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                              {apt.phone} • <span className="plate-badge-sm">{apt.vehicleNumber || 'N/A'}</span> ({apt.vehicleType})
                            </div>
                          </td>
                          <td>
                            <strong>{apt.washPackage}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>
                              Est. Rs. {Number(apt.estimatedPrice || 4500).toLocaleString()}
                            </div>
                            {apt.notes && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Note: {apt.notes}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>
                              {apt.date ? new Date(apt.date).toLocaleDateString() : 'Today'}
                            </strong>
                            <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
                              Slot: {apt.time}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`status-chip ${
                                approval === 'Approved'
                                  ? 'success'
                                  : approval === 'Rejected'
                                  ? 'danger'
                                  : approval === 'Rescheduled'
                                  ? 'warning'
                                  : 'info'
                              }`}
                            >
                              {approval}
                            </span>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                              <button
                                type="button"
                                className="mini-action-btn approve"
                                onClick={() =>
                                  handleAppointmentAction(
                                    apt,
                                    { approvalStatus: 'Approved', status: 'Confirmed' },
                                    `Appointment for ${apt.name} Approved!`
                                  )
                                }
                              >
                                <CheckCircleRounded sx={{ fontSize: 13 }} /> Approve
                              </button>
                              <button
                                type="button"
                                className="mini-action-btn reject"
                                onClick={() =>
                                  handleAppointmentAction(
                                    apt,
                                    { approvalStatus: 'Rejected', status: 'Rejected' },
                                    `Appointment for ${apt.name} Rejected.`
                                  )
                                }
                              >
                                <CancelRounded sx={{ fontSize: 13 }} /> Reject
                              </button>
                            </div>
                          </td>
                          <td>
                            <select
                              className="admin-inline-select"
                              value={apt.status || 'Confirmed'}
                              onChange={(e) =>
                                handleAppointmentAction(
                                  apt,
                                  { status: e.target.value, approvalStatus: 'Approved' },
                                  `Bay status updated to ${e.target.value}`
                                )
                              }
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Checked In">Checked In</option>
                              <option value="In Service Bay">In Service Bay</option>
                              <option value="Quality Check">Quality Check</option>
                              <option value="Ready for Pickup">Ready for Pickup</option>
                              <option value="Completed">Completed</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              {apt.assignedMechanic || 'Unassigned'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-group" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="mini-action-btn reschedule"
                                onClick={() => {
                                  setFormErrors({});
                                  setAppointmentModal({ open: true, data: apt, isReschedule: true });
                                }}
                                title="Reschedule Date/Time or Assign Mechanic"
                              >
                                <ScheduleRounded sx={{ fontSize: 14 }} />
                                <span>Reschedule</span>
                              </button>
                              <button
                                type="button"
                                className="mini-action-btn convert"
                                onClick={() => handleConvertAppointmentToJobCard(apt)}
                                title="Open Job Card for this Appointment"
                              >
                                <PlayArrowRounded sx={{ fontSize: 14 }} />
                                <span>Job Card</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: JOB CARD MANAGEMENT
              ================================================================ */}
          {activeTab === 'jobcards' && (
            <div className="admin-panel-card">
              <div className="admin-panel-toolbar">
                <div className="admin-filter-pills">
                  {[
                    'All',
                    'Open',
                    'Assigned',
                    'In Progress',
                    'Waiting for Parts',
                    'Quality Check',
                    'Completed'
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setJobCardFilter(st)}
                      className={`admin-pill-btn ${jobCardFilter === st ? 'active' : ''}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary-pro"
                  onClick={() => {
                    setFormErrors({});
                    setJobCardModal({ open: true, data: null });
                  }}
                >
                  <AddCircleRounded fontSize="small" />
                  <span>Create Job Card</span>
                </button>
              </div>

              <div className="jobcards-grid">
                {filteredJobCards.map((jc) => (
                  <div key={jc._id} className="jobcard-item">
                    <div className="jobcard-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="jobcard-number">{jc.jobCardNumber}</span>
                          <span className="plate-badge-sm">{jc.vehicleNumber}</span>
                          <span
                            className={`status-chip ${
                              jc.priority === 'High' || jc.priority === 'Urgent' ? 'danger' : 'info'
                            }`}
                          >
                            {jc.priority || 'Normal'} Priority
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '6px', color: '#0f172a' }}>
                          {jc.vehicleModel || 'Vehicle Service'} — {jc.customerName} ({jc.customerPhone})
                        </h4>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          className="admin-inline-select"
                          value={jc.status}
                          onChange={(e) => handleJobCardStatusChange(jc, e.target.value)}
                        >
                          <option value="Open">Open (15%)</option>
                          <option value="Assigned">Assigned (25%)</option>
                          <option value="Waiting for Parts">Waiting for Parts (45%)</option>
                          <option value="In Progress">In Progress (65%)</option>
                          <option value="Quality Check">Quality Check (85%)</option>
                          <option value="Completed">Completed (100%)</option>
                          <option value="Delivered">Delivered (100%)</option>
                        </select>
                        <button
                          type="button"
                          className="icon-btn-sm blue"
                          onClick={() => {
                            setFormErrors({});
                            setJobCardModal({ open: true, data: jc });
                          }}
                          title="Edit Job Card"
                        >
                          <EditRounded fontSize="small" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="jc-progress-wrap">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                        <span style={{ color: '#0284c7' }}>Repair Stage: {jc.status}</span>
                        <span>{jc.progressPercent || 50}% Complete</span>
                      </div>
                      <div className="jc-progress-bar-bg">
                        <div
                          className="jc-progress-bar-fill"
                          style={{ width: `${jc.progressPercent || 50}%` }}
                        />
                      </div>
                    </div>

                    <div className="jc-meta-row">
                      <span>
                        <strong>Assigned Mechanic:</strong> {jc.assignedMechanic}
                      </span>
                      <span>
                        <strong>Service Bay:</strong> {jc.bayNumber || 'Bay 1'}
                      </span>
                      <span>
                        <strong>Odometer:</strong> {Number(jc.odometerReading || 0).toLocaleString()} km
                      </span>
                      <span>
                        <strong>Est. Completion:</strong> {jc.estimatedCompletion || 'Today'}
                      </span>
                    </div>

                    {jc.reportedIssues && (
                      <div className="jc-issues-box">
                        <strong>Reported Issues / Instructions:</strong> {jc.reportedIssues}
                      </div>
                    )}

                    {/* Interactive Checklist Tasks */}
                    {jc.tasks && jc.tasks.length > 0 && (
                      <div className="jc-tasks-list">
                        <strong style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '4px' }}>
                          Service Tasks Checklist (Click to toggle completion):
                        </strong>
                        {jc.tasks.map((t, idx) => (
                          <label key={idx} className={`jc-task-row ${t.completed ? 'done' : ''}`}>
                            <input
                              type="checkbox"
                              checked={!!t.completed}
                              onChange={() => handleToggleJobTask(jc, idx)}
                            />
                            <span>{t.description}</span>
                            {t.cost > 0 && (
                              <strong style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
                                Rs. {Number(t.cost).toLocaleString()}
                              </strong>
                            )}
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="jc-footer">
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Estimated Job Total (Incl. Labor & Parts):{' '}
                        </span>
                        <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>
                          Rs. {Number(jc.estimatedTotal || 0).toLocaleString()}
                        </strong>
                      </div>
                      <button
                        type="button"
                        className="btn-primary-pro"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.84rem' }}
                        onClick={() => handleGenerateInvoiceFromJobCard(jc)}
                      >
                        <ReceiptLongRounded sx={{ fontSize: 16 }} />
                        <span>Generate Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: MECHANIC MANAGEMENT
              ================================================================ */}
          {activeTab === 'mechanics' && (
            <div className="admin-panel-card">
              <div className="admin-panel-toolbar">
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    Workshop Technicians & Specializations Roster
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    Manage mechanic specializations, real-time bay availability, and active job assignments.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary-pro"
                  onClick={() => {
                    setFormErrors({});
                    setMechanicModal({ open: true, data: null });
                  }}
                >
                  <AddCircleRounded fontSize="small" />
                  <span>Add New Mechanic</span>
                </button>
              </div>

              <div className="mechanics-cards-grid">
                {mechanics.map((mech) => {
                  const activeAssignedJobs = jobCards.filter(
                    (jc) =>
                      (jc.assignedMechanic || '').toLowerCase() === (mech.name || '').toLowerCase() &&
                      jc.status !== 'Completed' &&
                      jc.status !== 'Delivered'
                  );
                  const isLocked = mech.availability === 'On Job' || activeAssignedJobs.length > 0;

                  return (
                    <div key={mech._id} className="mechanic-pro-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div className="mechanic-avatar">
                            <EngineeringRounded />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7' }}>
                              {mech.employeeId} • {mech.assignedBay}
                            </span>
                            <h4 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0f172a' }}>
                              {mech.name}
                            </h4>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {mech.phone} • {mech.experienceYears} Yrs Exp.
                            </div>
                          </div>
                        </div>

                        <select
                          className={`availability-select ${
                            mech.availability === 'Available'
                              ? 'avail'
                              : mech.availability === 'On Job'
                              ? 'busy'
                              : 'off'
                          }`}
                          value={mech.availability}
                          onChange={(e) => handleMechanicAvailabilityChange(mech, e.target.value)}
                        >
                          <option value="Available">● Available</option>
                          <option value="On Job">● On Job</option>
                          <option value="On Break">● On Break</option>
                          <option value="Off Duty">○ Off Duty</option>
                        </select>
                      </div>

                      <div style={{ margin: '1rem 0' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                          SPECIALIZATIONS:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {(mech.specializations || []).map((spec) => (
                            <span key={spec} className="spec-tag">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mechanic-stats-strip">
                        <div>
                          <span>Active Jobs</span>
                          <strong>{activeAssignedJobs.length}</strong>
                        </div>
                        <div>
                          <span>Completed</span>
                          <strong>{mech.completedJobsCount || 0}</strong>
                        </div>
                        <div>
                          <span>Hourly Rate</span>
                          <strong>Rs. {Number(mech.hourlyRate || 1500).toLocaleString()}</strong>
                        </div>
                        <div>
                          <span>Rating</span>
                          <strong style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            <StarRounded sx={{ fontSize: 16 }} /> {mech.rating || 4.8}
                          </strong>
                        </div>
                      </div>

                      {activeAssignedJobs.length > 0 && (
                        <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ color: '#0f172a' }}>Current Bay Queue: </strong>
                          {activeAssignedJobs.map((j) => `${j.jobCardNumber} (${j.vehicleNumber})`).join(', ')}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                        <button
                          type="button"
                          className="icon-btn-sm blue"
                          onClick={() => {
                            setFormErrors({});
                            setMechanicModal({ open: true, data: mech });
                          }}
                          title="Edit Mechanic"
                        >
                          <EditRounded fontSize="small" />
                        </button>
                        <button
                          type="button"
                          className="icon-btn-sm red"
                          style={isLocked ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                          onClick={() => handleDeleteMechanic(mech)}
                          title={
                            isLocked
                              ? 'Cannot delete mechanic while On Job or assigned to active Job Cards'
                              : 'Remove Mechanic'
                          }
                        >
                          <DeleteOutlineRounded fontSize="small" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: INVENTORY MANAGEMENT
              ================================================================ */}
          {activeTab === 'inventory' && (
            <div className="admin-panel-card">
              {lowStockParts.length > 0 && (
                <div className="low-stock-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <WarningAmberRounded sx={{ color: '#d97706' }} />
                    <div>
                      <strong>Low Stock Alert ({lowStockParts.length} Spare Parts below reorder level): </strong>
                      <span>
                        {lowStockParts.map((p) => `${p.name} (${p.quantity} left)`).join(' • ')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-pill-btn active"
                    onClick={() => setInventoryCategoryFilter('Low Stock')}
                  >
                    Filter Low Stock
                  </button>
                </div>
              )}

              <div className="admin-panel-toolbar">
                <div className="admin-filter-pills">
                  {[
                    'All',
                    'Low Stock',
                    'Engine Oil & Fluids',
                    'Filters',
                    'Brake Components',
                    'Detailing Chemicals',
                    'Batteries & Electrical'
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setInventoryCategoryFilter(cat)}
                      className={`admin-pill-btn ${inventoryCategoryFilter === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary-pro"
                  onClick={() => {
                    setFormErrors({});
                    setInventoryModal({ open: true, data: null });
                  }}
                >
                  <AddCircleRounded fontSize="small" />
                  <span>Add Spare Part</span>
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>SKU / Part Code</th>
                      <th>Spare Part & Brand</th>
                      <th>Category & Bin</th>
                      <th>Stock Level</th>
                      <th>Cost / Selling Price</th>
                      <th>Supplier Details</th>
                      <th style={{ textAlign: 'right' }}>Stock Movements & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((part) => {
                      const isLow = Number(part.quantity) <= Number(part.reorderLevel);
                      const hasStock = Number(part.quantity) > 0;
                      return (
                        <tr key={part._id}>
                          <td>
                            <span className="plate-badge">{part.partCode}</span>
                          </td>
                          <td>
                            <strong>{part.name}</strong>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Brand: {part.brand}
                            </div>
                          </td>
                          <td>
                            <span className="status-chip info">{part.category}</span>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>
                              Bin: {part.locationBin || 'Rack A'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong
                                style={{
                                  fontSize: '1.05rem',
                                  color: isLow ? '#dc2626' : '#059669'
                                }}
                              >
                                {part.quantity} {part.unit || 'Units'}
                              </strong>
                              {isLow && <span className="status-chip danger">Low Stock</span>}
                            </div>
                            <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                              Reorder at: {part.reorderLevel}
                            </div>
                          </td>
                          <td>
                            <strong>Rs. {Number(part.unitPrice || 0).toLocaleString()}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Cost: Rs. {Number(part.costPrice || 0).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <strong>{part.supplierName}</strong>
                            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                              {part.supplierPhone}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-action-group" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="mini-action-btn approve"
                                onClick={() => {
                                  setFormErrors({});
                                  setStockMovementModal({ open: true, part });
                                }}
                                title="Record Stock In / Out Movement"
                              >
                                <SwapVertRounded sx={{ fontSize: 15 }} />
                                <span>Stock In/Out</span>
                              </button>
                              <button
                                type="button"
                                className="icon-btn-sm blue"
                                onClick={() => setMovementHistoryModal({ open: true, part })}
                                title="View Stock Movement Log"
                              >
                                <HistoryRounded fontSize="small" />
                              </button>
                              <button
                                type="button"
                                className="icon-btn-sm blue"
                                onClick={() => {
                                  setFormErrors({});
                                  setInventoryModal({ open: true, data: part });
                                }}
                                title="Edit Spare Part"
                              >
                                <EditRounded fontSize="small" />
                              </button>
                              <button
                                type="button"
                                className="icon-btn-sm red"
                                style={hasStock ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
                                onClick={() => handleDeleteInventoryPart(part)}
                                title={
                                  hasStock
                                    ? `Cannot delete ${part.partCode}: Has ${part.quantity} in stock`
                                    : 'Delete Part'
                                }
                              >
                                <DeleteOutlineRounded fontSize="small" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: BILLING & PAYMENTS
              ================================================================ */}
          {activeTab === 'billing' && (
            <div className="admin-panel-card">
              {/* Financial Summary Strip */}
              <div className="billing-summary-strip">
                <div>
                  <span>Total Invoiced</span>
                  <strong>Rs. {totalRevenueBilled.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Payments Received</span>
                  <strong style={{ color: '#10b981' }}>Rs. {totalRevenueCollected.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Outstanding Balances</span>
                  <strong style={{ color: '#ef4444' }}>Rs. {totalOutstandingBalance.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Total Discounts Given</span>
                  <strong style={{ color: '#f59e0b' }}>Rs. {totalDiscountsGiven.toLocaleString()}</strong>
                </div>
              </div>

              <div className="admin-panel-toolbar">
                <div className="admin-filter-pills">
                  {['All', 'Paid', 'Partial', 'Unpaid'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setInvoiceStatusFilter(st)}
                      className={`admin-pill-btn ${invoiceStatusFilter === st ? 'active' : ''}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary-pro"
                  onClick={() => {
                    setFormErrors({});
                    setInvoiceModal({ open: true, data: null });
                  }}
                >
                  <AddCircleRounded fontSize="small" />
                  <span>Generate New Invoice</span>
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Invoice # & Date</th>
                      <th>Customer & Vehicle</th>
                      <th>Subtotal & Discount</th>
                      <th>Grand Total</th>
                      <th>Paid / Balance Due</th>
                      <th>Status & Method</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv._id}>
                        <td>
                          <strong style={{ color: '#0284c7' }}>{inv.invoiceNumber}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {inv.jobCardNumber ? `Job: ${inv.jobCardNumber}` : 'Direct POS'} •{' '}
                            {inv.issuedDate ? new Date(inv.issuedDate).toLocaleDateString() : 'Today'}
                          </div>
                        </td>
                        <td>
                          <strong>{inv.customerName}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                            {inv.customerPhone} • <span className="plate-badge-sm">{inv.vehicleNumber}</span>
                          </div>
                        </td>
                        <td>
                          <div>Subtotal: Rs. {Number(inv.subtotal || 0).toLocaleString()}</div>
                          {Number(inv.discount) > 0 && (
                            <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                              Discount: -Rs. {Number(inv.discount).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td>
                          <strong style={{ fontSize: '1.05rem' }}>
                            Rs. {Number(inv.grandTotal || 0).toLocaleString()}
                          </strong>
                        </td>
                        <td>
                          <div style={{ color: '#059669', fontWeight: 600 }}>
                            Paid: Rs. {Number(inv.paidAmount || 0).toLocaleString()}
                          </div>
                          {Number(inv.balanceDue) > 0 && (
                            <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem' }}>
                              Due: Rs. {Number(inv.balanceDue).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-chip ${
                              inv.paymentStatus === 'Paid'
                                ? 'success'
                                : inv.paymentStatus === 'Partial'
                                ? 'warning'
                                : 'danger'
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>
                            via {inv.paymentMethod}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-action-group" style={{ justifyContent: 'flex-end' }}>
                            {Number(inv.balanceDue) > 0 && (
                              <button
                                type="button"
                                className="mini-action-btn approve"
                                onClick={() => {
                                  setFormErrors({});
                                  setPaymentModal({
                                    open: true,
                                    invoice: inv,
                                    amount: inv.balanceDue,
                                    method: inv.paymentMethod || 'Cash'
                                  });
                                }}
                              >
                                <PaidRounded sx={{ fontSize: 14 }} />
                                <span>Pay Balance</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="icon-btn-sm blue"
                              onClick={() => setPrintInvoiceModal({ open: true, invoice: inv })}
                              title="View / Print Official Invoice"
                            >
                              <PrintRounded fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: REPORTS & ANALYTICS
              ================================================================ */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-panel-toolbar" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Executive Workshop Reports & Financial Analytics
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
                    Real-time insights across daily/monthly revenue, service utilization, spare parts valuation, and mechanic performance.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-primary-pro" onClick={handleExportCSVReport}>
                    <DownloadRounded fontSize="small" />
                    <span>Export CSV Report</span>
                  </button>
                  <button
                    type="button"
                    className="admin-action-chip"
                    onClick={() => window.print()}
                  >
                    <PrintRounded fontSize="small" />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              {/* Revenue Charts Grid */}
              <div className="reports-grid-2col">
                <div className="admin-panel-card">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    Monthly Revenue & Service Volume (6-Month Trend)
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                    Gross workshop billing vs operational spare parts cost
                  </p>

                  <div className="visual-bar-chart">
                    {[
                      { month: 'Jun', rev: 385000, jobs: 48 },
                      { month: 'Jul', rev: 442000, jobs: 56 },
                      { month: 'Aug', rev: 418000, jobs: 52 },
                      { month: 'Sep', rev: 512000, jobs: 64 },
                      { month: 'Oct', rev: 568000, jobs: 71 },
                      { month: 'Nov', rev: Math.max(580000, totalRevenueBilled + 510000), jobs: 65 + jobCards.length }
                    ].map((m) => {
                      const heightPct = Math.min(100, Math.round((m.rev / 650000) * 100));
                      return (
                        <div key={m.month} className="bar-col-wrap">
                          <span className="bar-top-val">Rs. {(m.rev / 1000).toFixed(0)}k</span>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ height: `${heightPct}%` }} />
                          </div>
                          <strong className="bar-label">{m.month}</strong>
                          <small style={{ fontSize: '0.7rem', color: '#64748b' }}>{m.jobs} Jobs</small>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="admin-panel-card">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    Daily Revenue & Bay Turnaround (Last 7 Days)
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                    Daily bay collections and completed customer appointments
                  </p>

                  <div className="daily-rev-list">
                    {[
                      { day: 'Monday', rev: 68500, count: 9 },
                      { day: 'Tuesday', rev: 74200, count: 11 },
                      { day: 'Wednesday', rev: 61800, count: 8 },
                      { day: 'Thursday', rev: 89400, count: 13 },
                      { day: 'Friday', rev: 96500, count: 14 },
                      { day: 'Saturday', rev: 124000, count: 18 },
                      { day: 'Today (Live)', rev: totalRevenueCollected, count: invoices.length }
                    ].map((d) => {
                      const pct = Math.min(100, Math.round((d.rev / 130000) * 100));
                      return (
                        <div key={d.day} className="daily-rev-row">
                          <div style={{ width: '120px', fontWeight: 700, fontSize: '0.85rem' }}>{d.day}</div>
                          <div className="daily-bar-bg">
                            <div className="daily-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div style={{ width: '130px', textAlign: 'right', fontWeight: 800, fontSize: '0.86rem' }}>
                            Rs. {d.rev.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="reports-grid-2col" style={{ marginTop: '1.5rem' }}>
                <div className="admin-panel-card">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Mechanic Performance & Efficiency Report
                  </h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Technician</th>
                        <th>Completed Jobs</th>
                        <th>Active Bay Load</th>
                        <th>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mechanics.map((m) => {
                        const activeCount = jobCards.filter(
                          (j) => (j.assignedMechanic || '').toLowerCase() === (m.name || '').toLowerCase()
                        ).length;
                        return (
                          <tr key={m._id}>
                            <td>
                              <strong>{m.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {(m.specializations || []).slice(0, 2).join(', ')}
                              </div>
                            </td>
                            <td>
                              <strong>{m.completedJobsCount || 0} Jobs</strong>
                            </td>
                            <td>
                              <span className="status-chip info">{activeCount} Assigned</span>
                            </td>
                            <td>
                              <strong style={{ color: '#f59e0b' }}>★ {m.rating || 4.8} / 5.0</strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="admin-panel-card">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Inventory Valuation & Service Department Report
                  </h4>
                  <div className="report-kv-list">
                    <div className="report-kv-item">
                      <span>Total Spare Parts Retail Value</span>
                      <strong>Rs. {totalInventoryRetailValue.toLocaleString()}</strong>
                    </div>
                    <div className="report-kv-item">
                      <span>Total Spare Parts Cost Value</span>
                      <strong>Rs. {totalInventoryCostValue.toLocaleString()}</strong>
                    </div>
                    <div className="report-kv-item">
                      <span>Projected Spare Parts Margin</span>
                      <strong style={{ color: '#10b981' }}>
                        Rs. {(totalInventoryRetailValue - totalInventoryCostValue).toLocaleString()}
                      </strong>
                    </div>
                    <div className="report-kv-item">
                      <span>Low Stock Items Requiring Reorder</span>
                      <strong style={{ color: lowStockParts.length ? '#dc2626' : '#10b981' }}>
                        {lowStockParts.length} SKUs
                      </strong>
                    </div>
                    <div className="report-kv-item">
                      <span>Active Service Catalog Packages</span>
                      <strong>{services.filter((s) => s.isActive).length} Active Packages</strong>
                    </div>
                    <div className="report-kv-item">
                      <span>Customer Collection Efficiency</span>
                      <strong style={{ color: '#0284c7' }}>
                        {totalRevenueBilled > 0
                          ? Math.round((totalRevenueCollected / totalRevenueBilled) * 100)
                          : 100}
                        % Collected
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB: STAFF REGISTRATION (ADMIN, MECHANIC, SALES PERSON)
              ================================================================ */}
          {activeTab === 'staff' && (
            <div className="admin-panel-card">
              <div className="admin-panel-toolbar">
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    Staff Registration & Role Management
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    Register and manage authorized accounts for <strong>Admin</strong>, <strong>Mechanic</strong>, and <strong>Sales Person</strong> roles.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="admin-filter-pills">
                    {['All', 'Admin', 'Mechanic', 'Sales Person'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setStaffRoleFilter(role)}
                        className={`admin-pill-btn ${staffRoleFilter === role ? 'active' : ''}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-primary-pro"
                    onClick={() => {
                      setFormErrors({});
                      setStaffModal({ open: true, data: null });
                    }}
                  >
                    <PersonAddAlt1Rounded fontSize="small" />
                    <span>Register Staff Account</span>
                  </button>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Staff Member Name</th>
                      <th>Designated Role</th>
                      <th>Login Email</th>
                      <th>Mobile Number</th>
                      <th>Registered Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => {
                      const isPrimaryOwner = (member.email || '').toLowerCase() === 'admin@soapyride.com';
                      return (
                        <tr key={member._id}>
                          <td>
                            <strong>{member.fullname}</strong>
                          </td>
                          <td>
                            <span
                              className={`status-chip ${
                                member.staffRole === 'Admin'
                                  ? 'info'
                                  : member.staffRole === 'Mechanic'
                                  ? 'warning'
                                  : 'success'
                              }`}
                            >
                              {member.staffRole || 'Admin'}
                            </span>
                          </td>
                          <td>{member.email}</td>
                          <td>{member.phone}</td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'Active'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="icon-btn-sm red"
                              style={isPrimaryOwner ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                              title={isPrimaryOwner ? 'Primary Shop Owner cannot be deleted' : 'Remove Staff Member'}
                              onClick={() => handleDeleteStaff(member)}
                            >
                              <DeleteOutlineRounded fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          MODALS WITH PROFESSIONAL VALIDATIONS (noValidate)
          ==================================================================== */}

      {/* Vehicle Modal */}
      {vehicleModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{vehicleModal.data ? 'Edit Vehicle & Mileage' : 'Register New Vehicle'}</h3>
              <button
                type="button"
                onClick={() => clearErrorsAndClose(setVehicleModal, { open: false, data: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Vehicle Registration Plate *</label>
                  <input
                    name="vehicleNumber"
                    className={`pro-input ${formErrors.vehicleNumber ? 'input-error' : ''}`}
                    defaultValue={vehicleModal.data?.vehicleNumber || ''}
                    placeholder="e.g. WP CAB-4582"
                  />
                  {renderFieldError('vehicleNumber')}
                </div>
                <div className="pro-field-group">
                  <label>Vehicle Category *</label>
                  <select
                    name="vehicleType"
                    className="pro-input"
                    defaultValue={vehicleModal.data?.vehicleType || 'Car'}
                  >
                    <option value="Car">Car (Sedan / Hatchback)</option>
                    <option value="SUV">SUV / 4x4</option>
                    <option value="Van">Van / MPV</option>
                    <option value="Bike">Motorcycle</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Brand / Make *</label>
                  <input
                    name="brand"
                    className={`pro-input ${formErrors.brand ? 'input-error' : ''}`}
                    defaultValue={vehicleModal.data?.brand || ''}
                    placeholder="e.g. Toyota, Honda, BMW"
                  />
                  {renderFieldError('brand')}
                </div>
                <div className="pro-field-group">
                  <label>Vehicle Model *</label>
                  <input
                    name="model"
                    className={`pro-input ${formErrors.model ? 'input-error' : ''}`}
                    defaultValue={vehicleModal.data?.model || ''}
                    placeholder="e.g. Premio G Superior"
                  />
                  {renderFieldError('model')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Current Mileage (km) *</label>
                  <input
                    name="mileage"
                    type="number"
                    className={`pro-input ${formErrors.mileage ? 'input-error' : ''}`}
                    defaultValue={vehicleModal.data?.mileage ?? ''}
                    placeholder="e.g. 45000"
                  />
                  {renderFieldError('mileage')}
                </div>
                <div className="pro-field-group">
                  <label>Fuel Type & Year *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      name="fuelType"
                      className="pro-input"
                      defaultValue={vehicleModal.data?.fuelType || 'Petrol'}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                    <input
                      name="year"
                      type="number"
                      className={`pro-input ${formErrors.year ? 'input-error' : ''}`}
                      defaultValue={vehicleModal.data?.year || 2021}
                      placeholder="Year"
                    />
                  </div>
                  {renderFieldError('year')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Owner Full Name *</label>
                  <input
                    name="ownerName"
                    className={`pro-input ${formErrors.ownerName ? 'input-error' : ''}`}
                    defaultValue={vehicleModal.data?.ownerName || ''}
                    placeholder="Customer Full Name"
                  />
                  {renderFieldError('ownerName')}
                </div>
                <div className="pro-field-group">
                  <label>Owner Mobile Number (10 Digits) *</label>
                  <input
                    name="ownerPhone"
                    className={`pro-input ${formErrors.ownerPhone ? 'input-error' : ''}`}
                    defaultValue={vehicleModal.data?.ownerPhone || ''}
                    placeholder="0771234567"
                  />
                  {renderFieldError('ownerPhone')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Owner Email</label>
                  <input
                    name="ownerEmail"
                    type="email"
                    className={`pro-input ${formErrors.ownerEmail ? 'input-error' : ''}`}
                    defaultValue={vehicleModal.data?.ownerEmail || ''}
                    placeholder="customer@email.com"
                  />
                  {renderFieldError('ownerEmail')}
                </div>
                <div className="pro-field-group">
                  <label>Exterior Color</label>
                  <input
                    name="color"
                    className="pro-input"
                    defaultValue={vehicleModal.data?.color || 'Pearl White'}
                  />
                </div>
              </div>

              <div className="pro-field-group">
                <label>Owner Address</label>
                <input
                  name="ownerAddress"
                  className="pro-input"
                  defaultValue={vehicleModal.data?.ownerAddress || ''}
                  placeholder="Street address, city"
                />
              </div>

              <div className="pro-field-group">
                <label>Service History & Oil Grade Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  className="pro-input"
                  defaultValue={vehicleModal.data?.notes || ''}
                  placeholder="Special maintenance notes..."
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => clearErrorsAndClose(setVehicleModal, { open: false, data: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Save Vehicle Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {serviceModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{serviceModal.data ? 'Edit Service Package' : 'Create New Service Package'}</h3>
              <button
                type="button"
                onClick={() => clearErrorsAndClose(setServiceModal, { open: false, data: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveService} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Service Code *</label>
                  <input
                    name="serviceCode"
                    className={`pro-input ${formErrors.serviceCode ? 'input-error' : ''}`}
                    defaultValue={serviceModal.data?.serviceCode || `SRV-00${services.length + 1}`}
                  />
                  {renderFieldError('serviceCode')}
                </div>
                <div className="pro-field-group">
                  <label>Service Category *</label>
                  <select
                    name="category"
                    className="pro-input"
                    defaultValue={serviceModal.data?.category || 'Wash & Detailing'}
                  >
                    <option value="Wash & Detailing">Wash & Detailing</option>
                    <option value="Mechanical & Lube">Mechanical & Lube</option>
                    <option value="Diagnostics & Electrical">Diagnostics & Electrical</option>
                    <option value="Wheel & Alignment">Wheel & Alignment</option>
                    <option value="Paint & Ceramic">Paint & Ceramic</option>
                    <option value="Custom Upgrades">Custom Upgrades</option>
                  </select>
                </div>
              </div>

              <div className="pro-field-group">
                <label>Service / Package Title *</label>
                <input
                  name="name"
                  className={`pro-input ${formErrors.name ? 'input-error' : ''}`}
                  defaultValue={serviceModal.data?.name || ''}
                  placeholder="e.g. Full Synthetic Lube & Brake Service"
                />
                {renderFieldError('name')}
              </div>

              <div className="pro-field-group">
                <label>Detailed Description (Min 15 chars) *</label>
                <textarea
                  name="description"
                  rows={3}
                  className={`pro-input ${formErrors.description ? 'input-error' : ''}`}
                  defaultValue={serviceModal.data?.description || ''}
                  placeholder="Describe included treatments, parts, and inspections..."
                />
                {renderFieldError('description')}
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Standard Price (Rs.) *</label>
                  <input
                    name="price"
                    type="number"
                    className={`pro-input ${formErrors.price ? 'input-error' : ''}`}
                    defaultValue={serviceModal.data?.price ?? ''}
                    placeholder="e.g. 4500"
                  />
                  {renderFieldError('price')}
                </div>
                <div className="pro-field-group">
                  <label>Estimated Duration *</label>
                  <input
                    name="duration"
                    className={`pro-input ${formErrors.duration ? 'input-error' : ''}`}
                    defaultValue={serviceModal.data?.duration || '60 mins'}
                    placeholder="e.g. 90 mins"
                  />
                  {renderFieldError('duration')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Service Warranty *</label>
                  <input
                    name="warranty"
                    className={`pro-input ${formErrors.warranty ? 'input-error' : ''}`}
                    defaultValue={serviceModal.data?.warranty || '30 Days Service Warranty'}
                  />
                  {renderFieldError('warranty')}
                </div>
                <div className="pro-field-group">
                  <label>Catalog Visibility</label>
                  <select
                    name="isActive"
                    className="pro-input"
                    defaultValue={String(serviceModal.data?.isActive ?? true)}
                  >
                    <option value="true">Active (Visible to Customers)</option>
                    <option value="false">Paused / Hidden</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => clearErrorsAndClose(setServiceModal, { open: false, data: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Save Service Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment / Reschedule Modal */}
      {appointmentModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>
                {appointmentModal.isReschedule
                  ? `Reschedule & Manage Appointment (${appointmentModal.data?.name})`
                  : 'Create Walk-In Service Appointment'}
              </h3>
              <button
                type="button"
                onClick={() =>
                  clearErrorsAndClose(setAppointmentModal, { open: false, data: null, isReschedule: false })
                }
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveAppointment} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Customer Name *</label>
                  <input
                    name="name"
                    className={`pro-input ${formErrors.name ? 'input-error' : ''}`}
                    defaultValue={appointmentModal.data?.name || ''}
                    placeholder="Customer Full Name"
                  />
                  {renderFieldError('name')}
                </div>
                <div className="pro-field-group">
                  <label>Phone Number (10 Digits) *</label>
                  <input
                    name="phone"
                    className={`pro-input ${formErrors.phone ? 'input-error' : ''}`}
                    defaultValue={appointmentModal.data?.phone || ''}
                    placeholder="0771234567"
                  />
                  {renderFieldError('phone')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Vehicle Number Plate *</label>
                  <input
                    name="vehicleNumber"
                    className={`pro-input ${formErrors.vehicleNumber ? 'input-error' : ''}`}
                    defaultValue={appointmentModal.data?.vehicleNumber || ''}
                    placeholder="WP CAB-4582"
                  />
                  {renderFieldError('vehicleNumber')}
                </div>
                <div className="pro-field-group">
                  <label>Vehicle Type</label>
                  <select
                    name="vehicleType"
                    className="pro-input"
                    defaultValue={appointmentModal.data?.vehicleType || 'Car'}
                  >
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Service Package *</label>
                  <input
                    name="washPackage"
                    className={`pro-input ${formErrors.washPackage ? 'input-error' : ''}`}
                    defaultValue={appointmentModal.data?.washPackage || 'Signature Detailing & Carnauba Wax Spa'}
                  />
                  {renderFieldError('washPackage')}
                </div>
                <div className="pro-field-group">
                  <label>Estimated Price (Rs.) *</label>
                  <input
                    name="estimatedPrice"
                    type="number"
                    className={`pro-input ${formErrors.estimatedPrice ? 'input-error' : ''}`}
                    defaultValue={appointmentModal.data?.estimatedPrice || 4500}
                  />
                  {renderFieldError('estimatedPrice')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Appointment Date *</label>
                  <input
                    name="date"
                    type="date"
                    className={`pro-input ${formErrors.date ? 'input-error' : ''}`}
                    defaultValue={
                      appointmentModal.data?.date
                        ? new Date(appointmentModal.data.date).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0]
                    }
                  />
                  {renderFieldError('date')}
                </div>
                <div className="pro-field-group">
                  <label>Bay Time Slot (07:30 – 19:00) *</label>
                  <input
                    name="time"
                    type="time"
                    className={`pro-input ${formErrors.time ? 'input-error' : ''}`}
                    defaultValue={appointmentModal.data?.time || '10:00'}
                  />
                  {renderFieldError('time')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Approval Status</label>
                  <select
                    name="approvalStatus"
                    className="pro-input"
                    defaultValue={
                      appointmentModal.isReschedule
                        ? 'Rescheduled'
                        : appointmentModal.data?.approvalStatus || 'Approved'
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="pro-field-group">
                  <label>Assign Mechanic</label>
                  <select
                    name="assignedMechanic"
                    className="pro-input"
                    defaultValue={appointmentModal.data?.assignedMechanic || mechanics[0]?.name || ''}
                  >
                    <option value="">Unassigned</option>
                    {mechanics.map((m) => (
                      <option key={m._id} value={m.name}>
                        {m.name} ({m.availability})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pro-field-group">
                <label>Live Bay Stage</label>
                <select
                  name="status"
                  className="pro-input"
                  defaultValue={appointmentModal.data?.status || 'Confirmed'}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked In">Checked In</option>
                  <option value="In Service Bay">In Service Bay</option>
                  <option value="Quality Check">Quality Check</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="pro-field-group">
                <label>Admin / Reschedule Notes</label>
                <textarea
                  name="adminNotes"
                  rows={2}
                  className="pro-input"
                  defaultValue={appointmentModal.data?.adminNotes || ''}
                  placeholder="Reason for reschedule or bay instructions..."
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() =>
                    clearErrorsAndClose(setAppointmentModal, { open: false, data: null, isReschedule: false })
                  }
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Card Modal */}
      {jobCardModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{jobCardModal.data?._id ? 'Update Job Card & Progress' : 'Create Workshop Job Card'}</h3>
              <button
                type="button"
                onClick={() => clearErrorsAndClose(setJobCardModal, { open: false, data: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveJobCard} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Job Card Number *</label>
                  <input
                    name="jobCardNumber"
                    className={`pro-input ${formErrors.jobCardNumber ? 'input-error' : ''}`}
                    defaultValue={
                      jobCardModal.data?.jobCardNumber || `JC-2026-${Math.floor(100 + Math.random() * 900)}`
                    }
                  />
                  {renderFieldError('jobCardNumber')}
                </div>
                <div className="pro-field-group">
                  <label>Vehicle Number Plate *</label>
                  <input
                    name="vehicleNumber"
                    className={`pro-input ${formErrors.vehicleNumber ? 'input-error' : ''}`}
                    defaultValue={jobCardModal.data?.vehicleNumber || ''}
                    placeholder="WP CAB-4582"
                  />
                  {renderFieldError('vehicleNumber')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Vehicle Make & Model *</label>
                  <input
                    name="vehicleModel"
                    className={`pro-input ${formErrors.vehicleModel ? 'input-error' : ''}`}
                    defaultValue={jobCardModal.data?.vehicleModel || ''}
                    placeholder="e.g. Toyota Premio"
                  />
                  {renderFieldError('vehicleModel')}
                </div>
                <div className="pro-field-group">
                  <label>Odometer Reading (km) *</label>
                  <input
                    name="odometerReading"
                    type="number"
                    className={`pro-input ${formErrors.odometerReading ? 'input-error' : ''}`}
                    defaultValue={jobCardModal.data?.odometerReading || 55000}
                  />
                  {renderFieldError('odometerReading')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Customer Name *</label>
                  <input
                    name="customerName"
                    className={`pro-input ${formErrors.customerName ? 'input-error' : ''}`}
                    defaultValue={jobCardModal.data?.customerName || ''}
                  />
                  {renderFieldError('customerName')}
                </div>
                <div className="pro-field-group">
                  <label>Customer Phone (10 Digits) *</label>
                  <input
                    name="customerPhone"
                    className={`pro-input ${formErrors.customerPhone ? 'input-error' : ''}`}
                    defaultValue={jobCardModal.data?.customerPhone || ''}
                    placeholder="0771234567"
                  />
                  {renderFieldError('customerPhone')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Assign Mechanic *</label>
                  <select
                    name="assignedMechanic"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.assignedMechanic || mechanics[0]?.name || 'Nuwan Bandara'}
                  >
                    {mechanics.map((m) => (
                      <option key={m._id} value={m.name}>
                        {m.name} — {m.assignedBay}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pro-field-group">
                  <label>Service Bay & Priority</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      name="bayNumber"
                      className="pro-input"
                      defaultValue={jobCardModal.data?.bayNumber || 'Bay 1 - Mechanical'}
                    />
                    <select
                      name="priority"
                      className="pro-input"
                      defaultValue={jobCardModal.data?.priority || 'Normal'}
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Repair Progress Stage</label>
                  <select
                    name="status"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.status || 'In Progress'}
                  >
                    <option value="Open">Open (15%)</option>
                    <option value="Assigned">Assigned (25%)</option>
                    <option value="Waiting for Parts">Waiting for Parts (45%)</option>
                    <option value="In Progress">In Progress (65%)</option>
                    <option value="Quality Check">Quality Check (85%)</option>
                    <option value="Completed">Completed (100%)</option>
                    <option value="Delivered">Delivered (100%)</option>
                  </select>
                </div>
                <div className="pro-field-group">
                  <label>Est. Completion Time</label>
                  <input
                    name="estimatedCompletion"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.estimatedCompletion || '04:00 PM'}
                  />
                </div>
              </div>

              <div className="pro-field-group">
                <label>Reported Issues / Customer Instructions *</label>
                <input
                  name="reportedIssues"
                  className={`pro-input ${formErrors.reportedIssues ? 'input-error' : ''}`}
                  defaultValue={jobCardModal.data?.reportedIssues || ''}
                  placeholder="Describe symptoms or requested service..."
                />
                {renderFieldError('reportedIssues')}
              </div>

              <div className="pro-field-group">
                <label>Repair Tasks (One per line: Task Description | Cost in Rs.) *</label>
                <textarea
                  name="tasksText"
                  rows={3}
                  className={`pro-input ${formErrors.tasksText ? 'input-error' : ''}`}
                  defaultValue={
                    (jobCardModal.data?.tasks || [])
                      .map((t) => `${t.description} | ${t.cost || 0}`)
                      .join('\n') ||
                    'Full Synthetic Oil & Filter Service | 8500\nBrake Pad Inspection & Cleaning | 2500'
                  }
                />
                {renderFieldError('tasksText')}
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Technician Labor Charge (Rs.) *</label>
                  <input
                    name="laborCost"
                    type="number"
                    className={`pro-input ${formErrors.laborCost ? 'input-error' : ''}`}
                    defaultValue={jobCardModal.data?.laborCost ?? 2500}
                  />
                  {renderFieldError('laborCost')}
                </div>
                <div className="pro-field-group">
                  <label>Total Estimated Cost (Rs.)</label>
                  <input
                    name="estimatedTotal"
                    type="number"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.estimatedTotal || ''}
                    placeholder="Auto-calculated if left blank"
                  />
                </div>
              </div>

              <div className="pro-field-group">
                <label>Technician Diagnostic Notes</label>
                <input
                  name="technicianNotes"
                  className="pro-input"
                  defaultValue={jobCardModal.data?.technicianNotes || ''}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => clearErrorsAndClose(setJobCardModal, { open: false, data: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Save Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mechanic Modal */}
      {mechanicModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{mechanicModal.data ? 'Edit Mechanic Profile' : 'Register Workshop Mechanic'}</h3>
              <button
                type="button"
                onClick={() => clearErrorsAndClose(setMechanicModal, { open: false, data: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveMechanic} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Employee ID (Format: MEC-001) *</label>
                  <input
                    name="employeeId"
                    className={`pro-input ${formErrors.employeeId ? 'input-error' : ''}`}
                    defaultValue={mechanicModal.data?.employeeId || `MEC-00${mechanics.length + 1}`}
                  />
                  {renderFieldError('employeeId')}
                </div>
                <div className="pro-field-group">
                  <label>Full Name *</label>
                  <input
                    name="name"
                    className={`pro-input ${formErrors.name ? 'input-error' : ''}`}
                    defaultValue={mechanicModal.data?.name || ''}
                    placeholder="e.g. Kasun Bandara"
                  />
                  {renderFieldError('name')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Mobile Phone (10 Digits) *</label>
                  <input
                    name="phone"
                    className={`pro-input ${formErrors.phone ? 'input-error' : ''}`}
                    defaultValue={mechanicModal.data?.phone || ''}
                    placeholder="0771234567"
                  />
                  {renderFieldError('phone')}
                </div>
                <div className="pro-field-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    className={`pro-input ${formErrors.email ? 'input-error' : ''}`}
                    defaultValue={mechanicModal.data?.email || ''}
                    placeholder="mechanic@soapyride.com"
                  />
                  {renderFieldError('email')}
                </div>
              </div>

              <div className="pro-field-group">
                <label>Technical Specializations (Comma-separated) *</label>
                <input
                  name="specializations"
                  className={`pro-input ${formErrors.specializations ? 'input-error' : ''}`}
                  defaultValue={
                    (mechanicModal.data?.specializations || []).join(', ') ||
                    'Engine & Transmission, OBD-II Diagnostics, Hybrid Systems'
                  }
                />
                {renderFieldError('specializations')}
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Assigned Service Bay *</label>
                  <input
                    name="assignedBay"
                    className={`pro-input ${formErrors.assignedBay ? 'input-error' : ''}`}
                    defaultValue={mechanicModal.data?.assignedBay || 'Bay 1 - Mechanical'}
                  />
                  {renderFieldError('assignedBay')}
                </div>
                <div className="pro-field-group">
                  <label>Availability Status</label>
                  <select
                    name="availability"
                    className="pro-input"
                    defaultValue={mechanicModal.data?.availability || 'Available'}
                  >
                    <option value="Available">Available</option>
                    <option value="On Job">On Job</option>
                    <option value="On Break">On Break</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Experience (Years) *</label>
                  <input
                    name="experienceYears"
                    type="number"
                    className={`pro-input ${formErrors.experienceYears ? 'input-error' : ''}`}
                    defaultValue={mechanicModal.data?.experienceYears ?? 5}
                  />
                  {renderFieldError('experienceYears')}
                </div>
                <div className="pro-field-group">
                  <label>Hourly Labor Rate (Rs.) *</label>
                  <input
                    name="hourlyRate"
                    type="number"
                    className={`pro-input ${formErrors.hourlyRate ? 'input-error' : ''}`}
                    defaultValue={mechanicModal.data?.hourlyRate ?? 1800}
                  />
                  {renderFieldError('hourlyRate')}
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => clearErrorsAndClose(setMechanicModal, { open: false, data: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Save Mechanic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Add/Edit Modal */}
      {inventoryModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{inventoryModal.data ? 'Edit Spare Part & Supplier' : 'Register New Spare Part'}</h3>
              <button
                type="button"
                onClick={() => clearErrorsAndClose(setInventoryModal, { open: false, data: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveInventoryPart} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Part SKU / Code *</label>
                  <input
                    name="partCode"
                    className={`pro-input ${formErrors.partCode ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.partCode || `PRT-00${inventory.length + 1}`}
                  />
                  {renderFieldError('partCode')}
                </div>
                <div className="pro-field-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.category || 'Engine Oil & Fluids'}
                  >
                    <option value="Engine Oil & Fluids">Engine Oil & Fluids</option>
                    <option value="Filters">Filters</option>
                    <option value="Brake Components">Brake Components</option>
                    <option value="Detailing Chemicals">Detailing Chemicals</option>
                    <option value="Batteries & Electrical">Batteries & Electrical</option>
                    <option value="Tires & Suspension">Tires & Suspension</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Spare Part Name *</label>
                  <input
                    name="name"
                    className={`pro-input ${formErrors.name ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.name || ''}
                    placeholder="e.g. Mobil 1 5W-30 Synthetic (4L)"
                  />
                  {renderFieldError('name')}
                </div>
                <div className="pro-field-group">
                  <label>Manufacturer / Brand *</label>
                  <input
                    name="brand"
                    className={`pro-input ${formErrors.brand ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.brand || ''}
                    placeholder="e.g. Mobil 1, Toyota OEM"
                  />
                  {renderFieldError('brand')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Current Stock Quantity & Unit *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      name="quantity"
                      type="number"
                      className={`pro-input ${formErrors.quantity ? 'input-error' : ''}`}
                      defaultValue={inventoryModal.data?.quantity ?? 0}
                    />
                    <input
                      name="unit"
                      className={`pro-input ${formErrors.unit ? 'input-error' : ''}`}
                      defaultValue={inventoryModal.data?.unit || 'Units'}
                      placeholder="Units/Cans"
                    />
                  </div>
                  {renderFieldError('quantity')}
                  {renderFieldError('unit')}
                </div>
                <div className="pro-field-group">
                  <label>Min Reorder Alert Level *</label>
                  <input
                    name="reorderLevel"
                    type="number"
                    className={`pro-input ${formErrors.reorderLevel ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.reorderLevel ?? 5}
                  />
                  {renderFieldError('reorderLevel')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Supplier Cost Price (Rs.) *</label>
                  <input
                    name="costPrice"
                    type="number"
                    className={`pro-input ${formErrors.costPrice ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.costPrice ?? ''}
                    placeholder="e.g. 5000"
                  />
                  {renderFieldError('costPrice')}
                </div>
                <div className="pro-field-group">
                  <label>Customer Retail Price (Rs.) *</label>
                  <input
                    name="unitPrice"
                    type="number"
                    className={`pro-input ${formErrors.unitPrice ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.unitPrice ?? ''}
                    placeholder="Must be >= Cost Price"
                  />
                  {renderFieldError('unitPrice')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Supplier Company Name *</label>
                  <input
                    name="supplierName"
                    className={`pro-input ${formErrors.supplierName ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.supplierName || ''}
                    placeholder="e.g. AutoLanka Distributors"
                  />
                  {renderFieldError('supplierName')}
                </div>
                <div className="pro-field-group">
                  <label>Supplier Phone (10 Digits) *</label>
                  <input
                    name="supplierPhone"
                    className={`pro-input ${formErrors.supplierPhone ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.supplierPhone || ''}
                    placeholder="0112345678"
                  />
                  {renderFieldError('supplierPhone')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Supplier Email</label>
                  <input
                    name="supplierEmail"
                    className={`pro-input ${formErrors.supplierEmail ? 'input-error' : ''}`}
                    defaultValue={inventoryModal.data?.supplierEmail || ''}
                    placeholder="orders@supplier.lk"
                  />
                  {renderFieldError('supplierEmail')}
                </div>
                <div className="pro-field-group">
                  <label>Storage Bin Location</label>
                  <input
                    name="locationBin"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.locationBin || 'Rack A-01'}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => clearErrorsAndClose(setInventoryModal, { open: false, data: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Save Spare Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement (Stock IN / Stock OUT) Modal */}
      {stockMovementModal.open && stockMovementModal.part && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 500 }}>
            <div className="admin-modal-header">
              <h3>Record Stock Movement — {stockMovementModal.part.partCode}</h3>
              <button
                type="button"
                onClick={() => clearErrorsAndClose(setStockMovementModal, { open: false, part: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
              Item: <strong>{stockMovementModal.part.name}</strong> • Current Stock:{' '}
              <strong style={{ color: '#0284c7' }}>
                {stockMovementModal.part.quantity} {stockMovementModal.part.unit}
              </strong>
            </p>
            <form onSubmit={handleRecordStockMovement} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Movement Direction *</label>
                  <select name="type" className="pro-input" defaultValue="IN">
                    <option value="IN">STOCK IN (+ Restock from Supplier)</option>
                    <option value="OUT">STOCK OUT (- Issue to Job Card)</option>
                  </select>
                </div>
                <div className="pro-field-group">
                  <label>Quantity *</label>
                  <input
                    name="quantity"
                    type="number"
                    className={`pro-input ${formErrors.quantity ? 'input-error' : ''}`}
                    defaultValue={1}
                  />
                  {renderFieldError('quantity')}
                </div>
              </div>

              <div className="pro-field-group">
                <label>Reference (PO Number or Job Card Number) *</label>
                <input
                  name="reference"
                  className={`pro-input ${formErrors.reference ? 'input-error' : ''}`}
                  placeholder="e.g. PO-2026-105 or JC-2026-101"
                />
                {renderFieldError('reference')}
              </div>

              <div className="pro-field-group">
                <label>Reason / Notes *</label>
                <input
                  name="reason"
                  className={`pro-input ${formErrors.reason ? 'input-error' : ''}`}
                  placeholder="e.g. Supplier delivery or Used for brake replacement"
                />
                {renderFieldError('reason')}
              </div>

              <div className="pro-field-group">
                <label>Recorded By *</label>
                <input
                  name="performedBy"
                  className={`pro-input ${formErrors.performedBy ? 'input-error' : ''}`}
                  defaultValue={localStorage.getItem('userName') || 'Shop Admin'}
                />
                {renderFieldError('performedBy')}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => clearErrorsAndClose(setStockMovementModal, { open: false, part: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Confirm Stock Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement History Modal */}
      {movementHistoryModal.open && movementHistoryModal.part && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>
                Stock Movement Log — {movementHistoryModal.part.name} ({movementHistoryModal.part.partCode})
              </h3>
              <button
                type="button"
                onClick={() => setMovementHistoryModal({ open: false, part: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Reference</th>
                    <th>Reason</th>
                    <th>By / Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(movementHistoryModal.part.movements || []).map((m, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={`status-chip ${m.type === 'IN' ? 'success' : 'warning'}`}>
                          {m.type === 'IN' ? '+ STOCK IN' : '- STOCK OUT'}
                        </span>
                      </td>
                      <td>
                        <strong>{m.quantity}</strong>
                      </td>
                      <td>{m.reference || '—'}</td>
                      <td>{m.reason}</td>
                      <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {m.performedBy} • {m.date ? new Date(m.date).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                  {(!movementHistoryModal.part.movements ||
                    movementHistoryModal.part.movements.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        No stock movements recorded yet for this item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {invoiceModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Generate Customer Invoice & Payment Record</h3>
              <button
                type="button"
                onClick={() => clearErrorsAndClose(setInvoiceModal, { open: false, data: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveInvoice} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Invoice Number *</label>
                  <input
                    name="invoiceNumber"
                    className={`pro-input ${formErrors.invoiceNumber ? 'input-error' : ''}`}
                    defaultValue={
                      invoiceModal.data?.invoiceNumber ||
                      `INV-2026-${Math.floor(100 + Math.random() * 900)}`
                    }
                  />
                  {renderFieldError('invoiceNumber')}
                </div>
                <div className="pro-field-group">
                  <label>Linked Job Card #</label>
                  <input
                    name="jobCardNumber"
                    className="pro-input"
                    defaultValue={invoiceModal.data?.jobCardNumber || ''}
                    placeholder="e.g. JC-2026-101"
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Customer Name *</label>
                  <input
                    name="customerName"
                    className={`pro-input ${formErrors.customerName ? 'input-error' : ''}`}
                    defaultValue={invoiceModal.data?.customerName || ''}
                  />
                  {renderFieldError('customerName')}
                </div>
                <div className="pro-field-group">
                  <label>Customer Phone (10 Digits) *</label>
                  <input
                    name="customerPhone"
                    className={`pro-input ${formErrors.customerPhone ? 'input-error' : ''}`}
                    defaultValue={invoiceModal.data?.customerPhone || ''}
                    placeholder="0771234567"
                  />
                  {renderFieldError('customerPhone')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Vehicle Number Plate *</label>
                  <input
                    name="vehicleNumber"
                    className={`pro-input ${formErrors.vehicleNumber ? 'input-error' : ''}`}
                    defaultValue={invoiceModal.data?.vehicleNumber || ''}
                    placeholder="WP CAB-4582"
                  />
                  {renderFieldError('vehicleNumber')}
                </div>
                <div className="pro-field-group">
                  <label>Payment Method</label>
                  <select
                    name="paymentMethod"
                    className="pro-input"
                    defaultValue={invoiceModal.data?.paymentMethod || 'Card'}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online / LankaQR">Online / LankaQR</option>
                  </select>
                </div>
              </div>

              <div className="pro-field-group">
                <label>Invoice Line Items (Format: Description | Qty | Unit Price | Type) *</label>
                <textarea
                  name="itemsText"
                  rows={4}
                  className={`pro-input ${formErrors.itemsText ? 'input-error' : ''}`}
                  defaultValue={
                    invoiceModal.data?.items
                      ? invoiceModal.data.items
                          .map((i) => `${i.description} | ${i.quantity} | ${i.unitPrice} | ${i.itemType}`)
                          .join('\n')
                      : 'Full Mechanical & Lube Service | 1 | 11500 | Service\nMobil 1 Synthetic Oil Filter | 1 | 2800 | Part'
                  }
                />
                {renderFieldError('itemsText')}
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Discount Amount (Rs.)</label>
                  <input
                    name="discount"
                    type="number"
                    className={`pro-input ${formErrors.discount ? 'input-error' : ''}`}
                    defaultValue={invoiceModal.data?.discount || 0}
                  />
                  {renderFieldError('discount')}
                </div>
                <div className="pro-field-group">
                  <label>Amount Paid Now (Rs.)</label>
                  <input
                    name="paidAmount"
                    type="number"
                    className={`pro-input ${formErrors.paidAmount ? 'input-error' : ''}`}
                    defaultValue={invoiceModal.data?.paidAmount ?? invoiceModal.data?.grandTotal ?? 0}
                  />
                  {renderFieldError('paidAmount')}
                </div>
              </div>

              <div className="pro-field-group">
                <label>Billing Notes</label>
                <input
                  name="notes"
                  className="pro-input"
                  defaultValue={invoiceModal.data?.notes || ''}
                  placeholder="Warranty terms or payment remarks..."
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => clearErrorsAndClose(setInvoiceModal, { open: false, data: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Issue Official Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Outstanding Balance Payment Modal */}
      {paymentModal.open && paymentModal.invoice && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 460 }}>
            <div className="admin-modal-header">
              <h3>Collect Payment — {paymentModal.invoice.invoiceNumber}</h3>
              <button
                type="button"
                onClick={() =>
                  clearErrorsAndClose(setPaymentModal, { open: false, invoice: null, amount: 0, method: 'Cash' })
                }
              >
                <CloseRounded />
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
              Customer: <strong>{paymentModal.invoice.customerName}</strong> ({paymentModal.invoice.vehicleNumber})
              <br />
              Outstanding Balance Due:{' '}
              <strong style={{ color: '#dc2626' }}>
                Rs. {Number(paymentModal.invoice.balanceDue).toLocaleString()}
              </strong>
            </p>
            <form onSubmit={handleRecordPaymentSubmit} noValidate>
              <div className="pro-field-group">
                <label>Payment Amount Received (Rs.) *</label>
                <input
                  type="number"
                  className={`pro-input ${formErrors.paymentAmount ? 'input-error' : ''}`}
                  value={paymentModal.amount}
                  onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                />
                {renderFieldError('paymentAmount')}
              </div>
              <div className="pro-field-group">
                <label>Payment Method</label>
                <select
                  className="pro-input"
                  value={paymentModal.method}
                  onChange={(e) => setPaymentModal({ ...paymentModal, method: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online / LankaQR">Online / LankaQR</option>
                </select>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() =>
                    clearErrorsAndClose(setPaymentModal, { open: false, invoice: null, amount: 0, method: 'Cash' })
                  }
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Confirm Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Receipt Modal */}
      {printInvoiceModal.open && printInvoiceModal.invoice && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 640 }}>
            <div className="admin-modal-header">
              <h3>Official Tax Invoice — {printInvoiceModal.invoice.invoiceNumber}</h3>
              <button
                type="button"
                onClick={() => setPrintInvoiceModal({ open: false, invoice: null })}
              >
                <CloseRounded />
              </button>
            </div>

            <div className="printable-invoice-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    <span style={{ color: '#0284c7' }}>Soapy</span>Ride Auto Care Center
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                    No. 247, Main Street, Colombo 03 • Tel: +94 11 234 5678
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#0284c7' }}>
                    {printInvoiceModal.invoice.invoiceNumber}
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Date:{' '}
                    {printInvoiceModal.invoice.issuedDate
                      ? new Date(printInvoiceModal.invoice.issuedDate).toLocaleDateString()
                      : new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <strong>Billed To:</strong> {printInvoiceModal.invoice.customerName}
                  <br />
                  <strong>Phone:</strong> {printInvoiceModal.invoice.customerPhone}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Vehicle Plate:</strong> {printInvoiceModal.invoice.vehicleNumber}
                  <br />
                  <strong>Job Card Ref:</strong> {printInvoiceModal.invoice.jobCardNumber || 'Direct Counter'}
                </div>
              </div>

              <table className="admin-table" style={{ marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(printInvoiceModal.invoice.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td>{item.itemType}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {Number(item.unitPrice).toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        Rs. {Number(item.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', fontSize: '0.9rem' }}>
                <div>
                  Subtotal: <strong>Rs. {Number(printInvoiceModal.invoice.subtotal).toLocaleString()}</strong>
                </div>
                {Number(printInvoiceModal.invoice.discount) > 0 && (
                  <div style={{ color: '#10b981' }}>
                    Discount: <strong>-Rs. {Number(printInvoiceModal.invoice.discount).toLocaleString()}</strong>
                  </div>
                )}
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Grand Total: Rs. {Number(printInvoiceModal.invoice.grandTotal).toLocaleString()}
                </div>
                <div style={{ color: '#059669' }}>
                  Paid ({printInvoiceModal.invoice.paymentMethod}): Rs.{' '}
                  {Number(printInvoiceModal.invoice.paidAmount).toLocaleString()}
                </div>
                <div style={{ color: Number(printInvoiceModal.invoice.balanceDue) > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                  Balance Due: Rs. {Number(printInvoiceModal.invoice.balanceDue).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={() => setPrintInvoiceModal({ open: false, invoice: null })}
              >
                Close
              </button>
              <button type="button" className="btn-primary-pro" onClick={() => window.print()}>
                <PrintRounded fontSize="small" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Registration Modal (Admin, Mechanic, Sales Person) */}
      {staffModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Register Staff Account (Admin, Mechanic, or Sales Person)</h3>
              <button
                type="button"
                onClick={() => clearErrorsAndClose(setStaffModal, { open: false, data: null })}
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveStaff} noValidate>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Full Name *</label>
                  <input
                    name="fullname"
                    className={`pro-input ${formErrors.fullname ? 'input-error' : ''}`}
                    placeholder="e.g. Dilshan Perera"
                  />
                  {renderFieldError('fullname')}
                </div>
                <div className="pro-field-group">
                  <label>Account Role *</label>
                  <select name="staffRole" className="pro-input" defaultValue="Admin">
                    <option value="Admin">Admin</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Sales Person">Sales Person</option>
                  </select>
                  {renderFieldError('staffRole')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Staff Login Email *</label>
                  <input
                    name="email"
                    type="email"
                    className={`pro-input ${formErrors.email ? 'input-error' : ''}`}
                    placeholder="staff@soapyride.com"
                  />
                  {renderFieldError('email')}
                </div>
                <div className="pro-field-group">
                  <label>Mobile Phone (10 Digits) *</label>
                  <input
                    name="phone"
                    className={`pro-input ${formErrors.phone ? 'input-error' : ''}`}
                    placeholder="0771234567"
                  />
                  {renderFieldError('phone')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Password (8+ chars, Upper, Lower, Number) *</label>
                  <input
                    name="password"
                    type="password"
                    className={`pro-input ${formErrors.password ? 'input-error' : ''}`}
                    placeholder="Enter strong password"
                  />
                  {renderFieldError('password')}
                </div>
                <div className="pro-field-group">
                  <label>Confirm Password *</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    className={`pro-input ${formErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter password"
                  />
                  {renderFieldError('confirmPassword')}
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Specializations (If Mechanic)</label>
                  <input
                    name="specializations"
                    className="pro-input"
                    placeholder="e.g. Engine, Brakes, Diagnostics"
                  />
                </div>
                <div className="pro-field-group">
                  <label>Assigned Bay (If Mechanic)</label>
                  <input
                    name="assignedBay"
                    className="pro-input"
                    placeholder="e.g. Bay 2 - Alignment"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => clearErrorsAndClose(setStaffModal, { open: false, data: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-pro">
                  Register Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
