import { FaFacebook, FaInstagram, FaLinkedin, FaTelegram, FaYoutube } from "react-icons/fa";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: <FaFacebook size={16} />, url: "https://www.facebook.com/cpbankplc/", label: "Facebook" },
    { icon: <FaLinkedin size={16} />, url: "https://www.linkedin.com/company/cp-bank-plc/", label: "LinkedIn" },
    { icon: <FaYoutube size={16} />, url: "https://www.youtube.com/@cpbankplc", label: "YouTube" },
    { icon: <FaInstagram size={16} />, url: "https://www.instagram.com/cpbank_plc/", label: "Instagram" },
    { icon: <FaTelegram size={16} />, url: "https://t.me/cpbankplc", label: "Telegram" },
  ];

  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Column 1: Brand */}
          <div className="space-y-4">
            <img src="/app/CPBank-footer.png" alt="CPBank Logo" className="h-9 w-auto" />
            <div className="h-0.5 w-16 bg-orange-500 rounded-full" />
            <div className="space-y-2.5 text-sm text-gray-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-3.5 h-3.5 mt-0.5 text-orange-400 flex-shrink-0" />
                <span>070 200 002 &nbsp;|&nbsp; 1800 200 888 <span className="text-gray-500">(ឥតគិតថ្លៃ)</span></span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-3.5 h-3.5 mt-0.5 text-orange-400 flex-shrink-0" />
                <a href="mailto:info@cambodiapostbank.com.kh" className="hover:text-white transition-colors break-all">
                  info@cambodiapostbank.com.kh
                </a>
              </div>
            </div>
            {/* Socials */}
            <div className="pt-1">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Follow Us</p>
              <div className="flex gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-orange-500 transition-colors duration-200"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Address */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Address</h3>
              <div className="h-0.5 w-10 bg-orange-500 rounded-full mt-2" />
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-400">
              <MapPin className="w-3.5 h-3.5 mt-0.5 text-orange-400 flex-shrink-0" />
              <p className="leading-relaxed">
                Building No 263, 1st–6th Floor, Street No 110 ⊥ 61, Sangkat Vat Phnum, Khan Doun Penh, Phnom Penh, Cambodia.
              </p>
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-gray-300">SWIFT Code: </span>CPBPKHP2
            </div>
          </div>

          {/* Column 3: Feedback QR */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Feedback</h3>
              <div className="h-0.5 w-10 bg-orange-500 rounded-full mt-2" />
            </div>
            <div className="flex gap-4 sm:gap-6">
              {[
                { label: "Customer", src: "/assets/qr/customer-feedback-qr.jpg" },
                { label: "Staff", src: "/assets/qr/staff-feedback-qr.jpg" },
              ].map((qr) => (
                <div key={qr.label} className="flex flex-col items-center gap-2">
                  <div className="bg-white p-1.5 rounded-xl shadow-md">
                    <img src={qr.src} alt={`${qr.label} QR`} className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg" />
                  </div>
                  <span className="text-xs text-gray-400">{qr.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CP BANK IT Department. All rights reserved.</p>
          <p>Confidential &amp; Proprietary</p>
        </div>
      </div>
    </footer>
  );
}
