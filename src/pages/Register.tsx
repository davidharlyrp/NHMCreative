import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Sparkles, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

const benefits = [
  'Akses ke semua produk digital',
  'Riwayat pembelian tersimpan',
  'Update produk otomatis',
  'Dukungan pelanggan prioritas',
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (!formData.agreeTerms) {
      toast.error('Anda harus menyetujui syarat dan ketentuan');
      return;
    }

    setIsLoading(true);

    const result = await register(formData.email, formData.password, formData.name);
    
    if (result.success) {
      toast.success('Akun berhasil dibuat! Selamat datang.');
      navigate('/');
    } else {
      toast.error(result.error || 'Gagal membuat akun. Silakan coba lagi.');
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Bergabung dengan NHCreative
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Daftar sekarang dan dapatkan akses ke koleksi produk digital terbaik 
                untuk assistant dan virtual assistant.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-pink-500" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
              <p className="text-gray-600 italic">
                "Produk dari NHCreative sangat membantu saya mengelola tugas harian 
                sebagai virtual assistant. Sangat recommended!"
              </p>
              <p className="text-sm text-gray-500 mt-3">— Sarah, Virtual Assistant</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <Card className="border-0 shadow-xl shadow-pink-100/50">
              <CardContent className="p-8">
                <div className="lg:hidden text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Buat Akun Baru</h1>
                  <p className="text-gray-500 mt-2">Daftar untuk mulai berbelanja</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Nama Anda"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 8 karakter"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 h-12"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                      }
                      className="mt-1"
                    />
                    <label
                      htmlFor="agreeTerms"
                      className="text-sm text-gray-600 leading-relaxed"
                    >
                      Saya menyetujui{' '}
                      <Link to="/terms" className="text-pink-500 hover:text-pink-600">
                        Syarat dan Ketentuan
                      </Link>{' '}
                      serta{' '}
                      <Link to="/privacy" className="text-pink-500 hover:text-pink-600">
                        Kebijakan Privasi
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-pink-400 hover:bg-pink-500 text-white h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Memuat...
                      </>
                    ) : (
                      <>
                        Daftar
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">atau</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Sudah punya akun?{' '}
                      <Link to="/login" className="text-pink-500 hover:text-pink-600 font-medium">
                        Masuk di sini
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-pink-500">
            &larr; Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
