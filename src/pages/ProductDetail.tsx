import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productHelpers, orderHelpers, reviewHelpers, API_URL } from '@/lib/pocketbase';
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
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewUserName, setReviewUserName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug, user]);

  const checkReviewStatus = async (productId: string) => {
    if (!user?.id) return;
    const result = await reviewHelpers.getByUserAndProduct(user.id, productId);
    if (result.success && result.data) {
      setHasReviewed(true);
    }
  };

  const loadReviews = async (productId: string) => {
    const result = await reviewHelpers.getByProduct(productId);
    if (result.success && result.data) {
      setReviews(result.data);
    }
  };

  const checkPurchaseStatus = async (productId: string) => {
    try {
      const result = await orderHelpers.getAll({
        filter: `userId = "${user?.id}" && productId = "${productId}" && status = "paid"`
      });
      if (result.success && result.data && result.data.length > 0) {
        setHasPurchased(true);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const loadProduct = async (silent = false) => {
    if (!silent) setIsLoading(true);
    console.log('Fetching product with slug:', slug);
    const result = await productHelpers.getBySlug(slug!);
    if (result.success && result.data) {
      const prod = result.data as unknown as Product;
      setProduct(prod);
      setActiveImage(prod.image);

      // Check if user has purchased
      if (user?.id) {
        checkPurchaseStatus(prod.id);
        checkReviewStatus(prod.id);
        setReviewUserName(user.name || '');
      }

      loadReviews(prod.id);

      // Load related products
      const related = await productHelpers.getAll({
        filter: `category = "${prod.category}" && id != "${prod.id}" && status = "active"`,
      });
      if (related.success && related.data) {
        setRelatedProducts(related.data.slice(0, 4) as unknown as Product[]);
      }
    } else {
      if (result.isAbort) return; // Ignore autocancelled requests

      console.error('Failed to load product:', result.error);
      toast.error('Produk tidak ditemukan');
      navigate('/products');
    }
    if (!silent) setIsLoading(false);
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
        // Initialize Xendit payment via our secure backend
        const response = await fetch(`${API_URL}/api/payment/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderResult.data.id,
            amount: product?.price,
            productSlug: product?.slug,
            description: `Pembelian ${product?.name}`,
            customer: {
              email: user?.email,
              name: user?.name
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal membuat pembayaran');
        }

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !product) return;

    setIsSubmittingReview(true);
    try {
      const result = await reviewHelpers.create({
        productId: product.id,
        userId: user.id,
        userName: reviewUserName || user.name,
        rating: rating,
        comment: comment
      });

      if (result.success) {
        toast.success('Terima kasih atas ulasan Anda!');
        setHasReviewed(true);
        setComment('');
        loadProduct(true); // Re-fetch product data for updated rating/count
        loadReviews(product.id);
      } else {
        toast.error(result.error || 'Gagal mengirim ulasan');
      }
    } catch (error) {
      toast.error('Gagal mengirim ulasan');
    } finally {
      setIsSubmittingReview(false);
    }
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
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              {activeImage ? (
                <img
                  src={productHelpers.getFileUrl(product, activeImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CategoryIcon className="w-24 h-24 text-pink-200" />
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setActiveImage(product.image)}
                  className={`w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden border-2 transition-all ${activeImage === product.image ? 'border-pink-400' : 'border-transparent'
                    }`}
                >
                  <img src={productHelpers.getFileUrl(product, product.image)} className="w-full h-full object-cover" alt="Main" />
                </button>
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden border-2 transition-all ${activeImage === img ? 'border-pink-400' : 'border-transparent'
                      }`}
                  >
                    <img src={productHelpers.getFileUrl(product, img)} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                  </button>
                ))}
              </div>
            )}
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-green-400 text-white border-0 text-sm px-3 py-1">
                Baru
              </Badge>
            )}
            {product.originalPrice && (
              <Badge className="absolute top-4 right-4 bg-red-400 text-white border-0 text-sm px-3 py-1">
                % Diskon
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
              <div className="flex items-center gap-1.5">
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-bold text-gray-800">{product.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({product.reviewCount} ulasan)</span>
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

            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 font-normal">
                {product.format}
              </Badge>
              <span>•</span>
              <span>{formatFileSize(product.fileSize)}</span>
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
            <div className="flex flex-col sm:flex-row gap-3">
              {hasPurchased ? (
                <Button
                  size="lg"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-sm rounded-xl"
                  onClick={() => {
                    if (product.file && product.file.length > 0) {
                      window.open(productHelpers.getFileUrl(product, product.file[0]), '_blank');
                    } else {
                      toast.error('File tidak tersedia untuk diunduh');
                    }
                  }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download File
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex-1 bg-pink-400 hover:bg-pink-500 text-white shadow-sm rounded-xl"
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
              )}
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
                            src={productHelpers.getFileUrl(relatedProduct, relatedProduct.image)}
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

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="border-t border-gray-100 pt-12">
          <div className="flex flex-col md:flex-row md:items-start gap-12">
            {/* Left Side: Summary & Form */}
            <div className="md:w-1/3">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Ulasan Pelanggan
                <Badge variant="secondary" className="bg-pink-50 text-pink-500 border-none px-2 rounded-full text-xs">
                  {reviews.length}
                </Badge>
              </h2>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl font-bold text-gray-800">{product.rating.toFixed(1)}</div>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-tight">Berdasarkan {product.reviewCount} ulasan</span>
                  </div>
                </div>

                {/* Verified Buyer Form */}
                {hasPurchased && !hasReviewed && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Tulis Ulasan</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1">Username Review</label>
                        <input
                          type="text"
                          required
                          value={reviewUserName}
                          onChange={(e) => setReviewUserName(e.target.value)}
                          placeholder="Nama yang akan ditampilkan..."
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all placeholder:text-gray-300 mb-2"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 ml-1">Rating Produk</label>
                        <div className="flex gap-1.5 text-gray-200 ml-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`transition-all ${star <= rating ? 'text-yellow-400' : 'hover:text-yellow-300'}`}
                            >
                              <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <textarea
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all placeholder:text-gray-300"
                          rows={3}
                          placeholder="Tulis ulasan Anda di sini..."
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl py-5"
                      >
                        {isSubmittingReview ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : 'Kirim Ulasan'}
                      </Button>
                    </form>
                  </div>
                )}

                {hasReviewed && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-green-700 text-center font-medium">Anda sudah memberikan ulasan. Terima kasih!</p>
                  </div>
                )}

                {!user && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                      Silakan <button onClick={() => setShowLoginDialog(true)} className="text-pink-500 font-semibold underline">Login</button> untuk menulis ulasan produk ini.
                    </p>
                  </div>
                )}

                {user && !hasPurchased && !hasReviewed && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 text-center italic leading-relaxed">Hanya pembeli yang bisa memberikan ulasan.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Reviews List */}
            <div className="md:w-2/3">
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm transition-all hover:bg-gray-50/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 text-xs font-bold uppercase">
                            {rev.userName?.charAt(0) || rev.expand?.userId?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-800">{rev.userName || rev.expand?.userId?.name || 'Anonim'}</div>
                            <div className="text-[10px] text-gray-400">
                              {new Date(rev.created).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-3">"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                    <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Belum ada ulasan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
