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
export const productHelpers = {
  async getAll(options = {}) {
    try {
      const records = await pb.collection('products').getFullList({
        sort: '-created',
        ...options
      });
      return { success: true, data: records };
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
      return { success: true, data: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  async getBySlug(slug: string) {
    try {
      const record = await pb.collection('products').getFirstListItem(`slug = "${slug}"`);
      return { success: true, data: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  async getByCategory(category: string) {
    try {
      const records = await pb.collection('products').getFullList({
        filter: `category = "${category}" && status = "active"`,
        sort: '-created'
      });
      return { success: true, data: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  async create(productData: any) {
    try {
      const record = await pb.collection('products').create(productData);
      return { success: true, data: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  async update(id: string, productData: any) {
    try {
      const record = await pb.collection('products').update(id, productData);
      return { success: true, data: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  async delete(id: string) {
    try {
      await pb.collection('products').delete(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
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
