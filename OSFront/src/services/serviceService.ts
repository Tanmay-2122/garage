import { api } from "@/lib/api";

export interface Service {
  id?: number | string;
  name: string;
  price: number;
}

export const serviceService = {
  async list(): Promise<Service[]> {
    const { data } = await api.get("/services");
    return Array.isArray(data) ? data : [];
  },

  async create(payload: Service): Promise<Service> {
    const { data } = await api.post("/services", {
      name: payload.name,
      price: Number(payload.price),
    });
    return data;
  },
};
