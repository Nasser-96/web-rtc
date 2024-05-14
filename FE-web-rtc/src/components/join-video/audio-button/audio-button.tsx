import ActionButton from "@/components/shared/action-button";
import { FaMicrophone } from "react-icons/fa";

export default function AudioButton() {
  return <ActionButton icon={<FaMicrophone size={30} />} text="Join Video" />;
}
