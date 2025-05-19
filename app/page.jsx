"use client";

import ItemList from "@components/ItemList";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Home = () => {
  const { data: session } = useSession();

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {session?.user?.role === "admin" && (
          <Link
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block"
          >
            Admin Dashboard
          </Link>
        )}
      </div>

      <ItemList />
    </section>
  );
};

export default Home;
