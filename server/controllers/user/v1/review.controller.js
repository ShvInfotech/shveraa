import mongoose from "mongoose";
import { CustomeError } from "../../../middleware/globelError.js";
import ReviewModel from "../../../models/review.model.js";
import OrderModel from "../../../models/order.model.js";
import productModel from "../../../models/product.model.js";

// Recalculate the product-level rating summary (avgRating + rating count)
// every time a review is created or updated.
const refreshProductRating = async (productId) => {
  try {
    const stats = await ReviewModel.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(String(productId)) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avgRating = stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0;
    const ratingCount = stats[0] ? stats[0].count : 0;

    await productModel.findByIdAndUpdate(productId, {
      avgRating,
      rating: ratingCount,
      reviewsCount: ratingCount,
    });
  } catch (err) {
    // Rating summary is secondary — never fail the review because of it.
    console.warn("Could not refresh product rating:", err.message);
  }
};

// POST /api/v1/user/reviews  (auth)
// Create or update the logged-in customer's review for a product.
// A review is ONLY allowed when the customer has a DELIVERED order
// containing that product.
export const SubmitReview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, orderId, rating, title, comment, name, city } = req.body || {};

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return next(CustomeError(422, "Valid productId is required"));
    }

    const ratingNum = Number(rating);
    if (!ratingNum || Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return next(CustomeError(422, "Rating must be between 1 and 5 stars"));
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return next(CustomeError(404, "Product not found"));
    }

    // ---- Locate the delivered order that qualifies for this review ----
    let order = null;

    if (orderId) {
      if (!mongoose.isValidObjectId(orderId)) {
        return next(CustomeError(422, "Valid orderId is required"));
      }
      order = await OrderModel.findOne({ _id: orderId, userId });
      if (!order) {
        return next(CustomeError(404, "Order not found"));
      }
      const itemExists = (order.items || []).some(
        (item) => String(item.productId) === String(productId)
      );
      if (!itemExists) {
        return next(CustomeError(422, "This product is not part of the selected order"));
      }
    } else {
      // No explicit order (e.g. Product detail page) → find any delivered
      // order of this customer that contains the product.
      const deliveredOrders = await OrderModel.find({ userId, status: "delivered" }).sort({
        createdAt: -1,
      });
      order =
        deliveredOrders.find((o) =>
          (o.items || []).some((item) => String(item.productId) === String(productId))
        ) || null;
      if (!order) {
        return next(CustomeError(403, "You can write a review only after the order is delivered"));
      }
    }

    if (order.status !== "delivered") {
      return next(CustomeError(403, "You can write a review only for delivered orders"));
    }

    // ---- Upsert: one review per customer per product ----
    const review = await ReviewModel.findOneAndUpdate(
      { userId, productId },
      {
        $set: {
          orderId: order._id,
          rating: ratingNum,
          title: (title || "").trim(),
          comment: (comment || "").trim(),
          name: (name || req.user.name || "").trim(),
          city: (city || "").trim(),
          verified: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await refreshProductRating(productId);

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/user/reviews/product/:productId  (public)
// All reviews for a product + average / distribution, used by the
// Product detail page "Customer Reviews" hub.
export const GetProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return next(CustomeError(422, "Valid productId is required"));
    }

    const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      totalReviews,
      averageRating,
      distribution,
      reviews: reviews.map((r) => ({
        id: r._id,
        productId: r.productId,
        orderId: r.orderId,
        name: r.name || "Verified Buyer",
        city: r.city || "",
        rating: r.rating,
        title: r.title || "",
        comment: r.comment || "",
        verified: !!r.verified,
        helpful: r.helpful || 0,
        date: new Date(r.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};
