import orderModel from "../../../models/order.model.js";



export const GetAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'address.phone': { $regex: search, $options: 'i' } },
      ];
    }
    const orders = await orderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await orderModel.countDocuments(filter);
    return res.status(200).json({ success: true, orders, total });
  } catch (error) {
    return next(error);
  }
};