"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { getProviders, signOut, useSession } from "next-auth/react";

const Nav = () => {
  const [providers, setProviders] = useState(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [toggleDown, setToggleDown] = useState(false);
  const { data: session } = useSession();

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

  return (
    <nav className="w-full px-6 py-3 border-4 border-t-0 rounded-bl-2xl rounded-br-2xl border-b-white flex justify-between items-center">
      <Link href="/" className="text-white font-bold">
        NAVBAR
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-2">
        <Link href="/Cart" aria-label="View cart">
          <FaShoppingCart className="cart-btn" />
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-3 md:gap-5">
            <button
              type="button"
              onClick={() => signOut()}
              className="sign-btn"
              aria-label="Sign out"
            >
              Sign Out
            </button>
            <Link href="/Profile">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  width={37}
                  height={37}
                  className="rounded-full border-2 border-white"
                  alt="Profile picture"
                />
              ) : (
                <FaUser
                  className="text-xl rounded-full border-2 border-white w-8 h-8 p-1 bg-main text-white"
                  alt="User icon"
                />
              )}
            </Link>
          </div>
        ) : (
          !isLoadingProviders &&
          providers && (
            <Link href="/auth/login" className="sign-btn" aria-label="Sign in">
              Sign In
            </Link>
          )
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden flex items-center gap-2 relative">
        <Link href="/Cart" aria-label="View cart">
          <FaShoppingCart className="cart-btn" />
        </Link>
        {session?.user ? (
          <div className="relative flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                width={37}
                height={37}
                className="rounded-full border-2 border-white"
                alt="Profile picture"
              />
            ) : (
              <FaUser
                className="text-xl rounded-full border-2 border-white w-8 h-8 p-1 bg-main text-white"
                alt="User icon"
              />
            )}
            <button
              type="button"
              className="p-2"
              onClick={() => setToggleDown((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <FaUser className="text-xl text-white" />
            </button>
            {toggleDown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                <Link
                  href="/Profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setToggleDown(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  className="sign-btn"
                  onClick={() => {
                    setToggleDown(false);
                    signOut();
                  }}
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          !isLoadingProviders &&
          providers && (
            <Link href="/auth/login" className="sign-btn" aria-label="Sign in">
              Sign In
            </Link>
          )
        )}
      </div>
    </nav>
  );
};

export default Nav;
