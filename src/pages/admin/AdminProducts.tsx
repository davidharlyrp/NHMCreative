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
  Sparkles,
  X,
  Upload,
  Image as ImageIcon
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
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    price: string;
    originalPrice: string;
    category: string;
    features: string;
    includes: string;
    format: string;
    fileSize: number;
    isFeatured: boolean;
    isNew: boolean;
    status: string;
    image: File | null;
    gallery: File[];
    productFiles: File[];
  }>({
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
    fileSize: 0,
    isFeatured: false,
    isNew: false,
    status: 'active',
    image: null,
    gallery: [],
    productFiles: [],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [newProductFileNames, setNewProductFileNames] = useState<string[]>([]);
  const [existingProductFileNames, setExistingProductFileNames] = useState<string[]>([]);

  useEffect(() => {
    // Calculate total file size when productFiles change
    const totalSize = formData.productFiles.reduce((acc, file) => acc + file.size, 0);
    setFormData(prev => ({ ...prev, fileSize: totalSize }));
    setNewProductFileNames(formData.productFiles.map(f => f.name));
  }, [formData.productFiles]);

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
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      data.append('shortDescription', formData.shortDescription);
      data.append('description', formData.description);
      data.append('price', formData.price || '0');
      if (formData.originalPrice) data.append('originalPrice', formData.originalPrice);
      data.append('category', formData.category);
      data.append('format', formData.format);
      data.append('fileSize', String(formData.fileSize || 0));
      data.append('isFeatured', String(formData.isFeatured));
      data.append('isNew', String(formData.isNew));
      data.append('status', formData.status);
      data.append('rating', '0');
      data.append('reviewCount', '0');
      data.append('salesCount', '0');

      // Handle array-like fields for text schema
      const features = formData.features.split('\n').filter(f => f.trim()).join('\n');
      data.append('features', features);

      const includes = formData.includes.split('\n').filter(i => i.trim()).join('\n');
      data.append('includes', includes);

      // Handle files
      if (formData.image) {
        data.append('image', formData.image);
      }
      formData.gallery.forEach(file => {
        data.append('gallery', file);
      });
      formData.productFiles.forEach(file => {
        data.append('file', file);
      });

      const result = await productHelpers.create(data);
      if (result.success) {
        toast.success('Produk berhasil ditambahkan');
        setShowAddDialog(false);
        resetForm();
        loadProducts();
      } else {
        console.error('PocketBase Create Error:', result.originalError || result.error);
        toast.error(result.error || 'Gagal menambahkan produk');
      }
    } catch (error: any) {
      console.error('Add Product Exception:', error);
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      data.append('shortDescription', formData.shortDescription);
      data.append('description', formData.description);
      data.append('price', formData.price || '0');
      data.append('originalPrice', formData.originalPrice || '');
      data.append('category', formData.category);
      data.append('format', formData.format);
      data.append('fileSize', String(formData.fileSize || 0));
      data.append('isFeatured', String(formData.isFeatured));
      data.append('isNew', String(formData.isNew));
      data.append('status', formData.status);

      // Handle array-like fields for text schema
      const features = formData.features.split('\n').filter(f => f.trim()).join('\n');
      data.append('features', features);

      const includes = formData.includes.split('\n').filter(i => i.trim()).join('\n');
      data.append('includes', includes);

      // Handle files
      if (formData.image) {
        data.append('image', formData.image);
      }
      formData.gallery.forEach(file => {
        data.append('gallery', file);
      });
      formData.productFiles.forEach(file => {
        data.append('file', file);
      });

      const result = await productHelpers.update(selectedProduct.id, data);
      if (result.success) {
        toast.success('Produk berhasil diperbarui');
        setShowEditDialog(false);
        setSelectedProduct(null);
        resetForm();
        loadProducts();
      } else {
        console.error('PocketBase Update Error:', result.originalError || result.error);
        toast.error(result.error || 'Gagal memperbarui produk');
      }
    } catch (error: any) {
      console.error('Edit Product Exception:', error);
      toast.error(error.message || 'Terjadi kesalahan');
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
      features: Array.isArray(product.features) ? product.features.join('\n') : (product.features || ''),
      includes: Array.isArray(product.includes) ? product.includes.join('\n') : (product.includes || ''),
      format: product.format || '',
      fileSize: product.fileSize || 0,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      status: product.status,
      image: null,
      gallery: [],
      productFiles: [],
    });
    if (product.image) {
      setImagePreview(productHelpers.getFileUrl(product, product.image));
    } else {
      setImagePreview(null);
    }
    if (product.gallery && product.gallery.length > 0) {
      setGalleryPreviews(product.gallery.map(img => productHelpers.getFileUrl(product, img)));
    } else {
      setGalleryPreviews([]);
    }
    if (product.file && product.file.length > 0) {
      setExistingProductFileNames(product.file);
    } else {
      setExistingProductFileNames([]);
    }
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
      fileSize: 0,
      isFeatured: false,
      isNew: false,
      status: 'active',
      image: null,
      gallery: [],
      productFiles: [],
    });
    setImagePreview(null);
    setGalleryPreviews([]);
    setNewProductFileNames([]);
    setExistingProductFileNames([]);
  };

  const handleProductFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        productFiles: [...prev.productFiles, ...files]
      }));
    }
  };

  const removeProductFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productFiles: prev.productFiles.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData({ ...formData, gallery: [...formData.gallery, ...files] });
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index)
    });
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-');  // Replace multiple - with single -
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
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                {product.image ? (
                                  <img
                                    src={productHelpers.getFileUrl(product, product.image)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate">{product.slug}</p>
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
                              <p className="text-[10px] text-gray-400 capitalize">{product.format} • {formatFileSize(product.fileSize || 0)}</p>
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
                  onChange={(e) => {
                    const newName = e.target.value;
                    const prevSlug = slugify(formData.name);
                    const isSlugAuto = !formData.slug || formData.slug === prevSlug;

                    setFormData(prev => ({
                      ...prev,
                      name: newName,
                      slug: isSlugAuto ? slugify(newName) : prev.slug
                    }));
                  }}
                  placeholder="Nama produk"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
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
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format File</Label>
                <Input
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  placeholder="PDF, XLSX, dll"
                />
              </div>
              <div className="space-y-2">
                <Label>Ukuran File</Label>
                <Input
                  value={formatFileSize(formData.fileSize)}
                  readOnly
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>File Produk Digital (Multiple)</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Upload file produk yang akan didownload pembeli
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleProductFilesChange}
                    />
                  </label>
                </div>

                {(newProductFileNames.length > 0) && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">File Terpilih:</p>
                    {newProductFileNames.map((name, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-md shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Package className="w-4 h-4 text-pink-400 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{name}</span>
                        </div>
                        <button
                          onClick={() => removeProductFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-pink-400 focus:ring-pink-400"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer font-normal">Produk Unggulan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isNew"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="rounded border-gray-300 text-pink-400 focus:ring-pink-400"
                />
                <Label htmlFor="isNew" className="cursor-pointer font-normal">Produk Baru</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gambar Utama</Label>
              <div className="flex items-start gap-4">
                <div className="relative group w-32 h-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          setFormData({ ...formData, image: null });
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-[10px] text-gray-400">Pilih Foto</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 text-xs text-gray-500 pt-2">
                  <p className="font-medium mb-1">Rekomendasi:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Rasio 1:1 atau 4:3</li>
                    <li>Maksimal 2MB</li>
                    <li>Format JPG, PNG, atau WebP</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Galeri Foto</Label>
              <div className="grid grid-cols-4 gap-3">
                {galleryPreviews.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                    <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
                <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-center">
                    <Plus className="w-5 h-5 text-gray-300 mx-auto" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
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
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format File</Label>
                <Input
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ukuran File</Label>
                <Input
                  value={formatFileSize(formData.fileSize)}
                  readOnly
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>File Produk Digital (Multiple)</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Tambah File Baru</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleProductFilesChange}
                    />
                  </label>
                </div>

                {(existingProductFileNames.length > 0 || newProductFileNames.length > 0) && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">File:</p>
                    {/* Existing Files */}
                    {existingProductFileNames.map((name, index) => (
                      <div key={`existing-${index}`} className="flex items-center justify-between bg-white px-3 py-2 rounded-md shadow-sm border border-gray-100 opacity-70">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Package className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{name}</span>
                          <Badge variant="secondary" className="text-[9px] px-1 h-4">Existing</Badge>
                        </div>
                        <button
                          onClick={() => setExistingProductFileNames(prev => prev.filter((_, i) => i !== index))}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {/* New Files */}
                    {newProductFileNames.map((name, index) => (
                      <div key={`new-${index}`} className="flex items-center justify-between bg-white px-3 py-2 rounded-md shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Package className="w-4 h-4 text-pink-400 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{name}</span>
                          <Badge className="bg-pink-100 text-pink-600 border-none text-[9px] px-1 h-4">New</Badge>
                        </div>
                        <button
                          onClick={() => removeProductFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 py-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-pink-400 focus:ring-pink-400"
                />
                <Label htmlFor="editIsFeatured" className="cursor-pointer font-normal">Produk Unggulan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsNew"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="rounded border-gray-300 text-pink-400 focus:ring-pink-400"
                />
                <Label htmlFor="editIsNew" className="cursor-pointer font-normal">Produk Baru</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gambar Utama</Label>
              <div className="flex items-start gap-4">
                <div className="relative group w-32 h-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          setFormData({ ...formData, image: null });
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-[10px] text-gray-400">Pilih Foto</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Galeri Foto</Label>
              <div className="grid grid-cols-4 gap-3">
                {galleryPreviews.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                    <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
                <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-center">
                    <Plus className="w-5 h-5 text-gray-300 mx-auto" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fitur (satu per baris)</Label>
              <Textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Yang Didapat (satu per baris)</Label>
              <Textarea
                value={formData.includes}
                onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                rows={3}
              />
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
