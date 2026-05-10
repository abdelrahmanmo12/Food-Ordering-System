export const ORDER_STATUS = {
  Placed: "placed",
  Confirmed: "confirmed",
  Preparing: "preparing",
  OnTheWay: "on_the_way",
  Delivered: "delivered",
  Cancelled: "cancelled",

  // Backwards-compat alias (some older data may still store "prepared")
  Prepared: "prepared",
};

// Status flow defines valid transitions between order statuses
// Each key is a current status, and the array contains valid next statuses
export const STATUS_FLOW = {
  placed: ["confirmed"],
  confirmed: ["preparing"],
  preparing: ["on_the_way"],
  on_the_way: ["delivered"],
  delivered: [],
  cancelled: [],
};
