interface ToggleProps {
  isChecked: boolean;
  onChange: () => void;
}

export default function Toggle({ isChecked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center">
      <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          checked={isChecked}
          className={`absolute transition-all duration-300 block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer ${
            isChecked ? "left-[40%]" : "left-0"
          }`}
          onChange={onChange}
        />
        <label
          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
            isChecked ? "bg-emerald-700" : "bg-gray-300"
          }`}
          onClick={onChange}
        />
      </div>
    </div>
  );
}
