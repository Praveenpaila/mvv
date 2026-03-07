import tomato from "./tomato.png";
import potato from "./potato.png";
import onion from "./onion.png";
import carrot from "./carrot.png";
import cabbage from "./cabbage.png";
import cauliflower from "./cauliflower.png";
import greenChilli from "./greenchilli.png";
import ginger from "./ginger.png";
import garlic from "./garlic.png";
import beetroot from "./beetroot.png";
import mkLogo from "./mkLogo.png";

import Upload from "./upload_area.png";

import vegCat from "./categories/vegetables.png";
import fruitsCat from "./categories/fruits.png";
import dairyCat from "./categories/dairy.png";
import bakeryCat from "./categories/bakery.png";
import beveragesCat from "./categories/beverages.png";
import snacksCat from "./categories/snacks.png";
import grainsCat from "./categories/grains.png";
import dryCat from "./categories/dry.png";
import spicesCat from "./categories/spices.png";
import householdCat from "./categories/household.png";

export const asset = {
  mkLogo,
  Upload,
};

export const categories = [
  { id: "cat-01", name: "Vegetables", image: vegCat },
  { id: "cat-02", name: "Fruits", image: fruitsCat },
  { id: "cat-03", name: "Dairy & Eggs", image: dairyCat },
  { id: "cat-04", name: "Bakery", image: bakeryCat },
  { id: "cat-05", name: "Beverages", image: beveragesCat },
  { id: "cat-06", name: "Snacks", image: snacksCat },
  { id: "cat-07", name: "Rice & Grains", image: grainsCat },
  { id: "cat-08", name: "Dry Fruits", image: dryCat },
  { id: "cat-09", name: "Masala & Spices", image: spicesCat },
  { id: "cat-10", name: "Household Essentials", image: householdCat },
];

export const products = [
  {
    id: "fv-001",
    cat_id: "cat-01",
    name: "Tomato",
    image: tomato,
    packSize: "1 kg",
    price: 40,
    mrp: 45,
    stock: 100,
    rating: 4.3,
    reviewsCount: 128,
    discountPercentage: 11,
    deliveryTime: "10–20 mins",
    description: "Fresh farm tomatoes",
  },
  {
    id: "fv-002",
    cat_id: "cat-01",
    name: "Potato",
    image: potato,
    packSize: "1 kg",
    price: 30,
    mrp: 35,
    stock: 150,
    rating: 4.4,
    reviewsCount: 210,
    discountPercentage: 14,
    deliveryTime: "10–20 mins",
    description: "Fresh potatoes",
  },
  {
    id: "fv-003",
    cat_id: "cat-01",
    name: "Onion",
    image: onion,
    packSize: "1 kg",
    price: 35,
    mrp: 40,
    stock: 180,
    rating: 4.5,
    reviewsCount: 260,
    discountPercentage: 12,
    deliveryTime: "10–20 mins",
    description: "Fresh red onions",
  },
  {
    id: "fv-004",
    cat_id: "cat-01",
    name: "Carrot",
    image: carrot,
    packSize: "500 g",
    price: 25,
    mrp: 30,
    stock: 90,
    rating: 4.2,
    reviewsCount: 98,
    discountPercentage: 16,
    deliveryTime: "10–20 mins",
    description: "Crunchy carrots",
  },
  {
    id: "fv-005",
    cat_id: "cat-01",
    name: "Cabbage",
    image: cabbage,
    packSize: "1 piece",
    price: 35,
    mrp: 40,
    stock: 60,
    rating: 4.1,
    reviewsCount: 72,
    discountPercentage: 12,
    deliveryTime: "10–20 mins",
    description: "Fresh cabbage",
  },
  {
    id: "fv-006",
    cat_id: "cat-01",
    name: "Cauliflower",
    image: cauliflower,
    packSize: "1 piece",
    price: 45,
    mrp: 55,
    stock: 55,
    rating: 4.3,
    reviewsCount: 81,
    discountPercentage: 18,
    deliveryTime: "10–20 mins",
    description: "Fresh cauliflower",
  },
  {
    id: "fv-007",
    cat_id: "cat-01",
    name: "Green Chilli",
    image: greenChilli,
    packSize: "250 g",
    price: 20,
    mrp: 25,
    stock: 70,
    rating: 4.2,
    reviewsCount: 66,
    discountPercentage: 20,
    deliveryTime: "10–20 mins",
    description: "Spicy green chillies",
  },
  {
    id: "fv-008",
    cat_id: "cat-01",
    name: "Ginger",
    image: ginger,
    packSize: "250 g",
    price: 30,
    mrp: 35,
    stock: 65,
    rating: 4.4,
    reviewsCount: 92,
    discountPercentage: 14,
    deliveryTime: "10–20 mins",
    description: "Fresh ginger",
  },
  {
    id: "fv-009",
    cat_id: "cat-01",
    name: "Garlic",
    image: garlic,
    packSize: "250 g",
    price: 28,
    mrp: 32,
    stock: 80,
    rating: 4.5,
    reviewsCount: 134,
    discountPercentage: 12,
    deliveryTime: "10–20 mins",
    description: "Fresh garlic",
  },
  {
    id: "fv-010",
    cat_id: "cat-01",
    name: "Beetroot",
    image: beetroot,
    packSize: "500 g",
    price: 35,
    mrp: 40,
    stock: 50,
    rating: 4.1,
    reviewsCount: 59,
    discountPercentage: 12,
    deliveryTime: "10–20 mins",
    description: "Fresh beetroot",
  },
];
