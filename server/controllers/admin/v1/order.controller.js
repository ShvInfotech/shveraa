import orderModel from "../../../models/order.model.js";



export const GetAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 50));

    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search?.trim()) {
      filter.$or = [
        { orderNumber: { $regex: search.trim(), $options: "i" } },
        { "address.phone": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const orders = await orderModel.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $facet: {
          orders: [
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userData",
              },
            },
            {
              $unwind: {
                path: "$userData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                "userData.name": 1,
                "userData.email": 1,
                "userData.phone": 1,
                orderNumber: 1,
                address: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                items: 1,
                totalAmount: 1,
                payment: 1,
                shipping: 1,
              },
            },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
    ]);

    const result = orders[0] || { orders: [], totalCount: [] };

    return res.status(200).json({
      success: true,
      orders: result.orders,
      total: result.totalCount[0]?.total || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    return next(error);
  }
};


export const GetRTOReturnOrders = async (req, res, next) => {
  try {
    const { type } = req.params;

    // A single flow can still be requested ("return" | "rto"), but by default the
    // endpoint returns BOTH return and RTO orders mixed together in one list.
    const filter = ["rto", "return"].includes(type)
      ? { type }
      : { type: { $in: ["return", "rto"] } };

    const orders = await orderModel.aggregate([
      {
        $match: filter
      },
      {
        $sort: { createdAt: -1, _id: -1 }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          userInfo: {
            name: "$user.name",
            email: "$user.email",
            phone: "$user.phone"
          },
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    image: {
                      $concat: [
                        process.env.BACKEND_DOMIN_URL,
                        "$$item.image"
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          user: 0,
          __v: 0
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    return next(error);
  }
};