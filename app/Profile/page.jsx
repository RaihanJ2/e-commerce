"use client";

import Orders from "@app/order/page";
import Address from "@components/Address";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FaUser, FaEnvelope, FaIdCard } from "react-icons/fa6";

export default function Profile() {
  const { data: session } = useSession();

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>

          {/* Profile Info */}
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar - Positioned to overlap with banner */}
              <div className="relative -mt-20 mb-4 md:mb-0">
                <div className="h-36 w-36 rounded-full bg-gray-700 p-1 border-4 border-gray-800 shadow-lg overflow-hidden">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      width={144}
                      height={144}
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center">
                      <FaUser className="text-4xl text-gray-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {session.user.name || "User"}
                </h1>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaEnvelope className="text-blue-400" />
                    <span className="text-lg">{session.user.email}</span>
                  </div>

                  {session.user.role && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaIdCard className="text-purple-400" />
                      <span className="text-lg">{session.user.role}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Component in a Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>Address Information</span>
          </h2>
          <Address />
        </div>
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <Orders />
        </div>
      </div>
    </section>
  );
}
