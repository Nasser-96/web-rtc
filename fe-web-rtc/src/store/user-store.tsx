import { create } from "zustand";
import { LocalStorageUserDataType } from "../types&enums/types";

export type UserStoreType = {
  userData: LocalStorageUserDataType;
  setUserData: (data: LocalStorageUserDataType) => void;
};

const useUserStore = create<UserStoreType>((set) => ({
  userData: {
    token:
      typeof window !== "undefined"
        ? (localStorage.getItem("token") as string)
        : "",
    username:
      typeof window !== "undefined"
        ? (localStorage.getItem("username") as string)
        : "",
  },
  setUserData(userData: LocalStorageUserDataType) {
    set((state) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", userData.token as string);
        localStorage.setItem("username", userData.username as string);
      }
      return { ...state, userData };
    });
  },
}));

export default useUserStore;
