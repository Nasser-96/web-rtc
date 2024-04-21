import { create } from "zustand";
import { LocalStorageUserDataType } from "../types&enums/types";

export type UserStoreType = {
  userData: LocalStorageUserDataType;
  setUserData: (data: LocalStorageUserDataType) => void;
};

const useUserStore = create<UserStoreType>((set) => ({
  userData: {
    token: typeof window !== "undefined" ? localStorage.getItem("token") : "",
    username:
      typeof window !== "undefined" ? localStorage.getItem("username") : "",
  },
  setUserData(userData: LocalStorageUserDataType) {
    set((state) => {
      return { ...state, userData };
    });
  },
}));

export default useUserStore;
