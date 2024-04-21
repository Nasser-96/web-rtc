import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReturnResponseType } from "../../types&enums/enums";
import { loginService } from "../../model/login";
import useUserStore from "../../store/user-store";
import useNewSocket from "../../socket/new-socket";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const { setUserData } = useUserStore();

  const login = async () => {
    try {
      const data: ReturnResponseType<{ user_token: string }> =
        await loginService({ username, password });
      setUserData({ token: data?.response?.user_token });
      router.push("/");
    } catch (error) {}
  };

  return (
    <div className="min-h-screen h-full w-full flex flex-col items-center justify-center">
      <div className="bg-slate-800 flex flex-col mt-10 justify-center p-14 rounded-2xl gap-4">
        <label className="text-white">Username:</label>
        <input
          onKeyDown={(e) => {
            e.key.toLowerCase() === "enter" && login();
          }}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          className="mt-2 rounded-md p-2"
        />
        <label className="text-white">Password:</label>
        <input
          type="password"
          onKeyDown={(e) => {
            e.key.toLowerCase() === "enter" && login();
          }}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 rounded-md p-2"
        />
        <button
          onClick={login}
          className="border rounded-xl p-2 text-white mt-3"
        >
          Login
        </button>
      </div>
    </div>
  );
}
