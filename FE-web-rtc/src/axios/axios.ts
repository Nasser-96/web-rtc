import axios from "axios";
import { AxiosMethods } from "../types&enums/enums";
import GetBackendUrl from "@/helpers/backend-url";

const axiosObject = axios.create();

export type MakeRequest = {
  url: string;
  method: AxiosMethods;
  data?: any;
  params?: any;
};

export const makeRequest = async (req: MakeRequest) => {
  const { url, method, data, params } = req;

  return axiosObject({
    url: GetBackendUrl() + url,
    method,
    data,
    params,
  }).then((res) => {
    return res.data;
  });
};
