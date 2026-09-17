import sendEmail from '../../../config/nodemailer.confing.js'
import { ForgetPasswordMail } from '../../../helper/emailTemplate.js'
import { DeleteImage, hashUserPassword } from '../../../helper/helper.js'
import { CustomeError } from '../../../middleware/globelError.js'
import { ForgotgenerateJwtToken, generatehashToken, generateJwtToken } from '../../../middleware/jwtToken.js'
import UserModel from '../../../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import AddressModel from '../../../models/address.model.js'
import CartModel from '../../../models/cart.model.js'
import WishlistModel from '../../../models/wishlist.model.js'



export const UserRegister = async (req, res, next) => {
    try {

        const { name, email, phone, password, deviceToken } = req.body || {}

        if (!name) {
            return next(CustomeError(422, 'name is required'))
        }


        if (!email) {
            return next(CustomeError(422, 'email is required'))
        }

        if (!phone) {
            return next(CustomeError(422, 'contact number is required'))
        }

        if (!password) {
            return next(CustomeError(422, 'password is required'))
        }


        const hashPassword = await hashUserPassword(password)
        console.log(hashPassword)
        const userData = {
            name,
            email,
            phone,
            password: hashPassword
        }


        let user = await UserModel.create(userData)

        const token = generateJwtToken(user)
        const hashAccessToken = generatehashToken(token)



        const updateData = { $addToSet: { accessToken: hashAccessToken } };

        if (deviceToken) {
            updateData.$addToSet.deviceToken = deviceToken;
        }

        user = await UserModel.findByIdAndUpdate(user._id, updateData, { returnDocument: 'after' }).select('name email contact profile createdAt')


        return res.status(200).json({ success: true, message: "User Register", user, AccessToken: token })
    } catch (error) {
        return next(error)
    }
}


export const UserLogin = async (req, res, next) => {
    try {
        const { email, password, deviceToken } = req.body || {}

        if (!email) {
            return next(CustomeError(422, "email is required"))
        }

        if (!password) {
            return next(CustomeError(422, "password is required"))
        }

        let user = await UserModel.findOne({ email: email})

        if (!user) {
            return next(CustomeError(404, "User Not Found"))
        }

        if(user.status == "inactive" || user.status == "block"){
            return next(CustomeError(401,"Your Account is Inactive or Block"))
        }

        const matchPassword = await bcrypt.compare(password, user.password)

        if (!matchPassword) {
            return next(CustomeError(403, "Invalid  Password"))
        }

        const token = generateJwtToken(user)
        const hashAccessToken = generatehashToken(token)



        const updateData = { $addToSet: { accessToken: hashAccessToken } };

        if (deviceToken) {
            updateData.$addToSet.deviceToken = deviceToken;
        }

        user = await UserModel.findByIdAndUpdate(user._id, updateData, { returnDocument: 'after' }).select('name email contact profile createdAt')


        return res.status(200).json({ success: true, message: "User Register", user, AccessToken: token })


    } catch (error) {
        return next(error)
    }
}

export const UserLogout = async (req, res, next) => {
    try {
        const token = req.token

        if (token) {
            await UserModel.findByIdAndUpdate(req.user._id, { $pull: { accessToken: token } }, { returnDocument: "after" })
        }

        return res.status(200).json({ success: true, message: 'User Logout', token })
    } catch (error) {
        return next(error)
    }
}

export const UserForgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body

        if (!email) {
            return next(CustomeError(422, 'Enter Your Register Email'))
        }

        const user = await UserModel.findOne({ email: email, status: 'active' })

        if (!user) {
            return next(CustomeError(404, "Inavlid Email Enter Your Register Email"))
        }


        const token = ForgotgenerateJwtToken(user)

        const link = `${process.env.BACKEND_DOMIN_URL}/reset-password/${token}`

        await sendEmail(ForgetPasswordMail(user.email, user.name, link))

        return res.status(200).json({ success: true, message: "Reset Password Link Sent Your Register Email" })

    } catch (error) {
        return next(error)
    }
}


export const ResetPasswordpage = async (req, res, next) => {
    try {
        const token = req.params.token
        res.render('reset-password', { token, message: "", type: "" })
    } catch (error) {
        return next(error)
    }
}


export const ResetPassword = async (req, res, next) => {

    try {

        const token = req.params.token;
        const { password } = req.body;

        if(!password){
            return res.render("reset-password", {
                token: token,
                message: "Password Is Required.",
                type: "error"
            });
        }

        const decoded = jwt.verify(token, process.env.FORGOT_PASSWORD_JWT_SECRET);
        const userId = decoded.id;


        // 2. hash password
        const hashPassword = await bcrypt.hash(password, 12);

        await UserModel.findByIdAndUpdate(userId, { password: hashPassword, accessToken: [] });
        return res.render("reset-password", {
            token,
            message: "Password updated successfully",
            type: "success"
        });

    } catch (error) {
        console.log(error)
        if (error.name === "TokenExpiredError") {
            return res.render("reset-password", {
                token: null,
                message: "Your reset password link has expired. Please request a new one.",
                type: "expired"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.render("reset-password", {
                token: null,
                message: "Invalid reset password link.",
                type: "error"
            });
        }
        return next(error);
    }
};

export const UserUpdateProfile = async (req,res,next) =>{
    try {
        const userId = req.user._id

        let user = await UserModel.findById(userId)

        if(!user){
            return next(CustomeError(401,'User Not Found'))
        }
        let profile = user.profile
        if(req.file){
            if(profile !==""){
                DeleteImage(user.profile)
            }
            profile = `/uploads/${req.file.fieldname}/${req.file.filename}`
        }
    } catch (error) {
        return next(error)
    }
}

/* ==========================================================================
   ADDRESS CONTROLLERS  (separate AddressModel)
   ========================================================================== */
export const GetUserAddresses = async (req, res, next) => {
  try {
    const addresses = await AddressModel.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: 1 });
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    return next(error);
  }
};

export const AddUserAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, locality, city, state, pincode, isDefault, label } = req.body || {};
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return next(CustomeError(422, 'Full name, phone, street, city, state, and pincode are required'));
    }

    const count = await AddressModel.countDocuments({ userId: req.user._id });
    const shouldBeDefault = Boolean(isDefault) || count === 0;

    if (shouldBeDefault) {
      await AddressModel.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
    }

    const address = await AddressModel.create({
      userId: req.user._id,
      fullName,
      phone,
      street,
      locality: locality || '',
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
      label: label || 'Home',
    });

    const addresses = await AddressModel.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: 1 });
    return res.status(201).json({ success: true, message: 'Address added successfully', address, addresses });
  } catch (error) {
    return next(error);
  }
};

export const UpdateUserAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { fullName, phone, street, locality, city, state, pincode, isDefault, label } = req.body || {};

    const address = await AddressModel.findOne({ _id: addressId, userId: req.user._id });
    if (!address) return next(CustomeError(404, 'Address not found'));

    if (isDefault) {
      await AddressModel.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
    }

    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (locality !== undefined) address.locality = locality;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (label !== undefined) address.label = label;
    if (isDefault !== undefined) address.isDefault = Boolean(isDefault);

    await address.save();

    const addresses = await AddressModel.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: 1 });
    return res.status(200).json({ success: true, message: 'Address updated successfully', address, addresses });
  } catch (error) {
    return next(error);
  }
};

export const DeleteUserAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const address = await AddressModel.findOneAndDelete({ _id: addressId, userId: req.user._id });
    if (!address) return next(CustomeError(404, 'Address not found'));

    // If deleted was default, promote the oldest remaining as default
    if (address.isDefault) {
      const next_ = await AddressModel.findOne({ userId: req.user._id }).sort({ createdAt: 1 });
      if (next_) { next_.isDefault = true; await next_.save(); }
    }

    const addresses = await AddressModel.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: 1 });
    return res.status(200).json({ success: true, message: 'Address deleted successfully', addresses });
  } catch (error) {
    return next(error);
  }
};

export const SetDefaultUserAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const address = await AddressModel.findOne({ _id: addressId, userId: req.user._id });
    if (!address) return next(CustomeError(404, 'Address not found'));

    await AddressModel.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
    address.isDefault = true;
    await address.save();

    const addresses = await AddressModel.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: 1 });
    return res.status(200).json({ success: true, message: 'Default address updated', addresses });
  } catch (error) {
    return next(error);
  }
};

/* ==========================================================================
   CART CONTROLLERS  (separate CartModel)
   ========================================================================== */
export const GetCart = async (req, res, next) => {
  try {
    const cart = await CartModel.find({ userId: req.user._id });
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return next(error);
  }
};

export const SyncCart = async (req, res, next) => {
  try {
    const { cart } = req.body || {};
    if (!Array.isArray(cart)) return next(CustomeError(422, 'cart must be an array'));

    // Delete all existing items for user then reinsert
    await CartModel.deleteMany({ userId: req.user._id });
    if (cart.length > 0) {
      const docs = cart.map(item => ({ ...item, userId: req.user._id }));
      await CartModel.insertMany(docs, { ordered: false }).catch(() => {});
    }
    const updated = await CartModel.find({ userId: req.user._id });
    return res.status(200).json({ success: true, cart: updated });
  } catch (error) {
    return next(error);
  }
};

export const AddToCart = async (req, res, next) => {
  try {
    const { productId, variantId, name, price, originalPrice, image, category, size, color, quantity } = req.body || {};
    if (!productId || !name || !price) {
      return next(CustomeError(422, 'productId, name and price are required'));
    }

    const normalizedSize = String(size || 'Standard').trim();
    const normalizedColor = String(color || '').trim().toLowerCase();
    const cartItemFilter = {
      userId: req.user._id,
      productId,
      size: normalizedSize,
      color: normalizedColor,
    };
    const existing = await CartModel.findOne(cartItemFilter);
    if (existing) {
      const cart = await CartModel.find({ userId: req.user._id });
      return res.status(200).json({
        success: true,
        added: false,
        message: 'This colour and size is already in your cart',
        cart,
      });
    } else {
      await CartModel.create({
        userId: req.user._id,
        productId,
        variantId: variantId || '',
        name,
        price: Number(price),
        originalPrice: Number(originalPrice || 0),
        image: image || '',
        category: category || '',
        size: normalizedSize,
        color: normalizedColor,
        quantity: quantity || 1,
      });
    }

    const cart = await CartModel.find({ userId: req.user._id });
    return res.status(200).json({ success: true, added: true, cart });
  } catch (error) {
    return next(error);
  }
};

export const UpdateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body || {};

    if (quantity <= 0) {
      await CartModel.findOneAndDelete({ _id: id, userId: req.user._id });
    } else {
      const item = await CartModel.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { $set: { quantity } },
        { new: true }
      );
      if (!item) return next(CustomeError(404, 'Cart item not found'));
    }

    const cart = await CartModel.find({ userId: req.user._id });
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return next(error);
  }
};

export const RemoveCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await CartModel.findOneAndDelete({ _id: id, userId: req.user._id });
    const cart = await CartModel.find({ userId: req.user._id });
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return next(error);
  }
};

export const ClearCart = async (req, res, next) => {
  try {
    await CartModel.deleteMany({ userId: req.user._id });
    return res.status(200).json({ success: true, cart: [] });
  } catch (error) {
    return next(error);
  }
};

/* ==========================================================================
   WISHLIST CONTROLLERS  (separate WishlistModel)
   ========================================================================== */
export const GetWishlist = async (req, res, next) => {
  try {
    const items = await WishlistModel.find({ userId: req.user._id });
    const wishlist = items.map(i => i.productId);
    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    return next(error);
  }
};

export const ToggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body || {};
    if (!productId) return next(CustomeError(422, 'productId is required'));

    const existing = await WishlistModel.findOne({ userId: req.user._id, productId });
    let action;
    if (existing) {
      await existing.deleteOne();
      action = 'removed';
    } else {
      await WishlistModel.create({ userId: req.user._id, productId });
      action = 'added';
    }

    const items = await WishlistModel.find({ userId: req.user._id });
    const wishlist = items.map(i => i.productId);
    return res.status(200).json({ success: true, wishlist, action });
  } catch (error) {
    return next(error);
  }
};
