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
  LocalOfferRounded,
  PaidRounded,
  PrintRounded,
  DownloadRounded,
  SwapVertRounded,
  HistoryRounded,
  StarRounded,
  SpeedRounded,
  PhoneAndroidRounded,
  PersonRounded,
  CloseRounded,
  RefreshRounded,
  PlayArrowRounded
} from '@mui/icons-material';
import {
  FALLBACK_VEHICLES,
  FALLBACK_SERVICES,
  FALLBACK_MECHANICS,
  FALLBACK_APPOINTMENTS,
  FALLBACK_JOB_CARDS,
  FALLBACK_INVENTORY,
  FALLBACK_INVOICES
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

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

  // Filters
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState('All');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('All');
  const [appointmentFilter, setAppointmentFilter] = useState('All');
  const [jobCardFilter, setJobCardFilter] = useState('All');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');

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

    setSyncing(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [vRes, sRes, aRes, jcRes, mRes, invRes, billRes] = await Promise.all([
        axios.get(`${API_BASE}/vehicles`, { headers }),
        axios.get(`${API_BASE}/services`, { headers }),
        axios.get(`${API_BASE}/appointments`, { headers }),
        axios.get(`${API_BASE}/jobcards`, { headers }),
        axios.get(`${API_BASE}/mechanics`, { headers }),
        axios.get(`${API_BASE}/inventory`, { headers }),
        axios.get(`${API_BASE}/invoices`, { headers })
      ]);

      if (vRes.data?.data) setVehicles(vRes.data.data);
      if (sRes.data?.data) setServices(sRes.data.data);
      if (aRes.data?.data) setAppointments(aRes.data.data);
      if (jcRes.data?.data) setJobCards(jcRes.data.data);
      if (mRes.data?.data) setMechanics(mRes.data.data);
      if (invRes.data?.data) setInventory(invRes.data.data);
      if (billRes.data?.data) setInvoices(billRes.data.data);
    } catch {
      // Uses local synchronized state if backend is offline
    } finally {
      setSyncing(false);
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

  // ==========================================================================
  // 4. VEHICLE MANAGEMENT HANDLERS
  // ==========================================================================
  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      vehicleNumber: formData.get('vehicleNumber').toUpperCase().trim(),
      brand: formData.get('brand').trim(),
      model: formData.get('model').trim(),
      vehicleType: formData.get('vehicleType'),
      year: Number(formData.get('year')) || 2022,
      fuelType: formData.get('fuelType'),
      color: formData.get('color').trim(),
      mileage: Number(formData.get('mileage')) || 0,
      ownerName: formData.get('ownerName').trim(),
      ownerPhone: formData.get('ownerPhone').trim(),
      ownerEmail: formData.get('ownerEmail').trim(),
      ownerAddress: formData.get('ownerAddress').trim(),
      notes: formData.get('notes').trim()
    };

    const existing = vehicleModal.data;
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

  const handleDeleteVehicle = async (id, plate) => {
    setVehicles((prev) => prev.filter((v) => v._id !== id));
    try {
      await axios.delete(`${API_BASE}/vehicles/${id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Vehicle ${plate} removed from registry.`);
  };

  // ==========================================================================
  // 5. SERVICE MANAGEMENT HANDLERS
  // ==========================================================================
  const handleSaveService = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      serviceCode: formData.get('serviceCode').toUpperCase().trim(),
      name: formData.get('name').trim(),
      category: formData.get('category'),
      description: formData.get('description').trim(),
      price: Number(formData.get('price')) || 0,
      duration: formData.get('duration').trim(),
      warranty: formData.get('warranty').trim(),
      isActive: formData.get('isActive') === 'true'
    };

    const existing = serviceModal.data;
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

  const handleDeleteService = async (id, name) => {
    setServices((prev) => prev.filter((s) => s._id !== id));
    try {
      await axios.delete(`${API_BASE}/services/${id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Service "${name}" deleted.`);
  };

  // ==========================================================================
  // 6. APPOINTMENT MANAGEMENT HANDLERS
  // ==========================================================================
  const handleAppointmentAction = async (apt, updates, actionLabel) => {
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
    const payload = {
      name: formData.get('name').trim(),
      phone: formData.get('phone').trim(),
      vehicleNumber: formData.get('vehicleNumber').toUpperCase().trim(),
      vehicleType: formData.get('vehicleType'),
      washPackage: formData.get('washPackage'),
      date: formData.get('date'),
      time: formData.get('time'),
      estimatedPrice: Number(formData.get('estimatedPrice')) || 4500,
      assignedMechanic: formData.get('assignedMechanic'),
      approvalStatus: formData.get('approvalStatus') || 'Approved',
      status: formData.get('status') || 'Confirmed',
      notes: formData.get('notes') || '',
      adminNotes: formData.get('adminNotes') || ''
    };

    const existing = appointmentModal.data;
    try {
      if (existing?._id) {
        const res = await axios.put(`${API_BASE}/appointments/${existing._id}`, payload, {
          headers: getAuthHeaders()
        });
        setAppointments((prev) =>
          prev.map((a) => (a._id === existing._id ? res.data.data || { ...a, ...payload } : a))
        );
        toast.success('Appointment rescheduled / updated!');
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
        toast.success('Appointment rescheduled / updated!');
      } else {
        setAppointments((prev) => [{ _id: 'apt-' + Date.now(), ...payload }, ...prev]);
        toast.success('New service appointment scheduled!');
      }
    }
    setAppointmentModal({ open: false, data: null, isReschedule: false });
  };

  const handleConvertAppointmentToJobCard = (apt) => {
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
  // 7. JOB CARD MANAGEMENT HANDLERS
  // ==========================================================================
  const handleSaveJobCard = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const status = formData.get('status') || 'In Progress';
    const progressPercent = PROGRESS_BY_STATUS[status] || 50;

    // Parse tasks lines
    const rawTasks = formData.get('tasksText') || '';
    const tasks = rawTasks
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [desc, costStr] = line.split('|');
        return {
          description: desc.trim(),
          completed: status === 'Completed' || status === 'Delivered',
          cost: Number(costStr) || 0
        };
      });

    const laborCost = Number(formData.get('laborCost')) || 0;
    const tasksCost = tasks.reduce((s, t) => s + (t.cost || 0), 0);
    const existingParts = jobCardModal.data?.partsUsed || [];
    const partsCost = existingParts.reduce((s, p) => s + (p.quantity || 1) * (p.unitPrice || 0), 0);
    const estimatedTotal = Number(formData.get('estimatedTotal')) || tasksCost + partsCost + laborCost;

    const payload = {
      jobCardNumber: formData.get('jobCardNumber').trim(),
      vehicleNumber: formData.get('vehicleNumber').toUpperCase().trim(),
      vehicleModel: formData.get('vehicleModel').trim(),
      customerName: formData.get('customerName').trim(),
      customerPhone: formData.get('customerPhone').trim(),
      assignedMechanic: formData.get('assignedMechanic'),
      bayNumber: formData.get('bayNumber'),
      priority: formData.get('priority'),
      status,
      progressPercent,
      odometerReading: Number(formData.get('odometerReading')) || 0,
      estimatedCompletion: formData.get('estimatedCompletion').trim(),
      reportedIssues: formData.get('reportedIssues').trim(),
      tasks,
      partsUsed: existingParts,
      laborCost,
      estimatedTotal,
      technicianNotes: formData.get('technicianNotes').trim()
    };

    const existing = jobCardModal.data;
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
  // 8. MECHANIC MANAGEMENT HANDLERS
  // ==========================================================================
  const handleSaveMechanic = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const specs = formData
      .get('specializations')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      employeeId: formData.get('employeeId').toUpperCase().trim(),
      name: formData.get('name').trim(),
      phone: formData.get('phone').trim(),
      email: formData.get('email').trim(),
      specializations: specs.length ? specs : ['General Mechanical'],
      experienceYears: Number(formData.get('experienceYears')) || 3,
      availability: formData.get('availability'),
      assignedBay: formData.get('assignedBay').trim(),
      hourlyRate: Number(formData.get('hourlyRate')) || 1500,
      rating: Number(formData.get('rating')) || 4.8
    };

    const existing = mechanicModal.data;
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

  const handleDeleteMechanic = async (id, name) => {
    setMechanics((prev) => prev.filter((m) => m._id !== id));
    try {
      await axios.delete(`${API_BASE}/mechanics/${id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Mechanic ${name} removed.`);
  };

  // ==========================================================================
  // 9. INVENTORY MANAGEMENT & STOCK MOVEMENT HANDLERS
  // ==========================================================================
  const handleSaveInventoryPart = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      partCode: formData.get('partCode').toUpperCase().trim(),
      name: formData.get('name').trim(),
      category: formData.get('category'),
      brand: formData.get('brand').trim(),
      quantity: Number(formData.get('quantity')) || 0,
      unit: formData.get('unit').trim(),
      reorderLevel: Number(formData.get('reorderLevel')) || 5,
      costPrice: Number(formData.get('costPrice')) || 0,
      unitPrice: Number(formData.get('unitPrice')) || 0,
      supplierName: formData.get('supplierName').trim(),
      supplierPhone: formData.get('supplierPhone').trim(),
      supplierEmail: formData.get('supplierEmail').trim(),
      locationBin: formData.get('locationBin').trim()
    };

    const existing = inventoryModal.data;
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
    const quantity = Math.abs(Number(formData.get('quantity')) || 0);
    const reason = formData.get('reason').trim();
    const reference = formData.get('reference').trim();
    const performedBy = formData.get('performedBy').trim() || 'Shop Owner';

    if (type === 'OUT' && part.quantity < quantity) {
      toast.error(`Insufficient stock! Only ${part.quantity} ${part.unit} available.`);
      return;
    }

    const newQty =
      type === 'IN'
        ? part.quantity + quantity
        : type === 'OUT'
        ? Math.max(0, part.quantity - quantity)
        : quantity;

    const movementRecord = {
      type,
      quantity,
      reason: reason || (type === 'IN' ? 'Supplier Restock' : 'Issued to Workshop Bay'),
      reference: reference || 'MANUAL',
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

  const handleDeleteInventoryPart = async (id, code) => {
    setInventory((prev) => prev.filter((p) => p._id !== id));
    try {
      await axios.delete(`${API_BASE}/inventory/${id}`, { headers: getAuthHeaders() });
    } catch {
      // Removed locally
    }
    toast.info(`Part ${code} removed from inventory.`);
  };

  // ==========================================================================
  // 10. BILLING & PAYMENTS HANDLERS
  // ==========================================================================
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const rawLines = formData.get('itemsText') || '';
    const items = rawLines
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [desc, qtyStr, priceStr, typeStr] = line.split('|');
        const quantity = Number(qtyStr) || 1;
        const unitPrice = Number(priceStr) || 0;
        return {
          description: (desc || 'Service Item').trim(),
          itemType: (typeStr || 'Service').trim(),
          quantity,
          unitPrice,
          total: quantity * unitPrice
        };
      });

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const discount = Number(formData.get('discount')) || 0;
    const tax = Number(formData.get('tax')) || 0;
    const grandTotal = Math.max(0, subtotal - discount + tax);
    const paidAmount = Number(formData.get('paidAmount')) || 0;
    const balanceDue = Math.max(0, grandTotal - paidAmount);
    const paymentStatus =
      balanceDue <= 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';

    const payload = {
      invoiceNumber: formData.get('invoiceNumber').trim(),
      jobCardNumber: formData.get('jobCardNumber').trim(),
      customerName: formData.get('customerName').trim(),
      customerPhone: formData.get('customerPhone').trim(),
      vehicleNumber: formData.get('vehicleNumber').toUpperCase().trim(),
      items,
      subtotal,
      discount,
      tax,
      grandTotal,
      paidAmount,
      balanceDue,
      paymentMethod: formData.get('paymentMethod'),
      paymentStatus,
      notes: formData.get('notes').trim(),
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

    const addAmount = Number(paymentModal.amount) || 0;
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
  // COMPUTED METRICS & ANALYTICS (MODULE 11)
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

  // Sidebar Navigation Items
  const navModules = [
    { id: 'overview', label: 'Command Overview', icon: <DashboardRounded fontSize="small" /> },
    { id: 'vehicles', label: '4. Vehicle Management', icon: <DirectionsCarRounded fontSize="small" />, badge: vehicles.length },
    { id: 'services', label: '5. Service Management', icon: <BuildCircleRounded fontSize="small" />, badge: services.length },
    { id: 'appointments', label: '6. Appointments', icon: <EventAvailableRounded fontSize="small" />, badge: appointments.length },
    { id: 'jobcards', label: '7. Job Card Management', icon: <AssignmentRounded fontSize="small" />, badge: jobCards.length },
    { id: 'mechanics', label: '8. Mechanic Management', icon: <EngineeringRounded fontSize="small" />, badge: mechanics.length },
    {
      id: 'inventory',
      label: '9. Inventory & Parts',
      icon: <Inventory2Rounded fontSize="small" />,
      badge: lowStockParts.length > 0 ? `${lowStockParts.length} Low` : inventory.length,
      alert: lowStockParts.length > 0
    },
    { id: 'billing', label: '10. Billing & Payments', icon: <ReceiptLongRounded fontSize="small" />, badge: invoices.length },
    { id: 'reports', label: '11. Reports & Analytics', icon: <InsertChartRounded fontSize="small" /> }
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
              OWNER ADMIN ERP
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
            <span>Sign Out Owner</span>
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
              Logged in as <strong>{localStorage.getItem('userName') || 'Shop Owner'}</strong> • Live MERN Workshop Suite
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

            <button
              type="button"
              onClick={fetchAllAdminData}
              className="admin-action-chip"
              title="Sync with MongoDB Server"
            >
              <RefreshRounded sx={{ fontSize: 18 }} />
              <span>{syncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>
          </div>
        </header>

        <div className="admin-content-body">
          {/* ================================================================
              TAB 0: COMMAND OVERVIEW
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

              {/* Quick Module Launcher Grid (Features 4 to 11) */}
              <h3 className="admin-section-heading" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                Shop Owner Management Modules (4 – 11)
              </h3>
              <div className="admin-module-cards-grid">
                <div className="admin-module-tile" onClick={() => setActiveTab('vehicles')}>
                  <div className="tile-head">
                    <span className="tile-num">#4</span>
                    <DirectionsCarRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Vehicle Management</h4>
                  <p>Register vehicles, plate numbers, brand, model, mileage (km), and owner details.</p>
                  <span className="tile-cta">Manage {vehicles.length} Vehicles &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('services')}>
                  <div className="tile-head">
                    <span className="tile-num">#5</span>
                    <BuildCircleRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Service Management</h4>
                  <p>Create & manage service packages, categories, durations, warranties, and pricing.</p>
                  <span className="tile-cta">Manage {services.length} Services &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('appointments')}>
                  <div className="tile-head">
                    <span className="tile-num">#6</span>
                    <EventAvailableRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Appointment Management</h4>
                  <p>View, approve, reject, reschedule, and track live bay appointments.</p>
                  <span className="tile-cta">Manage {appointments.length} Bookings &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('jobcards')}>
                  <div className="tile-head">
                    <span className="tile-num">#7</span>
                    <AssignmentRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Job Card Management</h4>
                  <p>Create job cards, assign mechanics, log spare parts, and track repair progress.</p>
                  <span className="tile-cta">Track {jobCards.length} Job Cards &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('mechanics')}>
                  <div className="tile-head">
                    <span className="tile-num">#8</span>
                    <EngineeringRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Mechanic Management</h4>
                  <p>Manage mechanics, specializations, bay assignments, availability, and jobs.</p>
                  <span className="tile-cta">Manage {mechanics.length} Mechanics &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('inventory')}>
                  <div className="tile-head">
                    <span className="tile-num">#9</span>
                    <Inventory2Rounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Inventory Management</h4>
                  <p>Manage spare parts, stock levels, low-stock alerts, suppliers, and stock movements.</p>
                  <span className="tile-cta">Manage {inventory.length} Spare Parts &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('billing')}>
                  <div className="tile-head">
                    <span className="tile-num">#10</span>
                    <ReceiptLongRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Billing & Payments</h4>
                  <p>Generate invoices, apply discounts, record payments, and track outstanding balances.</p>
                  <span className="tile-cta">Manage {invoices.length} Invoices &rarr;</span>
                </div>

                <div className="admin-module-tile" onClick={() => setActiveTab('reports')}>
                  <div className="tile-head">
                    <span className="tile-num">#11</span>
                    <InsertChartRounded sx={{ color: '#0284c7' }} />
                  </div>
                  <h4>Reports & Analytics</h4>
                  <p>Daily/monthly revenue, service reports, inventory valuation, and mechanic performance.</p>
                  <span className="tile-cta">Open Analytics Suite &rarr;</span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 4: VEHICLE MANAGEMENT
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
                  onClick={() => setVehicleModal({ open: true, data: null })}
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
                      <th>Service Notes</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map((v) => (
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
                        <td style={{ maxWidth: 220, fontSize: '0.82rem', color: '#475569' }}>
                          {v.notes || '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-action-group">
                            <button
                              type="button"
                              className="icon-btn-sm blue"
                              title="Edit Vehicle / Update Mileage"
                              onClick={() => setVehicleModal({ open: true, data: v })}
                            >
                              <EditRounded fontSize="small" />
                            </button>
                            <button
                              type="button"
                              className="icon-btn-sm red"
                              title="Delete Vehicle"
                              onClick={() => handleDeleteVehicle(v._id, v.vehicleNumber)}
                            >
                              <DeleteOutlineRounded fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
              TAB 5: SERVICE MANAGEMENT
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
                  onClick={() => setServiceModal({ open: true, data: null })}
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
                            onClick={() => setServiceModal({ open: true, data: srv })}
                            title="Edit Service"
                          >
                            <EditRounded fontSize="small" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn-sm red"
                            onClick={() => handleDeleteService(srv._id, srv.name)}
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
              TAB 6: APPOINTMENT MANAGEMENT
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
                  onClick={() => setAppointmentModal({ open: true, data: null, isReschedule: false })}
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
                                onClick={() =>
                                  setAppointmentModal({ open: true, data: apt, isReschedule: true })
                                }
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
              TAB 7: JOB CARD MANAGEMENT
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
                  onClick={() => setJobCardModal({ open: true, data: null })}
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
                          onClick={() => setJobCardModal({ open: true, data: jc })}
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
              TAB 8: MECHANIC MANAGEMENT
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
                  onClick={() => setMechanicModal({ open: true, data: null })}
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
                          onClick={() => setMechanicModal({ open: true, data: mech })}
                          title="Edit Mechanic"
                        >
                          <EditRounded fontSize="small" />
                        </button>
                        <button
                          type="button"
                          className="icon-btn-sm red"
                          onClick={() => handleDeleteMechanic(mech._id, mech.name)}
                          title="Remove Mechanic"
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
              TAB 9: INVENTORY MANAGEMENT
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
                  onClick={() => setInventoryModal({ open: true, data: null })}
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
                                onClick={() => setStockMovementModal({ open: true, part })}
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
                                onClick={() => setInventoryModal({ open: true, data: part })}
                                title="Edit Spare Part"
                              >
                                <EditRounded fontSize="small" />
                              </button>
                              <button
                                type="button"
                                className="icon-btn-sm red"
                                onClick={() => handleDeleteInventoryPart(part._id, part.partCode)}
                                title="Delete Part"
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
              TAB 10: BILLING & PAYMENTS
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
                  onClick={() => setInvoiceModal({ open: true, data: null })}
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
                                onClick={() =>
                                  setPaymentModal({
                                    open: true,
                                    invoice: inv,
                                    amount: inv.balanceDue,
                                    method: inv.paymentMethod || 'Cash'
                                  })
                                }
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
              TAB 11: REPORTS & ANALYTICS
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
                {/* Monthly Revenue Chart */}
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

                {/* Daily Revenue Breakdown */}
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

              {/* Mechanic Performance & Inventory Valuation Reports */}
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
        </div>
      </div>

      {/* ====================================================================
          MODALS FOR ALL 8 MODULES
          ==================================================================== */}

      {/* 4. Vehicle Modal */}
      {vehicleModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{vehicleModal.data ? 'Edit Vehicle & Mileage' : 'Register New Vehicle'}</h3>
              <button type="button" onClick={() => setVehicleModal({ open: false, data: null })}>
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle}>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Vehicle Registration Plate *</label>
                  <input
                    name="vehicleNumber"
                    className="pro-input"
                    defaultValue={vehicleModal.data?.vehicleNumber || ''}
                    placeholder="e.g. WP CAB-4582"
                    required
                  />
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
                    className="pro-input"
                    defaultValue={vehicleModal.data?.brand || ''}
                    placeholder="e.g. Toyota, Honda, BMW"
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Vehicle Model *</label>
                  <input
                    name="model"
                    className="pro-input"
                    defaultValue={vehicleModal.data?.model || ''}
                    placeholder="e.g. Premio G Superior"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Current Mileage (km) *</label>
                  <input
                    name="mileage"
                    type="number"
                    className="pro-input"
                    defaultValue={vehicleModal.data?.mileage || 25000}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Fuel Type & Year</label>
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
                      className="pro-input"
                      defaultValue={vehicleModal.data?.year || 2021}
                      placeholder="Year"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Owner Full Name *</label>
                  <input
                    name="ownerName"
                    className="pro-input"
                    defaultValue={vehicleModal.data?.ownerName || ''}
                    placeholder="Customer Name"
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Owner Phone Number *</label>
                  <input
                    name="ownerPhone"
                    className="pro-input"
                    defaultValue={vehicleModal.data?.ownerPhone || ''}
                    placeholder="0771234567"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Owner Email</label>
                  <input
                    name="ownerEmail"
                    type="email"
                    className="pro-input"
                    defaultValue={vehicleModal.data?.ownerEmail || ''}
                    placeholder="customer@email.com"
                  />
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
                  onClick={() => setVehicleModal({ open: false, data: null })}
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

      {/* 5. Service Modal */}
      {serviceModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{serviceModal.data ? 'Edit Service Package' : 'Create New Service Package'}</h3>
              <button type="button" onClick={() => setServiceModal({ open: false, data: null })}>
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveService}>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Service Code *</label>
                  <input
                    name="serviceCode"
                    className="pro-input"
                    defaultValue={serviceModal.data?.serviceCode || `SRV-00${services.length + 1}`}
                    required
                  />
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
                  className="pro-input"
                  defaultValue={serviceModal.data?.name || ''}
                  placeholder="e.g. Full Synthetic Lube & Brake Service"
                  required
                />
              </div>

              <div className="pro-field-group">
                <label>Detailed Description *</label>
                <textarea
                  name="description"
                  rows={3}
                  className="pro-input"
                  defaultValue={serviceModal.data?.description || ''}
                  placeholder="Describe included treatments, parts, and inspections..."
                  required
                />
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Standard Price (Rs.) *</label>
                  <input
                    name="price"
                    type="number"
                    className="pro-input"
                    defaultValue={serviceModal.data?.price || 3500}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Estimated Duration</label>
                  <input
                    name="duration"
                    className="pro-input"
                    defaultValue={serviceModal.data?.duration || '60 mins'}
                    placeholder="e.g. 90 mins"
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Service Warranty</label>
                  <input
                    name="warranty"
                    className="pro-input"
                    defaultValue={serviceModal.data?.warranty || '30 Days Service Warranty'}
                  />
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
                  onClick={() => setServiceModal({ open: false, data: null })}
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

      {/* 6. Appointment / Reschedule Modal */}
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
                onClick={() => setAppointmentModal({ open: false, data: null, isReschedule: false })}
              >
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveAppointment}>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Customer Name *</label>
                  <input
                    name="name"
                    className="pro-input"
                    defaultValue={appointmentModal.data?.name || ''}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Phone Number *</label>
                  <input
                    name="phone"
                    className="pro-input"
                    defaultValue={appointmentModal.data?.phone || ''}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Vehicle Number Plate *</label>
                  <input
                    name="vehicleNumber"
                    className="pro-input"
                    defaultValue={appointmentModal.data?.vehicleNumber || ''}
                    placeholder="WP CAB-4582"
                    required
                  />
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
                    className="pro-input"
                    defaultValue={appointmentModal.data?.washPackage || 'Signature Detailing & Carnauba Wax Spa'}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Estimated Price (Rs.)</label>
                  <input
                    name="estimatedPrice"
                    type="number"
                    className="pro-input"
                    defaultValue={appointmentModal.data?.estimatedPrice || 4500}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Appointment Date *</label>
                  <input
                    name="date"
                    type="date"
                    className="pro-input"
                    defaultValue={
                      appointmentModal.data?.date
                        ? new Date(appointmentModal.data.date).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0]
                    }
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Bay Time Slot *</label>
                  <input
                    name="time"
                    type="time"
                    className="pro-input"
                    defaultValue={appointmentModal.data?.time || '10:00'}
                    required
                  />
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
                  onClick={() => setAppointmentModal({ open: false, data: null, isReschedule: false })}
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

      {/* 7. Job Card Modal */}
      {jobCardModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{jobCardModal.data?._id ? 'Update Job Card & Progress' : 'Create Workshop Job Card'}</h3>
              <button type="button" onClick={() => setJobCardModal({ open: false, data: null })}>
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveJobCard}>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Job Card Number *</label>
                  <input
                    name="jobCardNumber"
                    className="pro-input"
                    defaultValue={
                      jobCardModal.data?.jobCardNumber || `JC-2026-${Math.floor(100 + Math.random() * 900)}`
                    }
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Vehicle Number Plate *</label>
                  <input
                    name="vehicleNumber"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.vehicleNumber || ''}
                    placeholder="WP CAB-4582"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Vehicle Make & Model</label>
                  <input
                    name="vehicleModel"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.vehicleModel || ''}
                    placeholder="e.g. Toyota Premio"
                  />
                </div>
                <div className="pro-field-group">
                  <label>Odometer Reading (km)</label>
                  <input
                    name="odometerReading"
                    type="number"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.odometerReading || 55000}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Customer Name *</label>
                  <input
                    name="customerName"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.customerName || ''}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Customer Phone *</label>
                  <input
                    name="customerPhone"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.customerPhone || ''}
                    required
                  />
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
                <label>Reported Issues / Customer Instructions</label>
                <input
                  name="reportedIssues"
                  className="pro-input"
                  defaultValue={jobCardModal.data?.reportedIssues || ''}
                  placeholder="Describe symptoms or requested service..."
                />
              </div>

              <div className="pro-field-group">
                <label>Repair Tasks (One per line: Task Description | Cost in Rs.)</label>
                <textarea
                  name="tasksText"
                  rows={3}
                  className="pro-input"
                  defaultValue={
                    (jobCardModal.data?.tasks || [])
                      .map((t) => `${t.description} | ${t.cost || 0}`)
                      .join('\n') ||
                    'Full Synthetic Oil & Filter Service | 8500\nBrake Pad Inspection & Cleaning | 2500'
                  }
                />
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Technician Labor Charge (Rs.)</label>
                  <input
                    name="laborCost"
                    type="number"
                    className="pro-input"
                    defaultValue={jobCardModal.data?.laborCost || 2500}
                  />
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
                  onClick={() => setJobCardModal({ open: false, data: null })}
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

      {/* 8. Mechanic Modal */}
      {mechanicModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{mechanicModal.data ? 'Edit Mechanic Profile' : 'Register Workshop Mechanic'}</h3>
              <button type="button" onClick={() => setMechanicModal({ open: false, data: null })}>
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveMechanic}>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Employee ID *</label>
                  <input
                    name="employeeId"
                    className="pro-input"
                    defaultValue={mechanicModal.data?.employeeId || `MEC-00${mechanics.length + 1}`}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Full Name *</label>
                  <input
                    name="name"
                    className="pro-input"
                    defaultValue={mechanicModal.data?.name || ''}
                    placeholder="e.g. Kasun Bandara"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Mobile Phone *</label>
                  <input
                    name="phone"
                    className="pro-input"
                    defaultValue={mechanicModal.data?.phone || ''}
                    placeholder="0771234567"
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    className="pro-input"
                    defaultValue={mechanicModal.data?.email || ''}
                    placeholder="mechanic@soapyride.com"
                  />
                </div>
              </div>

              <div className="pro-field-group">
                <label>Technical Specializations (Comma-separated) *</label>
                <input
                  name="specializations"
                  className="pro-input"
                  defaultValue={
                    (mechanicModal.data?.specializations || []).join(', ') ||
                    'Engine & Transmission, OBD-II Diagnostics, Hybrid Systems'
                  }
                  required
                />
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Assigned Service Bay</label>
                  <input
                    name="assignedBay"
                    className="pro-input"
                    defaultValue={mechanicModal.data?.assignedBay || 'Bay 1 - Mechanical'}
                  />
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
                  <label>Experience (Years)</label>
                  <input
                    name="experienceYears"
                    type="number"
                    className="pro-input"
                    defaultValue={mechanicModal.data?.experienceYears || 5}
                  />
                </div>
                <div className="pro-field-group">
                  <label>Hourly Labor Rate (Rs.)</label>
                  <input
                    name="hourlyRate"
                    type="number"
                    className="pro-input"
                    defaultValue={mechanicModal.data?.hourlyRate || 1800}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => setMechanicModal({ open: false, data: null })}
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

      {/* 9A. Inventory Add/Edit Modal */}
      {inventoryModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{inventoryModal.data ? 'Edit Spare Part & Supplier' : 'Register New Spare Part'}</h3>
              <button type="button" onClick={() => setInventoryModal({ open: false, data: null })}>
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveInventoryPart}>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Part SKU / Code *</label>
                  <input
                    name="partCode"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.partCode || `PRT-00${inventory.length + 1}`}
                    required
                  />
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
                    className="pro-input"
                    defaultValue={inventoryModal.data?.name || ''}
                    placeholder="e.g. Mobil 1 5W-30 Synthetic (4L)"
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Manufacturer / Brand *</label>
                  <input
                    name="brand"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.brand || 'OEM Genuine'}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Current Stock Quantity *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      name="quantity"
                      type="number"
                      className="pro-input"
                      defaultValue={inventoryModal.data?.quantity ?? 15}
                      required
                    />
                    <input
                      name="unit"
                      className="pro-input"
                      defaultValue={inventoryModal.data?.unit || 'Units'}
                      placeholder="Units/Cans"
                    />
                  </div>
                </div>
                <div className="pro-field-group">
                  <label>Min Reorder Alert Level *</label>
                  <input
                    name="reorderLevel"
                    type="number"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.reorderLevel ?? 5}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Supplier Cost Price (Rs.) *</label>
                  <input
                    name="costPrice"
                    type="number"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.costPrice || 5000}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Customer Retail Price (Rs.) *</label>
                  <input
                    name="unitPrice"
                    type="number"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.unitPrice || 6800}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Supplier Company Name *</label>
                  <input
                    name="supplierName"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.supplierName || 'AutoLanka Distributors'}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Supplier Phone</label>
                  <input
                    name="supplierPhone"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.supplierPhone || '0112345678'}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Supplier Email</label>
                  <input
                    name="supplierEmail"
                    className="pro-input"
                    defaultValue={inventoryModal.data?.supplierEmail || 'orders@autolanka.lk'}
                  />
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
                  onClick={() => setInventoryModal({ open: false, data: null })}
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

      {/* 9B. Stock Movement (Stock IN / Stock OUT) Modal */}
      {stockMovementModal.open && stockMovementModal.part && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 500 }}>
            <div className="admin-modal-header">
              <h3>Record Stock Movement — {stockMovementModal.part.partCode}</h3>
              <button
                type="button"
                onClick={() => setStockMovementModal({ open: false, part: null })}
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
            <form onSubmit={handleRecordStockMovement}>
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
                    min="1"
                    className="pro-input"
                    defaultValue={5}
                    required
                  />
                </div>
              </div>

              <div className="pro-field-group">
                <label>Reference (PO Number or Job Card Number)</label>
                <input
                  name="reference"
                  className="pro-input"
                  placeholder="e.g. PO-2026-105 or JC-2026-101"
                />
              </div>

              <div className="pro-field-group">
                <label>Reason / Notes</label>
                <input
                  name="reason"
                  className="pro-input"
                  placeholder="e.g. Supplier delivery or Used for brake replacement"
                />
              </div>

              <div className="pro-field-group">
                <label>Recorded By</label>
                <input name="performedBy" className="pro-input" defaultValue="Shop Owner / Admin" />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => setStockMovementModal({ open: false, part: null })}
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

      {/* 9C. Stock Movement History Modal */}
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

      {/* 10A. Generate Invoice Modal */}
      {invoiceModal.open && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Generate Customer Invoice & Payment Record</h3>
              <button type="button" onClick={() => setInvoiceModal({ open: false, data: null })}>
                <CloseRounded />
              </button>
            </div>
            <form onSubmit={handleSaveInvoice}>
              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Invoice Number *</label>
                  <input
                    name="invoiceNumber"
                    className="pro-input"
                    defaultValue={
                      invoiceModal.data?.invoiceNumber ||
                      `INV-2026-${Math.floor(100 + Math.random() * 900)}`
                    }
                    required
                  />
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
                    className="pro-input"
                    defaultValue={invoiceModal.data?.customerName || ''}
                    required
                  />
                </div>
                <div className="pro-field-group">
                  <label>Customer Phone *</label>
                  <input
                    name="customerPhone"
                    className="pro-input"
                    defaultValue={invoiceModal.data?.customerPhone || ''}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Vehicle Number Plate *</label>
                  <input
                    name="vehicleNumber"
                    className="pro-input"
                    defaultValue={invoiceModal.data?.vehicleNumber || ''}
                    placeholder="WP CAB-4582"
                    required
                  />
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
                <label>Invoice Line Items (Format: Description | Qty | Unit Price | Type)</label>
                <textarea
                  name="itemsText"
                  rows={4}
                  className="pro-input"
                  defaultValue={
                    invoiceModal.data?.items
                      ? invoiceModal.data.items
                          .map((i) => `${i.description} | ${i.quantity} | ${i.unitPrice} | ${i.itemType}`)
                          .join('\n')
                      : 'Full Mechanical & Lube Service | 1 | 11500 | Service\nMobil 1 Synthetic Oil Filter | 1 | 2800 | Part'
                  }
                  required
                />
              </div>

              <div className="form-grid-2col">
                <div className="pro-field-group">
                  <label>Discount Amount (Rs.)</label>
                  <input
                    name="discount"
                    type="number"
                    className="pro-input"
                    defaultValue={invoiceModal.data?.discount || 0}
                  />
                </div>
                <div className="pro-field-group">
                  <label>Amount Paid Now (Rs.)</label>
                  <input
                    name="paidAmount"
                    type="number"
                    className="pro-input"
                    defaultValue={invoiceModal.data?.paidAmount ?? invoiceModal.data?.grandTotal ?? 0}
                  />
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
                  onClick={() => setInvoiceModal({ open: false, data: null })}
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

      {/* 10B. Record Outstanding Balance Payment Modal */}
      {paymentModal.open && paymentModal.invoice && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card" style={{ maxWidth: 460 }}>
            <div className="admin-modal-header">
              <h3>Collect Payment — {paymentModal.invoice.invoiceNumber}</h3>
              <button
                type="button"
                onClick={() => setPaymentModal({ open: false, invoice: null, amount: 0, method: 'Cash' })}
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
            <form onSubmit={handleRecordPaymentSubmit}>
              <div className="pro-field-group">
                <label>Payment Amount Received (Rs.) *</label>
                <input
                  type="number"
                  className="pro-input"
                  value={paymentModal.amount}
                  onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                  max={paymentModal.invoice.balanceDue}
                  min={1}
                  required
                />
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
                  onClick={() => setPaymentModal({ open: false, invoice: null, amount: 0, method: 'Cash' })}
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

      {/* 10C. Printable Invoice Receipt Modal */}
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
    </div>
  );
};

export default AdminDashboard;
