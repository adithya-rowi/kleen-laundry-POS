import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, 
  Check, 
  Copy, 
  Phone, 
  MessageCircle, 
  Mail,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  MapPin,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import laundryImg1 from "@assets/stock_images/folded_clean_laundry_d1303af8.jpg";
import laundryImg2 from "@assets/stock_images/folded_clean_laundry_c505cf98.jpg";
import laundryImg3 from "@assets/stock_images/folded_clean_laundry_dee54f9a.jpg";

const orderData = {
  orderId: "TZM251015091748056",
  customerName: "Priza",
  customerPhone: "628111095503",
  customerAddress: "Pinang Emas 1 B4",
  transactionType: "REGULER",
  receivedAt: "2025-10-15T09:17:00",
  expectedAt: "2025-10-16T09:17:00",
  status: "SELESAI",
  progress: 100,
  totalAmount: 50000,
  paidAmount: 0,
  balanceDue: 50000,
  isPaid: false,
  timeline: [
    { step: "Order Diterima", timestamp: "2025-10-15T09:17:00", staff: "Kasir Pangpol", service: "Cuci Lipat 1 hari", completed: true, icon: "order" },
    { step: "Cuci", timestamp: "2025-10-15T14:56:00", staff: "DianiMY", service: "Cuci Lipat 1 hari", completed: true, icon: "wash" },
    { step: "Kering", timestamp: "2025-10-15T15:08:00", staff: "DianiMY", service: "Cuci Lipat 1 hari", completed: true, icon: "dry" },
    { step: "Setrika", timestamp: "2025-10-15T15:13:00", staff: "Ratih Pondok Labu", service: "Cuci Lipat 1 hari", completed: true, icon: "iron" },
    { step: "Pengemasan", timestamp: "2025-10-15T15:13:00", staff: "Ratih Pondok Labu", service: "Cuci Lipat 1 hari", completed: true, icon: "pack" },
    { step: "Finishing", timestamp: "2025-10-16T14:06:00", staff: "Kasir Pangpol", service: "Cuci Lipat 1 hari", completed: true, icon: "finish" },
    { step: "Selesai", timestamp: "2025-10-16T14:06:00", staff: "Kasir Pangpol", service: "Siap diambil", completed: true, icon: "done" }
  ],
  photos: [laundryImg1, laundryImg2, laundryImg3],
  business: {
    name: "Kleen Laundry Panglima Polim",
    address: "Ruko Grand Panglima Polim 90. Pulo, Kebayoran Baru - Adm. Jakarta Selatan",
    phone: "628119909933"
  }
};

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

export default function OrderStatus() {
  const [copied, setCopied] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const scrollToPayment = () => {
    document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background wave-bg">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-8 space-y-5">
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
          photos={orderData.photos} 
          onPhotoClick={openLightbox}
        />
        
        <PaymentCard 
          orderData={orderData}
          onPayClick={scrollToPayment}
        />
        
        <ContactButtons business={orderData.business} />
        
        <Footer business={orderData.business} />
      </main>

      <Lightbox
        open={lightboxOpen}
        photos={orderData.photos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex((prev) => (prev + 1) % orderData.photos.length)}
        onPrev={() => setLightboxIndex((prev) => (prev - 1 + orderData.photos.length) % orderData.photos.length)}
      />
    </div>
  );
}

function Header() {
  return (
    <header className="pt-8 pb-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-2 mb-2"
      >
        <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shadow-lg">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          KLEEN
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-sm text-muted-foreground font-medium"
      >
        Laundry Bersih, Hidup Tenang
      </motion.p>
    </header>
  );
}

interface OrderCardProps {
  orderData: typeof orderData;
  copied: boolean;
  onCopy: () => void;
}

function OrderCard({ orderData, copied, onCopy }: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="bg-card rounded-2xl shadow-lg p-6 border border-card-border"
      data-testid="order-card"
    >
      <div className="flex flex-col items-center">
        <div className="w-36 h-36 bg-white rounded-xl border-2 border-muted p-2 mb-4 shadow-sm">
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-28 h-28">
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"/>
              <g className="text-foreground">
                {[...Array(8)].map((_, i) => (
                  <g key={i}>
                    {[...Array(8)].map((_, j) => (
                      <rect
                        key={`${i}-${j}`}
                        x={15 + j * 9}
                        y={15 + i * 9}
                        width={7}
                        height={7}
                        fill={(i + j) % 3 === 0 ? "currentColor" : "transparent"}
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
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors group"
          data-testid="button-copy-order-id"
        >
          <span className="font-mono text-sm font-semibold text-foreground" data-testid="text-order-id">
            {orderData.orderId}
          </span>
          <motion.div
            animate={{ scale: copied ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.2 }}
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </motion.div>
        </button>

        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-foreground" data-testid="text-customer-name">
            {orderData.customerName}
          </p>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              orderData.transactionType === "EXPRESS"
                ? "bg-coral/10 text-coral"
                : "bg-primary/10 text-primary"
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
  orderData: typeof orderData;
}

function DateTimeCard({ orderData }: DateTimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-card rounded-2xl shadow-lg p-5 border border-card-border"
      data-testid="datetime-card"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wide">Diterima</span>
          </div>
          <p className="text-sm font-semibold text-foreground" data-testid="text-received-date">
            {formatDate(orderData.receivedAt)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTime(orderData.receivedAt)} WIB
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wide">Selesai</span>
          </div>
          <p className="text-sm font-semibold text-foreground" data-testid="text-expected-date">
            {formatDate(orderData.expectedAt)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTime(orderData.expectedAt)} WIB
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface ProgressSectionProps {
  progress: number;
  timeline: typeof orderData.timeline;
  expanded: boolean;
  onToggle: () => void;
}

function ProgressSection({ progress, timeline, expanded, onToggle }: ProgressSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-card rounded-2xl shadow-lg border border-card-border overflow-hidden"
      data-testid="progress-section"
    >
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
        data-testid="button-toggle-timeline"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-teal flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">{progress}%</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Status Laundry</h3>
            <p className="text-sm text-muted-foreground">
              {timeline.find(t => !t.completed)?.step || "Selesai"}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 timeline-line" />
                
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
                          ? index === timeline.length - 1
                            ? "bg-success"
                            : "bg-primary"
                          : "bg-muted border-2 border-muted-foreground"
                      }`}
                    >
                      {item.completed ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <p className={`font-semibold text-sm ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.step}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTime(item.timestamp)} • {item.staff}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
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
      className="bg-card rounded-2xl shadow-lg p-5 border border-card-border"
      data-testid="photo-gallery"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Foto Laundry</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {photos.length} foto
        </span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {photos.map((photo, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPhotoClick(index)}
            className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-sm"
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
  orderData: typeof orderData;
  onPayClick: () => void;
}

function PaymentCard({ orderData, onPayClick }: PaymentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      id="payment-section"
      className="bg-card rounded-2xl shadow-xl p-6 border border-card-border"
      data-testid="payment-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Ringkasan Pembayaran</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Biaya</span>
          <span className="font-semibold text-foreground" data-testid="text-total-amount">
            {formatCurrency(orderData.totalAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Sudah Dibayar</span>
          <span className="font-semibold text-foreground" data-testid="text-paid-amount">
            {formatCurrency(orderData.paidAmount)}
          </span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-foreground">Sisa Bayar</span>
          <span className="text-xl font-bold text-coral" data-testid="text-balance-due">
            {formatCurrency(orderData.balanceDue)}
          </span>
        </div>
      </div>

      <div className="flex justify-center mb-5">
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-bold ${
            orderData.isPaid
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
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
            className="w-full py-4 rounded-xl gradient-coral text-white font-bold text-lg shadow-lg pulse-gentle"
            onClick={onPayClick}
            data-testid="button-pay-now"
          >
            BAYAR SEKARANG
          </motion.button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            QRIS • Transfer Bank • E-Wallet
          </p>
        </>
      )}
    </motion.div>
  );
}

interface ContactButtonsProps {
  business: typeof orderData.business;
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
        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-card-border shadow-sm hover:shadow-md transition-shadow"
        data-testid="button-call"
      >
        <Phone className="w-5 h-5 text-primary" />
        <span className="text-xs font-medium text-foreground">Telp</span>
      </a>
      <a
        href={`https://wa.me/${business.phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-card-border shadow-sm hover:shadow-md transition-shadow"
        data-testid="button-whatsapp"
      >
        <MessageCircle className="w-5 h-5 text-success" />
        <span className="text-xs font-medium text-foreground">WhatsApp</span>
      </a>
      <a
        href={`sms:+${business.phone}`}
        className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-card-border shadow-sm hover:shadow-md transition-shadow"
        data-testid="button-sms"
      >
        <Mail className="w-5 h-5 text-coral" />
        <span className="text-xs font-medium text-foreground">SMS</span>
      </a>
    </motion.div>
  );
}

interface FooterProps {
  business: typeof orderData.business;
}

function Footer({ business }: FooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="text-center pt-4 pb-8"
      data-testid="footer"
    >
      <div className="flex items-start gap-2 justify-center mb-3">
        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {business.name}<br />
          {business.address}
        </p>
      </div>
      <a
        href="#"
        className="text-xs text-primary hover:underline"
        data-testid="link-terms"
      >
        Syarat & Ketentuan
      </a>
      <p className="text-xs text-muted-foreground/60 mt-4">
        Powered by KleenPOS
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
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
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
          <ChevronUp className="w-6 h-6 text-white -rotate-90" />
        </button>

        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          src={photos[currentIndex]}
          alt={`Laundry photo ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          data-testid="button-next-photo"
        >
          <ChevronUp className="w-6 h-6 text-white rotate-90" />
        </button>

        <div className="absolute bottom-6 flex gap-2">
          {photos.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
