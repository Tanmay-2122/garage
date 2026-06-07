import { api } from "@/lib/api";

export interface Customer {
  id?: number | string;
  name: string;
  email: string;
  phone: string;
}

export const customerService = {
  async list(): Promise<Customer[]> {
    const { data } = await api.get("/customers");
    return Array.isArray(data) ? data : [];
  },

  async search(query: string): Promise<Customer[]> {
    const { data } = await api.get("/customers/search", { params: { q: query } });
    return Array.isArray(data) ? data : [];
  },

  async get(id: string | number): Promise<Customer> {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  async create(payload: Customer): Promise<Customer> {
    const { data } = await api.post("/customers", payload);
    return data;
  },

  async update(id: string | number, payload: Customer): Promise<Customer> {
    const { data } = await api.put(`/customers/${id}`, payload);
    return data;
  },

  async remove(id: string | number): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
