"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
const Nav = () => {
  const [providers, setProviders] = useState(null);
  const [toggleDown, setToggleDown] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);
  return (
    <nav className="w-full px-6 flex-between py-3 border-4 border-t-0 rounded-bl-2xl rounded-br-2xl border-b-white">
      <Link href="/" className="flex font-bold text-white">
        NAVBAR
      </Link>
      {/* Desktop Navigation */}

      <div className="sm:flex hidden gap-2">
        <Link href="/Cart" className="cart-btn">
          <FaShoppingCart />
        </Link>
        {session?.user ? (
          <div className="flex gap-3 md:gap-5">
            <button
              type="button"
              onClick={() => {
                signOut();
              }}
              className="sign-btn"
            >
              Sign Out
            </button>
            <Link href="/Profile">
              <Image
                src={session.user.image}
                width={37}
                height={37}
                className="rounded-full border-white border-2"
                alt="profile"
              />
            </Link>
          </div>
        ) : (
          <>
            {providers &&
              Object.values(providers).map((provider) => (
                <button
                  type="button"
                  key={provider.name}
                  onClick={() => signIn(provider.id)}
                  className="sign-btn"
                >
                  Sign In
                </button>
              ))}
          </>
        )}
      </div>
      {/* Mobile Navigation */}

      <div className="sm:hidden flex relative gap-2">
        <Link href="/Cart" className="cart-btn">
          <FaShoppingCart />
        </Link>
        {session?.user ? (
          <div className="flex-between gap-2 flex-center">
            <Image
              src={session?.user.image}
              width={40}
              height={40}
              className="rounded-full border"
              alt="profile"
              onClick={() => setToggleDown((prev) => !prev)}
            />
            {toggleDown && (
              <div className="dropdown flex flex-center border">
                <Link
                  href="/Profile"
                  className="dropdown-link"
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
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {providers &&
              Object.values(providers).map((provider) => (
                <button
                  type="button"
                  key={provider.name}
                  onClick={() => signIn(provider.id)}
                  className="sign-btn"
                >
                  Sign In
                </button>
              ))}
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
