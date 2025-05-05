import Image from "next/image";
import Link from "next/link";
import {
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
  FaPhone,
  FaLocationDot,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="footer mt-16 pt-8 pb-4 bg-primary-dark">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary-lightest mb-8 text-center sm:text-left">
          ABOUT US
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Logo Section */}
          <div className="flex justify-center sm:justify-start">
            <Link href="/">
              <Image
                src="/logo(bg).png"
                alt="logo"
                width={150}
                height={150}
                className="transition-all duration-200 hover:opacity-90"
              />
            </Link>
          </div>

          {/* Products Section */}
          <div className="flex flex-col items-center sm:items-start">
            <h2 className="text-xl text-primary-lightest font-bold mb-4">
              PRODUCT
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-primary-lightest hover:underline transition-all duration-200"
                >
                  Clothes
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-primary-lightest hover:underline transition-all duration-200"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts Section */}
          <div className="flex flex-col items-center sm:items-start">
            <h2 className="text-xl text-primary-lightest font-bold mb-4">
              CONTACTS
            </h2>
            <div className="space-y-4">
              <p className="text-primary-lightest flex items-start gap-3">
                <FaLocationDot className="text-xl mt-1 flex-shrink-0" />
                <span>
                  Jl. Raya Barat Wanayasa, Wanayasa, Kec. Wanayasa, Kabupaten
                  Purwakarta, Jawa Barat 41174
                </span>
              </p>
              <p className="text-primary-lightest flex items-center gap-3">
                <FaPhone className="flex-shrink-0" />
                <span>0851-6181-3330</span>
              </p>
              <div className="flex justify-center sm:justify-start gap-6 text-primary-lightest mt-4">
                <Link
                  href="/"
                  className="p-2 hover:text-primary-light transition-colors duration-200"
                >
                  <FaXTwitter size={24} />
                </Link>
                <Link
                  href="/"
                  className="p-2 hover:text-primary-light transition-colors duration-200"
                >
                  <FaFacebookF size={24} />
                </Link>
                <Link
                  href="/"
                  className="p-2 hover:text-primary-light transition-colors duration-200"
                >
                  <FaInstagram size={24} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-t-primary-lightest mb-4"></div>

        {/* Copyright */}
        <div className="flex justify-between items-center">
          <div className="flex py-2">
            <h1 className="text-primary-lightest">©2024, </h1>
            <Link href="/" className="text-primary-lightest hover:underline">
              &nbsp;Company® Official
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
