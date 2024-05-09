import { makeRequest } from "../axios/axios";
import { AxiosMethods } from "../types&enums/enums";

export const loginService = (data: any) => {
  return makeRequest({ url: "auth/login", method: AxiosMethods.POST, data });
};

export const testUpdateNamespacesService = async (data: any) => {
  return await makeRequest({
    url: "updateNamespaces",
    method: AxiosMethods.POST,
    data: data,
  });
};

export const getDecodeTokenService = async (token: string) => {
  return await makeRequest({
    url: "validate-link",
    method: AxiosMethods.POST,
    data: { token: token },
  });
};
