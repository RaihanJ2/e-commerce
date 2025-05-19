"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@app/loading";
import { FaGear } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";

const UserList = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchUsers();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
      setError("");
    } catch (error) {
      setError("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;

    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      fetchUsers();
      setError("");
    } catch (error) {
      setError("Failed to delete user: " + error.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-lightest mb-4 md:mb-0">
          User Management
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex items-center">
            <span className="font-medium">Error:</span>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-transparent shadow-md rounded-lg overflow-hidden border border-primary-light">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary-light">
            <thead className="bg-primary-darkest text-primary-lightest">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary-darkest text-primary-lightest divide-y divide-primary-light">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-primary-dark transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-around gap-3">
                        <button
                          onClick={() =>
                            router.push(`/admin/users/${user._id}`)
                          }
                          className="bg-primary-medium/80 text-primary-lightest px-4 py-2 rounded hover:bg-primary-medium font-medium transition-colors"
                        >
                          <FaGear />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-600 hover:bg-red-800 text-primary-lightest px-4 py-2 rounded font-medium transition-colors"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
