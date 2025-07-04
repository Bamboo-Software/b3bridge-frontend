import { RefreshCcwIcon } from 'lucide-react';

interface SwapButtonProps {
  handleSwap: () => void;
}

function SwapButton({ handleSwap }: SwapButtonProps) {
  return (
    <div className='flex justify-center my-3 absolute top-[255px] left-[200px]'>
      <button
        type="button"
        onClick={handleSwap}
        className={`
          border border-primary/20 p-2 rounded-full shadow-md transition cursor-pointer
          bg-background
          hover:bg-gradient-to-r hover:from-primary hover:via-cyan-400 hover:to-purple-500
          focus:outline-none
          hover:scale-110 hover:rotate-90 transition-transform duration-300
        `}
        aria-label="Swap"
      >
        <RefreshCcwIcon className="w-6 h-6 text-white hover:text-black transition-colors duration-300" />
      </button>
    </div>
  );
}

export default SwapButton;