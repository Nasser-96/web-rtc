import ActionButton from "@/components/shared/action-button";
import { FaVideo } from "react-icons/fa";

export default function VideoButton() {
  return <ActionButton text="Start Video" icon={<FaVideo size={30} />} />;
}
