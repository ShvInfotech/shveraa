import mongoose from 'mongoose';
import CartModel from '../models/cart.model.js';
// dsdfsddfgggh
 const dbconnection= async()=>{
  try {
      await mongoose.connect(process.env.MONGO_URI)
      // Remove the former custom cartItemId index. Cart uniqueness is now
      // enforced by product + colour + size, with MongoDB's built-in _id used
      // for update and delete operations.
      await CartModel.collection.dropIndex('userId_1_cartItemId_1').catch((error) => {
        if (error.codeName !== 'IndexNotFound' && error.code !== 27) throw error;
      });
      await CartModel.createIndexes();
       console.log("db connected!!!!")
  } catch (error) {
    console.log(error)
  }
}


export default dbconnection



