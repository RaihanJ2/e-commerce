"use client";
import Address from "@components/Address";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa6";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session?.user) {
    router.push("/");
  }
  return (
    <section className=" w-full p-4 text-white flex flex-col justify-center items-center">
      <div className="flex flex-row w-1/2 gap-2">
        {session?.user?.image ? (
          <Image
            src={session?.user?.image}
            alt={session?.user?.name}
            height={200}
            width={200}
          />
        ) : (
          <FaUser className="text-9xl border-white border-2 p-6" />
        )}
        <div className="flex-col flex justify-center">
          <p>{session?.user?.name}</p>
          <p className="text-4xl">{session?.user?.email}</p>
        </div>
      </div>
      <Address />
    </section>
  );
}
