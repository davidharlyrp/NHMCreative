import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderHelpers } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Search,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Package,
  Sparkles,
  RefreshCw,
  DollarSign,
  Calendar
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Produk', href: '/admin/products', icon: Package },
  { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
];

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'failed', label: 'Gagal' },
  { value: 'refunded', label: 'Dikembalikan' },
];

export default function AdminOrders() {
  const { logout, user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    const result = await orderHelpers.getAll();
    if (result.success && result.data) {
      setOrders(result.data);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const result = await orderHelpers.updateStatus(orderId, newStatus);
    if (result.success) {
      toast.success('Status pesanan diperbarui');
      loadOrders();
    } else {
      toast.error('Gagal memperbarui status');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      paid: 'Dibayar',
      failed: 'Gagal',
      refunded: 'Dikembalikan',
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.expand?.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0);
  
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const paidCount = orders.filter((o) => o.status === 'paid').length;

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
              NH<span className="text-pink-400">Creative</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin/orders';
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
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
                NH<span className="text-pink-400">Creative</span>
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
                  <Link to="/admin">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Kembali
                  </Link>
                </Button>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kelola Pesanan</h1>
              <p className="text-gray-500 mt-1">Lihat dan kelola semua pesanan</p>
            </div>
            <Button
              variant="outline"
              onClick={loadOrders}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-gray-800">{formatPrice(totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Menunggu Pembayaran</p>
                    <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pesanan Berhasil</p>
                    <p className="text-2xl font-bold text-gray-800">{paidCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Produk</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Pelanggan</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Jumlah</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Tanggal</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm text-gray-600">
                              #{order.id.slice(-8)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-800">{order.productName}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-sm text-gray-800">{order.expand?.userId?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{order.expand?.userId?.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-800">{formatPrice(order.amount)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className={getStatusBadge(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-500">{formatDate(order.created)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="paid">Dibayar</SelectItem>
                                <SelectItem value="failed">Gagal</SelectItem>
                                <SelectItem value="refunded">Dikembalikan</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada pesanan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
