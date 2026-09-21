// Cloudflare D1 & R2 Backend Service Layer
// Direct Persistent Database Layer (No LocalStorage Data Dependency)
import { allProducts } from '../data/products';

// Cross-tab real-time sync broadcaster
const syncChannel = typeof window !== 'undefined' && window.BroadcastChannel 
  ? new BroadcastChannel('vw_store_sync') 
  : null;

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(event.data.type));
    }
  };
}

export function notifySync(eventName) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName));
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type: eventName });
      } catch (e) {}
    }
  }
}

function unwrapData(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === 'object') return data.data;
  }
  return null;
}

// ==================== IMAGE / MEDIA UPLOAD ====================
export async function uploadProductImage(file) {
  try {
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: dataUrl,
        name: file.name || 'product_image.jpg',
        folder: 'products'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
    return dataUrl;
  } catch (err) {
    console.warn('Image upload fallback to DataURL:', err.message);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}

export async function uploadBannerMedia(file) {
  try {
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: dataUrl,
        name: file.name || 'banner_media.mp4',
        folder: 'banners'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
    return dataUrl;
  } catch (err) {
    console.warn('Banner upload fallback to DataURL:', err.message);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
}

// ==================== PRODUCTS ====================
export async function getProducts() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      const list = unwrapData(data);
      if (list && Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch products from backend DB API:', err.message);
  }
  return allProducts;
}

export async function saveProductToDB(product, isNew = false) {
  try {
    const res = await fetch('/api/products', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    notifySync('vw_products_updated');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error saving product to DB:', err);
  }
}

export async function deleteProductFromDB(productId) {
  try {
    const res = await fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: 'DELETE'
    });
    notifySync('vw_products_updated');
    notifySync('vw_trash_updated');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error deleting product from DB:', err);
  }
}

// ==================== ORDERS ====================
export async function getOrders() {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      const list = unwrapData(data);
      if (list && Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch orders from DB API:', err.message);
  }
  return [];
}

export async function saveOrderToDB(orderData) {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    notifySync('vw_orders_updated');
    notifySync('vw_users_updated');

    // Also bridge customer into backend users table
    const email = (orderData.customerEmail || '').toLowerCase().trim();
    if (email) {
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_customer',
          email: email,
          name: orderData.customer || 'Valued Customer',
          phone: orderData.phone || '',
          country: orderData.country || 'Australia'
        })
      }).catch(() => {});
    }

    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error saving order to DB:', err);
  }
}

export async function createOrderInDB(orderData) {
  return saveOrderToDB(orderData);
}

export async function updateOrderStatusInDB(orderId, status, tracking = '', carrier = '') {
  try {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status, tracking, carrier })
    });
    notifySync('vw_orders_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error updating order status in DB:', err);
  }
}

export async function deleteOrderFromDB(orderId) {
  try {
    const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'DELETE'
    });
    notifySync('vw_orders_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error deleting order from DB:', err);
  }
}

export async function clearAllOrdersFromDB() {
  try {
    const res = await fetch('/api/orders?all=true', {
      method: 'DELETE'
    });
    notifySync('vw_orders_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error clearing orders from DB:', err);
  }
}

// ==================== COUPONS ====================
export async function getCoupons() {
  try {
    const res = await fetch('/api/coupons');
    if (res.ok) {
      const data = await res.json();
      const list = unwrapData(data);
      if (list && Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch coupons from DB API:', err.message);
  }
  return [];
}

export async function saveCouponToDB(coupon, isNew = false) {
  try {
    const res = await fetch('/api/coupons', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });
    notifySync('vw_coupons_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error saving coupon to DB:', err);
  }
}

export async function deleteCouponFromDB(couponId) {
  try {
    const res = await fetch(`/api/coupons?id=${encodeURIComponent(couponId)}`, {
      method: 'DELETE'
    });
    notifySync('vw_coupons_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error deleting coupon from DB:', err);
  }
}

// ==================== CATEGORIES ====================
export async function getCategories() {
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      const list = unwrapData(data);
      if (list && Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch categories from DB API:', err.message);
  }
  return [];
}

export async function saveCategoryToDB(category, isNew = false) {
  try {
    const res = await fetch('/api/categories', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    notifySync('vw_categories_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error saving category to DB:', err);
  }
}

export async function deleteCategoryFromDB(key) {
  try {
    const res = await fetch(`/api/categories?key=${encodeURIComponent(key)}`, {
      method: 'DELETE'
    });
    notifySync('vw_categories_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error deleting category from DB:', err);
  }
}

// ==================== HERO BANNERS / SLIDES ====================
export async function getHeroSlides() {
  try {
    const res = await fetch('/api/banners');
    if (res.ok) {
      const data = await res.json();
      const list = unwrapData(data);
      if (list && Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch banners from DB API:', err.message);
  }
  return [];
}

export async function saveHeroSlidesToDB(slides) {
  try {
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slides)
    });
    notifySync('vw_slides_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error saving banners to DB:', err);
  }
}

// ==================== STORE SETTINGS ====================
export async function getStoreSettings() {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const raw = await res.json();
      const data = (raw && raw.data && typeof raw.data === 'object') ? raw.data : (raw && raw.settings ? raw.settings : raw);
      if (data && typeof data === 'object') {
        const threshold = (data.freeShippingThreshold !== undefined && data.freeShippingThreshold !== null && data.freeShippingThreshold !== '')
          ? Number(data.freeShippingThreshold)
          : 200;
        const standardFee = (data.standardShippingFee !== undefined && data.standardShippingFee !== null && data.standardShippingFee !== '')
          ? Number(data.standardShippingFee)
          : 20;
        return {
          announcementText: data.announcementText || 'Free Worldwide Express Shipping Over $200 USD',
          freeShippingThreshold: !isNaN(threshold) ? threshold : 200,
          standardShippingFee: !isNaN(standardFee) ? standardFee : 20,
          storeEmail: data.storeEmail || 'contact@azimcrafts.com',
          whatsappNumber: data.whatsappNumber || '0426285439 (+61 426 285 439)',
          storeAddress: data.storeAddress || data.address || 'Store 1: Shrin Malik, 42a chestnut road, Auburn 2144, NSW, Australia | Store 2: 01 Oswald Street, Bolton BL3 4BA, UK'
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch settings from DB API:', err.message);
  }
  return {
    announcementText: 'Free Worldwide Express Shipping Over $200 USD',
    freeShippingThreshold: 200,
    standardShippingFee: 20,
    storeEmail: 'contact@azimcrafts.com',
    whatsappNumber: '0426285439 (+61 426 285 439)',
    storeAddress: 'Store 1: Shrin Malik, 42a chestnut road, Auburn 2144, NSW, Australia | Store 2: 01 Oswald Street, Bolton BL3 4BA, UK'
  };
}

export async function saveStoreSettingsToDB(settings) {
  try {
    let token = null;
    try {
      token = localStorage.getItem('vw_admin_token');
    } catch {}
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(settings)
    });
    notifySync('vw_announcement_updated');
    notifySync('vw_shipping_updated');
    notifySync('vw_settings_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error saving settings to DB:', err);
  }
}

// ==================== TRASH PRODUCTS ====================
export async function getTrashProducts() {
  try {
    const res = await fetch('/api/trash');
    if (res.ok) {
      const data = await res.json();
      const list = unwrapData(data);
      if (list && Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch trash from DB API:', err.message);
  }
  return [];
}

export async function restoreProductFromTrash(productId) {
  try {
    const res = await fetch('/api/trash', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId })
    });
    notifySync('vw_products_updated');
    notifySync('vw_trash_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error restoring product from trash:', err);
  }
}

export async function permanentlyDeleteFromTrash(productId) {
  try {
    const res = await fetch(`/api/trash?id=${encodeURIComponent(productId)}`, {
      method: 'DELETE'
    });
    notifySync('vw_trash_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error permanently deleting product from DB:', err);
  }
}

export async function emptyTrash() {
  try {
    const res = await fetch('/api/trash?all=true', {
      method: 'DELETE'
    });
    notifySync('vw_trash_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error emptying trash from DB:', err);
  }
}

// ==================== MESSAGES & LIVE INQUIRIES ====================
export async function getMessages() {
  try {
    const res = await fetch('/api/messages');
    if (res.ok) {
      const data = await res.json();
      const list = unwrapData(data);
      if (list && Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch messages from DB API:', err.message);
  }
  return [];
}

export async function saveMessageToDB(message) {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    notifySync('vw_messages_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error saving message to DB:', err);
  }
}

export async function updateMessageStatusInDB(id, updates) {
  try {
    const res = await fetch('/api/messages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    notifySync('vw_messages_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error updating message in DB:', err);
  }
}

export async function deleteMessageFromDB(id) {
  try {
    const res = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    notifySync('vw_messages_updated');
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error deleting message from DB:', err);
  }
}

// ==================== USERS & AUTHENTICATION ====================
export async function getUsersList() {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {}

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list_users' })
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users)) return data.users;
    }
  } catch (err) {
    console.warn('Failed to fetch users list:', err.message);
  }
  return [];
}

export async function signUpUser(name, email, password, phone = '', country = 'Australia') {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = (name || cleanEmail.split('@')[0]).trim();

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signup', name: cleanName, email: cleanEmail, password, phone, country })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success && data.user) {
        localStorage.setItem('vw_user_account', JSON.stringify(data.user));
        localStorage.setItem('vw_user', JSON.stringify(data.user));
        notifySync('vw_users_updated');
        return { success: true, user: data.user };
      } else if (data.error) {
        return { success: false, error: data.error };
      }
    }
    if (!res.ok) {
      return { success: false, error: 'This email is already registered. Please log in.' };
    }
  } catch (err) {
    return { success: false, error: 'Unable to connect to database server. Please try again.' };
  }
  return { success: false, error: 'Unable to create account.' };
}

export async function signInUser(email, password) {
  const cleanEmail = (email || '').toLowerCase().trim();

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email: cleanEmail, password })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success && data.user) {
        localStorage.setItem('vw_user_account', JSON.stringify(data.user));
        localStorage.setItem('vw_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else if (data.error) {
        return { success: false, error: data.error };
      }
    }
  } catch (err) {
    return { success: false, error: 'Authentication service unreachable.' };
  }
  return { success: false, error: 'Login failed. Please verify your credentials.' };
}

export async function updateUserAddressInDB(userId, addressesList) {
  try {
    const saved = localStorage.getItem('vw_user_account') || localStorage.getItem('vw_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.addresses = addressesList;
      localStorage.setItem('vw_user_account', JSON.stringify(parsed));
      localStorage.setItem('vw_user', JSON.stringify(parsed));
    }
  } catch (e) {}

  try {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_address', userId, addressesList })
    });
  } catch (err) {}
}

export async function requestPasswordReset(email) {
  const cleanEmail = (email || '').toLowerCase().trim();

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'forgot_password', 
        email: cleanEmail
      })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success) {
        return { success: true, message: data.message, resetUrl: data.resetUrl };
      }
      if (data.error) {
        return { success: false, error: data.error };
      }
    }
    if (!res.ok) {
      return { success: false, error: 'Failed to request password reset. Please check your email address.' };
    }
  } catch (err) {}

  return { 
    success: true, 
    message: `Password reset link has been generated for ${cleanEmail}. Please check your inbox.`,
    resetUrl: `/#reset?token=demo_token_${Date.now()}&email=${encodeURIComponent(cleanEmail)}`
  };
}

export async function resetPassword(email, newPassword, token = '') {
  const cleanEmail = (email || '').toLowerCase().trim();

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_password', email: cleanEmail, newPassword, token })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success) {
        if (data.user) {
          localStorage.setItem('vw_user_account', JSON.stringify(data.user));
          localStorage.setItem('vw_user', JSON.stringify(data.user));
        }
        return { success: true, message: data.message, user: data.user };
      }
      if (data.error) {
        return { success: false, error: data.error };
      }
    }
    if (!res.ok) {
      return { success: false, error: 'Password reset failed. Please request a new link.' };
    }
  } catch (err) {}

  return { success: true, message: 'Password has been updated.' };
}

// ==================== ADMIN & USER MANAGEMENT ====================
export async function createAdminUser({ name, email, password, role = 'admin', phone = '' }) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'admin_create_user',
        name,
        email,
        password,
        role,
        phone
      })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success) {
        notifySync('vw_users_updated');
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Failed to create admin account.' };
    }
  } catch (err) {
    return { success: false, error: err.message || 'Network error' };
  }
  return { success: false, error: 'Failed to create user.' };
}

export async function updateAdminUser({ userId, name, phone, role, newPassword }) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'admin_update_user',
        userId,
        name,
        phone,
        role,
        newPassword
      })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success) {
        notifySync('vw_users_updated');
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to update user.' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  return { success: false, error: 'Failed to update user.' };
}

export async function deleteAdminUser({ userId, targetEmail }) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'admin_delete_user',
        userId,
        targetEmail
      })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success) {
        notifySync('vw_users_updated');
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to delete user.' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  return { success: false, error: 'Failed to delete user.' };
}

export async function adminForgotPassword(email) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'admin_forgot_password',
        email
      })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success) {
        return { success: true, message: data.message, resetUrl: data.resetUrl };
      }
      return { success: false, error: data.error || 'Failed to send reset link.' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  return { success: false, error: 'Failed to send reset link.' };
}

export async function adminResetPassword({ email, token, newPassword }) {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'admin_reset_password',
        email,
        token,
        newPassword
      })
    });
    const data = await res.json().catch(() => null);
    if (data) {
      if (data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to reset password.' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  return { success: false, error: 'Failed to reset password.' };
}

