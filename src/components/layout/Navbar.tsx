import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, ShoppingBag, LogOut, ChevronDown, Sparkles } from 'lucide-react';

const navLinks = [
  { name: 'Beranda', href: '/' },
  { name: 'Produk', href: '/products' },
  { name: 'Tentang', href: '/about' },
  { name: 'Kontak', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-800">
              NH<span className="text-pink-400">Creative</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-pink-500 ${
                  isActive(link.href) ? 'text-pink-500' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="text-sm text-gray-700">{user?.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild>
                  <Link to="/login">Masuk</Link>
                </Button>
                <Button className="bg-pink-400 hover:bg-pink-500 text-white" asChild>
                  <Link to="/register">Daftar</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-pink-500 hover:bg-pink-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-pink-100">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'bg-pink-50 text-pink-500'
                      : 'text-gray-600 hover:bg-pink-50 hover:text-pink-500'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-pink-100 mt-2">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                        onClick={() => setIsOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 px-4">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        Masuk
                      </Link>
                    </Button>
                    <Button className="w-full bg-pink-400 hover:bg-pink-500 text-white" asChild>
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        Daftar
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
