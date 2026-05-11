import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTelegram,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  const socialLinks = [
    {
      icon: <FaFacebook size={20} />,
      url: "https://www.facebook.com/cpbankplc/",
    },
    {
      icon: <FaLinkedin size={20} />,
      url: "https://www.linkedin.com/company/cp-bank-plc/",
    },
    {
      icon: <FaYoutube size={20} />,
      url: "https://www.youtube.com/@cpbankplc",
    },
    {
      icon: <FaInstagram size={20} />,
      url: "https://www.instagram.com/cpbank_plc/",
    },
    { icon: <FaTelegram size={20} />, url: "https://t.me/cpbankplc" },
  ];
  return (
    <footer className="bg-[#1e293b] text-white pt-12 pb-4 px-4 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Column 1: Logo, Contact Info & Socials */}
        <div className="space-y-5">
          <div className="space-y-2 flex flex-col items-center sm:items-start">
            <img
              src="/app/CPBank-footer.png"
              alt="CPBank Logo"
              className="h-10 w-auto hover:scale-105 transition"
            />
            <div className="w-20 sm:w-16 lg:w-52 h-0.5 bg-[#F37021] rounded-full" />
          </div>

          <div className="space-y-3 text-sm text-gray-300 leading-relaxed text-center sm:text-left">
            <p className="hover:text-white transition">
              <span className="font-semibold text-white">Hotline: </span>
              070 200 002 | 1800 200 888
              <span className="block sm:inline">(ឥតគិតថ្លៃ)</span>
            </p>

            <p className="hover:text-white transition">
              <span className="font-semibold text-white">Email:</span>{" "}
              <a
                href="mailto:info@cambodiapostbank.com.kh"
                className="underline-offset-2 hover:underline"
              >
                info@cambodiapostbank.com.kh
              </a>
            </p>
          </div>

          {/* Social Icons */}
          <div className="space-y-3 mt-3">
            <h3 className="font-semibold text-lg text-center sm:text-left">
              Follow Us
            </h3>
            <div className="w-14 sm:w-16 lg:w-14 h-0.5 bg-[#F37021] rounded-full mx-auto sm:mx-0" />
            <div className="flex justify-center sm:justify-start gap-2 mt-2">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-2 rounded-full hover:scale-110 hover:bg-white/20 transition"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Address */}
        <div className="space-y-5">
          <div className="w-full flex flex-col items-center">
            <h3 className="font-semibold text-lg">Address</h3>
            <div className="w-12 sm:w-16 lg:w-12 h-0.5 bg-[#F37021] rounded-full"></div>
          </div>

          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p className="hover:text-white transition">
              Building No 263, 1st–6th Floor, Street No 110 ⊥ 61, Group 11, Phum
              1, Sangkat Vat Phnum, Khan Doun Penh, Phnom Penh, Cambodia.
            </p>

            <p className="hover:text-white transition">
              <span className="font-semibold text-white">SWIFT Code:</span>{" "}
              CPBPKHP2
            </p>
          </div>
        </div>

        {/* Column 4: Feedback */}
        <div className="space-y-5">
          {/* Title with line */}
          <div className="w-full flex flex-col items-center">
            <h3 className="font-semibold text-lg">Feedback</h3>
            {/* Decorative line under title */}
            <div className="w-12 sm:w-16 lg:w-14 h-0.5 bg-[#F37021] rounded-full"></div>
          </div>

          {/* Responsive layout: Stack on mobile, side-by-side on larger screens */}
          <div className="flex flex-row sm:flex-row lg:flex-row sm:gap-4 lg:gap-6 justify-center items-start">
            {/* Customer Feedback */}
            <div className="flex flex-col items-center flex-1">
              <h4 className="text-xs sm:text-[11px] underline lg:text-xs mb-2 font-semibold text-center whitespace-nowrap">
                Customer Feedback
              </h4>

              <div className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
                <img
                  src="/assets/qr/customer-feedback-qr.jpg"
                  alt="Customer Feedback QR"
                  className="w-24 h-24 sm:w-20 sm:h-20 lg:w-32 lg:h-32 object-contain"
                />
              </div>
            </div>

            {/* Staff Feedback */}
            <div className="flex flex-col items-center flex-1">
              <h4 className="text-xs underline sm:text-[11px] mb-2 lg:text-xs font-semibold text-center whitespace-nowrap">
                Staff Feedback
              </h4>

              <div className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
                <img
                  src="/assets/qr/staff-feedback-qr.jpg"
                  alt="Staff Feedback QR"
                  className="w-24 h-24 sm:w-20 sm:h-20 lg:w-32 lg:h-32 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 pt-6 border-t border-gray-700 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
        <p className="hover:text-white transition duration-300">
          © 2025 CP BANK IT Department
        </p>
        <p className="text-xs text-gray-500">
          All rights reserved. Confidential &amp; Proprietary
        </p>
      </div>
    </footer>
  );
}
