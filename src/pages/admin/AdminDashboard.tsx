import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderHelpers } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ArrowRight,
  LogOut,
  Sparkles,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  recentOrders: any[];
  salesByMonth: { month: string; amount: number }[];
}

export const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Produk', href: '/admin/products', icon: Package },
  { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Ulasan', href: '/admin/reviews', icon: Star },
];

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    const result = await orderHelpers.getStats();
    if (result.success && result.data) {
      const recentOrders = await orderHelpers.getRecent(5);
      setStats({
        ...result.data,
        recentOrders: recentOrders.success && recentOrders.data ? recentOrders.data : []
      });
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      refunded: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-800">
              NHM<span className="text-pink-400">Creative</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-sm font-medium text-pink-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800">
                NHM<span className="text-pink-400">Creative</span>
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">Ringkasan performa toko Anda</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Penjualan</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalSales}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-pink-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
                        <p className="text-2xl font-bold text-gray-800">{formatPrice(stats.totalRevenue)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-pink-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Pesanan</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-pink-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Produk</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-pink-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card className="border-0 shadow-sm">
                <div className="p-6 flex flex-row items-center justify-between border-b border-gray-100">
                  <h3 className="text-lg font-semibold">Pesanan Terbaru</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/orders">
                      Lihat Semua
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <CardContent>
                  {stats.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produk</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Jumlah</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Tanggal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.map((order: any) => (
                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-600">#{order.id.slice(-6)}</td>
                              <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{order.expand?.productId?.name || order.productName}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-sm text-gray-600">Rp</span>
                                  <span className="text-sm text-right text-gray-600">{formatNumber(order.amount)}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 flex items-center justify-center">
                                <Badge variant="outline" className={getStatusBadge(order.status)}>
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500 text-center">{formatDateTime(order.created)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Belum ada pesanan</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Gagal memuat data</p>
              <Button onClick={loadStats} variant="outline" className="mt-4">
                Coba Lagi
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
