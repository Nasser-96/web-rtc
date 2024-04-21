import { makeRequest } from "../axios/axios";
import { AxiosMethods } from "../types&enums/enums";

export const loginService = (data: any) => {
  return makeRequest({ url: "auth/login", method: AxiosMethods.POST, data });
};

export const testUpdateNamespacesService = (data: any) => {
  return makeRequest({
    url: "updateNamespaces",
    method: AxiosMethods.POST,
    data: data,
  });
};
