import { apiCreateMagicOrder, apiVerifyMagicOrder, apiGetCart } from '../services/api';

/**
 * Loads Razorpay Magic Checkout script if not already present on page.
 */
export const loadRazorpayMagicScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const existing = document.querySelector('script[src*="magic-checkout.js"]');
    if (existing) {
      existing.onload = () => resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/magic-checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Triggers 1-Click Razorpay Magic Checkout directly from any button (Cart Drawer, Buy Now, Cart page).
 * Bypasses the traditional /checkout page completely.
 */
export const triggerMagicCheckout = async ({
  cartItems,
  couponId,
  shippingCost = 0,
  user,
  navigate,
  clearCart,
  closeCart,
  showToast,
  setLoading,
  onError,
}) => {
  try {
    if (setLoading) setLoading(true);

    let items = cartItems;
    if (!items || !items.length) {
      try {
        const localCart = localStorage.getItem('shveraa_cart');
        if (localCart) {
          const parsed = JSON.parse(localCart);
          if (Array.isArray(parsed) && parsed.length) {
            items = parsed;
          }
        }
      } catch (_) {}
    }

    if (!items || !items.length) {
      const token = localStorage.getItem('shveraa_user_token');
      if (token) {
        try {
          const cartRes = await apiGetCart();
          items = cartRes?.cart || [];
        } catch (_) {}
      }
    }

    if (!items || !items.length) {
      if (showToast) showToast('Your shopping bag is empty.');
      if (setLoading) setLoading(false);
      return false;
    }

    const formattedRawItems = (items || []).map((item) => ({
      productId: item.productId?._id || item.productId?.id || item.productId || item._id || item.id,
      variantId: item.variantId || '',
      size: item.size || item.selectedSize || 'Standard',
      quantity: Number(item.quantity) || 1,
      price: Number(
        item.price ||
        item.productId?.salePrice ||
        item.productId?.originalPrice ||
        item.productId?.price ||
        0
      ),
      name: item.name || item.productId?.name || 'Fine Silver Jewellery',
    }));

    const cartIds = (items || [])
      .map((item) => (typeof item === 'object' ? item._id || item.id : item))
      .filter((id) => id && !String(id).startsWith('guest_') && !String(id).startsWith('buy_now_') && !String(id).startsWith('item_'));

    const isLoaded = await loadRazorpayMagicScript();
    if (!isLoaded) {
      throw new Error('Could not load Razorpay payment SDK. Please check your internet connection.');
    }

    const data = await apiCreateMagicOrder({
      cartIds,
      items: formattedRawItems,
      couponId: couponId || '',
      shippingCost: Math.round(Number(shippingCost) || 0),
    });

    const order = data?.order;
    if (!order || !order.id) {
      throw new Error(data?.message || 'Failed to initialize Magic Checkout.');
    }

    const razorpayKey = data?.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TVSL7tlw4NS59L';

    if (closeCart) {
      closeCart();
    }

    const options = {
      key: razorpayKey,
      one_click_checkout: true,
      show_coupons: true,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'SHVERAA',
      description: 'Fine 925 Sterling Silver Order',
      image: typeof window !== 'undefined' ? `${window.location.origin}/razorpay_logo.jpeg` : 'https://shveraa.com/razorpay_logo.jpeg',
      order_id: order.id,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: {
        color: '#1a1a1a',
      },
      modal: {
        ondismiss: function () {
          if (setLoading) setLoading(false);
        },
      },
      handler: async function (response) {
        try {
          if (setLoading) setLoading(true);

          const verifyRes = await apiVerifyMagicOrder({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id || '',
            razorpay_signature: response.razorpay_signature || '',
            cartIds,
            items: formattedRawItems,
            couponId: couponId || '',
            shippingCost: Math.round(Number(shippingCost) || 0),
          });

          if (verifyRes?.token) {
            localStorage.setItem('shveraa_user_token', verifyRes.token);
            if (verifyRes.user) {
              localStorage.setItem('shveraa_user', JSON.stringify(verifyRes.user));
            }
            window.dispatchEvent(new CustomEvent('shveraa_user_logged_in'));
          }

          const placedOrder = verifyRes?.order;
          if (clearCart) {
            try {
              await clearCart();
            } catch (cErr) {
              console.warn('Error clearing cart state:', cErr);
            }
          }
          try {
            localStorage.removeItem('shveraa_cart');
          } catch (_) {}

          const formattedOrder = {
            ...(placedOrder || {}),
            orderId: placedOrder?.orderNumber || placedOrder?._id,
            orderNumber: placedOrder?.orderNumber || placedOrder?._id,
            date: new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            customer: {
              fullName: placedOrder?.address?.fullName || user?.name || 'Valued Patron',
              email: user?.email || '',
              phone: placedOrder?.address?.phone || user?.phone || '',
              address: placedOrder?.address?.addressline
                ? `${placedOrder.address.addressline}, ${placedOrder.address.city}, ${placedOrder.address.state} - ${placedOrder.address.pincode}`
                : 'Address',
            },
            items: placedOrder?.items || [],
            pricing: {
              subtotal: placedOrder?.amount || 0,
              discount: placedOrder?.discount || 0,
              shipping: placedOrder?.shippingcharges === 0 ? 'FREE' : placedOrder?.shippingcharges || 0,
              total: placedOrder?.totalAmount || 0,
            },
            paymentMethod: placedOrder?.payment?.method || 'razorpay',
            estimatedDelivery: placedOrder?.waybill
              ? `Waybill: ${placedOrder.waybill} (2–4 Business Days)`
              : '2–4 Business Days (Insured Air Express)',
          };

          try {
            localStorage.setItem('shveraa_last_order', JSON.stringify(formattedOrder));
            const existingOrdersStr = localStorage.getItem('shveraa_orders');
            const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
            const updatedOrders = [formattedOrder, ...existingOrders.filter((o) => o.orderId !== formattedOrder.orderId)];
            localStorage.setItem('shveraa_orders', JSON.stringify(updatedOrders));
            window.dispatchEvent(
              new CustomEvent('shveraa_store_updated', {
                detail: { action: 'ORDER_PLACED', data: updatedOrders },
              })
            );
          } catch (cacheErr) {
            console.warn('Could not cache placed order:', cacheErr);
          }

          if (navigate) {
            navigate('/order-success', { state: { order: formattedOrder } });
          } else {
            window.location.href = '/order-success';
          }
        } catch (verifyErr) {
          console.error('Magic Checkout verification failed:', verifyErr);
          if (showToast) showToast(verifyErr.message || 'Payment verification failed. Please contact support.');
          if (onError) onError(verifyErr);
        } finally {
          if (setLoading) setLoading(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      console.error('Razorpay payment failed:', resp.error);
      if (showToast) showToast(resp.error?.description || 'Payment failed or cancelled.');
      if (setLoading) setLoading(false);
    });
    rzp.open();
    return true;
  } catch (err) {
    console.error('Magic Checkout initiation failed:', err);
    if (showToast) showToast(err.message || 'Failed to initiate Magic Checkout.');
    if (onError) onError(err);
    if (setLoading) setLoading(false);
    return false;
  }
};
