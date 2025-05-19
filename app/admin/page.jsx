"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SalesDashboard from "./sales/page";
import Loading from "@app/loading";

const AdminPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <Loading />;
  }

  // Only render content if user is admin
  if (status === "authenticated" && session?.user?.role === "admin") {
    return (
      <div className="container mx-auto p-6 text-primary-lightest">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-primary-medium p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Users Management</h2>
            <p className="mb-4">
              Manage user accounts, permissions, and roles.
            </p>
            <Link
              href="/admin/users"
              className="bg-primary-darkest/50 hover:bg-primary-darkest text-white py-2 px-4 rounded inline-block"
            >
              Manage Users
            </Link>
          </div>

          <div className="bg-primary-medium p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Products Management</h2>
            <p className="mb-4">
              Add, edit, or remove products from your store.
            </p>
            <Link
              href="/admin/products"
              className="bg-primary-darkest/50 hover:bg-primary-darkest text-white py-2 px-4 rounded inline-block"
            >
              Manage Products
            </Link>
          </div>
        </div>
        <SalesDashboard />
      </div>
    );
  }

  return null;
};

export default AdminPage;
