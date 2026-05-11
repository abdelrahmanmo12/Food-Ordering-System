

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Get All Audit Logs ───

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs", "all"],
    queryFn: async () => {
      try {
        return await api.get("/api/audit-logs");
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Get Audit Logs by Phone ───

export function useAuditLogsByPhone(phone) {
  return useQuery({
    queryKey: ["audit-logs", "phone", phone],
    enabled: !!phone,
    queryFn: async () => {
      try {
        return await api.get(`/api/audit-logs/phone/${encodeURIComponent(phone)}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Get Audit Logs by Order Number ───

export function useAuditLogsByOrder(orderNumber) {
  return useQuery({
    queryKey: ["audit-logs", "order", orderNumber],
    enabled: !!orderNumber,
    queryFn: async () => {
      try {
        return await api.get(`/api/audit-logs/order/${encodeURIComponent(orderNumber)}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}