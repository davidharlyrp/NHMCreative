import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productHelpers } from '@/lib/pocketbase';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Calendar,
  FileSpreadsheet,
  LayoutTemplate,
  Package,
  Star,
  Search,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

const categories = [
  { id: 'all', name: 'Semua Produk', icon: Sparkles },
  { id: 'planner', name: 'Planner', icon: Calendar },
  { id: 'spreadsheet', name: 'Spreadsheet', icon: FileSpreadsheet },
  { id: 'template', name: 'Template', icon: LayoutTemplate },
  { id: 'bundle', name: 'Bundle', icon: Package },
];

const sortOptions = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price-low', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price-high', label: 'Harga: Tinggi ke Rendah' },
  { value: 'popular', label: 'Paling Populer' },
  { value: 'rating', label: 'Rating Tertinggi' },
];

export default function Products() {
  const { category: categoryParam } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const loadProducts = async () => {
    setIsLoading(true);
    const result = await productHelpers.getAll({ filter: 'status = "active"' });
    if (result.success && result.data) {
      setProducts(result.data as unknown as Product[]);
    }
    setIsLoading(false);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    }

    setFilteredProducts(filtered);
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
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : category;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-pink-500">Beranda</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800">Produk</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-800">{getCategoryName(selectedCategory)}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {selectedCategory === 'all' ? 'Semua Produk' : getCategoryName(selectedCategory)}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} produk tersedia
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? 'bg-pink-400 text-white'
                    : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div className="flex gap-4 lg:ml-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-pink-300 focus:ring-pink-200"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border-gray-200">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const CategoryIcon = getCategoryIcon(product.category);
              if (!product.slug) {
                console.warn(`Product "${product.name}" (ID: ${product.id}) is missing a slug!`);
              }
              return (
                <Link key={product.id} to={`/product/${product.slug || 'no-slug'}`}>
                  <Card className="overflow-hidden hover-lift border-0 shadow-lg shadow-pink-100/50 group h-full">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                      {product.image ? (
                        <img
                          src={productHelpers.getFileUrl(product, product.image)}
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
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.shortDescription}</p>
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
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Produk tidak ditemukan</h3>
            <p className="text-gray-500 mb-4">Coba ubah filter atau kata kunci pencarian</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
