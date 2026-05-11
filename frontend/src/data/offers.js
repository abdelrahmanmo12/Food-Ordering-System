export const OFFERS = {
  "rest_2": [
    {
      id: "br-1",
      name: "Classic Smash Combo",
      description: "Classic Smash burger with crispy fries and your choice of refreshing drink",
      image: "../imgs/offers/burger republic offers/classic smash combo.png",
      originalPrice: 150,
      discountedPrice: 120,
      items: ["Classic Smash", "Fries", "Drink"],
      options: {
        drink: {
          label: "Choose Drink",
          choices: ["Cola", "Pepsi", "Sprite", "Fanta Orange", "Fanta Grape", "7UP", "Iced Tea", "Lemonade"],
          required: true
        }
      }
    },
    {
      id: "br-2",
      name: "BBQ Ranch Melt Combo",
      description: "Crispy onion rings with smoky BBQ Ranch Melt sandwich and your choice of drink",
      image: "../imgs/offers/burger republic offers/BBQ Ranch Melt combo.png",
      originalPrice: 190,
      discountedPrice: 130,
      items: ["Onion Rings", "BBQ Ranch Melt", "Drink"],
      options: {
        drink: {
          label: "Choose Drink",
          choices: ["Cola", "Pepsi", "Sprite", "Fanta Orange", "Fanta Grape", "7UP", "Iced Tea", "Lemonade"],
          required: true
        }
      }
    },
    {
      id: "br-3",
      name: "Double Shake Deal",
      description: "Two delicious milkshakes - choose your favorite flavors for each",
      image: "../imgs/offers/burger republic offers/double shake deal.png",
      originalPrice: 130,
      discountedPrice: 90,
      items: ["Milkshake", "Milkshake"],
      options: {
        milkshake1: {
          label: "First Milkshake Flavor",
          choices: ["Chocolate", "Strawberry", "Oreo", "Vanilla", "Caramel", "Pistachio", "Mango", "Cookies & Cream"],
          required: true
        },
        milkshake2: {
          label: "Second Milkshake Flavor",
          choices: ["Chocolate", "Strawberry", "Oreo", "Vanilla", "Caramel", "Pistachio", "Mango", "Cookies & Cream"],
          required: true
        }
      }
    }
  ],
  "rest_3": [
    {
      id: "ss-1",
      name: "Nigiri & Roll Combo",
      description: "Fresh Salmon Nigiri paired with Dragon Roll - a perfect Japanese combination",
      image: "../imgs/offers/Sakura Sushi offers/Nigri & roll combo.png",
      originalPrice: 230,
      discountedPrice: 185,
      items: ["Salmon Nigiri", "Dragon Roll"]
    },
    {
      id: "ss-2",
      name: "Spicy Tuna Platter",
      description: "Fiery Spicy Tuna Roll with soothing Miso Soup for the perfect balance",
      image: "../imgs/offers/Sakura Sushi offers/spicy tuna platter Spicy.png",
      originalPrice: 200,
      discountedPrice: 150,
      items: ["Spicy Tuna Roll", "Miso Soup"]
    },
    {
      id: "ss-3",
      name: "Matcha Dessert Duo",
      description: "Creamy Matcha Ice Cream with delicate Matcha Mochi for a sweet finish",
      image: "../imgs/offers/Sakura Sushi offers/matcha dessert duo.png",
      originalPrice: 100,
      discountedPrice: 70,
      items: ["Matcha Ice Cream", "Matcha Mochi"]
    }
  ],
  "rest_4": [
    {
      id: "pp-1",
      name: "Classic Pizza Combo",
      description: "Delicate Margherita and spicy Diavola pizza - two iconic Italian favorites",
      image: "../imgs/offers/Pizza Palazzo  offer/Classic Pizza Combo.png",
      originalPrice: 210,
      discountedPrice: 165,
      items: ["Margherita Pizza", "Diavola Pizza"]
    },
    {
      id: "pp-2",
      name: "Family Pizza Feast",
      description: "Rich Quattro Formaggi pizza with crispy Arancini and San Pellegrino",
      image: "../imgs/offers/Pizza Palazzo  offer/Family Pizza Feast.png",
      originalPrice: 285,
      discountedPrice: 215,
      items: ["Quattro Formaggi Pizza", "Arancini", "San Pellegrino"]
    },
    {
      id: "pp-3",
      name: "Dolce Duo Deal",
      description: "Heavenly Tiramisu with golden Zeppole - pure Italian sweetness",
      image: "../imgs/offers/Pizza Palazzo  offer/Dolce Duo Deal.png",
      originalPrice: 140,
      discountedPrice: 100,
      items: ["Tiramisu", "Zeppole"]
    }
  ],
  "rest_1": [
    {
      id: "cgh-1",
      name: "Koshary Deluxe Combo",
      description: "Hearty Koshary bowl packed with rice, pasta, and lentils plus refreshing Ayran",
      image: "../imgs/offers/Cairo Grill House offer/Koshary Deluxe Combo.png",
      originalPrice: 80,
      discountedPrice: 50,
      items: ["Koshary Bowl", "Ayran"]
    },
    {
      id: "cgh-2",
      name: "Hawawshi Meal Deal",
      description: "Savory Hawawshi stuffed with seasoned meat, creamy Om Ali dessert, and Ayran",
      image: "../imgs/offers/Cairo Grill House offer/Hawawshi Meal Deal.png",
      originalPrice: 160,
      discountedPrice: 125,
      items: ["Hawawshi", "Om Ali", "Ayran"]
    },
    {
      id: "cgh-3",
      name: "Om Ali Dessert Tray",
      description: "Classic Om Ali dessert - pure indulgence with cream and caramel",
      image: "../imgs/offers/Cairo Grill House offer/Om Ali Dessert Tray.png",
      originalPrice: 80,
      discountedPrice: 40,
      items: ["Om Ali"]
    }
  ]
};

// Make OFFERS globally accessible for owner management
if (typeof window !== 'undefined') {
  window.OFFERS = OFFERS;
}
