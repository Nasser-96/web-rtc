import { useEffect, useRef, useState } from "react";

export enum ModalSizeEnum {
  XLARGE = "XLARGE",
  LARGE = "LARGE",
  MEDIUM = "MEDIUM",
  SMALL = "SMALL",
}

/* eslint-disable-next-line */
export interface ModalProps {
  children: JSX.Element;
  size?: string;
  img?: string;
  imgStyle?: string;
  extraClasses?: string;
}

export function Modal({
  children,
  size = ModalSizeEnum.LARGE,
  img,
  imgStyle,
  extraClasses = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalAnimationDone, setIsModalAnimationDone] =
    useState<boolean>(false);

  const getModalSizeClass = (): string => {
    switch (size) {
      case ModalSizeEnum.SMALL:
        return "sm:w-[343px]";
      case ModalSizeEnum.MEDIUM:
        return "sm:w-[484px]";
      case ModalSizeEnum.LARGE:
        return "sm:max-w-2xl";
      case ModalSizeEnum.XLARGE:
        return "lg:max-w-[990px]";
      default:
        return "lg:max-w-2xl";
    }
  };

  useEffect(() => {
    // disable body scrolling behaviour
    window.document.body.style.setProperty("overflow-y", "hidden", "important");
    window.document
      .getElementsByTagName("html")[0]
      .style.setProperty("overflow-y", "hidden", "important");
    window.document.body.style.width = "100%";
    window.document
      .getElementsByTagName("nav")
      ?.item(0)
      ?.classList.add("!z-10");
    return () => {
      // enable body scrolling behaviour
      window.document
        .getElementsByTagName("nav")
        ?.item(0)
        ?.classList.remove("!z-10");
      window.document.body.style.overflowY = "auto";
      window.document.getElementsByTagName("html")[0].style.overflowY = "auto";
    };
  }, []);

  useEffect(() => {
    // check if modal is shown
    if (modalRef?.current) {
      setTimeout(() => {
        setIsModalAnimationDone(true);
      }, 50);
    } else {
      setIsModalAnimationDone(false);
    }
  }, []);

  return (
    <>
      {/* <!--Overlay Effect--> */}
      <div className="z-9999 fixed inset-0 min-h-full overflow-hidden bg-white/5 backdrop-blur-md dark:bg-black/30 dark:backdrop-blur-lg" />

      <div
        className="z-9999 fixed inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-gray-600/50 dark:bg-black/50"
        id={`my-modal-${Math.random()}`}
        ref={modalRef}
      >
        <div
          className={`max-h-800 !bg-modal-color relative bottom-0 mx-auto mt-10 w-11/12 max-w-lg rounded-2xl p-5 shadow-lg transition-all duration-500 sm:p-8 ${getModalSizeClass()} dark:bg-dark border bg-white dark:border-0 ${
            img ? "" : "overflow-y-auto"
          } ${isModalAnimationDone ? "scale-100" : "scale-0"} ${extraClasses}`}
        >
          {img && (
            <div className={`${imgStyle} absolute z-10 mt-10 bg-transparent`}>
              <img
                src={img}
                alt="badge"
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
}

export default Modal;
