import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import { initialProducts } from './data/productsData.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shveraa';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Connected. Clearing existing products...');
    await Product.deleteMany({});

    // Strip custom _id so MongoDB generates valid ObjectIds, but keep custom slugs
    const productsToInsert = initialProducts.map((p) => {
      const { _id, ...rest } = p;
      return rest;
    });

    console.log(`Inserting ${productsToInsert.length} jewellery products...`);
    const inserted = await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${inserted.length} products into Shveraa database!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
