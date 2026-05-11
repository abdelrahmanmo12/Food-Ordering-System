export const PROMO_CODES = [
  {
    code: "WELCOME10",
    type: "percent", // percent | fixed | delivery
    value: 10,
    minOrder: 100,
    expiresAt: "2026-12-31"
  },
  {
    code: "SAVE50",
    type: "fixed",
    value: 50,
    minOrder: 200,
    expiresAt: "2026-06-01"
  },
  {
    code: "FREESHIP",
    type: "delivery",
    value: 0,
    minOrder: 80,
    expiresAt: "2027-01-01"
  }
];