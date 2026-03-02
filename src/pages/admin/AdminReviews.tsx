import { useEffect, useState } from 'react';
import { navItems } from './AdminDashboard';
import { Link, useLocation } from 'react-router-dom';
import { reviewHelpers } from '@/lib/pocketbase';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setIsLoading(true);
        const result = await reviewHelpers.getAll({ perPage: 50 });
        if (result.success && 'items' in result) {
            setReviews(result.items);
        } else if (!result.success) {
            toast.error((result as any).error || 'Gagal mengambil data review');
        }
        setIsLoading(false);
    };

    const getStatusBadge = (rating: number) => {
        if (rating >= 4) return 'bg-green-100 text-green-700 border-green-200';
        if (rating >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-gray-50">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-pink-400 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">N</span>
                        </div>
                        <span className="font-bold text-gray-800 text-lg">NHM Admin</span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item: any) => {
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
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Daftar Ulasan</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola ulasan produk dari pembeli</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-50">
                                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Produk & Pembeli</th>
                                        <th className="py-4 px-6 text-sm font-medium text-gray-500 text-center">Rating</th>
                                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Ulasan</th>
                                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-5 px-6">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <Package className="w-4 h-4 text-pink-400" />
                                                            <span className="text-sm font-bold text-gray-800 line-clamp-1">
                                                                {review.expand?.productId?.name || 'Produk dihapus'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold uppercase">
                                                                {review.userName?.charAt(0) || review.expand?.userId?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                {review.userName || review.expand?.userId?.name || 'Anonim'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6 text-center">
                                                    <Badge variant="outline" className={`px-2.5 py-1 text-xs border-0 font-semibold ${getStatusBadge(review.rating)}`}>
                                                        {review.rating} Bintang
                                                    </Badge>
                                                    <div className="flex justify-center mt-1.5 gap-0.5 text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="relative group">
                                                        <p className="text-sm text-gray-600 line-clamp-2 italic max-w-sm">"{review.comment}"</p>
                                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] p-2 rounded-lg z-10 w-48 shadow-lg">
                                                            "{review.comment}"
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-6">
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(review.created).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                                <p className="text-gray-400">Belum ada ulasan untuk ditampilkan.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
