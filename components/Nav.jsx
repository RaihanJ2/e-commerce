"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { getProviders, signOut, useSession } from "next-auth/react";

const Nav = () => {
  const [providers, setProviders] = useState(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [toggleDown, setToggleDown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getProviders();
        setProviders(res);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setToggleDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full sticky top-0 z-50 bg-primary-darkest shadow-lg">
      <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo1.png"
            width={150}
            height={60}
            alt="Logo"
            className="cursor-pointer"
            priority
          />
        </Link>

        {/* Desktop Right Section: Cart & Auth */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/Cart" className="relative group" aria-label="View cart">
            <FaShoppingCart className="text-primary-lightest text-xl hover:text-primary-light transition-colors duration-200" />
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-4" ref={dropdownRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setToggleDown((prev) => !prev)}
                  className="flex items-center gap-2 text-primary-lightest hover:text-primary-light transition-colors duration-200"
                  aria-label="User menu"
                >
                  {session.user.name && (
                    <span className="hidden lg:inline-block font-medium">
                      {session.user.name.split(" ")[0]}
                    </span>
                  )}
                  <div className="w-9 h-9 rounded-full border-2 border-primary-light overflow-hidden bg-primary-dark/10 flex items-center justify-center">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                        alt="Profile picture"
                      />
                    ) : (
                      <FaUser className="text-primary-lightest text-lg" />
                    )}
                  </div>
                </button>

                {toggleDown && (
                  <div className="absolute right-0 mt-2 w-48 bg-primary-lightest rounded-lg shadow-lg py-1 z-20">
                    <div className="px-4 py-3 border-b border-primary-light/30">
                      <p className="text-sm font-medium text-primary-darkest">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-primary-dark truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/Profile"
                      className="block px-4 py-2 text-primary-darkest hover:bg-primary-light/20"
                      onClick={() => setToggleDown(false)}
                    >
                      Profile
                    </Link>

                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-primary-darkest hover:bg-primary-light/20"
                      onClick={() => {
                        setToggleDown(false);
                        signOut();
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            !isLoadingProviders &&
            providers && (
              <Link
                href="/auth/login"
                className="bg-primary-medium text-primary-lightest px-5 py-2 rounded-full font-medium hover:bg-primary-medium/90 transition-all duration-200"
              >
                Sign In
              </Link>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/Cart" className="relative" aria-label="View cart">
            <FaShoppingCart className="text-primary-lightest text-xl" />
            <span className="absolute -top-2 -right-2 bg-primary-medium text-primary-lightest text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-primary-lightest focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary-darkest/95 backdrop-blur-md">
          <div className="px-4 pt-2 pb-4 space-y-1 border-t border-primary-light/20">
            {navLinks &&
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 text-primary-lightest font-medium border-b border-primary-light/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

            {session?.user ? (
              <div className="pt-2">
                <div className="flex items-center gap-3 py-3 border-b border-primary-light/20">
                  <div className="w-10 h-10 rounded-full border-2 border-primary-light overflow-hidden bg-primary-dark/10 flex items-center justify-center">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        alt="Profile picture"
                      />
                    ) : (
                      <FaUser className="text-primary-lightest text-lg" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary-lightest">
                      {session.user.name}
                    </p>
                    <p className="text-sm text-primary-light truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/Profile"
                  className="block py-3 text-primary-lightest font-medium border-b border-primary-light/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="block py-3 text-primary-lightest font-medium border-b border-primary-light/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  className="block w-full text-left py-3 text-primary-lightest font-medium"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              !isLoadingProviders &&
              providers && (
                <div className="pt-4">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center bg-primary-medium text-primary-lightest px-5 py-3 rounded-lg font-medium hover:bg-primary-medium/90"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Nav;
