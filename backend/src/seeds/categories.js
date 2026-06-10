require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  { name: 'Baches y vialidad', description: 'Daños en pavimento, baches, hundimientos', icon: '🚧', color: '#F59E0B' },
  { name: 'Alumbrado público', description: 'Lámparas fundidas o dañadas', icon: '💡', color: '#3B82F6' },
  { name: 'Robo o asalto', description: 'Reportes de robo o asalto en la vía pública', icon: '🚨', color: '#EF4444' },
  { name: 'Grafiti y vandalismo', description: 'Daño a propiedad pública o privada', icon: '🎨', color: '#8B5CF6' },
  { name: 'Basura y limpieza', description: 'Acumulación de basura o falta de recolección', icon: '🗑️', color: '#10B981' },
  { name: 'Fugas de agua', description: 'Fugas en tuberías o drenajes tapados', icon: '💧', color: '#06B6D4' },
  { name: 'Parques y espacios públicos', description: 'Daños en parques, bancas, juegos', icon: '🌳', color: '#22C55E' },
  { name: 'Otro', description: 'Cualquier otra incidencia urbana', icon: '📍', color: '#6B7280' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log(`Seeded ${categories.length} categories`);
  await mongoose.disconnect();
}

seed().catch(console.error);
