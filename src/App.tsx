import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, ChevronDown, ChevronRight, ChevronLeft, BookOpen, History, Users, 
  Home, Box, Cpu, Leaf, Info, ArrowRight, ArrowLeft, ExternalLink,
  Award, School, User, Calendar, MapPin, Sun, Moon, GripVertical,
  PanelRightClose, PanelRightOpen, Brain, Heart, Lightbulb, DownloadCloud, Save, CloudOff, CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';

// --- Utility ---
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

// --- Components ---

const SectionTitle = ({ children, subtitle, number, isDarkMode }: { children: React.ReactNode, subtitle?: string, number?: string, isDarkMode?: boolean }) => (
  <div className="mb-12 text-right" dir="rtl">
    {number && <span className="text-emerald-500 font-mono text-sm mb-2 block tracking-widest">{number}</span>}
    <h2 className={cn(
      "text-4xl md:text-5xl font-light mb-4 leading-tight transition-colors duration-500",
      isDarkMode ? "text-zinc-100" : "text-zinc-900"
    )}>
      {children}
    </h2>
    {subtitle && <p className={cn(
      "text-lg max-w-2xl ml-auto transition-colors duration-500",
      isDarkMode ? "text-zinc-400" : "text-zinc-600"
    )}>{subtitle}</p>}
    <div className="h-px w-24 bg-emerald-500 mt-6 mr-0 ml-auto" />
  </div>
);

const InfoCard = ({ title, content, icon: Icon, isDarkMode }: { title: string, content: string, icon: any, isDarkMode?: boolean }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={cn(
      "border p-6 rounded-2xl backdrop-blur-sm transition-all duration-500",
      isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
    )}
  >
    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
      <Icon className="text-emerald-500 w-6 h-6" />
    </div>
    <h3 className={cn(
      "text-xl font-medium mb-2 transition-colors duration-500",
      isDarkMode ? "text-zinc-100" : "text-zinc-900"
    )}>{title}</h3>
    <p className={cn(
      "text-sm leading-relaxed transition-colors duration-500",
      isDarkMode ? "text-zinc-400" : "text-zinc-600"
    )}>{content}</p>
  </motion.div>
);

const ImageWithCaption = ({ src, caption, details, isDarkMode }: { src: string, caption: string, details?: string[], isDarkMode?: boolean }) => {
  // Convert Google Drive links to direct view links if possible
  const getDirectLink = (url: string) => {
    if (url.includes('drive.google.com')) {
      const id = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1]?.split('&')[0];
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return src;
  };

  return (
    <figure className="my-12 group">
      <div className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-500",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200 shadow-sm"
      )}>
        <img crossOrigin="anonymous" 
          src={getDirectLink(src)} 
          alt={caption}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback if Google Drive link fails
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${caption}/1200/800`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <figcaption className="mt-4 text-right" dir="rtl">
        <span className="text-emerald-500 font-medium block mb-1">{caption}</span>
        {details && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {details.map((d, i) => (
              <div key={i} className={cn(
                "text-xs border-r pr-2 transition-colors duration-500",
                isDarkMode ? "text-zinc-500 border-zinc-800" : "text-zinc-400 border-zinc-200"
              )}>
                {d}
              </div>
            ))}
          </div>
        )}
      </figcaption>
    </figure>
  );
};

// --- Main App ---

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : false;
    }
    return false;
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState<'idle' | 'loading' | 'ready'>('idle');

  const downloadOfflineCopy = async () => {
    setIsDownloading(true);
    try {
      const images = Array.from(document.querySelectorAll('img'));
      const base64Map = new Map();

      // Show all slides temporarily to ensure they are fully rendered for capture
      const slidesElements = document.querySelectorAll('[id^="slide-container-"]');
      slidesElements.forEach(s => (s as HTMLElement).style.display = 'block');

      for (const img of images) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          base64Map.set(img.src, canvas.toDataURL('image/png'));
        } catch (e) {
          try {
            const resp = await fetch(img.src);
            const blob = await resp.blob();
            const reader = new FileReader();
            const b64 = await new Promise((resolve) => {
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            base64Map.set(img.src, b64);
          } catch (err) {
            console.warn('Could not bundle image:', img.src);
          }
        }
      }

      let html = document.documentElement.outerHTML;
      
      // Restore slides visibility
      slidesElements.forEach((s, i) => (s as HTMLElement).style.display = i === currentSlide ? 'block' : 'none');

      base64Map.forEach((b64, src) => {
        html = html.split(src).join(b64);
      });

      // Add a small script to ensure basic functionality in the static copy
      const offlineScript = `
        <script>
          let currentSlide = 0;
          const totalSlides = ${slides.length};
          
          function showSlide(n) {
            for(let i=0; i<totalSlides; i++) {
              const s = document.getElementById('slide-container-' + i);
              if(s) s.style.display = (i === n) ? 'block' : 'none';
              
              const navBtn = document.getElementById('sidebar-nav-' + i);
              if(navBtn) {
                if(i === n) {
                  navBtn.classList.add('bg-emerald-500/10', 'text-emerald-500', 'border-emerald-500/20');
                } else {
                  navBtn.classList.remove('bg-emerald-500/10', 'text-emerald-500', 'border-emerald-500/20');
                }
              }
            }
            currentSlide = n;
            
            // Update next/prev buttons state
            const prevBtn = document.getElementById('prev-slide-btn');
            const nextBtn = document.getElementById('next-slide-btn');
            if(prevBtn) prevBtn.style.opacity = (n === 0) ? '0.3' : '1';
            if(nextBtn) nextBtn.style.opacity = (n === totalSlides - 1) ? '0.3' : '1';
          }
          
          window.addEventListener('load', () => {
            // Initialize
            showSlide(0);
            
            // Sidebar Nav
            for(let i=0; i<totalSlides; i++) {
              const btn = document.getElementById('sidebar-nav-' + i);
              if(btn) btn.onclick = () => showSlide(i);
              
              const topBtn = document.getElementById('top-nav-' + i);
              if(topBtn) topBtn.onclick = () => showSlide(i);
            }
            
            // Next/Prev
            const prevBtn = document.getElementById('prev-slide-btn');
            const nextBtn = document.getElementById('next-slide-btn');
            if(prevBtn) prevBtn.onclick = () => { if(currentSlide > 0) showSlide(currentSlide - 1); };
            if(nextBtn) nextBtn.onclick = () => { if(currentSlide < totalSlides - 1) showSlide(currentSlide + 1); };
            
            // Sidebar Toggle
            const sidebar = document.getElementById('main-sidebar');
            const openBtn = document.getElementById('sidebar-open-btn');
            const closeBtn = document.getElementById('sidebar-close-btn');
            
            if(closeBtn) closeBtn.onclick = () => { if(sidebar) sidebar.style.width = '0'; };
            if(openBtn) openBtn.onclick = () => { if(sidebar) sidebar.style.width = '260px'; };
            
            // Theme Toggle
            const themeBtn = document.getElementById('theme-toggle-btn');
            if(themeBtn) themeBtn.onclick = () => {
              document.body.classList.toggle('dark');
              const isDark = document.body.classList.contains('dark');
              // This is a simplified theme toggle for the static export
              document.documentElement.style.backgroundColor = isDark ? '#000' : '#f9fafb';
              document.documentElement.style.color = isDark ? '#d4d4d8' : '#27272a';
            };
          });
        </script>
      `;
      html = html.replace('</body>', `${offlineScript}</body>`);

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Minimalism_Presentation_Offline.html';
      a.click();
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const enableOffline = async () => {
    setOfflineStatus('loading');
    const images = Array.from(document.querySelectorAll('img'));
    try {
      // Pre-cache images via SW
      await Promise.all(images.map(img => fetch(img.src, { mode: 'no-cors' })));
      setOfflineStatus('ready');
      setTimeout(() => setOfflineStatus('idle'), 5000);
    } catch (e) {
      console.error('Offline sync failed', e);
      setOfflineStatus('idle');
    }
  };

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 150 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const slides = [
    { id: 'hero', title: 'الرئيسية' },
    { id: 'intro', title: 'المقدمة' },
    { id: 'history', title: 'تاريخ التيار' },
    { id: 'characteristics', title: 'خصائص التيار' },
    { id: 'pioneers', title: 'الرواد والمدارس' },
    { id: 'koshino', title: 'منزل كوشينو' },
    { id: 'olnick', title: 'جناح أولنيك' },
    { id: 'analysis', title: 'الدراسة التحليلية' },
    { id: 'future', title: 'المستقبل' },
    { id: 'vision', title: 'آفاق الرؤية' },
    { id: 'references', title: 'المراجع' },
    { id: 'footer', title: 'الخاتمة' },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const philosophyData = [
    { name: 'فلسفة الزن (Zen Philosophy)', concept: 'الفراغ (Ma)', effect: 'تعزيز التأمل من خلال المساحات المفتوحة' },
    { name: 'الظاهراتية (Phenomenology)', concept: 'الحضور المادي', effect: 'التركيز على ملمس المادة وتفاعل الجسد' },
    { name: 'الأخلاقيات البيئية (Environmental Ethics)', concept: 'القصدية', effect: 'تقليل الهدر المادي والاعتماد على الطبيعة' },
    { name: 'الصدق البنائي (Structural Honesty)', concept: 'الوظيفية الصارمة', effect: 'إظهار الهيكل الإنشائي كجزء من الجمالية' },
  ];

  const timelineData = [
    { year: '1913', event: 'البنائية الروسية', desc: 'ماليفيتش وتاتلين - التجريد الهندسي' },
    { year: '1917', event: 'دي ستايل', desc: 'موندريان - الخطوط والألوان الأساسية' },
    { year: '1919', event: 'البوهاوس', desc: 'غروبيوس - الشكل يتبع الوظيفة' },
    { year: '1929', event: 'جناح برشلونة', desc: 'ميس فان دير روه - الأقل هو الأكثر' },
    { year: '1960', event: 'مينيماليزم نيويورك', desc: 'دونالد جود - الحضور المادي الصرف' },
    { year: '1989', event: 'كنيسة الضوء', desc: 'تاداو أندو - نحت الضوء بالخرسانة' },
    { year: '2023', event: 'جناح أولنيك', desc: 'كامبو بايزا - الفراغ الأيزوتروبي' },
  ];

  const timelineChartData = [
    { title: 'الثورة الصناعية', desc: 'رفض الزخرفة', year: 1860 },
    { title: 'البنائية الروسية', desc: 'الصدق الهيكلي', year: 1913 },
    { title: 'حركة دي ستايل', desc: 'التجريد الشكلي', year: 1917 },
    { title: 'اليسارية والبوهاوس', desc: 'العقلانية', year: 1919 },
    { title: 'المينيماليزم النيويوركي', desc: 'التكريس', year: 1966 },
  ].map(item => ({ ...item, name: `${item.title} (${item.desc})` }));

  const radarData = [
    { subject: 'دراما الظلال والمادية (Chiaroscuro)', ando: 95, baeza: 20 },
    { subject: 'غمر الضوء والتجريد (Isotropic)', ando: 30, baeza: 98 },
    { subject: 'الاحتواء والاندماج التضاريسي', ando: 85, baeza: 40 },
    { subject: 'اللامادية وانعكاس البياض', ando: 20, baeza: 95 },
    { subject: 'الصرامة الهندسية (Cube)', ando: 60, baeza: 90 },
    { subject: 'الارتباط الثقافي الروحاني (Zen)', ando: 90, baeza: 30 },
  ];

  const donutData = [
    { name: 'التكامل التكنولوجي والذكاء', value: 25, color: '#3b82f6' },
    { name: 'الاستدامة والطاقة المتجددة', value: 30, color: '#10b981' },
    { name: 'المواد المبتكرة (UHPC وغيرها)', value: 15, color: '#f59e0b' },
    { name: 'الانسيابية الفراغية', value: 15, color: '#8b5cf6' },
    { name: 'تخصيص الإضاءة', value: 15, color: '#06b6d4' },
  ];

  return (
    <div className={cn(
      "h-screen flex overflow-hidden font-sans transition-colors duration-500 selection:bg-emerald-500/30 selection:text-emerald-200",
      isDarkMode ? "bg-black text-zinc-300" : "bg-zinc-50 text-zinc-800"
    )}>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
      `}} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Navigation */}
        <nav className={cn(
          "absolute top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 flex items-center justify-between",
          currentSlide > 0
            ? (isDarkMode ? "bg-black/80 backdrop-blur-md border-b border-zinc-800" : "bg-white/80 backdrop-blur-md border-b border-zinc-200")
            : "bg-transparent"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black font-bold">
              AH
            </div>
            <div className="hidden md:block text-right" dir="rtl">
              <div className={cn("text-xs transition-colors", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>جامعة دمشق</div>
              <div className={cn("text-sm font-medium transition-colors", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>م. أمير الدين الحمامي</div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium" dir="rtl">
            {['الرئيسية', 'المقدمة', 'التاريخ', 'الخصائص', 'الرواد', 'كوشينو', 'أولنيك', 'التحليل', 'المستقبل', 'الرؤية'].map((item, i) => {
              const slideIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
              return (
                <button 
                  key={i} 
                  id={`top-nav-${slideIndices[i]}`}
                  onClick={() => setCurrentSlide(slideIndices[i])} 
                  className={cn(
                    "transition-colors",
                    currentSlide === slideIndices[i]
                      ? "text-emerald-500"
                      : (isDarkMode ? "hover:text-emerald-500 text-zinc-300" : "hover:text-emerald-600 text-zinc-600")
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Offline & Download Buttons */}
            <div className="flex items-center gap-2 ml-2">
              <button 
                onClick={enableOffline}
                disabled={offlineStatus === 'loading'}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  offlineStatus === 'ready' 
                    ? "bg-emerald-500 text-white" 
                    : (isDarkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:text-emerald-500")
                )}
                title="تفعيل العمل بدون إنترنت (PWA)"
              >
                {offlineStatus === 'loading' ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : offlineStatus === 'ready' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <CloudOff className="w-3 h-3" />
                )}
                <span className="hidden xl:inline">
                  {offlineStatus === 'ready' ? 'جاهز للأوفلاين' : 'تفعيل الأوفلاين'}
                </span>
              </button>

              <button 
                onClick={downloadOfflineCopy}
                disabled={isDownloading}
                id="download-offline-btn"
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
                )}
                title="تحميل نسخة أوفلاين (HTML)"
              >
                {isDownloading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <DownloadCloud className="w-5 h-5" />
                )}
              </button>
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              id="theme-toggle-btn"
              className={cn(
                "p-2 rounded-lg transition-all duration-300 flex items-center justify-center",
                isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
              )}
              title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              id="sidebar-toggle-btn"
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-zinc-100 text-zinc-600"
              )}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Slide Content */}
        <main className="flex-1 relative overflow-hidden pt-20">
          <div className="h-full relative">
            {slides.map((slide, index) => (
              <div 
                key={slide.id}
                id={`slide-container-${index}`}
                className={cn(
                  "absolute inset-0 h-full overflow-y-auto custom-scrollbar p-6 md:p-12 scroll-smooth transition-all duration-500",
                  currentSlide === index ? "block opacity-100 z-10" : "hidden opacity-0 z-0"
                )}
              >
                {index === 0 && (
                  <section id="section-0" className="relative h-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                      <div className={cn(
                        "absolute inset-0 z-10 transition-colors duration-500",
                        isDarkMode ? "bg-gradient-to-b from-black/20 via-black/60 to-black" : "bg-gradient-to-b from-white/20 via-white/60 to-white"
                      )} />
                      <img crossOrigin="anonymous" 
                        src="https://lh3.googleusercontent.com/d/1O1y3q0Q-7OOLDgideRwYYED-UBdaZZPo" 
                        className={cn(
                          "w-full h-full object-cover scale-105 animate-pulse-slow transition-opacity duration-500",
                          isDarkMode ? "opacity-50" : "opacity-30"
                        )}
                        alt="Minimalist Architecture Background"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="relative z-20 container mx-auto px-6 text-center" dir="rtl">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <span className={cn(
                          "inline-block px-4 py-1 border rounded-full text-sm mb-6 transition-all duration-500",
                          isDarkMode ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-emerald-500/5 text-emerald-600 border-emerald-500/30"
                        )}>
                          الدراسات العليا - الجذع المشترك
                        </span>
                        <h1 className={cn(
                          "text-5xl md:text-7xl lg:text-8xl font-light mb-8 leading-tight tracking-tight transition-colors duration-500",
                          isDarkMode ? "text-white" : "text-zinc-900"
                        )}>
                          الفراغ <span className="text-emerald-500 italic">الجوهري</span>
                        </h1>
                        <p className={cn(
                          "text-xl md:text-2xl max-w-4xl mx-auto mb-12 font-light leading-relaxed transition-colors duration-500",
                          isDarkMode ? "text-zinc-400" : "text-zinc-600"
                        )}>
                          دراسة تحليلية نقدية لتيار الحدنوية (المينيماليزم) من الجذور الفلسفية إلى آفاق التقنية المستدامة في القرن الحادي والعشرين
                        </p>
                        
                        <div className={cn(
                          "flex flex-wrap justify-center gap-12 text-right border-t pt-12 transition-colors duration-500",
                          isDarkMode ? "border-zinc-800" : "border-zinc-200"
                        )}>
                          <div>
                            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">الباحث</div>
                            <div className={cn("font-medium transition-colors", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>م. أمير الدين الحمامي</div>
                          </div>
                          <div>
                            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">المشرف</div>
                            <div className={cn("font-medium transition-colors", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>د. رهف كركوكي</div>
                          </div>
                          <div>
                            <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">المؤسسة</div>
                            <div className={cn("font-medium transition-colors", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>جامعة دمشق - كلية الهندسة المعمارية</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div 
                      animate={{ y: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={cn("absolute bottom-10 left-1/2 -translate-x-1/2 transition-colors", isDarkMode ? "text-zinc-500" : "text-zinc-400")}
                    >
                      <ChevronDown className="w-8 h-8" />
                    </motion.div>
                  </section>
                )}

                {index === 1 && (
                  <section id="section-1" className="py-12 container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                      <div className="order-2 lg:order-1" dir="rtl">
                        <SectionTitle number="01" subtitle="فلسفة الاختزال والبحث عن الحقيقة المعمارية" isDarkMode={isDarkMode}>المقدمة</SectionTitle>
                        <div className={cn(
                          "prose max-w-none text-lg leading-relaxed transition-colors duration-500",
                          isDarkMode ? "prose-invert prose-emerald text-zinc-400" : "prose-slate text-zinc-600"
                        )}>
                          <p className="mb-6">
                            يشهد النتاج المعماري المعاصر حالة من التشتت البصري والتعقيد الشكلي، مما ولد حاجة ملحة للعودة إلى الأصول، وهنا يبرز تيار الحدنوية ليس كمجرد "أسلوب" جمالي، بل كموقف فكري وأخلاقي يسعى لتنقية المشهد المعماري من الشوائب الفائضة.
                          </p>
                          <p className="mb-6">
                            إن الحدنوية في جوهرها هي البحث عن <span className={cn("font-medium transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>"الحد الأدنى غير القابل للاختزال"</span> (Irreducible Minimum)، حيث تصبح البساطة أداة للكشف عن القيم الجوهرية للفراغ والضوء والمادة.
                          </p>
                          <div className={cn(
                            "border-r-4 border-emerald-500 p-6 my-8 italic transition-colors duration-500",
                            isDarkMode ? "bg-zinc-900/50 text-zinc-300" : "bg-zinc-100 text-zinc-700"
                          )}>
                            "تنبثق الجذور الفلسفية لهذا التيار من تقاطع فريد بين الفكر الشرقي والمنطق الغربي؛ فمن جهة، تعتمد الحدنوية على مفهوم 'الزن' الياباني الذي يقدس 'الما' (Ma) أو الفراغ بوصفه حيزاً للاحتمالات وليس مجرد فراغ سلبي."
                          </div>
                        </div>
                      </div>
                      
                      <div className="order-1 lg:order-2">
                        <div className={cn(
                          "p-8 rounded-3xl border transition-all duration-500",
                          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                        )}>
                          <h3 className={cn("text-2xl font-light mb-6 text-right transition-colors", isDarkMode ? "text-white" : "text-zinc-900")} dir="rtl">ملخص البحث</h3>
                          <p className={cn("text-right leading-relaxed mb-8 transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")} dir="rtl">
                            تستهدف هذه الدراسة تقديم تحليل شمولي لتيار "الحدنوية" (Minimalism) كفلسفة معمارية ومنهج تصميمي يسعى لاستخلاص الجوهر من خلال الاختزال المدروس. يتتبع البحث الأصول التاريخية للتيار بدءاً من الحركات الطليعية في مطلع القرن العشرين، مروراً برواده المؤسسين، وصولاً إلى تطبيقاته المعاصرة والمستقبلية.
                          </p>
                          <div className="space-y-4">
                            <div className={cn("flex items-center justify-between text-sm border-b pb-2 transition-colors", isDarkMode ? "border-zinc-800" : "border-zinc-100")}>
                              <span className="text-emerald-500">الاستدامة والتقنية</span>
                              <span className="text-zinc-500">التركيز الرئيسي</span>
                            </div>
                            <div className={cn("flex items-center justify-between text-sm border-b pb-2 transition-colors", isDarkMode ? "border-zinc-800" : "border-zinc-100")}>
                              <span className="text-emerald-500">منزل كوشينو / جناح أولنيك</span>
                              <span className="text-zinc-500">نماذج تطبيقية</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-emerald-500">الحدنوية الدافئة</span>
                              <span className="text-zinc-500">الرؤية المستقبلية</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Philosophy Table/Infographic */}
                    <div className="mt-24" dir="rtl">
                      <h3 className={cn("text-2xl font-light mb-12 text-center transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>أبعاد الفكر الحدنوي</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {philosophyData.map((item, i) => (
                          <div key={i} className={cn(
                            "group p-8 border rounded-2xl transition-all duration-500 hover:border-emerald-500/50",
                            isDarkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                          )}>
                            <div className="text-emerald-500 font-mono text-sm mb-4">0{i+1}</div>
                            <h4 className={cn("text-xl font-medium mb-2 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>{item.name}</h4>
                            <div className="text-zinc-500 text-xs mb-4 uppercase tracking-widest">{item.concept}</div>
                            <p className={cn("text-sm leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>{item.effect}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                {index === 2 && (
                  <section id="section-2" className="py-12 container mx-auto px-6">
                    <SectionTitle number="02" subtitle="الجذور الفلسفية والمنطقية" isDarkMode={isDarkMode}>الفصل الأول: النشأة والتطور</SectionTitle>
                    <div className="grid lg:grid-cols-2 gap-16 mt-16 items-center" dir="rtl">
                      <div className="space-y-8">
                        <div className={cn(
                          "p-8 rounded-3xl border transition-all duration-500",
                          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                        )}>
                          <h3 className={cn("text-2xl font-light mb-4 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>تأثير فلسفة "الزن" اليابانية</h3>
                          <p className={cn("leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                            تعتبر فلسفة "الزن" حجر الزاوية في المينيماليزم الشرقي. يركز مفهوم "الما" (Ma) على الفراغ البيني الذي يعطي قيمة للأشياء المحيطة به. في العمارة، يترجم هذا إلى مساحات صامتة تسمح للضوء والظل برسم ملامح المكان.
                          </p>
                        </div>
                        <div className={cn(
                          "p-8 rounded-3xl border transition-all duration-500",
                          isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                        )}>
                          <h4 className="text-emerald-500 font-medium mb-2">مبدأ "Wabi-Sabi"</h4>
                          <p className="text-sm leading-relaxed">الجمال في عدم الكمال، والبساطة في المادة الخام، والقبول بدورة الحياة الطبيعية للأشياء.</p>
                        </div>
                      </div>
                      <div>
                        <ImageWithCaption 
                          src="https://drive.google.com/file/d/1mEyChZyKDquc1uybrY2wKFszpkYo8XNc/view?usp=drive_link"
                          caption="صورة 1: لقطة تجريدية لفناء ياباني تقليدي يوضح مفهوم 'الما' والهدوء الفراغي"
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    </div>

                    {/* Philosophy Table */}
                    <div className={cn(
                      "mt-16 border rounded-3xl overflow-hidden transition-all duration-500",
                      isDarkMode ? "bg-zinc-900/20 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm"
                    )} dir="rtl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right">
                          <thead>
                            <tr className={cn("border-b transition-colors", isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-50 border-zinc-200")}>
                              <th className="py-5 px-8 text-emerald-500 font-medium text-sm uppercase tracking-wider">البعد الفلسفي</th>
                              <th className="py-5 px-8 text-emerald-500 font-medium text-sm uppercase tracking-wider">المفهوم المركزي</th>
                              <th className="py-5 px-8 text-emerald-500 font-medium text-sm uppercase tracking-wider">الأثر المعماري المتوقع</th>
                              <th className="py-5 px-8 text-emerald-500 font-medium text-sm uppercase tracking-wider text-center">المصدر</th>
                            </tr>
                          </thead>
                          <tbody className={cn("divide-y transition-colors", isDarkMode ? "divide-zinc-800/50" : "divide-zinc-100")}>
                            {[
                              { dim: 'فلسفة الزن (Zen Philosophy)', concept: 'الفراغ (Ma)', impact: 'تعزيز التأمل من خلال المساحات المفتوحة', source: '1' },
                              { dim: 'الظاهراتية (Phenomenology)', concept: 'الحضور المادي (Specific Object)', impact: 'التركيز على ملمس المادة وتفاعل الجسد مع الفراغ', source: '11' },
                              { dim: 'الأخلاقيات البيئية (Environmental Ethics)', concept: 'القصدية (Intentionality)', impact: 'تقليل الهدر المادي والاعتماد على المواد الطبيعية', source: '1' },
                              { dim: 'الصدق البنائي (Structural Honesty)', concept: 'الوظيفية الصارمة', impact: 'إظهار الهيكل الإنشائي كجزء من الجمالية', source: '6' },
                            ].map((row, i) => (
                              <motion.tr 
                                key={i} 
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={cn("transition-colors group", isDarkMode ? "hover:bg-emerald-500/5" : "hover:bg-emerald-50/50")}
                              >
                                <td className={cn("py-6 px-8 font-medium border-r-2 border-transparent group-hover:border-emerald-500 transition-all", isDarkMode ? "text-white" : "text-zinc-900")}>{row.dim}</td>
                                <td className={cn("py-6 px-8 font-light transition-colors", isDarkMode ? "text-zinc-300" : "text-zinc-600")}>{row.concept}</td>
                                <td className={cn("py-6 px-8 text-sm leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>{row.impact}</td>
                                <td className="py-6 px-8">
                                  <div className="flex justify-center">
                                    <span className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-colors",
                                      isDarkMode ? "bg-zinc-800 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black" : "bg-zinc-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                                    )}>
                                      {row.source}
                                    </span>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                )}

                {index === 3 && (
                  <section id="section-characteristics" className="py-12 container mx-auto px-6">
                  <SectionTitle number="03" subtitle="الجوهر المختزل في الفراغ" isDarkMode={isDarkMode}>خصائص التيار المعماري</SectionTitle>
                  
                  <div className="mt-16" dir="rtl">
                    <div className={cn(
                      "border rounded-[2.5rem] overflow-hidden transition-all duration-500",
                      isDarkMode ? "bg-zinc-900/20 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm"
                    )}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                          <thead>
                            <tr className={isDarkMode ? "bg-zinc-900/50" : "bg-zinc-50"}>
                              <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>الخاصية</th>
                              <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>الوصف الأكاديمي</th>
                              <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>التأثير المعماري</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { prop: 'النقاء الشكلي', desc: 'استخدام الأشكال الهندسية الأساسية (المكعب، الكرة، الهرم) دون تعقيد.', effect: 'تحقيق الوضوح البصري والهدوء النفسي.' },
                              { prop: 'الاختزال المادي', desc: 'تقليل تنوع المواد المستخدمة والتركيز على جودة المادة الخام (الخرسانة، الزجاج، الحجر).', effect: 'إبراز الملمس الطبيعي للمادة كعنصر جمالي.' },
                              { prop: 'الفراغ كعنصر فعال', desc: 'اعتبار الفراغ مادة بناء حقيقية وليس مجرد غياب للكتلة.', effect: 'خلق تجربة مكانية غامرة تركز على الحضور.' },
                              { prop: 'الصدق الإنشائي', desc: 'إظهار الهيكل الإنشائي للمبنى بوضوح دون تزييف أو تغطية زخرفية.', effect: 'تعزيز الثقة والنزاهة في التصميم.' },
                              { prop: 'التفاعل مع الضوء', desc: 'استخدام الضوء الطبيعي كمادة تشكيلية أساسية تحدد معالم الفراغ.', effect: 'تحويل الأسطح الصماء إلى لوحات ضوئية متغيرة.' },
                            ].map((row, idx) => (
                              <tr key={idx} className="group hover:bg-emerald-500/5 transition-colors">
                                <td className={cn("p-6 border-b transition-colors font-medium", isDarkMode ? "text-white border-zinc-800/50" : "text-zinc-900 border-zinc-100")}>{row.prop}</td>
                                <td className={cn("p-6 border-b transition-colors", isDarkMode ? "text-zinc-400 border-zinc-800/50" : "text-zinc-600 border-zinc-100")}>{row.desc}</td>
                                <td className={cn("p-6 border-b transition-colors", isDarkMode ? "text-zinc-500 border-zinc-800/50" : "text-zinc-500 border-zinc-100")}>{row.effect}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-24 grid lg:grid-cols-2 gap-16 items-center">
                      <div className="space-y-8">
                        <h3 className={cn("text-3xl font-light transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>شروط "الحدنوية" في التصميم</h3>
                        <p className={cn("leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                          وفقاً للمراجع الأكاديمية (مثل Bertoni, 2002)، يجب أن يستوفي التصميم معايير محددة ليصنف ضمن التيار الحدنوي. هذه المعايير ليست جمالية فقط، بل هي فلسفة متكاملة في التعامل مع المادة والمكان.
                        </p>
                        
                        <div className="space-y-4">
                          {[
                            { label: 'الاختزال الشكلي (Formal Reduction)', value: 30, color: '#10b981' },
                            { label: 'نقاء المواد (Material Purity)', value: 25, color: '#3b82f6' },
                            { label: 'الفراغ والسيولة (Space & Fluidity)', value: 20, color: '#f59e0b' },
                            { label: 'غياب الزخرفة (Absence of Ornament)', value: 15, color: '#ef4444' },
                            { label: 'الصدق الإنشائي (Structural Honesty)', value: 10, color: '#8b5cf6' },
                          ].map((item, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className={isDarkMode ? "text-zinc-300" : "text-zinc-700"}>{item.label}</span>
                                <span className="text-emerald-500 font-bold">{item.value}%</span>
                              </div>
                              <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${item.value}%` }}
                                  transition={{ duration: 1, delay: i * 0.1 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={cn(
                        "p-8 rounded-[3rem] border transition-all duration-500",
                        isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      )}>
                        <h4 className={cn("text-xl font-light mb-8 text-center transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>توزيع الأهمية النسبية للمعايير</h4>
                        <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'الاختزال الشكلي', value: 30, fill: '#10b981' },
                                  { name: 'نقاء المواد', value: 25, fill: '#3b82f6' },
                                  { name: 'الفراغ والسيولة', value: 20, fill: '#f59e0b' },
                                  { name: 'غياب الزخرفة', value: 15, fill: '#ef4444' },
                                  { name: 'الصدق الإنشائي', value: 10, fill: '#8b5cf6' },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                { [0,1,2,3,4].map((entry, index) => (
                                  <Cell key={`cell-${index}`} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
                                  border: isDarkMode ? '1px solid #27272a' : '1px solid #e4e4e7', 
                                  borderRadius: '12px',
                                  color: isDarkMode ? '#ffffff' : '#000000',
                                  textAlign: 'right'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-center text-xs text-zinc-500 mt-4">
                          * تمثل هذه النسب الثقل النوعي لكل معيار في تقييم "حدنوية" العمل المعماري.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

                {index === 4 && (
                <>
                  <section id="section-4" className="py-12 container mx-auto px-6">
        <SectionTitle number="04" subtitle="صناع الفراغ الصامت" isDarkMode={isDarkMode}>الفصل الثاني: رواد التيار ومدارسه</SectionTitle>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16" dir="rtl">
          {/* Mies */}
          <div className="group">
            <div className={cn(
              "aspect-[3/4] overflow-hidden rounded-3xl mb-6 relative transition-colors duration-500",
              isDarkMode ? "bg-zinc-900" : "bg-zinc-100"
            )}>
              <img crossOrigin="anonymous" 
                src="https://lh3.googleusercontent.com/d/1AxAvmrK0bh44ERoLBFvNXMEbpvi6894J" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                alt="Mies van der Rohe"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black via-transparent to-transparent">
                <h4 className="text-2xl font-light text-white mb-2">ميس فان دير روه</h4>
                <p className="text-emerald-500 text-sm font-mono">"الأقل هو الأكثر"</p>
              </div>
            </div>
            <p className={cn("text-sm leading-relaxed mb-6 transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
              ركز ميس على "الفراغ الشامل" والشفافية المطلقة، مستخدماً الزجاج والصلب لخلق حدود غير مرئية بين الساكن والطبيعة.
            </p>
            <ImageWithCaption 
              src="https://drive.google.com/file/d/1jmXp6WiJyDi_m4gq9FidOtxUcyT-lga0/view?usp=drive_link"
              caption="صور 5: جناح برشلونة - انعكاس الرخام والماء"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Ando */}
          <div className="group">
            <div className={cn(
              "aspect-[3/4] overflow-hidden rounded-3xl mb-6 relative transition-colors duration-500",
              isDarkMode ? "bg-zinc-900" : "bg-zinc-100"
            )}>
              <img crossOrigin="anonymous" 
                src="https://lh3.googleusercontent.com/d/1MRVJ44X0abk_pTNtJDDr4_cjSsHC-znT" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                alt="Tadao Ando"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black via-transparent to-transparent">
                <h4 className="text-2xl font-light text-white mb-2">تاداو أندو</h4>
                <p className="text-emerald-500 text-sm font-mono">"نحت الضوء بالخرسانة"</p>
              </div>
            </div>
            <p className={cn("text-sm leading-relaxed mb-6 transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
              المعماري الياباني الذي نجح في تحويل الخرسانة الصماء إلى مادة روحانية. يمثل أندو "مينيماليزم الشرق" الذي يركز على العزلة.
            </p>
            <ImageWithCaption 
              src="https://drive.google.com/file/d/1qF9BbIxIzbubREDLxm2NPG3UzouGHeKE/view?usp=drive_link"
              caption="صورة 6: كنيسة الضوء في أوساكا - تاداو أندو"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Campo Baeza */}
          <div className="group">
            <div className={cn(
              "aspect-[3/4] overflow-hidden rounded-3xl mb-6 relative transition-colors duration-500",
              isDarkMode ? "bg-zinc-900" : "bg-zinc-100"
            )}>
              <img crossOrigin="anonymous" 
                src="https://lh3.googleusercontent.com/d/1bhiLeIMqN95fnOM3r5aS4pDiUGcGT1C3" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                alt="Campo Baeza"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black via-transparent to-transparent">
                <h4 className="text-2xl font-light text-white mb-2">كامبو بايزا</h4>
                <p className="text-emerald-500 text-sm font-mono">"الأكثر بالقليل"</p>
              </div>
            </div>
            <p className={cn("text-sm leading-relaxed mb-6 transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
              يمثل ذروة المينيماليزم التجريدي الغربي. يرتكز فكره على ثنائية "الجاذبية والضوء"؛ فالجاذبية تبني المكان، والضوء يبني الزمان.
            </p>
            <ImageWithCaption 
              src="https://drive.google.com/file/d/1BVMNqylIqc42X5TPjBVeb4SnAzo28Pxl/view?usp=drive_link"
              caption="صورة 7: منزل غاسبار في قادش - كامبو بايزا"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
                  </section>

                  {/* Full width image between sections */}
                  <div className="w-full relative h-[60vh] md:h-[80vh] overflow-hidden rounded-3xl my-12">
        <img crossOrigin="anonymous" 
          src="https://lh3.googleusercontent.com/d/1Zgivv6Hl_bSVVirQJS8SKS84b1VS6GO0" 
          className="w-full h-full object-cover"
          alt="منظور شامل وتفصيلي لمنزل غاسبار - قادش"
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute inset-0 transition-colors duration-500",
          isDarkMode ? "bg-gradient-to-t from-black via-transparent to-black/20" : "bg-gradient-to-t from-white via-transparent to-white/20"
        )} />
        <div className="absolute bottom-12 right-12 text-right px-6" dir="rtl">
          <p className="text-emerald-500 font-medium text-xl mb-2">منظور شامل وتفصيلي لمنزل غاسبار - قادش</p>
          <p className={cn("text-sm max-w-md transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>أيقونة المينيماليزم لكامبو بايزا التي تجسد فلسفة "الأكثر بالقليل" من خلال نقاء الفراغ وسطوع الضوء.</p>
        </div>
      </div>

                </>
              )}

                {index === 5 && (
                <section id="section-5" className={cn("py-12 transition-colors duration-500 rounded-3xl", isDarkMode ? "bg-zinc-950" : "bg-zinc-100")}>
        <div className="container mx-auto px-6">
          <SectionTitle number="05" subtitle="مختبر أندو للمينيماليزم والارتباط بالطبيعة" isDarkMode={isDarkMode}>الفصل الثالث: دراسة تحليلية لمنزل كوشينو</SectionTitle>
          
          <div className="grid lg:grid-cols-2 gap-16 mt-16" dir="rtl">
            <div className="space-y-8">
              <div className={cn(
                "p-8 rounded-3xl border transition-all duration-500",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <h3 className={cn("text-2xl font-light mb-4 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>تعريف بالمبنى والسياق</h3>
                <p className={cn("leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                  صمم أندو هذا المنزل لمصممة الأزياء "هيروكو كوشينو" على موقع جبلي كثيف الأشجار. تمثل الاستراتيجية الرئيسية في "الدفن الجزئي" للكتل تحت الأرض لاحترام التضاريس وتوفير ملاذ هادئ بعيداً عن المدينة.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "p-6 rounded-2xl border transition-all duration-500",
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}>
                  <div className="text-emerald-500 text-xl font-bold mb-1">1980</div>
                  <div className="text-zinc-500 text-xs">سنة التأسيس</div>
                </div>
                <div className={cn(
                  "p-6 rounded-2xl border transition-all duration-500",
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}>
                  <div className="text-emerald-500 text-xl font-bold mb-1">أشيا</div>
                  <div className="text-zinc-500 text-xs">الموقع - اليابان</div>
                </div>
              </div>

              <div className={cn(
                "p-8 rounded-3xl border transition-all duration-500",
                isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
              )}>
                <h4 className="text-emerald-500 font-medium mb-4">المكونات الفراغية</h4>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    <div><span className={cn("transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>الكتلة الشمالية:</span> فراغ مزدوج الارتفاع للمعيشة والمطبخ.</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    <div><span className={cn("transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>الكتلة الجنوبية:</span> غرف النوم المنظمة خطياً للخصوصية.</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                    <div><span className={cn("transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>المرسم:</span> أُضيف لاحقاً بشكل منحني يكسر حدة الخطوط.</div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <ImageWithCaption 
                src="https://drive.google.com/file/d/1XWCSClQqSCgFZVtr4KKwN33Z09f6VLIz/view?usp=drive_link"
                caption="منزل كوشينو - لقطة خارجية"
                isDarkMode={isDarkMode}
              />
              <div className="grid grid-cols-2 gap-4">
                <img crossOrigin="anonymous" src="https://lh3.googleusercontent.com/d/1bZBvlQiblJYKlXYv-35f_Sdcq0GMOIcY" className={cn("rounded-xl border transition-colors", isDarkMode ? "border-zinc-800" : "border-zinc-200")} alt="Plan 1" />
                <img crossOrigin="anonymous" src="https://lh3.googleusercontent.com/d/1a9lj_4l7Pdei4T3r6Mv4AUrxagcW4nwT" className={cn("rounded-xl border transition-colors", isDarkMode ? "border-zinc-800" : "border-zinc-200")} alt="Plan 2" />
              </div>
            </div>
          </div>

          <div className="mt-16">
            <ImageWithCaption 
              src="https://drive.google.com/file/d/1XwCjEYXp-Ap3oZOiKEDmtk3VnaV3HGAG/view?usp=drive_link"
              caption="دراسة تحليلية شاملة لمنزل كوشينو"
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12 mt-16" dir="rtl">
            <div className={cn(
              "p-8 rounded-3xl border transition-all duration-500",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <h3 className={cn("text-2xl font-light mb-6 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>دراسة الواجهات والتفاصيل</h3>
              <p className={cn("leading-relaxed mb-6 transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                تخلو الواجهات تماماً من أي زخرفة، حيث تصبح "ثقوب الزراجين" الناتجة عن صب الخرسانة هي الزينة الوحيدة المنتظمة هندسياً. استخدام قوالب الخشب المصقولة جعل سطح الخرسانة ناعماً وعاكساً للضوء.
              </p>
              <ImageWithCaption 
                src="https://drive.google.com/file/d/14QD2eYg4gOwvl988oMzn4k6SXCVPgedl/view?usp=drive_link"
                caption="صورة 8: تفصيل مقرب لسطح الخرسانة في منزل كوشينو"
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="space-y-6">
              <ImageWithCaption 
                src="https://drive.google.com/file/d/1P6mn_WlCv8-HgxammAzPcttWBIK8m1KV/view?usp=drive_link"
                caption="تداخل الكتلة المنحنية مع التضاريس"
                isDarkMode={isDarkMode}
              />
              <ImageWithCaption 
                src="https://drive.google.com/file/d/1Z3Q6eBCw__Q2C6ftIr0D3uIqrCgzAlyo/view?usp=drive_link"
                caption="منظور ليلي يظهر شفافية الفراغات"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Koshino House Analysis Table */}
          <div className={cn(
            "mt-24 border rounded-[2.5rem] overflow-hidden transition-all duration-500",
            isDarkMode ? "bg-zinc-900/20 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm"
          )} dir="rtl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className={isDarkMode ? "bg-zinc-900/50" : "bg-zinc-50"}>
                    <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>المكون الفراغي</th>
                    <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>التحليل التصميمي</th>
                    <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>الأثر الحسي</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { component: 'الفناء المركزي', analysis: 'مساحة مفتوحة تربط الكتلتين', impact: 'دمج الطبيعة والضوء في قلب السكن' },
                    { component: 'النفق الرابط', analysis: 'ممر تحت الأرض أسفل الدرج', impact: 'الانتقال من الضوء إلى العتمة ثم الضوء' },
                    { component: 'الشقوق الضوئية', analysis: 'فتحات علوية ورأسية نحيفة', impact: 'تحويل الجدران إلى لوحات من الظل' },
                    { component: 'نظام الموديول', analysis: 'يعتمد على قياسات "التاتامي"', impact: 'تحقيق التناغم والنسب الإنسانية' },
                  ].map((row, idx) => (
                    <tr key={idx} className="group hover:bg-emerald-500/5 transition-colors">
                      <td className={cn("p-6 border-b transition-colors font-medium", isDarkMode ? "text-white border-zinc-800/50" : "text-zinc-900 border-zinc-100")}>{row.component}</td>
                      <td className={cn("p-6 border-b transition-colors", isDarkMode ? "text-zinc-400 border-zinc-800/50" : "text-zinc-600 border-zinc-100")}>{row.analysis}</td>
                      <td className={cn("p-6 border-b transition-colors", isDarkMode ? "text-zinc-500 border-zinc-800/50" : "text-zinc-500 border-zinc-100")}>{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
              )}

                {index === 6 && (
                <section id="section-6" className="py-12 container mx-auto px-6">
        <SectionTitle number="06" subtitle="أحدث تجليات فكر كامبو بايزا حول الفراغ المطلق" isDarkMode={isDarkMode}>الفصل الرابع: دراسة تحليلية لجناح روبرت أولنيك</SectionTitle>
        
        <div className="grid lg:grid-cols-2 gap-16 mt-16 items-center" dir="rtl">
          <div>
            <ImageWithCaption 
              src="https://drive.google.com/file/d/1EklklqWPXFvLX3u8El5BvGPFCQ7Oqv75/view?usp=drive_link"
              caption="جناح روبرت أولنيك - نيويورك 2023"
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="space-y-8">
            <div className={cn(
              "p-8 rounded-3xl border transition-all duration-500",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <h3 className={cn("text-2xl font-light mb-4 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>المفهوم: الفراغ الأيزوتروبي</h3>
              <p className={cn("leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                يتبنى بايزا هنا مفهوم "الفراغ الأيزوتروبي" (Isotropic Space)، وهو فراغ متجانس تماماً يبدو وكأنه يسبح في الضوء بلا بداية أو نهاية. المكعب المثالي (Gallery 2) هو قلب المشروع، مكعب أبيض بأبعاد 10*10*10 متر.
              </p>
            </div>
            
            <div className={cn(
              "p-8 rounded-3xl border transition-all duration-500",
              isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
            )}>
              <h4 className="text-emerald-500 font-medium mb-6">التفصيل المعماري</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold">1</div>
                  <div>
                    <div className={cn("font-medium transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>قياس الفتحات: 2.10 * 2.10 م</div>
                    <div className="text-zinc-500 text-xs">تعمل كمداخل ومصادر ضوء دقيقة</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold">2</div>
                  <div>
                    <div className={cn("font-medium transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>المادة الداخلية: جص أبيض ناصع</div>
                    <div className="text-zinc-500 text-xs">تعظيم انعكاس الضوء وإلغاء الظلال</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold">3</div>
                  <div>
                    <div className={cn("font-medium transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>الساعة الشمسية</div>
                    <div className="text-zinc-500 text-xs">حزم الضوء تتحرك عبر الأسطح طوال اليوم</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <ImageWithCaption src="https://drive.google.com/file/d/1tdC5fWnLdArU8ZlEHfRipXsEYzTu7uAb/view?usp=drive_link" caption="منظور داخلي لصالة العرض" isDarkMode={isDarkMode} />
          <ImageWithCaption src="https://drive.google.com/file/d/1jely6kOWLGV8E7ox45TJXAPUOyqfQzBz/view?usp=drive_link" caption="المساقط الأفقية" isDarkMode={isDarkMode} />
          <ImageWithCaption src="https://drive.google.com/file/d/1ZNFTT5snG3F7j6jFbMMr1hgy_G2oKaYB/view?usp=drive_link" caption="مقطع رأسي" isDarkMode={isDarkMode} />
        </div>

        {/* Olnick Pavilion Detail Table */}
        <div className={cn(
          "mt-24 border rounded-[2.5rem] overflow-hidden transition-all duration-500",
          isDarkMode ? "bg-zinc-900/20 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm"
        )} dir="rtl">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-zinc-900/50" : "bg-zinc-50"}>
                  <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>التفصيل المعماري</th>
                  <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>القياس / المواصفة</th>
                  <th className={cn("p-6 font-medium border-b transition-colors", isDarkMode ? "text-white border-zinc-800" : "text-zinc-900 border-zinc-200")}>الوظيفة الحدنوية</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { detail: 'قياس الفتحات', spec: '2.10 * 2.10 م', function: 'تعمل كمداخل (الأبواب القياسية) ومصادر ضوء' },
                  { detail: 'المادة الخارجية', spec: 'خرسانة مكشوفة مصبوبة', function: 'ربط المبنى بالطابع الصناعي للموقع' },
                  { detail: 'المادة الداخلية', spec: 'جص أبيض ناصع', function: 'تعظيم انعكاس الضوء وإلغاء الظلال الحادة' },
                  { detail: 'الشفافية', spec: 'واجهة زجاجية للمقهى', function: 'تذويب الحدود مع المناظر الطبيعية المحيطة' },
                ].map((row, idx) => (
                  <tr key={idx} className="group hover:bg-emerald-500/5 transition-colors">
                    <td className={cn("p-6 border-b transition-colors font-medium", isDarkMode ? "text-white border-zinc-800/50" : "text-zinc-900 border-zinc-100")}>{row.detail}</td>
                    <td className={cn("p-6 border-b transition-colors", isDarkMode ? "text-zinc-400 border-zinc-800/50" : "text-zinc-600 border-zinc-100")}>{row.spec}</td>
                    <td className={cn("p-6 border-b transition-colors", isDarkMode ? "text-zinc-500 border-zinc-800/50" : "text-zinc-500 border-zinc-100")}>{row.function}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
              )}

                {index === 7 && (
                <section className={cn("py-12 transition-colors duration-500", isDarkMode ? "bg-black" : "bg-white")}>
        <div className="container mx-auto px-6" dir="rtl">
          <div className="text-center mb-16">
            <h2 className={cn("text-4xl font-light mb-4 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>
              الدراسة التحليلية النقدية للحالات الدراسية
            </h2>
            <p className={cn("text-zinc-500 max-w-3xl mx-auto transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
              يفكك هذا القسم التحليلي العلاقة بين الكتلة والضوء، مظهراً التباين بين المينيماليزم "الدرامي/المادي" عند تاداو أندو، والمينيماليزم "النوراني/التجريدي" عند كامبو بايزا.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-24">
            {/* Ando Card */}
            <div className={cn(
              "p-10 rounded-[3rem] border transition-all duration-500",
              isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            )}>
              <h3 className="text-2xl font-bold text-orange-500 mb-6">منزل كوشينو (Tadao Ando)</h3>
              <div className="space-y-6">
                <div>
                  <h4 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-zinc-900")}>الفكرة والسياق:</h4>
                  <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                    "حصن" للسكينة، عدم المساس بالطبيعة بل الدفن الجزئي بالمنحدر لتحقيق اندماج بصري ومناخي [Ando, 1995].
                  </p>
                </div>
                <div>
                  <h4 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-zinc-900")}>التحليل الهندسي:</h4>
                  <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                    كتلتان مستطيلتان صارمتان، كُسرت لاحقاً بإضافة استوديو ذو جدار منحني يمثل (الطبيعة) مقابل المستطيل (المنطق).
                  </p>
                </div>
                <div>
                  <h4 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-zinc-900")}>المعالجة الضوئية (التفاصيل):</h4>
                  <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                    الاستغناء عن النوافذ المعتادة لصالح "شقوق ضوئية" طولية تحول الجدار الخرساني المصقول إلى لوحة متغيرة زمنياً بتأثير (Chiaroscuro) القوي.
                  </p>
                </div>
                <div className="pt-6">
                  <img crossOrigin="anonymous" 
                    src="https://lh3.googleusercontent.com/d/1Z3Q6eBCw__Q2C6ftIr0D3uIqrCgzAlyo" 
                    className={cn("w-full h-48 object-cover rounded-2xl border transition-colors", isDarkMode ? "border-zinc-800" : "border-zinc-200")} 
                    alt="Koshino House"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Baeza Card */}
            <div className={cn(
              "p-10 rounded-[3rem] border transition-all duration-500",
              isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            )}>
              <h3 className="text-2xl font-bold text-cyan-500 mb-6">جناح روبرت أولنيك (Campo Baeza)</h3>
              <div className="space-y-6">
                <div>
                  <h4 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-zinc-900")}>الفكرة والسياق:</h4>
                  <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                    ترجمة لمفهوم "المكعب المثالي" والفراغ المتساوي الخواص (Isotropic)، حيث يبدو الفراغ معلقاً في الضوء بلا بداية أو نهاية.
                  </p>
                </div>
                <div>
                  <h4 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-zinc-900")}>التحليل الهندسي:</h4>
                  <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                    متوازي مستطيلات خرساني مندمج بالأرض، يعلوه برج مكعب ناصع البياض (10x10x10متر) يعمل كقلب للمشروع.
                  </p>
                </div>
                <div>
                  <h4 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-zinc-900")}>المعالجة الضوئية (التفاصيل):</h4>
                  <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                    غياب النوافذ على مستوى العين، واستخدام 4 فتحات زاوية علوية تجعل الفراغ الأبيض الغامر يعمل كـ "ساعة شمسية" تقيس الزمن بدقة.
                  </p>
                </div>
                <div className="pt-6">
                  <img crossOrigin="anonymous" 
                    src="https://lh3.googleusercontent.com/d/1EklklqWPXFvLX3u8El5BvGPFCQ7Oqv75" 
                    className={cn("w-full h-48 object-cover rounded-2xl border transition-colors", isDarkMode ? "border-zinc-800" : "border-zinc-200")} 
                    alt="Olnick Pavilion"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className={cn(
            "p-12 rounded-[4rem] border transition-all duration-500",
            isDarkMode ? "bg-zinc-900/20 border-zinc-800/50" : "bg-zinc-50/50 border-zinc-200"
          )}>
            <h3 className={cn("text-2xl font-light mb-12 text-center transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>
              تحليل راداري مقارن: أندو مقابل بايزا
            </h3>
            <p className="text-center text-zinc-500 text-sm mb-12">
              مقارنة الخصائص الفراغية الظاهراتية للمشروعين من حيث التفاعل مع المستخدم [Pallasmaa, 2012]
            </p>
            
            <div className="h-[600px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke={isDarkMode ? "#27272a" : "#e4e4e7"} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: isDarkMode ? "#a1a1aa" : "#3f3f46", fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="تاداو أندو (منزل كوشينو)"
                    dataKey="ando"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="كامبو بايزا (جناح أولنيك)"
                    dataKey="baeza"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.5}
                  />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
                      border: isDarkMode ? '1px solid #27272a' : '1px solid #e4e4e7', 
                      borderRadius: '12px',
                      color: isDarkMode ? '#ffffff' : '#000000',
                      textAlign: 'right'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
              )}

                {index === 8 && (
                <section id="section-8" className={cn("py-12 overflow-hidden transition-colors duration-500 rounded-3xl", isDarkMode ? "bg-zinc-950" : "bg-zinc-100")}>
        <div className="container mx-auto px-6">
          <SectionTitle number="08" subtitle="الاستدامة، التكنولوجيا، والابتكار" isDarkMode={isDarkMode}>الفصل الخامس: المينيماليزم المستقبلي</SectionTitle>
          
          <div className="mb-16" dir="rtl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h3 className={cn("text-3xl font-light leading-tight transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>نحو "حدنوية دافئة" تلبي احتياجات العصر الرقمي</h3>
                <p className={cn("text-lg leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                  تخلص النتائج إلى أن مستقبل التيار يكمن في اندماجه مع التكنولوجيا الذكية والمواد المبتكرة لتحقيق توازن بين الكفاءة التقنية والراحة الإنسانية.
                </p>
                <div className="flex flex-wrap gap-4">
                  <span className={cn("px-4 py-2 border rounded-full text-sm text-emerald-500 transition-colors", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm")}>الاستدامة البيئية</span>
                  <span className={cn("px-4 py-2 border rounded-full text-sm text-emerald-500 transition-colors", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm")}>التكنولوجيا الذكية</span>
                  <span className={cn("px-4 py-2 border rounded-full text-sm text-emerald-500 transition-colors", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm")}>المواد المبتكرة</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full opacity-20" />
                <img crossOrigin="anonymous" src="https://lh3.googleusercontent.com/d/1O1y3q0Q-7OOLDgideRwYYED-UBdaZZPo" className={cn("relative rounded-3xl border shadow-2xl transition-colors", isDarkMode ? "border-zinc-800" : "border-zinc-200")} alt="Future Concept" />
              </div>
            </div>
          </div>

          {/* Interactive Comparison / Infographic */}
          <div className={cn(
            "my-24 p-12 rounded-[3rem] border transition-all duration-500",
            isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          )} dir="rtl">
            <h3 className={cn("text-2xl font-light mb-12 text-center transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>تحليل مقارناتي: الحدنوية التقليدية vs المستقبلية</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'الاستدامة', traditional: 40, future: 95 },
                  { name: 'التكنولوجيا', traditional: 20, future: 90 },
                  { name: 'الراحة النفسية', traditional: 70, future: 85 },
                  { name: 'كفاءة المواد', traditional: 60, future: 98 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#27272a" : "#e4e4e7"} />
                  <XAxis dataKey="name" stroke={isDarkMode ? "#71717a" : "#71717a"} />
                  <YAxis stroke={isDarkMode ? "#71717a" : "#71717a"} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
                      border: isDarkMode ? '1px solid #27272a' : '1px solid #e4e4e7', 
                      borderRadius: '12px',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Bar dataKey="traditional" name="الحدنوية التقليدية" fill={isDarkMode ? "#3f3f46" : "#d4d4d8"} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="future" name="الحدنوية المستقبلية" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
              )}

                {index === 9 && (
                <section id="section-9" className={cn("transition-colors duration-500", isDarkMode ? "bg-black" : "bg-white")}>
        <div className="py-24 container mx-auto px-6">
          <SectionTitle number="09" subtitle="رؤية بصرية للمستقبل الحدنوي" isDarkMode={isDarkMode}>آفاق المستقبل</SectionTitle>
          
          {/* Futuristic Architectural Icons */}
          <div className="mt-24" dir="rtl">
            <h3 className={cn("text-3xl font-light mb-12 text-center transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>أيقونات معمارية مستقبلية</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'متحف اللوفر أبوظبي',
                  architect: 'جان نوفيل',
                  desc: '55 مبنى مصمم كـ "مدينة متحفية". قبة قطرها 180م بأنماط هندسية معقدة (8 طبقات) تنتج تأثير "مطر الضوء". تعتمد القبة على 4 أعمدة مخفية فقط، مما يرسخ وهم الطفو. استخدام مكثف لـ UHPC.'
                },
                {
                  title: 'أبل بارك (Apple Park)',
                  architect: 'فوسترت + بارترنز',
                  desc: 'حلقة عملاقة تدمج الاستدامة المطلقة (تهوية طبيعية 9 أشهر بالعام، طاقة متجددة 100%). أكبر ألواح زجاجية منحنية بالعالم تلغي الحدود البصرية مع الغابة المحيطة لتوفير مساحات رحبة ومفتوحة.'
                },
                {
                  title: 'مركز حيدر علييف',
                  architect: 'زها حديد',
                  desc: 'علاقة سلسة خالية من الزوايا الحادة. الساحة الحضرية ترتفع لتغلف الفراغات، مطممسة التمييز بين الأرض والسقف والواجهة. تموجات وتشعبات توجه الزوار ديناميكياً بهيكل معدني معقد متخفي في قشرة بيضاء بسيطة.'
                }
              ].map((item, i) => (
                <div key={i} className={cn(
                  "p-8 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02]",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200 shadow-sm"
                )}>
                  <h4 className="text-2xl font-bold text-blue-500 mb-2">{item.title}</h4>
                  <div className="text-zinc-500 text-sm mb-6">المعماري: {item.architect}</div>
                  <p className={cn("text-sm leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Futuristic Minimalism Applications */}
          <div className="mt-32" dir="rtl">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-blue-500 mb-6">تطبيقات المينيماليزم المستقبلي (Futuristic Minimalism)</h3>
              <p className={cn("text-lg max-w-4xl mx-auto leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                يتطور التيار التبسيطي حالياً ليدمج الاستدامة المتقدمة والتكنولوجيا الذكية مع الأشكال العضوية غير التقليدية، مكوناً ما يعرف بـ "الحدنوية المستقبلية". هذا الاتجاه يتخلى عن الزوايا الحادة الصارمة لصالح الانسيابية والاندماج البيئي الكلي [McDonough, 2002].
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Donut Chart */}
              <div className={cn(
                "p-10 rounded-[3rem] border transition-all duration-500",
                isDarkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <h4 className={cn("text-xl font-light mb-8 text-center transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>أوزان خصائص المينيماليزم المستقبلي في المشاريع الحديثة</h4>
                <div className="h-[400px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
                          border: isDarkMode ? '1px solid #27272a' : '1px solid #e4e4e7', 
                          borderRadius: '12px',
                          color: isDarkMode ? '#ffffff' : '#000000',
                          textAlign: 'right'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Numbered Points */}
              <div className="space-y-8">
                {[
                  {
                    title: 'التقنيات والمواد المبتكرة',
                    desc: 'استخدام خرسانة ألياف الأداء الفائق (UHPC)، زجاج ذكي، أنظمة طاقة متجددة مدمجة بسلاسة مخفية لتعزيز الكفاءة البيئية دون مساومة جمالية.'
                  },
                  {
                    title: 'الفراغات الانسيابية والعضوية',
                    desc: 'طمس الحدود بين الداخل والخارج، خطط طوابق مفتوحة بالكامل، وتحدي المعايير المعتادة عبر أشكال هندسية غير متماثلة أو منحنيات حرة.'
                  },
                  {
                    title: 'الإضاءة التكنولوجية التكيفية',
                    desc: 'نظم ذكية تحاكي الإضاءة الطبيعية لتقليل الاستهلاك، وتخلق تأثيرات سينمائية ديناميكية ترتبط بحركة الشمس والمستخدم.'
                  }
                ].map((point, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0 text-xl shadow-lg shadow-orange-500/20">
                      {i + 1}
                    </div>
                    <div>
                      <h5 className={cn("text-xl font-bold mb-2 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>{point.title}</h5>
                      <p className={cn("leading-relaxed transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                        {point.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          {[
            "181wkbrTbxdKbVpmz0g2SIhV5rRBV1CU6",
            "19JtATPy5mNLr6tupBNgFc2JSrOUU5CYc",
            "1SrGOAFCnzjU1J8eqha85vt9LnFIIMxlX",
            "1wfngmuPzkyMnh1Pjuys-pP6gLW_wfLK3",
            "1m5_Kc6qUec4gCFDpi_-s3gkFzH338uwL",
            "1yhLvjr24QC9Mh9MmPySKBGSd11qmMwOq"
          ].map((id, i) => (
            <motion.div 
              key={id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="w-full relative overflow-hidden"
            >
              <img crossOrigin="anonymous" 
                src={`https://lh3.googleusercontent.com/d/${id}`} 
                className="w-full h-auto object-cover"
                alt={`Future Vision ${i + 1}`}
                referrerPolicy="no-referrer"
              />
              <div className={cn(
                "absolute inset-0 pointer-events-none transition-colors duration-500",
                isDarkMode ? "bg-gradient-to-b from-black/20 via-transparent to-black/40" : "bg-gradient-to-b from-white/20 via-transparent to-white/40"
              )} />
            </motion.div>
          ))}
        </div>
      </section>
              )}

                {index === 10 && (
                  <section className={cn("py-12 border-t transition-colors duration-500", isDarkMode ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200")}>
        <div className="container mx-auto px-6" dir="rtl">
          <SectionTitle number="10" isDarkMode={isDarkMode}>المراجع العلمية</SectionTitle>
          
          <div className="grid gap-6 mt-12">
            {[
              {
                title: 'Minimalism in Architecture: A Basis for Resource Conservation and Sustainable Development (2022)',
                link: 'https://doi.org/10.2298/FUACE221105021K',
                desc: '(دراسة محكمة حول علاقة الحدنوية بالاستدامة وترشيد الموارد)..2'
              },
              {
                title: 'The Essence of Space: Minimalism in Contemporary Architecture and Interior Design (2025)',
                link: 'https://www.researchgate.net/publication/391715250_The_Essence_of_Space_Minimalism_in_Contemporary_Architecture_and_Interior_Design',
                desc: '(بحث حديث يستعرض الأسس الفلسفية للزن والبوهاوس وتأثيرهما على الرفاه النفسي)..1'
              },
              {
                title: 'Minimalism in Contemporary Architecture as One of the Most Usable Aesthetically-Functional Patterns (2016)',
                link: 'https://www.researchgate.net/publication/323198218_Minimalism_in_contemporary_architecture_as_one_of_the_most_usable_aesthetically-functional_patterns',
                desc: '(دراسة تحليلية للنماذج المعمارية الحدنوية المعاصرة وتصنيفها الوظيفي)..78'
              },
              {
                title: 'Minimalism in Architecture: Architecture as a Language of its Identity (2012)',
                link: 'https://www.researchgate.net/publication/269851568_Minimalism_in_architecture_Architecture_as_a_language_of_its_identity',
                desc: '(بحث يغوص في سيميولوجيا الفراغ الحدنوي وكيفية بناء المعنى من خلال الاختزال)..5'
              },
              {
                title: 'Review of Minimalistic Architecture (2024)',
                link: 'https://www.researchgate.net/publication/389011938_Review_of_Minimalistic_Architecture',
                desc: '(مراجعة نقدية شاملة تتناول تاريخ التيار وتحديات ندرة الأراضي والحلول الحدنوية المقترحة)..12'
              }
            ].map((ref, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "p-6 rounded-2xl border transition-all duration-500 hover:border-emerald-500/50",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200 shadow-sm"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className={cn("text-lg font-medium mb-2 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>{ref.title}</h4>
                    <p className={cn("text-sm transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>{ref.desc}</p>
                  </div>
                  <a 
                    href={ref.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors shrink-0"
                  >
                    رابط المصدر <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
              )}

                {index === 11 && (
                  <footer className={cn(
                    "py-12 border-t transition-colors duration-500 min-h-full flex flex-col justify-center",
                    isDarkMode ? "border-zinc-900 bg-black" : "border-zinc-200 bg-zinc-50"
                  )}>
                  <div className="container mx-auto px-6" dir="rtl">
                    <div className="text-center mb-16">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-black font-bold mx-auto mb-6 text-2xl shadow-lg shadow-emerald-500/20">
                        AH
                      </div>
                      <h2 className={cn("text-4xl font-light mb-4 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>الخاتمة: النتائج والتوصيات</h2>
                      <p className={cn("text-zinc-500 max-w-2xl mx-auto", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                        تخلص الدراسة من خلال تحليل المسار التاريخي والتطبيقي لتيار الحدنوية إلى مجموعة من النتائج الجوهرية التي ترسم ملامح مستقبل العمارة.
                      </p>
                    </div>

                    {/* Results Infographic */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                      {[
                        { 
                          title: 'الحدنوية كمنهج ذهني', 
                          desc: 'ليست مجرد تقليل للمواد، بل هي عملية "تكثيف للمعنى"؛ حيث يصبح الفراغ أداة إدراكية تعيد صياغة علاقة الإنسان بمحيطه وبالزمن.',
                          icon: <Brain className="w-6 h-6" />,
                          color: 'bg-blue-500'
                        },
                        { 
                          title: 'التطور نحو الإنسانية', 
                          desc: 'انتقل التيار من الحدنوية "الباردة" والمطلقة إلى الحدنوية "الحسية والروحية"، وصولاً إلى الحدنوية "الدافئة" التي تعيد الاعتبار للمواد الطبيعية والراحة العاطفية.',
                          icon: <Heart className="w-6 h-6" />,
                          color: 'bg-rose-500'
                        },
                        { 
                          title: 'التكامل مع التكنولوجيا', 
                          desc: 'يمثل المستقبل الحدنوي اندماجاً ذكياً بين البساطة والتقنية؛ حيث تساهم الأنظمة الذكية والمواد المبتكرة في تحقيق استدامة حقيقية دون التضحية بالجمالية.',
                          icon: <Cpu className="w-6 h-6" />,
                          color: 'bg-emerald-500'
                        },
                        { 
                          title: 'الأثر النفسي والبيئي', 
                          desc: 'تلعب العمارة الحدنوية دوراً محورياً في تقليل التلوث البصري وترشيد استهلاك الموارد، مما يجعلها المنهج الأمثل لمواجهة تحديات القرن الحادي والعشرين.',
                          icon: <Leaf className="w-6 h-6" />,
                          color: 'bg-amber-500'
                        }
                      ].map((item, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className={cn(
                            "p-8 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02]",
                            isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                          )}
                        >
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", item.color)}>
                            {item.icon}
                          </div>
                          <h4 className={cn("text-xl font-bold mb-4", isDarkMode ? "text-white" : "text-zinc-900")}>{item.title}</h4>
                          <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Recommendation Box */}
                    <div className={cn(
                      "p-10 rounded-[3rem] border mb-16 transition-all duration-500",
                      isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                    )}>
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-xl shadow-emerald-500/20">
                          <Lightbulb className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-emerald-600 mb-4">توصيات البحث</h3>
                          <p className={cn("text-lg leading-relaxed", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>
                            توصي الدراسة المعماريين والباحثين بضرورة عدم النظر للحدنوية كـ "قالب جامد"، بل كإطار مرن يسمح بالتجريب في المواد والتقنيات مع الحفاظ على القصدية والوضوح الفراغي.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Researcher Info */}
                    <div className="pt-12 border-t border-zinc-800/20 text-center">
                      <h3 className={cn("text-2xl font-medium mb-2 transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>الباحث م. أمير الدين الحمامي</h3>
                      <p className={cn("text-lg transition-colors", isDarkMode ? "text-zinc-500" : "text-zinc-600")}>
                        كلية الهندسة المعمارية - جامعة دمشق | ماجستير تخطيط وبيئة
                      </p>
                    </div>
                  </div>
                </footer>
              )}
            </div>
          ))}
        </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-8 left-8 flex gap-4 z-40" dir="rtl">
            <button 
              id="prev-slide-btn"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                currentSlide === 0 
                  ? "opacity-30 cursor-not-allowed" 
                  : (isDarkMode ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-white hover:bg-zinc-100 text-zinc-900 shadow-lg")
              )}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button 
              id="next-slide-btn"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={cn(
                "px-6 h-12 rounded-full flex items-center gap-3 transition-all",
                currentSlide === slides.length - 1
                  ? "opacity-30 cursor-not-allowed" 
                  : (isDarkMode ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20")
              )}
            >
              <span className="font-medium">التالي</span>
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </main>
      </div>

      {/* Sidebar Index */}
      <div 
        style={{ width: isSidebarOpen ? sidebarWidth : 0 }}
        className={cn(
          "relative h-full transition-all duration-300 flex flex-col border-l shrink-0",
          isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200",
          !isSidebarOpen && "border-none"
        )}
      >
        {/* Resize Handle */}
        {isSidebarOpen && (
          <div 
            onMouseDown={startResizing}
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500/50 transition-colors z-50"
          />
        )}

        {/* Sidebar Content */}
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden",
          !isSidebarOpen && "hidden"
        )}>
          <div className="p-6 flex items-center justify-between border-b border-zinc-800/50" dir="rtl">
            <h3 className={cn("font-bold", isDarkMode ? "text-white" : "text-zinc-900")}>الفهرس</h3>
            <button 
              id="sidebar-close-btn"
              onClick={() => setIsSidebarOpen(false)} 
              className="p-1 hover:bg-zinc-800 rounded"
            >
              <PanelRightClose className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar" dir="rtl">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                id={`sidebar-nav-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-full text-right px-4 py-3 rounded-xl transition-all text-sm flex items-center justify-between group",
                  currentSlide === index 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : (isDarkMode ? "text-zinc-400 hover:bg-zinc-900" : "text-zinc-600 hover:bg-zinc-100")
                )}
              >
                <span>{slide.title}</span>
                <span className="text-[10px] opacity-50 font-mono">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Button when closed */}
        {!isSidebarOpen && (
          <button 
            id="sidebar-open-btn"
            onClick={() => setIsSidebarOpen(true)}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full border shadow-lg z-50",
              isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-zinc-200 text-zinc-600"
            )}
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
