const mongoose = require("mongoose");
const productModel = require("../model/product.model");
const ratingModel = require("../model/rating.model");
const categoryModel = require("../model/category.model");


exports.getproductspipeline = () => {
    return [
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "subcategories",
                localField: "subcategoryId",
                foreignField: "_id",
                as: "subcategory"
            }
        },
        {
            $unwind: {
                path: "$subcategory",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand"
            }
        },
        {
            $unwind: {
                path: "$brand",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "productinventorys",
                localField: "_id",
                foreignField: "productId",
                as: "inventory"
            }
        },
        {
            $unwind: {
                path: "$inventory",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                name: 1,
                price: 1,
                salePrice: 1,
                sku: 1,
                status: 1,
                slug: 1,
                stock: "$inventory.stock",
                category: "$category.name",
                subcategory: "$subcategory.name",
                brand: "$brand.name",

                productImage: {
                    $cond: [
                        { $gt: [{ $size: "$productImage" }, 0] },
                        {
                            $concat: [
                                process.env.BACKEND_DOMIN_URL,
                                { $arrayElemAt: ["$productImage", 0] }
                            ]
                        },
                        ""
                    ]
                }
            }
        }
    ];
};

exports.getproductpaginationpipeline = (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    return [
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ];
};


exports.userGetProductpipeline = ({
    search = "",
    userId = null,
    categoryId = "",
    subcategoryId = "",
    brandId = "",
    minPrice = "",
    maxPrice = "",
    rating = "",
    sort = { createdAt: -1 },
    page = 1,
    limit = 10
} = {}) => {

    const pipeline = [];

    //====================================
    // Match
    //====================================

    const match = {
        status: "Active",
        visibility: "visible"
    };

    if (categoryId) {
        match.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (subcategoryId) {
        match.subcategoryId = new mongoose.Types.ObjectId(subcategoryId);
    }

    if (brandId) {
        match.brandId = new mongoose.Types.ObjectId(brandId);
    }

    if (search) {
        match.name = {
            $regex: search,
            $options: "i"
        };
    }

    if (minPrice || maxPrice) {

        match.salePrice = {};

        if (minPrice) {
            match.salePrice.$gte = Number(minPrice);
        }

        if (maxPrice) {
            match.salePrice.$lte = Number(maxPrice);
        }

    }

    pipeline.push({
        $match: match
    });

    //====================================
    // Category
    //====================================

    pipeline.push(
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        }
    );

    //====================================
    // Sub Category
    //====================================

    pipeline.push(
        {
            $lookup: {
                from: "subcategories",
                localField: "subcategoryId",
                foreignField: "_id",
                as: "subcategory"
            }
        },
        {
            $unwind: {
                path: "$subcategory",
                preserveNullAndEmptyArrays: true
            }
        }
    );

    //====================================
    // Brand
    //====================================

    pipeline.push(
        {
            $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand"
            }
        },
        {
            $unwind: {
                path: "$brand",
                preserveNullAndEmptyArrays: true
            }
        }
    );

    //====================================
    // Ratings
    //====================================

    //====================================
    // Approved Ratings
    //====================================

    pipeline.push({
        $lookup: {
            from: "ratings",
            let: {
                productId: "$_id"
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ["$productId", "$$productId"]
                        },
                        status: "approved"
                    }
                }
            ],
            as: "ratings"
        }
    });

    if (userId) {
        pipeline.push({
            $lookup: {
                from: "wishlists",
                let: {
                    productId: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$productId", "$$productId"]
                                    },
                                    {
                                        $eq: [
                                            "$userId",
                                            new mongoose.Types.ObjectId(userId)
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "wishlist"
            }
        });

        pipeline.push({
            $addFields: {
                wishlist: {
                    $gt: [
                        {
                            $size: "$wishlist"
                        },
                        0
                    ]
                }
            }
        });
    } else {
        pipeline.push({
            $addFields: {
                wishlist: false
            }
        });
    }

    //====================================
    // Cart
    //====================================

    if (userId) {
        pipeline.push({
            $lookup: {
                from: "carts",
                let: {
                    productId: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$productId", "$$productId"] },
                                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] }
                                ]
                            }
                        }
                    }
                ],
                as: "cart"
            }
        });

        pipeline.push({
            $addFields: {
                cart: {
                    $gt: [
                        { $size: "$cart" },
                        0
                    ]
                }
            }
        });
    } else {
        pipeline.push({
            $addFields: {
                cart: false
            }
        });
    }

    pipeline.push({
        $lookup: {
            from: "productvariants",
            localField: "_id",
            foreignField: "productId",
            as: "variant"
        }
    },
        {
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true
            }
        }
    );
    //====================================
    // Project
    //====================================

    pipeline.push({
        $project: {
            createdAt: 1,
            name: 1,
            price: 1,
            salePrice: 1,
            longDescription: 1,
            shortDescription: 1,
            flags: 1,
            wishlist: 1,
            cart: 1,
            productImage: {
                $cond: {
                    if: {
                        $gt: [
                            {
                                $size: "$productImage"
                            },
                            0
                        ]
                    },
                    then: {
                        $concat: [
                            process.env.BACKEND_DOMIN_URL,
                            {
                                $arrayElemAt: [
                                    "$productImage",
                                    0
                                ]
                            }
                        ]
                    },
                    else: ""
                }
            },
            productImages: {
                $cond: {
                    if: { $gt: [{ $size: "$productImage" }, 0] },
                    then: {
                        $map: {
                            input: "$productImage",
                            as: "img",
                            in: {
                                $concat: [
                                    process.env.BACKEND_DOMIN_URL,
                                    "$$img"
                                ]
                            }
                        }
                    },
                    else: []
                }
            },
            category: "$category.name",
            subcategory: "$subcategory.name",
            brand: "$brand.name",
            size: "$variant.size",
            colors: "$variant.colorOptions",
            variants: "$variant.variant",
            totalCustomerRating: {
                $size: "$ratings"
            },

            averageRating: {
                $cond: {
                    if: {
                        $gt: [
                            {
                                $size: "$ratings"
                            },
                            0
                        ]
                    },
                    then: {
                        $round: [
                            {
                                $avg: "$ratings.rating"
                            },
                            1
                        ]
                    },
                    else: 0
                }
            }

        }
    });

    //====================================
    // Rating Filter
    //====================================

    if (rating) {
        pipeline.push({
            $match: {
                averageRating: {
                    $gte: Number(rating)
                }
            }
        });
    }

    //====================================
    // Facet (Pagination + Count)
    //====================================

    pipeline.push({
        $facet: {

            products: [

                {
                    $sort: sort
                },

                // {
                //     $skip: (Number(page) - 1) * Number(2)
                // },

                // {
                //     $limit: Number(limit)
                // }

            ],

            totalCount: [

                {
                    $count: "total"
                }

            ]

        }
    });

    return pipeline;
};

exports.userGetSingalsProductpipeline = (id) => {
    return [
        {
            $match: {
                status: "Active",
                visibility: "visible",
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "productvariants",
                localField: "_id",
                foreignField: "productId",
                as: "variant"
            }
        },
        {
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $lookup: {
                from: "brands",
                localField: "brandId",
                foreignField: "_id",
                as: "brand"
            }
        },
        {
            $unwind: {
                path: "$brand",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "ratings",
                localField: "_id",
                foreignField: "productId",
                as: "ratings"
            }
        },
        {
            $project: {
                name: 1,
                price: 1,
                salePrice: 1,
                longDescription: 1,
                shortDescription: 1,
                productImage: { $map: { input: { $ifNull: ["$productImage", []] }, as: "image", in: { $concat: [process.env.BACKEND_DOMIN_URL, "$$image"] } } },
                category: "$category.name",
                subcategory: "$subcategory.name",
                brand: "$brand.name",
                size: "$variant.size",
                color: "$variant.colorOptions",
                rating: { $size: "$ratings" },
                averageRating: {
                    $cond: { if: { $gt: [{ $size: "$ratings" }, 0] }, then: { $round: [{ $avg: "$ratings.rating" }, 1] }, else: 0 }
                }
            }
        }
    ];
}


exports.userGetSingalsProductRatingpipeline = (id) => {
    return [
        {
            $match: {
                productId: new mongoose.Types.ObjectId(id),
                status: 'approved'
            }
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
            $project: {
                _id: 1,
                rating: 1,
                review: 1,
                createdAt: 1,
                userName: "$user.name",
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ];
};


exports.GetCartPipeline = (id) => {
    return [
        {
            $match: {
                userId: id
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "brands",
                localField: "product.brandId",
                foreignField: "_id",
                as: "brand"
            }
        },
        {
            $unwind: {
                path: "$brand",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "productvariants",
                localField: "productId",
                foreignField: "productId",
                as: "productVariant"
            }
        },
        {
            $unwind: {
                path: "$productVariant",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "productshippings",
                localField: "productId",
                foreignField: "productId",
                as: "shippingInfo"
            }
        },
        {
            $unwind: {
                path: "$shippingInfo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                selectedVariant: {
                    $first: {
                        $filter: {
                            input: "$productVariant.variant",
                            as: "v",
                            cond: {
                                $eq: [
                                    "$$v.name",
                                    { $concat: ["$color", "/", "$size"] }
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                productId: "$product._id",
                quantity: 1,
                color: 1,
                size: 1,
                productName: "$product.name",
                price: {
                    $ifNull: [
                        "$selectedVariant.price",
                        "$product.salePrice"
                    ]
                },
                originalPrice: "$product.price",
                brand: "$brand.name",
                shipping: { $ifNull: ["$shippingInfo.shipping", true] },
                productImage: { $concat: [process.env.BACKEND_DOMIN_URL, { $ifNull: [{ $arrayElemAt: ["$product.productImage", 0] }, ""] }] }
            }
        }

    ]
}



exports.GetWishlistpipiline = (userId) => {
    return [
        {
            $match: {
                userId: userId
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "brands",
                localField: "product.brandId",
                foreignField: "_id",
                as: "brand"
            }
        },
        {
            $unwind: {
                path: "$brand",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "ratings",
                localField: "product._id",
                foreignField: "productId",
                as: "ratings"
            }
        },
        {
            $project: {

                productId: "$product._id",


            }
        }
    ]
}


exports.GetCartProductCouponApplay = (cartIds) => {
    return [
        {
            $match: {
                _id: {
                    $in: cartIds.map(id => new mongoose.Types.ObjectId(id))
                }
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $lookup: {
                from: "productvariants",
                localField: "product._id",
                foreignField: "productId",
                as: "variant"
            }
        },
        {
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true
            }
        },
    ]
}


exports.GetCartProductShipingcharg = (cartIds) => {
    return [
        {
            $match: {
                _id: {
                    $in: cartIds.map(id => new mongoose.Types.ObjectId(id))
                }
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $lookup: {
                from: "productshippings",
                localField: "product._id",
                foreignField: "productId",
                as: "shipping"
            }
        },
        {
            $unwind: {
                path: "$shipping",
                preserveNullAndEmptyArrays: true
            }
        },
    ]
}



exports.GetCartProductPaymentOrder = (cartIds) => {
    return [
        {
            $match: {
                _id: {
                    $in: cartIds.map(id => new mongoose.Types.ObjectId(id))
                }
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $lookup: {
                from: "productvariants",
                localField: "product._id",
                foreignField: "productId",
                as: "variant"
            }
        },
        {
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $lookup: {
                from: "productinventorys",
                localField: "product._id",
                foreignField: "productId",
                as: "inventory"
            }
        },
        {
            $unwind: {
                path: "$inventory",
                preserveNullAndEmptyArrays: true
            }
        },
    ]
}



exports.GetCustomersAdmin = () => {
    return [
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                phone: 1,
                status: 1,
                createdAt: 1,
                profile: {
                    $cond: [
                        {
                            $and: [
                                { $ne: ["$profile", null] },
                                { $ne: ["$profile", ""] }
                            ]
                        },
                        {
                            $concat: [
                                process.env.BACKEND_DOMIN_URL,
                                "$profile"
                            ]
                        },
                        null
                    ]
                },
            }
        },

        // Default Address
        {
            $lookup: {
                from: "addresses",
                let: {
                    userId: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$userId", "$$userId"] },
                                    { $eq: ["$defaultaddress", true] }
                                ]
                            }
                        }
                    }
                ],
                as: "defaultAddress"
            }
        },

        {
            $unwind: {
                path: "$defaultAddress",
                preserveNullAndEmptyArrays: true
            }
        },

        // User Orders
        {
            $lookup: {
                from: "orders",
                let: {
                    userId: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$userId", "$$userId"]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderNumber: 1,
                            updatedAt: 1,
                            itemsCount: {
                                $sum: "$items.quantity"
                            },
                            totalAmount: 1,
                            status: 1,
                            payment: {
                                status: 1
                            }
                        }
                    },

                    {
                        $sort: {
                            updatedAt: -1
                        }
                    }
                ],
                as: "orders"
            }
        },

        {
            $addFields: {
                totalOrders: {
                    $size: "$orders"
                },

                totalPaidAmount: {
                    $sum: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$orders",
                                    as: "order",
                                    cond: {
                                        $eq: ["$$order.payment.status", "paid"]
                                    }
                                }
                            },
                            as: "order",
                            in: "$$order.totalAmount"
                        }
                    }
                },

                averageSpendPerPaidOrder: {
                    $cond: [
                        {
                            $gt: [
                                {
                                    $size: {
                                        $filter: {
                                            input: "$orders",
                                            as: "order",
                                            cond: {
                                                $eq: ["$$order.payment.status", "paid"]
                                            }
                                        }
                                    }
                                },
                                0
                            ]
                        },
                        {
                            $divide: [
                                {
                                    $sum: {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$orders",
                                                    as: "order",
                                                    cond: {
                                                        $eq: ["$$order.payment.status", "paid"]
                                                    }
                                                }
                                            },
                                            as: "order",
                                            in: "$$order.totalAmount"
                                        }
                                    }
                                },
                                {
                                    $size: {
                                        $filter: {
                                            input: "$orders",
                                            as: "order",
                                            cond: {
                                                $eq: ["$$order.payment.status", "paid"]
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        0
                    ]
                }
            }
        },

        {
            $sort: {
                createdAt: -1
            }
        }
    ];
};



exports.GetHeroBanners = () => {
    const now = new Date();
    return [
        // =====================================================
        // BANNER FILTER
        // =====================================================
        {
            $match: {
                isDeleted: false,
                status: "Active",
                placement: "Hero Slider",

                $or: [
                    // No start date and no end date
                    {
                        startDate: null,
                        endDate: null,
                    },

                    // Only start date
                    {
                        startDate: {
                            $ne: null,
                            $lte: now,
                        },
                        endDate: null,
                    },

                    // Only end date
                    {
                        startDate: null,
                        endDate: {
                            $ne: null,
                            $gte: now,
                        },
                    },

                    // Both start and end date
                    {
                        startDate: {
                            $ne: null,
                            $lte: now,
                        },
                        endDate: {
                            $ne: null,
                            $gte: now,
                        },
                    },
                ],
            },
        },

        // =====================================================
        // PRIORITY SORT
        // =====================================================
        {
            $sort: {
                priority: 1,
            },
        },

        // =====================================================
        // PRODUCT LOOKUP USING SKU
        // =====================================================
        {
            $lookup: {
                from: productModel.collection.name,
                let: {
                    bannerSku: "$productSku",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$sku",
                                    "$$bannerSku",
                                ],
                            },
                        },
                    },

                    // =============================================
                    // RATING LOOKUP
                    // =============================================
                    {
                        $lookup: {
                            from: ratingModel.collection.name,
                            let: {
                                productId: "$_id",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: [
                                                "$productId",
                                                "$$productId",
                                            ],
                                        },
                                    },
                                },

                                // Average rating calculate
                                {
                                    $group: {
                                        _id: null,
                                        avgRating: {
                                            $avg: "$rating",
                                        },
                                    },
                                },

                                {
                                    $project: {
                                        _id: 0,
                                        avgRating: {
                                            $round: [
                                                "$avgRating",
                                                1,
                                            ],
                                        },
                                    },
                                },
                            ],
                            as: "ratingData",
                        },
                    },

                    // =============================================
                    // PRODUCT RESPONSE FORMAT
                    // =============================================
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            salePrice: 1,
                            categoryId: 1,
                            // First image only
                            image: {
                                $arrayElemAt: [
                                    "$productImage",
                                    0,
                                ],
                            },

                            avgRating: {
                                $ifNull: [
                                    {
                                        $arrayElemAt: [
                                            "$ratingData.avgRating",
                                            0,
                                        ],
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                ],
                as: "product",
            },
        },

        // =====================================================
        // PRODUCT ARRAY -> OBJECT
        // =====================================================
        {
            $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true,
            },
        },



        {
            $lookup: {
                from: categoryModel.collection.name,
                localField: "product.categoryId",
                foreignField: "_id",
                as: "category",
            },
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
            },
        },


        // =====================================================
        // FINAL RESPONSE
        // =====================================================
        {
            $project: {
                _id: 1,
                title: 1,
                subtitle: 1,
                desktopImage: {
                    $cond: [
                        { $and: [{ $ne: ["$desktopImage", null,], }, { $ne: ["$desktopImage", "",], },], },
                        { $concat: [process.env.BACKEND_DOMIN_URL, "$desktopImage",], }, "",
                    ],
                },

                // =============================================
                // MOBILE IMAGE WITH DOMAIN
                // =============================================
                mobileImage: {
                    $cond: [
                        { $and: [{ $ne: ["$mobileImage", null,], }, { $ne: ["$mobileImage", "",], },], },
                        { $concat: [process.env.BACKEND_DOMIN_URL, "$mobileImage",], }, "",
                    ],
                },

                // =============================================
                // PRODUCT DATA
                // =============================================
                product: {
                    $cond: [
                        { $ne: ["$product", null,], },
                        {
                            _id: "$product._id",
                            name: "$product.name",
                            salePrice: "$product.salePrice",
                            avgRating: "$product.avgRating",
                            category: "$category.name",
                            // Product first image with domain
                            image: {
                                $cond: [
                                    { $and: [{ $ne: ["$product.image", null,], }, { $ne: ["$product.image", "",], },], },
                                    { $concat: [process.env.BACKEND_DOMIN_URL, "$product.image",], }, "",
                                ],
                            },
                        },
                        null,
                    ],
                },

            },
        },
    ]
}

















