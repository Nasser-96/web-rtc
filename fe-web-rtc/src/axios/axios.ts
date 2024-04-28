import axios from "axios";
import { AxiosMethods } from "../types&enums/enums";

const axiosObject = axios.create();

export type MakeRequest = {
  url: string;
  method: AxiosMethods;
  data?: any;
};

export const makeRequest = async (req: MakeRequest) => {
  const { url, method, data } = req;

  return axiosObject({
    url: "https://localhost:9000/" + url,
    method,
    data,
  }).then((res) => {
    return res.data;
  });
};
