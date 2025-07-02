import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface SwapButtonProps {
  isSwapped: boolean;
  handleSwap: () => void;
}

function SwapButton({ isSwapped, handleSwap }: SwapButtonProps) {
  return (
    <div className='flex justify-center my-3 absolute top-[265px] left-[200px]'>
      <button
        type="button"
        onClick={handleSwap}
        className={`border border-primary/20 p-2 rounded-full shadow-md transition cursor-pointer
          bg-background
          hover:bg-gradient-to-r hover:from-primary hover:via-cyan-400 hover:to-purple-500
        `}
      >
        {isSwapped ? (
          <ArrowUpIcon className="w-6 h-6 text-white hover:text-black" />
        ) : (
          <ArrowDownIcon className="w-6 h-6 text-white hover:text-black" />
        )}
      </button>
    </div>
  );
}

export default SwapButton;