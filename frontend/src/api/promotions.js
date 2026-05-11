import { USE_MOCK_API } from "./config";
import { api } from "./client";
import { toApiError } from "./errors";

import * as mock from "../shared/api/mock/promotions";

export async function applyPromoCode(code, cartTotal) {
  try {
    if (USE_MOCK_API) return await mock.applyPromoCode(code, cartTotal);
    return await api.post("/promos/apply", { code, cartTotal });
  } catch (e) {
    throw toApiError(e);
  }
}

export async function applyOffers(cart) {
  try {
    if (USE_MOCK_API) return await mock.applyOffers(cart);
    return await api.post("/offers/apply", { cart });
  } catch (e) {
    throw toApiError(e);
  }
}

