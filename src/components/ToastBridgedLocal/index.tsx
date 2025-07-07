/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";

const CustomToastBridged = ({
  t,
  title,
  content,
  buttonText = "Đóng",
}: {
  t: any;
  title: string;
  content: React.ReactNode;
  buttonText?: string;
}) => (
  <div
    className={`bg-gradient-to-br from-gray-900/90 to-black/90 rounded-xl shadow-xl p-6 w-[600px] text-left border border-zinc-700 font-manrope ${
      t.visible ? "animate-in slide-in-from-top" : "animate-out fade-out"
    }`}
  >
    <div className="text-base font-semibold text-gray-200 mb-2">{title}</div>
    <div className="space-y-1 text-base text-gray-400 font-medium">{content}</div>
    <div className="mt-4">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-lg font-semibold bg-gradient-to-r from-primary via-cyan-400 to-purple-500 text-white rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300"
      >
        {buttonText}
      </button>
    </div>
  </div>
);
export default CustomToastBridged;