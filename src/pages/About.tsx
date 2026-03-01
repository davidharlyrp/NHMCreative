import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  Target,
  Heart,
  Zap,
  Calendar,
  FileSpreadsheet,
  LayoutTemplate,
  Package
} from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Fokus',
    description: 'Kami fokus pada kebutuhan spesifik assistant dan virtual assistant.',
    color: 'bg-pink-100 text-pink-500',
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'Setiap produk dibuat dengan cinta dan perhatian pada detail.',
    color: 'bg-purple-100 text-purple-500',
  },
  {
    icon: Zap,
    title: 'Efisiensi',
    description: 'Produk kami dirancang untuk menghemat waktu dan tenaga.',
    color: 'bg-green-100 text-green-500',
  },
];

const stats = [
  { value: '50+', label: 'Produk Digital', icon: Package },
  { value: '1000+', label: 'Pelanggan Puas', icon: Heart },
  { value: '4.9', label: 'Rating Rata-rata', icon: Sparkles },
  { value: '5000+', label: 'Produk Terjual', icon: Zap },
];

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Tentang <span className="text-pink-500">NHMCreative</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Kami adalah tim kreatif yang berdedikasi untuk membantu assistant dan virtual assistant
            bekerja lebih efisien melalui produk digital berkualitas.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Cerita Kami</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                NHMCreative dimulai dari pengalaman pribadi bekerja sebagai virtual assistant.
                Kami menyadari betapa pentingnya memiliki tools yang tepat untuk mengelola
                tugas-tugas harian dengan efisien.
              </p>
              <p>
                Pada tahun 2023, kami memutuskan untuk membuat produk digital yang tidak hanya
                fungsional, tetapi juga estetis dan mudah digunakan. Setiap produk dirancang
                dengan mempertimbangkan kebutuhan nyata assistant modern.
              </p>
              <p>
                Hari ini, kami bangga telah membantu ribuan assistant dan VA di seluruh Indonesia
                untuk meningkatkan produktivitas dan kualitas pekerjaan mereka.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl transform rotate-3 opacity-50"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-6 bg-pink-50 rounded-2xl">
                    <stat.icon className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nilai-Nilai Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Prinsip-prinsip yang menuntun setiap produk dan layanan yang kami buat
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg shadow-pink-100/50">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl ${value.color} flex items-center justify-center mx-auto mb-6`}>
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{value.title}</h3>
                  <p className="text-gray-500">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Produk Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berbagai kategori produk digital untuk memenuhi kebutuhan kerja Anda
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg shadow-pink-100/50 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Planner Digital</h3>
                <p className="text-sm text-gray-500">Atur jadwal dan tugas harian dengan mudah</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg shadow-purple-100/50 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-500 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Spreadsheet</h3>
                <p className="text-sm text-gray-500">Template spreadsheet profesional siap pakai</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg shadow-green-100/50 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
                  <LayoutTemplate className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Template</h3>
                <p className="text-sm text-gray-500">Template dokumen untuk berbagai keperluan</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg shadow-orange-100/50 hover-lift">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Bundle</h3>
                <p className="text-sm text-gray-500">Paket hemat dengan harga spesial</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mission Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-400 to-purple-400 p-12 lg:p-16 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">Misi Kami</h2>
            <p className="text-white/90 text-lg max-w-3xl mx-auto leading-relaxed">
              Memberdayakan assistant dan virtual assistant di Indonesia dengan menyediakan
              produk digital berkualitas tinggi yang membuat pekerjaan mereka lebih efisien,
              terorganisir, dan profesional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
