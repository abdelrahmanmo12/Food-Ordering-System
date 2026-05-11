// data/restaurants.js
export const RESTAURANTS = [
  {
    id: "rest_1",
    name: "Cairo Grill House",
    cuisine: "Egyptian",
    rating: 4.8,
    deliveryTime: { min: 25, max: 35 },
    minOrder: 80,
    image: "/imgs/cairo-grill.png",
    coverColor: "#3d1a00",
    isOpen: true,
    badge: "Popular",
    description: "Authentic Egyptian street food elevated to restaurant quality.",
    reviews: [], // { id: "rev_1", user: "Ahmed", rating: 5, comment: "Great food!", createdAt: "2026-04-16" }
    items: [
      { id: "item_101", name: "Koshary Deluxe", price: 55, // EGP
        category: "Mains", image: "/imgs/Koshary Deluxe.png", desc: "Lentils, rice, pasta with crispy onions & spiced tomato sauce" },
      { id: "item_102", name: "Hawawshi", price: 75, category: "Mains", image: "/imgs/Hawawshi.png", desc: "Spiced minced meat baked in crispy bread" },
      { id: "item_103", name: "Ful Medames Bowl", price: 45, category: "Mains", image: "/imgs/Ful Medames Bowl.png", desc: "Slow-cooked fava beans with olive oil & lemon" },
      { id: "item_104", name: "Baladi Salad", price: 40, category: "Salads", image: "/imgs/Baladi Salad.png", desc: "Fresh tomatoes, cucumber, herbs & tahini" },
      { id: "item_105", name: "Ayran", price: 25, category: "Drinks", image: "/imgs/Ayran.png", desc: "Chilled salted yogurt drink" },
      { id: "item_106", name: "Om Ali", price: 60, category: "Desserts", image: "/imgs/Om Ali.png", desc: "Classic Egyptian bread pudding with cream & nuts" },
    ]
  },
  {
    id: "rest_2",
    name: "Burger Republic",
    cuisine: "American",
    rating: 4.6,
    deliveryTime: { min: 20, max: 30 },
    minOrder: 60,
    image: "/imgs/burger-republic.png",
    coverColor: "#1a0a00",
    isOpen: true,
    badge: "New",
    description: "Smash-style burgers crafted with premium Angus beef.",
    reviews: [], // { id: "rev_2", user: "Sara", rating: 4, comment: "Great burgers.", createdAt: "2026-04-16" }
    items: [
      { id: "item_201", name: "Classic Smash", price: 90, // EGP
        category: "Burgers", image: "/imgs/Classic Smash.png", desc: "Double smash patty, American cheese, pickles, special sauce" },
      { id: "item_202", name: "BBQ Ranch Melt", price: 105, category: "Burgers", image: "/imgs/BBQ Ranch Melt.png", desc: "Bacon, cheddar, caramelized onions, BBQ ranch" },
      { id: "item_203", name: "Crispy Chicken", price: 85, category: "Burgers", image: "/imgs/Crispy Chicken.png", desc: "Southern-fried chicken thigh, coleslaw, hot honey" },
      { id: "item_204", name: "Loaded Fries", price: 55, category: "Sides", image: "/imgs/Loaded Fries.png", desc: "Crispy fries topped with cheese sauce & jalapeños" },
      { id: "item_205", name: "Onion Rings", price: 45, category: "Sides", image: "/imgs/Onion Rings.png", desc: "Beer-battered, golden, with chipotle mayo" },
      { id: "item_206", name: "Milkshake", price: 65, category: "Drinks", image: "/imgs/Milkshake.png", desc: "Thick shake: chocolate, vanilla, or strawberry" },
    ]
  },
  {
    id: "rest_3",
    name: "Sakura Sushi",
    cuisine: "Japanese",
    rating: 4.9,
    deliveryTime: { min: 30, max: 45 },
    minOrder: 120,
    image: "/imgs/sakura-sushi.png",
    coverColor: "#001a0e",
    isOpen: true,
    badge: "Top Rated",
    description: "Edo-style sushi with sustainably sourced fish.",
    reviews: [], // { id: "rev_3", user: "Lina", rating: 5, comment: "Excellent sushi.", createdAt: "2026-04-16" }
    items: [
      { id: "item_301", name: "Salmon Nigiri (2pc)", price: 85, // EGP
        category: "Nigiri", image: "/imgs/Salmon Nigiri (2pc).png", desc: "Fresh Atlantic salmon over seasoned sushi rice" },
      { id: "item_302", name: "Dragon Roll", price: 145, category: "Rolls", image: "/imgs/Dragon Roll.png", desc: "Shrimp tempura inside, avocado on top" },
      { id: "item_303", name: "Spicy Tuna Roll", price: 120, category: "Rolls", image: "/imgs/Spicy Tuna Roll.png", desc: "Diced tuna, cucumber, spicy mayo, sriracha" },
      { id: "item_304", name: "Edamame", price: 40, category: "Starters", image: "/imgs/Edamame.png", desc: "Steamed & salted young soybeans" },
      { id: "item_305", name: "Miso Soup", price: 30, category: "Starters", image: "/imgs/Miso Soup.png", desc: "Tofu, wakame seaweed, green onion in dashi broth" },
      { id: "item_306", name: "Matcha Ice Cream", price: 50, category: "Desserts", image: "/imgs/Matcha Ice Cream.png", desc: "House-made with ceremonial grade matcha" },
    ]
  },
  {
    id: "rest_4",
    name: "Pizza Palazzo",
    cuisine: "Italian",
    rating: 4.5,
    deliveryTime: { min: 25, max: 40 },
    minOrder: 70,
    image: "/imgs/pizza-palazzo.png",
    coverColor: "#1a001a",
    isOpen: false,
    badge: null,
    description: "Neapolitan-style pizzas baked in a wood-fired oven at 450°C.",
    reviews: [], // { id: "rev_4", user: "Omar", rating: 4, comment: "Great pizza.", createdAt: "2026-04-16" }
    items: [
      { id: "item_401", name: "Margherita Verace", price: 95, // EGP
        category: "Pizzas", image: "/imgs/Margherita Verace.png", desc: "San Marzano tomato, fior di latte, fresh basil, EVOO" },
      { id: "item_402", name: "Diavola", price: 115, category: "Pizzas", image: "/imgs/Diavola.png", desc: "Spicy Calabrian salami, smoked mozzarella, chili oil" },
      { id: "item_403", name: "Quattro Formaggi", price: 125, category: "Pizzas", image: "/imgs/Quattro Formaggi.png", desc: "Mozzarella, gorgonzola, pecorino, ricotta" },
      { id: "item_404", name: "Arancini", price: 60, category: "Starters", image: "/imgs/Arancini.png", desc: "Crispy rice balls stuffed with ragù & peas" },
      { id: "item_405", name: "Tiramisu", price: 70, category: "Desserts", image: "/imgs/Tiramisu.png", desc: "Classic with savoiardi, mascarpone & espresso" },
      { id: "item_406", name: "San Pellegrino", price: 30, category: "Drinks", image: "/imgs/San Pellegrino.png", desc: "Sparkling mineral water, 500ml" },
    ]
  },
]

export const STATUS_FLOW = ["placed", "confirmed", "preparing", "on_the_way", "delivered"]
export const STATUS_LABELS = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  on_the_way: "On the way",
  delivered: "Delivered",
}
export const STATUS_COLORS = {
  placed: "#6b6660",
  confirmed: "#5b8dd9",
  preparing: "#f5a623",
  on_the_way: "#9b59b6",
  delivered: "#4caf7d",
  Placed: "#6b6660",
  Confirmed: "#5b8dd9",
  Preparing: "#f5a623",
  "On the way": "#9b59b6",
  Delivered: "#4caf7d",
}
export const STATUS_EMOJI = {
  placed: "📋",
  confirmed: "✅",
  preparing: "👨‍🍳",
  on_the_way: "🚴",
  delivered: "🏠",
  Placed: "📋",
  Confirmed: "✅",
  Preparing: "👨‍🍳",
  "On the way": "🚴",
  Delivered: "🏠",
}

