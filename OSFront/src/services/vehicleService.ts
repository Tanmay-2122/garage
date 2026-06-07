import { api } from "@/lib/api";

export interface Vehicle {
  id?: number | string;
  vehicleNumber: string;
  customerId?: number | string;
  customer?: { id?: number | string; name?: string } | null;
  serviceDate?: string | null;
  nextServiceDate?: string | null;
}

export const vehicleService = {
  async list(): Promise<Vehicle[]> {
    const { data } = await api.get("/cars");
    return Array.isArray(data) ? data : [];
  },

  async search(query: string): Promise<Vehicle[]> {
    const { data } = await api.get("/cars/search", { params: { q: query } });
    return Array.isArray(data) ? data : [];
  },

  async create(payload: Vehicle): Promise<Vehicle> {
    const { data } = await api.post("/cars", {
      vehicleNumber: payload.vehicleNumber,
      customerId: payload.customerId,
    });
    return data;
  },

  async update(id: string | number, payload: Vehicle): Promise<Vehicle> {
    const { data } = await api.put(`/cars/${id}`, {
      vehicleNumber: payload.vehicleNumber,
      customerId: payload.customerId,
    });
    return data;
  },

  async remove(id: string | number): Promise<void> {
    await api.delete(`/cars/${id}`);
  },

  async markComplete(id: string | number): Promise<Vehicle> {
    const { data } = await api.post(`/cars/complete/${id}`);
    return data;
  },
};
