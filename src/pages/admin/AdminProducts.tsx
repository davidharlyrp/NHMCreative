import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productHelpers } from '@/lib/pocketbase';
import type { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Sparkles
} from 'lucide-react';

const categories = [
  { value: 'planner', label: 'Planner' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'template', label: 'Template' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'other', label: 'Lainnya' },
];

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Produk', href: '/admin/products', icon: Package },
  { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
];

export default function AdminProducts() {
  const { logout, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    features: '',
    includes: '',
    format: '',
    isFeatured: false,
    isNew: false,
    status: 'active',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const result = await productHelpers.getAll();
    if (result.success && result.data) {
      setProducts(result.data as unknown as Product[]);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
  };

  const handleAdd = async () => {
    const data = {
      ...formData,
      price: parseInt(formData.price),
      originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
      features: formData.features.split('\n').filter(f => f.trim()),
      includes: formData.includes.split('\n').filter(i => i.trim()),
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
    };

    const result = await productHelpers.create(data);
    if (result.success) {
      toast.success('Produk berhasil ditambahkan');
      setShowAddDialog(false);
      resetForm();
      loadProducts();
    } else {
      toast.error(result.error || 'Gagal menambahkan produk');
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;

    const data = {
      ...formData,
      price: parseInt(formData.price),
      originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
      features: formData.features.split('\n').filter(f => f.trim()),
      includes: formData.includes.split('\n').filter(i => i.trim()),
    };

    const result = await productHelpers.update(selectedProduct.id, data);
    if (result.success) {
      toast.success('Produk berhasil diperbarui');
      setShowEditDialog(false);
      setSelectedProduct(null);
      resetForm();
      loadProducts();
    } else {
      toast.error(result.error || 'Gagal memperbarui produk');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    const result = await productHelpers.delete(selectedProduct.id);
    if (result.success) {
      toast.success('Produk berhasil dihapus');
      setShowDeleteDialog(false);
      setSelectedProduct(null);
      loadProducts();
    } else {
      toast.error(result.error || 'Gagal menghapus produk');
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      features: product.features?.join('\n') || '',
      includes: product.includes?.join('\n') || '',
      format: product.format || '',
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      status: product.status,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      features: '',
      includes: '',
      format: '',
      isFeatured: false,
      isNew: false,
      status: 'active',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      planner: 'bg-pink-100 text-pink-600',
      spreadsheet: 'bg-purple-100 text-purple-600',
      template: 'bg-green-100 text-green-600',
      bundle: 'bg-orange-100 text-orange-600',
      other: 'bg-gray-100 text-gray-600',
    };
    return colors[category] || colors.other;
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            const isActive = item.href === '/admin/products';
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Kelola Produk</h1>
              <p className="text-gray-500 mt-1">Tambah, edit, atau hapus produk</p>
            </div>
            <Button
              className="bg-pink-400 hover:bg-pink-500 text-white"
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          {/* Products Table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Produk</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Kategori</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Harga</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-pink-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={getCategoryColor(product.category)}>
                              {product.category}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-800">{formatPrice(product.price)}</p>
                              {product.originalPrice && (
                                <p className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.originalPrice)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                              {product.isFeatured && (
                                <Badge className="bg-yellow-100 text-yellow-700">Unggulan</Badge>
                              )}
                              {product.isNew && (
                                <Badge className="bg-green-100 text-green-700">Baru</Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(product)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => openDeleteDialog(product)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada produk</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
            <DialogDescription>
              Isi detail produk di bawah ini
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama produk"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="nama-produk"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Singkat</Label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Deskripsi singkat produk"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Lengkap</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi lengkap produk"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="100000"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Asli (opsional)</Label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="150000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format File</Label>
                <Input
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  placeholder="PDF, XLSX, dll"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fitur (satu per baris)</Label>
              <Textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Fitur 1&#10;Fitur 2&#10;Fitur 3"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Yang Didapat (satu per baris)</Label>
              <Textarea
                value={formData.includes}
                onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                placeholder="File 1&#10;File 2&#10;File 3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAdd} className="bg-pink-400 hover:bg-pink-500 text-white">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>
              Ubah detail produk di bawah ini
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Singkat</Label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Lengkap</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Asli</Label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleEdit} className="bg-pink-400 hover:bg-pink-500 text-white">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk "{selectedProduct?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
