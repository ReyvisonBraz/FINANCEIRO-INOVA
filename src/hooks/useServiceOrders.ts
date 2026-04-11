import { useCallback } from 'react';
import { useServiceOrderStore } from '../store/useServiceOrderStore';
import { useFilterStore } from '../store/useFilterStore';
import { supabase } from '../lib/supabase';

export const useServiceOrders = () => {
  const {
    serviceOrders, setServiceOrders,
    serviceOrdersPage, setServiceOrdersPage,
    serviceOrderStatuses, setServiceOrderStatuses,
    equipmentTypes, setEquipmentTypes,
    brands, setBrands,
    models, setModels
  } = useServiceOrderStore();

  const { 
    osSearchTerm,
    osStatusFilter,
    osPriorityFilter,
    osSortBy,
    osDateFilter
  } = useFilterStore();

  const fetchServiceOrders = useCallback(async (page?: number, search?: string, status?: string, priority?: string, sortBy?: string, dateFilter?: string) => {
    const targetPage = page !== undefined ? page : serviceOrdersPage;
    const targetSearch = search !== undefined ? search : osSearchTerm;
    const targetStatus = status !== undefined ? status : osStatusFilter;
    const targetPriority = priority !== undefined ? priority : osPriorityFilter;
    const targetSortBy = sortBy !== undefined ? sortBy : osSortBy;
    const targetDateFilter = dateFilter !== undefined ? dateFilter : osDateFilter;

    try {
      let query = supabase
        .from('service_orders')
        .select('*')
        .range((targetPage - 1) * 20, targetPage * 20 - 1);

      if (targetSearch) {
        query = query.or(
          `id.ilike.%${targetSearch}%,equipment_brand.ilike.%${targetSearch}%,equipment_model.ilike.%${targetSearch}%,equipment_type.ilike.%${targetSearch}%,customer.first_name.ilike.%${targetSearch}%,customer.last_name.ilike.%${targetSearch}%`
        );
      }

      if (targetStatus && targetStatus !== 'all') {
        query = query.eq('status', targetStatus);
      }

      if (targetPriority && targetPriority !== 'all') {
        query = query.eq('priority', targetPriority);
      }

      if (targetSortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (targetSortBy === 'priority') {
        query = query.order('priority', { ascending: true }).order('created_at', { ascending: false });
      } else if (targetSortBy === 'prediction') {
        query = query.order('analysis_prediction', { ascending: true }).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const mapped = (data || []).map((o: any) => ({
        id: o.id,
        customerId: o.customer_id,
        firstName: o.customer?.first_name,
        lastName: o.customer?.last_name,
        phone: o.customer?.phone,
        equipmentType: o.equipment_type,
        equipmentBrand: o.equipment_brand,
        equipmentModel: o.equipment_model,
        equipmentColor: o.equipment_color,
        equipmentSerial: o.equipment_serial,
        reportedProblem: o.reported_problem,
        arrivalPhotoUrl: o.arrival_photo_url,
        arrivalPhotoBase64: o.arrival_photo_base64,
        status: o.status,
        technicalAnalysis: o.technical_analysis,
        servicesPerformed: o.services_performed,
        services: typeof o.services === 'string' ? JSON.parse(o.services || '[]') : (o.services || []),
        partsUsed: typeof o.parts_used === 'string' ? JSON.parse(o.parts_used || '[]') : (o.parts_used || []),
        serviceFee: o.service_fee,
        totalAmount: o.total_amount,
        finalObservations: o.final_observations,
        entryDate: o.entry_date,
        analysisPrediction: o.analysis_prediction,
        customerPassword: o.customer_password,
        accessories: o.accessories,
        ramInfo: o.ram_info,
        ssdInfo: o.ssd_info,
        priority: o.priority,
        createdAt: o.created_at,
        createdBy: o.created_by,
        updatedBy: o.updated_by
      }));
      
      setServiceOrders({ 
        data: mapped, 
        meta: { 
          total: count || 0, 
          page: targetPage, 
          limit: 20, 
          totalPages: Math.ceil((count || 0) / 20),
          counts: {}
        }
      });
    } catch (err) {
      console.error("Failed to fetch service orders", err);
      throw err;
    }
  }, [serviceOrdersPage, osSearchTerm, osStatusFilter, osPriorityFilter, osSortBy, setServiceOrders]);

  const fetchServiceOrderStatuses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('service_order_statuses')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      setServiceOrderStatuses(data || []);
    } catch (err) {
      console.error("Failed to fetch service order statuses", err);
      throw err;
    }
  }, [setServiceOrderStatuses]);

  const fetchEquipmentTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setEquipmentTypes(data || []);
    } catch (err) {
      console.error("Failed to fetch equipment types", err);
      throw err;
    }
  }, [setEquipmentTypes]);

  const fetchBrands = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setBrands(data || []);
    } catch (err) {
      console.error("Failed to fetch brands", err);
      throw err;
    }
  }, [setBrands]);

  const fetchModels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setModels(data || []);
    } catch (err) {
      console.error("Failed to fetch models", err);
      throw err;
    }
  }, [setModels]);

  const saveServiceOrderAPI = useCallback(async (order: any, id?: number): Promise<{ id: number } | null> => {
    const mapped = {
      customer_id: order.customerId,
      equipment_type: order.equipmentType,
      equipment_brand: order.equipmentBrand,
      equipment_model: order.equipmentModel,
      equipment_color: order.equipmentColor,
      equipment_serial: order.equipmentSerial,
      reported_problem: order.reportedProblem,
      arrival_photo_url: order.arrivalPhotoUrl,
      arrival_photo_base64: order.arrivalPhotoBase64,
      status: order.status || 'Aguardando Análise',
      entry_date: order.entryDate,
      analysis_prediction: order.analysisPrediction,
      customer_password: order.customerPassword,
      accessories: order.accessories,
      ram_info: order.ramInfo,
      ssd_info: order.ssdInfo,
      priority: order.priority || 'medium',
      technical_analysis: order.technicalAnalysis,
      services_performed: order.servicesPerformed,
      services: typeof order.services === 'string' ? order.services : JSON.stringify(order.services || []),
      parts_used: typeof order.partsUsed === 'string' ? order.partsUsed : JSON.stringify(order.partsUsed || []),
      service_fee: order.serviceFee,
      total_amount: order.totalAmount,
      final_observations: order.finalObservations,
      created_by: order.createdBy,
      updated_by: order.updatedBy
    };
    
    if (id) {
      const { error } = await supabase
        .from('service_orders')
        .update(mapped)
        .eq('id', id);
      if (error) throw error;
      return { id };
    } else {
      const { data, error } = await supabase
        .from('service_orders')
        .insert([mapped])
        .select('id')
        .single();
      if (error) throw error;
      return data ? { id: data.id } : null;
    }
  }, []);

  const deleteServiceOrderAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('service_orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const addServiceOrderStatusAPI = useCallback(async (status: any) => {
    const { error } = await supabase
      .from('service_order_statuses')
      .insert([{ name: status.name, color: status.color, priority: status.priority, is_default: status.isDefault ? 1 : 0 }]);
    if (error) throw error;
  }, []);

  const deleteServiceOrderStatusAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('service_order_statuses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const addEquipmentTypeAPI = useCallback(async (name: string, icon?: string) => {
    const { error } = await supabase
      .from('equipment_types')
      .insert([{ name, icon }]);
    if (error) throw error;
  }, []);

  const deleteEquipmentTypeAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('equipment_types')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const addBrandAPI = useCallback(async (name: string, equipmentType: string) => {
    const { error } = await supabase
      .from('brands')
      .insert([{ name, equipment_type: equipmentType }]);
    if (error) throw error;
  }, []);

  const deleteBrandAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  const addModelAPI = useCallback(async (brandId: number, name: string) => {
    const { error } = await supabase
      .from('models')
      .insert([{ brand_id: brandId, name }]);
    if (error) throw error;
  }, []);

  const deleteModelAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('models')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  return {
    serviceOrders,
    serviceOrdersPage,
    setServiceOrdersPage,
    serviceOrderStatuses,
    equipmentTypes,
    brands,
    models,
    fetchServiceOrders,
    fetchServiceOrderStatuses,
    fetchEquipmentTypes,
    fetchBrands,
    fetchModels,
    saveServiceOrderAPI,
    deleteServiceOrderAPI,
    addServiceOrderStatusAPI,
    deleteServiceOrderStatusAPI,
    addEquipmentTypeAPI,
    deleteEquipmentTypeAPI,
    addBrandAPI,
    deleteBrandAPI,
    addModelAPI,
    deleteModelAPI
  };
};
