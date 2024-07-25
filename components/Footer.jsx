import Image from "next/image";
import Link from "next/link";
import { FaXTwitter, FaFacebookF, FaInstagram } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="footer">
      <h1 className="text-3xl font-bold text-black pt-4 text-center sm:text-left pb-0 sm:pb-4">
        ABOUT US
      </h1>
      <div className="flex flex-col sm:flex-row pb-4 justify-around gap-4 sm:gap-0">
        <section className="w-full flex flex-col items-center justify-center">
          <Link href="/">
            <Image src="/vercel.svg" alt="logo" width={150} height={150} />
          </Link>
        </section>
        <section className="w-full flex flex-col items-center justify-center sm:items-start sm:justify-start">
          <h1 className="text-l text-black font-bold">PRODUCT</h1>
          <Link href="/" className="text-black hover:underline hover:font-bold">
            Clothes
          </Link>
          <Link href="/" className="text-black hover:underline hover:font-bold">
            Accessories
          </Link>
        </section>
        <section className="w-full flex flex-col items-center justify-center sm:items-start sm:justify-start">
          <h1 className="text-l text-black font-bold">CONTACTS</h1>
          <p className="text-black">Email. cecilia@ceciliamarin.id</p>
          <p className="text-black">Website www.ceciliamarin.id</p>
          <div className="flex text-2xl font-bold gap-8 text-black">
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
      <div className="border-t-2 border-t-black"></div>
      <section className="flex flex-between">
        <div className="flex py-2 hover:font-bold">
          <h1 className="text-black">@2024</h1>
          <Link href="/" className="">
            Company® Official
          </Link>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
