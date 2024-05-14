export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: JSX.Element;
  text?: string;
}

export default function ActionButton({
  icon,
  text,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={`text-white transition-all duration-300 hover:bg-gray-700 p-4 ${
        props.className ?? ""
      }`}
      {...props}
    >
      <div className="flex flex-col gap-1 items-center justify-center">
        {icon}
        <p>{text}</p>
      </div>
    </button>
  );
}
