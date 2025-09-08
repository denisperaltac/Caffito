interface BottomProps {
  color: colorBottom;
  text?: string;
  disabled?: boolean;
  onClick?: () => void;
  size?: string;
  children?: React.ReactNode;
  padding?: string;
  style?: string;
}

type colorBottom =
  | "purple"
  | "green"
  | "red"
  | "blue"
  | "yellow"
  | "orange"
  | "pink"
  | "gray"
  | "white"
  | "black";

export const Button = ({
  color,
  disabled,
  text,
  onClick,
  size,
  children,
  padding,
  style,
}: BottomProps) => {
  const calculateColor = () => {
    switch (color) {
      case "purple":
        return "bg-purple-500 hover:bg-purple-600";
      case "green":
        return "bg-green-500 hover:bg-green-600";
      case "red":
        return "bg-red-500 hover:bg-red-600";
      case "blue":
        return "bg-blue-500 hover:bg-blue-600";
      case "yellow":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "orange":
        return "bg-orange-500 hover:bg-orange-600";
      case "pink":
        return "bg-pink-500 hover:bg-pink-600";
      case "gray":
        return "bg-gray-500 hover:bg-gray-600";
      case "white":
        return "bg-white hover:bg-gray-200";
      default:
        return "bg-black hover:bg-gray-800";
    }
  };
  return (
    <button
      className={`${calculateColor()} ${size} text-white ${
        padding || "px-4 py-2"
      } text-center flex items-center justify-center rounded hover:shadow-lg disabled:opacity-50 duration-300 ${style}`}
      disabled={disabled}
      onClick={onClick}
    >
      {text || children}
    </button>
  );
};
