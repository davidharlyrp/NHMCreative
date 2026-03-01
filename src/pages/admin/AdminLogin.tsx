import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Berhasil masuk sebagai admin!');
      navigate('/admin');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Portal
          </h1>
          <p className="text-gray-500 mt-2">
            Masuk untuk mengakses dashboard admin
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Admin</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@nhcreative.id"
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memuat...
                  </>
                ) : (
                  <>
                    Masuk sebagai Admin
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>NHCreative Admin Dashboard</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-pink-500">
            &larr; Kembali ke website
          </Link>
        </div>
      </div>
    </div>
  );
}
