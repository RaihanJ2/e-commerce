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
    <footer className="footer">
      <h1 className="text-3xl font-bold text-white pt-4 text-center sm:text-left pb-0 sm:pb-4">
        ABOUT US
      </h1>
      <div className="flex flex-col sm:flex-row pb-4 justify-around gap-4 sm:gap-0">
        <Link className="w-full" href="/">
          <Image src="/logo(bg).png" alt="logo" width={150} height={150} />
        </Link>
        <section className="w-full flex flex-col items-center justify-center sm:items-start sm:justify-start">
          <h1 className="text-l text-white font-bold">PRODUCT</h1>
          <Link href="/" className="text-white hover:underline hover:font-bold">
            Clothes
          </Link>
          <Link href="/" className="text-white hover:underline hover:font-bold">
            Accessories
          </Link>
        </section>
        <section className="w-full flex flex-col items-center justify-center sm:items-start sm:justify-start">
          <h1 className="text-l text-white font-bold">CONTACTS</h1>
          <p className="text-white flex-center gap-4 flex-row">
            <FaLocationDot className="text-2xl" />
            Jl. Raya Barat Wanayasa, Wanayasa, Kec. Wanayasa,Kabupaten
            Purwakarta, Jawa Barat 41174
          </p>
          <p className="text-white flex-center gap-4 flex-row">
            <FaPhone />
            0851-6181-3330
          </p>
          <div className="flex text-2xl font-bold gap-8 text-white">
            <Link href="/" className="p-2 rounded-full">
              <FaXTwitter />
            </Link>
            <Link href="/" className="p-2 rounded-full">
              <FaFacebookF />
            </Link>
            <Link href="/" className="p-2 rounded-full">
              <FaInstagram />
            </Link>
          </div>
        </section>
      </div>
      <div className="border-t-2 border-t-white"></div>
      <section className="flex flex-between">
        <div className="flex py-2">
          <h1 className="text-tertiary">@2024, </h1>
          <Link href="/" className="text-tertiary">
            &nbsp;Company® Official
          </Link>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
