"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session?.user) {
    router.push("/");
  }
  return (
    <section className=" w-full p-4 flex flex-col justify-center items-center">
      <div className="flex flex-row w-1/2 gap-2">
        <Image
          src={session?.user?.image}
          alt={session?.user?.name}
          height={200}
          width={200}
        />
        <div className="flex-col flex justify-center">
          <p>{session?.user?.id}</p>
          <p>{session?.user?.name}</p>
          <p>{session?.user?.email}</p>
        </div>
      </div>
    </section>
  );
}
