import { api } from "@/lib/api";

export interface Invoice {
  id?: number | string;
  customerId?: number | string;
  customer?: { id?: number | string; name?: string } | null;
  serviceIds?: (number | string)[];
  totalAmount: number;
  total?: number;
  createdAt?: string;
}

export interface CreateInvoicePayload {
  customerId: number | string;
  serviceIds: (number | string)[];
  totalAmount: number;
}

export const invoiceService = {
  async list(): Promise<Invoice[]> {
    const { data } = await api.get("/invoice");
    return Array.isArray(data) ? data : [];
  },

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    const { data } = await api.post("/invoice", payload);
    return data;
  },
};
