import axios from "axios";
import { AxiosMethods } from "../types&enums/enums";

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
    url: "https://192.168.8.133:9000/" + url,
    method,
    data,
    params,
  }).then((res) => {
    return res.data;
  });
};
