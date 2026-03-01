import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productHelpers } from '@/lib/pocketbase';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  FileSpreadsheet,
  LayoutTemplate,
  Package,
  Star,
  CheckCircle2,
  Users,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Planner Digital',
    description: 'Atur jadwal dan tugas dengan planner yang dirancang khusus untuk assistant.',
    color: 'bg-pink-100 text-pink-500',
  },
  {
    icon: FileSpreadsheet,
    title: 'Spreadsheet Profesional',
    description: 'Template spreadsheet siap pakai untuk berbagai kebutuhan administrasi.',
    color: 'bg-purple-100 text-purple-500',
  },
  {
    icon: LayoutTemplate,
    title: 'Template Dokumen',
    description: 'Kumpulan template dokumen profesional untuk komunikasi bisnis.',
    color: 'bg-green-100 text-green-500',
  },
  {
    icon: Package,
    title: 'Bundle Hemat',
    description: 'Paket bundle dengan harga spesial untuk kebutuhan lengkap.',
    color: 'bg-orange-100 text-orange-500',
  },
];

const stats = [
  { label: 'Produk', value: '50+', icon: Package },
  { label: 'Pelanggan', value: '1000+', icon: Users },
  { label: 'Rating', value: '4.9', icon: Star },
  { label: 'Penjualan', value: '5000+', icon: TrendingUp },
];

const benefits = [
  'Desain profesional dan modern',
  'Mudah digunakan dan dikustomisasi',
  'Update gratis selamanya',
  'Support pelanggan responsif',
  'Format kompatibel universal',
  'Harga terjangkau',
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);

    // Load featured products
    const featuredResult = await productHelpers.getFeatured();
    if (featuredResult.success && featuredResult.data) {
      setFeaturedProducts(featuredResult.data as unknown as Product[]);
    }

    setIsLoading(false);
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 gradient-hero opacity-50"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-pink-100 text-pink-600 hover:bg-pink-100 border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Produk Digital untuk Assistant & VA
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Tingkatkan Produktivitas dengan{' '}
              <span className="text-gradient">Produk Digital</span> Profesional
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Kumpulan planner, spreadsheet, dan template berkualitas yang dirancang khusus
              untuk assistant dan virtual assistant. Hemat waktu, tingkatkan efisiensi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-pink-400 hover:bg-pink-500 text-white px-8" asChild>
                <Link to="/products">
                  Jelajahi Produk
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50" asChild>
                <Link to="/about">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-pink-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 mb-3">
                  <stat.icon className="w-6 h-6 text-pink-400" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Kategori Produk</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih dari berbagai kategori produk digital yang sesuai dengan kebutuhan Anda
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift border-0 shadow-lg shadow-pink-100/50">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50/50 to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Produk Unggulan</h2>
              <p className="text-gray-600">Produk paling populer pilihan pelanggan</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex text-pink-600 hover:text-pink-700 hover:bg-pink-50" asChild>
              <Link to="/products">
                Lihat Semua
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
                const CategoryIcon = getCategoryIcon(product.category);
                return (
                  <Link key={product.id} to={`/product/${product.slug}`}>
                    <Card className="overflow-hidden hover-lift border-0 shadow-lg shadow-pink-100/50 group">
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CategoryIcon className="w-16 h-16 text-pink-300" />
                          </div>
                        )}
                        {product.isNew && (
                          <Badge className="absolute top-3 left-3 bg-green-400 text-white border-0">
                            Baru
                          </Badge>
                        )}
                        {product.originalPrice && (
                          <Badge className="absolute top-3 right-3 bg-red-400 text-white border-0">
                            Diskon
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <Badge variant="outline" className={`mb-2 ${getCategoryColor(product.category)}`}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {product.category}
                        </Badge>
                        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{product.rating}</span>
                          <span className="text-sm text-gray-400">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-pink-600">{formatPrice(product.price)}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada produk unggulan</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="ghost" className="text-pink-600 hover:text-pink-700 hover:bg-pink-50" asChild>
              <Link to="/products">
                Lihat Semua Produk
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Kenapa Memilih <span className="text-pink-500">NHMCreative</span>?
              </h2>
              <p className="text-gray-600 mb-8">
                Kami berkomitmen menyediakan produk digital berkualitas tinggi yang membantu
                assistant dan virtual assistant bekerja lebih efisien dan profesional.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl transform rotate-3 opacity-50"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-50 rounded-2xl p-6 text-center">
                    <Calendar className="w-10 h-10 text-pink-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-800">20+</div>
                    <div className="text-sm text-gray-500">Planner</div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-6 text-center">
                    <FileSpreadsheet className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-800">15+</div>
                    <div className="text-sm text-gray-500">Spreadsheet</div>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-6 text-center">
                    <LayoutTemplate className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-800">30+</div>
                    <div className="text-sm text-gray-500">Template</div>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-6 text-center">
                    <Package className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-800">10+</div>
                    <div className="text-sm text-gray-500">Bundle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-400 to-purple-400 p-12 lg:p-16 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Siap Meningkatkan Produktivitas?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Bergabung dengan ribuan assistant dan VA yang sudah menggunakan produk kami.
                Dapatkan diskon spesial untuk pembelian pertama!
              </p>
              <Button size="lg" className="bg-white text-pink-500 hover:bg-gray-100" asChild>
                <Link to="/products">
                  Mulai Belanja Sekarang
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
