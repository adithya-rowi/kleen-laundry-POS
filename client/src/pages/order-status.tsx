import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Copy, 
  Phone, 
  MessageCircle, 
  Mail,
  ChevronDown,
  X,
  Clock,
  MapPin,
  CreditCard,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import kleenLogo from "@assets/logonew_1768219090685.png";
import laundryImg1 from "@assets/stock_images/folded_clean_laundry_d1303af8.jpg";
import laundryImg2 from "@assets/stock_images/folded_clean_laundry_c505cf98.jpg";
import laundryImg3 from "@assets/stock_images/folded_clean_laundry_dee54f9a.jpg";

// Map photo URLs to actual imported images
const photoMap: Record<string, string> = {
  "/stock_images/folded_clean_laundry_d1303af8.jpg": laundryImg1,
  "/stock_images/folded_clean_laundry_c505cf98.jpg": laundryImg2,
  "/stock_images/folded_clean_laundry_dee54f9a.jpg": laundryImg3,
};

interface TimelineItem {
  step: string;
  timestamp: string;
  staff: string;
  service: string;
  completed: boolean;
}

interface OrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  transactionType: string;
  receivedAt: string;
  expectedAt: string;
  status: string;
  progress: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  isPaid: boolean;
  timeline: TimelineItem[];
  photos: string[];
  businessName: string;
  businessAddress: string;
  businessPhone: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace("IDR", "Rp");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, "EEEE, d MMMM yyyy", { locale: id });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, "HH:mm", { locale: id });
}

async function fetchOrder(orderId: string): Promise<OrderData> {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) {
    throw new Error("Order not found");
  }
  return response.json();
}

export default function OrderStatus() {
  const orderId = "TZM251015091748056"; // In production, this would come from URL params
  
  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const [copied, setCopied] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const copyOrderId = () => {
    if (orderData) {
      navigator.clipboard.writeText(orderData.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const scrollToPayment = () => {
    document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00D4AA] animate-spin mx-auto mb-4" />
          <p className="text-[#1E3A5F]/60">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-[#E74C3C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-[#E74C3C]" />
          </div>
          <h2 className="text-xl font-bold text-[#1E3A5F] mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-[#1E3A5F]/60">
            Maaf, kami tidak dapat menemukan pesanan dengan ID tersebut.
          </p>
        </div>
      </div>
    );
  }

  const photos = orderData.photos.map((photo) => photoMap[photo] || photo);
  const business = {
    name: orderData.businessName,
    address: orderData.businessAddress,
    phone: orderData.businessPhone,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-8 space-y-4">
        <OrderCard 
          orderData={orderData} 
          copied={copied} 
          onCopy={copyOrderId} 
        />
        
        <DateTimeCard orderData={orderData} />
        
        <ProgressSection 
          progress={orderData.progress}
          timeline={orderData.timeline}
          expanded={timelineExpanded}
          onToggle={() => setTimelineExpanded(!timelineExpanded)}
        />
        
        <PhotoGallery 
          photos={photos} 
          onPhotoClick={openLightbox}
        />
        
        <PaymentCard 
          orderData={orderData}
          onPayClick={scrollToPayment}
        />
        
        <ContactButtons business={business} />
        
        <Footer business={business} />
      </main>

      <Lightbox
        open={lightboxOpen}
        photos={photos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex((prev) => (prev + 1) % photos.length)}
        onPrev={() => setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length)}
      />

      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1E3A5F] text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50"
        >
          Order ID disalin!
        </motion.div>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="gradient-header pt-8 pb-10 relative bubble-decoration">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <img 
          src={kleenLogo} 
          alt="KLEEN Laundry & General Cleaning" 
          className="h-16 w-auto object-contain"
          data-testid="img-logo"
        />
      </motion.div>
    </header>
  );
}

interface OrderCardProps {
  orderData: OrderData;
  copied: boolean;
  onCopy: () => void;
}

function OrderCard({ orderData, copied, onCopy }: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-6 -mt-6 relative z-10"
      data-testid="order-card"
    >
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 bg-white rounded-xl border-2 border-[#D6EEF5] p-2 mb-4">
          <div className="w-full h-full bg-gradient-to-br from-[#E8F4F8] to-[#D6EEF5] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="#1E3A5F" strokeWidth="2"/>
              <g fill="#1E3A5F">
                {[...Array(8)].map((_, i) => (
                  <g key={i}>
                    {[...Array(8)].map((_, j) => (
                      <rect
                        key={`${i}-${j}`}
                        x={15 + j * 9}
                        y={15 + i * 9}
                        width={7}
                        height={7}
                        fill={(i + j) % 3 === 0 ? "#1E3A5F" : "transparent"}
                      />
                    ))}
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>

        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F4F8] hover:bg-[#D6EEF5] transition-colors group border border-[#00D4AA]/20"
          data-testid="button-copy-order-id"
        >
          <span className="font-mono text-sm font-semibold text-[#1E3A5F]" data-testid="text-order-id">
            {orderData.orderId}
          </span>
          <motion.div
            animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.2 }}
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#00D4AA]" />
            ) : (
              <Copy className="w-4 h-4 text-[#1E3A5F]/50 group-hover:text-[#1E3A5F] transition-colors" />
            )}
          </motion.div>
        </button>

        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-[#1E3A5F]" data-testid="text-customer-name">
            {orderData.customerName}
          </p>
          <span
            className={`inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${
              orderData.transactionType === "EXPRESS"
                ? "bg-[#00D4AA] text-white border-[#00D4AA]"
                : "bg-white text-[#00D4AA] border-[#00D4AA]"
            }`}
            data-testid="badge-transaction-type"
          >
            {orderData.transactionType}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface DateTimeCardProps {
  orderData: OrderData;
}

function DateTimeCard({ orderData }: DateTimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-md p-5"
      data-testid="datetime-card"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#1E3A5F]/60">
            <Clock className="w-4 h-4 text-[#00D4AA]" />
            <span className="text-xs font-semibold uppercase tracking-wide">Diterima</span>
          </div>
          <p className="text-sm font-semibold text-[#1E3A5F]" data-testid="text-received-date">
            {formatDate(orderData.receivedAt)}
          </p>
          <p className="text-xs text-[#1E3A5F]/50">
            {formatTime(orderData.receivedAt)} WIB
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[#1E3A5F]/60">
            <Clock className="w-4 h-4 text-[#00D4AA]" />
            <span className="text-xs font-semibold uppercase tracking-wide">Selesai</span>
          </div>
          <p className="text-sm font-semibold text-[#1E3A5F]" data-testid="text-expected-date">
            {formatDate(orderData.expectedAt)}
          </p>
          <p className="text-xs text-[#1E3A5F]/50">
            {formatTime(orderData.expectedAt)} WIB
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface ProgressSectionProps {
  progress: number;
  timeline: TimelineItem[];
  expanded: boolean;
  onToggle: () => void;
}

function ProgressSection({ progress, timeline, expanded, onToggle }: ProgressSectionProps) {
  const currentStep = timeline.find(t => !t.completed)?.step || "Selesai";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
      data-testid="progress-section"
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-[#E8F4F8]/50 transition-colors"
        data-testid="button-toggle-timeline"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="#E8F4F8"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="#00D4AA"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(progress / 100) * 150.8} 150.8`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[#00D4AA]">{progress}%</span>
            </div>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-[#1E3A5F]">Status Laundry</h3>
            <p className="text-sm text-[#00D4AA] font-medium">{currentStep}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[#1E3A5F]/50" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="relative pl-8">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[#00D4AA]" />
                
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="relative py-3 first:pt-0 last:pb-0"
                    data-testid={`timeline-item-${index}`}
                  >
                    <div
                      className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center -translate-x-[11px] ${
                        item.completed
                          ? "bg-[#00D4AA]"
                          : "bg-white border-2 border-[#1E3A5F]/20"
                      }`}
                    >
                      {item.completed ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#1E3A5F]/30" />
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <p className={`font-semibold text-sm ${item.completed ? "text-[#1E3A5F]" : "text-[#1E3A5F]/50"}`}>
                        {item.step}
                      </p>
                      <p className="text-xs text-[#1E3A5F]/50 mt-0.5">
                        {formatTime(item.timestamp)} • {item.staff}
                      </p>
                      <p className="text-xs text-[#1E3A5F]/40">
                        {item.service}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface PhotoGalleryProps {
  photos: string[];
  onPhotoClick: (index: number) => void;
}

function PhotoGallery({ photos, onPhotoClick }: PhotoGalleryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-white rounded-2xl shadow-md p-5"
      data-testid="photo-gallery"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[#1E3A5F]">Foto Barang</h3>
        <span className="text-xs text-[#1E3A5F]/50 bg-[#E8F4F8] px-2 py-1 rounded-full font-medium">
          {photos.length} foto
        </span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {photos.map((photo, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPhotoClick(index)}
            className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-[#E8F4F8]"
            data-testid={`photo-${index}`}
          >
            <img
              src={photo}
              alt={`Laundry photo ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

interface PaymentCardProps {
  orderData: OrderData;
  onPayClick: () => void;
}

function PaymentCard({ orderData, onPayClick }: PaymentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      id="payment-section"
      className="bg-white rounded-2xl shadow-lg p-6"
      data-testid="payment-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-[#2E5CB8]" />
        <h3 className="font-bold text-[#1E3A5F]">Ringkasan Pembayaran</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[#1E3A5F]/60">Total Biaya</span>
          <span className="font-semibold text-[#1E3A5F]" data-testid="text-total-amount">
            {formatCurrency(orderData.totalAmount)},-
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#1E3A5F]/60">Pembayaran</span>
          <span className="font-semibold text-[#1E3A5F]" data-testid="text-paid-amount">
            {formatCurrency(orderData.paidAmount)},-
          </span>
        </div>
        <div className="h-px bg-[#E8F4F8] my-2" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#1E3A5F]">Sisa Bayar</span>
          <span className="text-xl font-bold text-[#2E5CB8]" data-testid="text-balance-due">
            {formatCurrency(orderData.balanceDue)},-
          </span>
        </div>
      </div>

      <div className="flex justify-center mb-5">
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-bold ${
            orderData.isPaid
              ? "bg-[#00D4AA] text-white"
              : "bg-[#E74C3C] text-white"
          }`}
          data-testid="badge-payment-status"
        >
          {orderData.isPaid ? "LUNAS" : "BELUM LUNAS"}
        </span>
      </div>

      {!orderData.isPaid && (
        <>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-4 rounded-xl bg-[#2E5CB8] hover:bg-[#1E3A5F] text-white font-bold text-lg shadow-lg pulse-pay transition-colors"
            onClick={onPayClick}
            data-testid="button-pay-now"
          >
            BAYAR SEKARANG
          </motion.button>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-xs text-[#1E3A5F]/50 font-medium">QRIS</span>
            <span className="text-xs text-[#1E3A5F]/30">•</span>
            <span className="text-xs text-[#1E3A5F]/50 font-medium">Transfer Bank</span>
            <span className="text-xs text-[#1E3A5F]/30">•</span>
            <span className="text-xs text-[#1E3A5F]/50 font-medium">E-Wallet</span>
          </div>
        </>
      )}
    </motion.div>
  );
}

interface ContactButtonsProps {
  business: {
    name: string;
    address: string;
    phone: string;
  };
}

function ContactButtons({ business }: ContactButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="grid grid-cols-3 gap-3"
      data-testid="contact-buttons"
    >
      <a
        href={`tel:+${business.phone}`}
        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-[#00D4AA] hover:bg-[#E8F4F8] transition-colors min-h-[72px]"
        data-testid="button-call"
      >
        <Phone className="w-5 h-5 text-[#00D4AA]" />
        <span className="text-xs font-semibold text-[#1E3A5F]">Telp</span>
      </a>
      <a
        href={`https://wa.me/${business.phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-[#00D4AA] hover:bg-[#E8F4F8] transition-colors min-h-[72px]"
        data-testid="button-whatsapp"
      >
        <MessageCircle className="w-5 h-5 text-[#00D4AA]" />
        <span className="text-xs font-semibold text-[#1E3A5F]">WhatsApp</span>
      </a>
      <a
        href={`sms:+${business.phone}`}
        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-[#00D4AA] hover:bg-[#E8F4F8] transition-colors min-h-[72px]"
        data-testid="button-sms"
      >
        <Mail className="w-5 h-5 text-[#00D4AA]" />
        <span className="text-xs font-semibold text-[#1E3A5F]">SMS</span>
      </a>
    </motion.div>
  );
}

interface FooterProps {
  business: {
    name: string;
    address: string;
    phone: string;
  };
}

function Footer({ business }: FooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="bg-[#E8F4F8] rounded-2xl p-5 text-center mt-2"
      data-testid="footer"
    >
      <h4 className="font-bold text-[#1E3A5F] mb-1">{business.name}</h4>
      <div className="flex items-start gap-2 justify-center mb-3">
        <MapPin className="w-3.5 h-3.5 text-[#1E3A5F]/40 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#1E3A5F]/60 leading-relaxed">
          {business.address}
        </p>
      </div>
      <p className="text-xs text-[#1E3A5F]/50 mb-3">
        +62 811-990-9933
      </p>
      <a
        href="#"
        className="text-xs text-[#2E5CB8] hover:underline font-medium"
        data-testid="link-terms"
      >
        Syarat & Ketentuan
      </a>
      <p className="text-xs text-[#1E3A5F]/40 mt-4">
        © 2025 KLEEN Laundry
      </p>
    </motion.footer>
  );
}

interface LightboxProps {
  open: boolean;
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function Lightbox({ open, photos, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#1E3A5F]/95 flex items-center justify-center"
        onClick={onClose}
        data-testid="lightbox"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="button-close-lightbox"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="button-prev-photo"
        >
          <ChevronDown className="w-6 h-6 text-white -rotate-90" />
        </button>

        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          src={photos[currentIndex]}
          alt={`Laundry photo ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="button-next-photo"
        >
          <ChevronDown className="w-6 h-6 text-white rotate-90" />
        </button>

        <div className="absolute bottom-6 flex gap-2">
          {photos.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-[#00D4AA]" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
