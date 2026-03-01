import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productHelpers, orderHelpers } from '@/lib/pocketbase';
import type { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Sparkles, 
  Calendar, 
  FileSpreadsheet, 
  LayoutTemplate, 
  Package,
  Star,
  Check,
  ChevronRight,
  ShoppingCart,
  Download,
  FileCheck,
  Clock,
  Shield
} from 'lucide-react';

const features = [
  { icon: FileCheck, title: 'Format Digital', description: 'File siap download' },
  { icon: Clock, title: 'Akses Lifetime', description: 'Update gratis selamanya' },
  { icon: Shield, title: 'Garansi', description: '30 hari uang kembali' },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    setIsLoading(true);
    const result = await productHelpers.getBySlug(slug!);
    if (result.success && result.data) {
      const prod = result.data as unknown as Product;
      setProduct(prod);
      // Load related products
      const related = await productHelpers.getAll({
        filter: `category = "${prod.category}" && id != "${prod.id}" && status = "active"`,
      });
      if (related.success && related.data) {
        setRelatedProducts(related.data.slice(0, 4) as unknown as Product[]);
      }
    } else {
      toast.error('Produk tidak ditemukan');
      navigate('/products');
    }
    setIsLoading(false);
  };

  const handleBuy = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    setIsPaymentLoading(true);
    try {
      // Create order
      const orderResult = await orderHelpers.create({
        userId: user?.id,
        productId: product?.id,
        productName: product?.name,
        amount: product?.price,
        status: 'pending',
        paymentMethod: 'xendit'
      });

      if (orderResult.success && orderResult.data) {
        // Initialize Xendit payment
        const response = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderResult.data.id,
            amount: product?.price,
            description: product?.name,
            customer: {
              email: user?.email,
              name: user?.name
            }
          })
        });

        const paymentData = await response.json();
        
        if (paymentData.invoice_url) {
          // Redirect to payment
          window.location.href = paymentData.invoice_url;
        } else {
          toast.error('Gagal membuat pembayaran');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planner': return Calendar;
      case 'spreadsheet': return FileSpreadsheet;
      case 'template': return LayoutTemplate;
      case 'bundle': return Package;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'planner': return 'bg-pink-100 text-pink-600 border-pink-200';
      case 'spreadsheet': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'template': return 'bg-green-100 text-green-600 border-green-200';
      case 'bundle': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      planner: 'Planner',
      spreadsheet: 'Spreadsheet',
      template: 'Template',
      bundle: 'Bundle',
      other: 'Lainnya'
    };
    return names[category] || category;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Produk tidak ditemukan</h2>
          <Button asChild className="bg-pink-400 hover:bg-pink-500 text-white">
            <Link to="/products">Kembali ke Produk</Link>
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(product.category);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-pink-500">Beranda</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-pink-500">Produk</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/products/category/${product.category}`} className="hover:text-pink-500 capitalize">
            {getCategoryName(product.category)}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CategoryIcon className="w-32 h-32 text-pink-300" />
                </div>
              )}
            </div>
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-green-400 text-white border-0 text-sm px-3 py-1">
                Baru
              </Badge>
            )}
            {product.originalPrice && (
              <Badge className="absolute top-4 right-4 bg-red-400 text-white border-0 text-sm px-3 py-1">
                Diskon
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Badge variant="outline" className={`mb-4 ${getCategoryColor(product.category)}`}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {getCategoryName(product.category)}
            </Badge>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-800">{product.rating}</span>
                <span className="text-gray-500">({product.reviewCount} ulasan)</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="text-gray-500">
                {product.salesCount} terjual
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-bold text-pink-600">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">{product.shortDescription}</p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-4 bg-pink-50 rounded-xl">
                  <feature.icon className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-800">{feature.title}</div>
                  <div className="text-xs text-gray-500">{feature.description}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1 bg-pink-400 hover:bg-pink-500 text-white"
                onClick={handleBuy}
                disabled={isPaymentLoading}
              >
                {isPaymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Beli Sekarang
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
                <Download className="w-5 h-5 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none h-auto p-0 mb-8">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
              >
                Deskripsi
              </TabsTrigger>
              <TabsTrigger 
                value="features"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
              >
                Fitur
              </TabsTrigger>
              <TabsTrigger 
                value="includes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-pink-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
              >
                Yang Didapat
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-0">
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                {product.description}
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="mt-0">
              <ul className="space-y-3">
                {product.features?.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="includes" className="mt-0">
              <ul className="space-y-3">
                {product.includes?.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Download className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const RelatedIcon = getCategoryIcon(relatedProduct.category);
                return (
                  <Link key={relatedProduct.id} to={`/product/${relatedProduct.slug}`}>
                    <Card className="overflow-hidden hover-lift border-0 shadow-lg shadow-pink-100/50 group">
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                        {relatedProduct.image ? (
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <RelatedIcon className="w-16 h-16 text-pink-300" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{relatedProduct.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{relatedProduct.rating}</span>
                        </div>
                        <span className="font-bold text-pink-600">{formatPrice(relatedProduct.price)}</span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masuk untuk Melanjutkan</DialogTitle>
            <DialogDescription>
              Anda perlu masuk atau mendaftar untuk melakukan pembelian.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button asChild className="bg-pink-400 hover:bg-pink-500 text-white">
              <Link to="/login">Masuk</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Daftar Akun Baru</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
