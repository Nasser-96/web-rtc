export default function GetBackendUrl() {
  const isLocalHost = true;
  if (isLocalHost) {
    return "https://192.168.8.133:9000/";
  }
}
