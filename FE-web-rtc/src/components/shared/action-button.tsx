export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function ActionButton({ ...props }: ActionButtonProps) {
  return (
    <button
      className={`text-white transition-all duration-300 hover:bg-gray-700 p-4 ${props.className}`}
    >
      {props.children}
    </button>
  );
}
