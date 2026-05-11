export const ORDER_STATUS = {
  Placed: "placed",
  Confirmed: "confirmed",
  Preparing: "preparing",
  OnTheWay: "on_the_way",
  Delivered: "delivered",
  Cancelled: "cancelled",

  Prepared: "prepared",
};

export const STATUS_FLOW = {
  placed: ["confirmed"],
  confirmed: ["preparing"],
  preparing: ["on_the_way"],
  on_the_way: ["delivered"],
  delivered: [],
  cancelled: [],
};
