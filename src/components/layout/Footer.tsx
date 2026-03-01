import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Mail, MessageCircle } from 'lucide-react';

const footerLinks = {
  produk: [
    { name: 'Planner', href: '/products/category/planner' },
    { name: 'Spreadsheet', href: '/products/category/spreadsheet' },
    { name: 'Template', href: '/products/category/template' },
    { name: 'Bundle', href: '/products/category/bundle' },
  ],
  perusahaan: [
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Kontak', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ],
  legal: [
    { name: 'Syarat & Ketentuan', href: '/terms' },
    { name: 'Kebijakan Privasi', href: '/privacy' },
  ],
};

const socialLinks = [
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'WhatsApp', icon: MessageCircle, href: '#' },
  { name: 'Email', icon: Mail, href: 'mailto:hello@nhcreative.id' },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-800">
                NH<span className="text-pink-400">Creative</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Produk digital berkualitas untuk assistant dan virtual assistant. 
              Tingkatkan produktivitas dengan planner, spreadsheet, dan template profesional.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-gray-500 hover:bg-pink-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Produk</h3>
            <ul className="space-y-3">
              {footerLinks.produk.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Perusahaan</h3>
            <ul className="space-y-3">
              {footerLinks.perusahaan.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-pink-100">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} NHCreative. All rights reserved.
            </p>
            <p className="text-sm text-gray-400">
              Dibuat dengan ❤️ untuk assistant & VA
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
