import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter as useNavigator } from "next/navigation";
import { useEffect } from "react";
import useUserStore from "../stores/user-store";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const navigate = useNavigator();
  const router = useRouter();
  const { pathname } = router;
  const { userData } = useUserStore();
  useEffect(() => {
    if (!userData?.token && !pathname.includes("/login")) {
      navigate.push("/login");
    }
  }, [userData]);
  return (
    <main className={`min-h-screen bg-slate-900`}>
      <Component {...pageProps} />;
    </main>
  );
}
