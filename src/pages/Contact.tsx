import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Mail, 
  MessageCircle, 
  Instagram, 
  Send,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'hello@nhcreative.id',
    description: 'Balasan dalam 24 jam',
    href: 'mailto:hello@nhcreative.id',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: '+62 812-3456-7890',
    description: 'Senin-Jumat, 09:00-17:00',
    href: 'https://wa.me/6281234567890',
  },
  {
    icon: Instagram,
    title: 'Instagram',
    value: '@nhcreative.id',
    description: 'Follow untuk update terbaru',
    href: 'https://instagram.com/nhcreative.id',
  },
];

const faqs = [
  {
    question: 'Bagaimana cara membeli produk?',
    answer: 'Pilih produk yang Anda inginkan, klik "Beli Sekarang", lalu ikuti proses pembayaran melalui Xendit. Setelah pembayaran berhasil, Anda akan mendapatkan akses download.',
  },
  {
    question: 'Apakah ada garansi?',
    answer: 'Ya, kami memberikan garansi uang kembali 30 hari jika Anda tidak puas dengan produk yang dibeli.',
  },
  {
    question: 'Bagaimana cara mengakses produk setelah pembelian?',
    answer: 'Setelah pembayaran berhasil, Anda akan menerima email dengan link download. Produk juga bisa diakses melalui akun Anda di website ini.',
  },
  {
    question: 'Apakah produk bisa dikustomisasi?',
    answer: 'Ya, semua produk kami dirancang agar mudah dikustomisasi sesuai kebutuhan Anda.',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Pesan berhasil dikirim! Kami akan membalas segera.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Hubungi Kami</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Punya pertanyaan atau butuh bantuan? Kami siap membantu Anda.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <a key={index} href={info.href} target="_blank" rel="noopener noreferrer">
              <Card className="h-full hover-lift border-0 shadow-lg shadow-pink-100/50 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-500 flex items-center justify-center mb-4 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{info.title}</h3>
                  <p className="text-pink-600 font-medium mb-1">{info.value}</p>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Kirim Pesan</h2>
            <Card className="border-0 shadow-lg shadow-pink-100/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Nama Anda"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@anda.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjek</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Subjek pesan"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tulis pesan Anda di sini..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-pink-400 hover:bg-pink-500 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pertanyaan Umum</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-md shadow-pink-100/30">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">{faq.question}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="mt-16">
          <Card className="border-0 shadow-lg shadow-pink-100/50 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-400 text-white flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Jam Operasional</h3>
                    <p className="text-gray-600">Senin - Jumat, 09:00 - 17:00 WIB</p>
                  </div>
                </div>
                <div className="hidden md:block w-px h-12 bg-pink-200"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-400 text-white flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Lokasi</h3>
                    <p className="text-gray-600">Jakarta, Indonesia</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
