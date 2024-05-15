export default function GetBackendUrl() {
  const isLocalHost = true;
  if (isLocalHost) {
    return "https://localhost:9000/";
  }
}
