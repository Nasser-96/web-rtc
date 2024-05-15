import { useEffect } from "react";

interface HandelOutSideClickProps {
  targetRef: React.MutableRefObject<any>;
  isOpen: boolean;
  OnOutsideClick: () => void;
}

export function HandelOutSideClick({
  targetRef,
  isOpen,
  OnOutsideClick,
}: HandelOutSideClickProps) {
  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      // If the targetRef is open and the clicked target is not within the targetRef,
      // then close the targetRef
      if (
        isOpen &&
        targetRef.current &&
        !targetRef.current.contains(e.target)
      ) {
        OnOutsideClick();
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [OnOutsideClick, isOpen, targetRef]);

  return <div></div>;
}

export default HandelOutSideClick;
