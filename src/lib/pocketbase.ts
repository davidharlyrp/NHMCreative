import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'https://your-pocketbase-instance.pockethost.io';

export const pb = new PocketBase(POCKETBASE_URL);

// Auth helpers
export const authHelpers = {
  isAuthenticated: () => pb.authStore.isValid,
  getUser: () => pb.authStore.model,
  isAdmin: () => pb.authStore.model?.role === 'admin',
  logout: () => pb.authStore.clear(),

  async login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return { success: true, record: authData.record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async register(email: string, password: string, name: string) {
    try {
      const userData = {
        email,
        password,
        passwordConfirm: password,
        name,
        role: 'customer'
      };
      const record = await pb.collection('users').create(userData);
      return { success: true, record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Product helpers
const normalizeProduct = (record: any) => ({
  ...record,
  features: Array.isArray(record.features) ? record.features : (record.features ? record.features.split('\n') : []),
  includes: Array.isArray(record.includes) ? record.includes : (record.includes ? record.includes.split('\n') : []),
});

export const productHelpers = {
  async getAll(options = {}) {
    try {
      const records = await pb.collection('products').getFullList({
        sort: '-created',
        ...options
      });
      return { success: true, data: records.map(normalizeProduct) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getFeatured() {
    try {
      const records = await pb.collection('products').getFullList({
        filter: 'isFeatured = true && status = "active"',
        sort: '-created'
      });
      return { success: true, data: records.map(normalizeProduct) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getBySlug(slug: string) {
    try {
      // Use single quotes for the filter value as per PocketBase best practices
      const record = await pb.collection('products').getFirstListItem(`slug = '${slug}'`);
      return { success: true, data: normalizeProduct(record) };
    } catch (error: any) {
      if (!error.isAbort) {
        console.error(`Error fetching product with slug "${slug}":`, error);
      }
      return { success: false, error: error.message, isAbort: error.isAbort };
    }
  },

  async getByCategory(category: string) {
    try {
      const records = await pb.collection('products').getFullList({
        filter: `category = "${category}" && status = "active"`,
        sort: '-created'
      });
      return { success: true, data: records.map(normalizeProduct) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async create(productData: any) {
    try {
      const record = await pb.collection('products').create(productData);
      return { success: true, data: record };
    } catch (error: any) {
      console.dir(error); // Log full error object for inspection
      let errorMessage = error.message;
      const errorData = error.data || error.response?.data;
      if (errorData) {
        const details = Object.entries(errorData.data || errorData).map(([key, value]: [string, any]) => {
          const msg = value.message || (typeof value === 'object' ? JSON.stringify(value) : value);
          return `${key}: ${msg}`;
        }).join(', ');
        if (details) errorMessage = `${error.message} (${details})`;
      }
      return { success: false, error: errorMessage, originalError: error };
    }
  },

  async update(id: string, productData: any) {
    try {
      const record = await pb.collection('products').update(id, productData);
      return { success: true, data: record };
    } catch (error: any) {
      console.dir(error); // Log full error object for inspection
      let errorMessage = error.message;
      const errorData = error.data || error.response?.data;
      if (errorData) {
        const details = Object.entries(errorData.data || errorData).map(([key, value]: [string, any]) => {
          const msg = value.message || (typeof value === 'object' ? JSON.stringify(value) : value);
          return `${key}: ${msg}`;
        }).join(', ');
        if (details) errorMessage = `${error.message} (${details})`;
      }
      return { success: false, error: errorMessage, originalError: error };
    }
  },

  async delete(id: string) {
    try {
      await pb.collection('products').delete(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getFileUrl(record: any, filename: string) {
    if (!filename) return '';
    return pb.files.getURL(record, filename);
  }
};

// Order helpers
export const orderHelpers = {
  async getAll(options = {}) {
    try {
      const records = await pb.collection('orders').getFullList({
        sort: '-created',
        expand: 'userId,productId',
        ...options
      });
      return { success: true, data: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getRecent(limit = 5) {
    try {
      const records = await pb.collection('orders').getList(1, limit, {
        sort: '-created',
        expand: 'userId,productId'
      });
      return { success: true, data: records.items };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async create(orderData: any) {
    try {
      const record = await pb.collection('orders').create(orderData);
      return { success: true, data: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      const record = await pb.collection('orders').update(id, { status });
      return { success: true, data: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getStats() {
    try {
      const orders = await pb.collection('orders').getFullList();
      const products = await pb.collection('products').getFullList();

      const totalRevenue = orders
        .filter((o: any) => o.status === 'paid')
        .reduce((sum: number, o: any) => sum + o.amount, 0);

      const totalSales = orders.filter((o: any) => o.status === 'paid').length;

      // Group by month
      const salesByMonth: Record<string, number> = {};
      orders.forEach((order: any) => {
        if (order.status === 'paid') {
          const month = new Date(order.created).toLocaleString('id-ID', { month: 'short', year: 'numeric' });
          salesByMonth[month] = (salesByMonth[month] || 0) + order.amount;
        }
      });

      return {
        success: true,
        data: {
          totalSales,
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          salesByMonth: Object.entries(salesByMonth).map(([month, amount]) => ({ month, amount }))
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// File upload helper
export const fileHelpers = {
  async upload(file: File, collection = 'products') {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const record = await pb.collection(collection).create(formData);
      return { success: true, data: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getFileUrl(record: any, filename: string) {
    return pb.files.getUrl(record, filename);
  }
};

export const API_URL = import.meta.env.VITE_API_URL || 'https://api.nhmcreative.com';

// Review helpers
export const reviewHelpers = {
  async getByProduct(productId: string) {
    try {
      const records = await pb.collection('review').getFullList({
        filter: `productId = "${productId}"`,
        sort: '-created',
        expand: 'userId'
      });
      return { success: true, data: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async create(reviewData: any) {
    try {
      const response = await fetch(`${API_URL}/api/review/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create review');

      return { success: true, data: result.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getByUserAndProduct(userId: string, productId: string) {
    try {
      const record = await pb.collection('review').getFirstListItem(
        `userId = "${userId}" && productId = "${productId}"`
      );
      return { success: true, data: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getAll(options: { page?: number, perPage?: number, filter?: string } = {}) {
    try {
      const result = await pb.collection('review').getList(
        options.page || 1,
        options.perPage || 30,
        {
          filter: options.filter || '',
          sort: '-created',
          expand: 'userId,productId'
        }
      );
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
