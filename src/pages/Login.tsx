import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Berhasil masuk!');
      navigate('/');
    } else {
      toast.error(result.error || 'Gagal masuk. Periksa email dan password Anda.');
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
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Selamat Datang Kembali
          </h1>
          <p className="text-gray-500 mt-2">
            Masuk untuk melanjutkan ke akun Anda
          </p>
        </div>

        <Card className="border-0 shadow-xl shadow-pink-100/50">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                    }
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                  >
                    Ingat saya
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-pink-500 hover:text-pink-600 font-medium"
                >
                  Lupa password?
                </Link>
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
                    Masuk
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
                  Belum punya akun?{' '}
                  <Link to="/register" className="text-pink-500 hover:text-pink-600 font-medium">
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
