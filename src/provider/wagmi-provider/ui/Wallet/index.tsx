"use client"
import Image from "next/image";

const Wallet = ({
  wallet,
}: {
  wallet: {
    metaData: {
      name: string;
      icon: string;
      chain: string;
    };
    // connect: () => void;
  };
}) => {
  const handleConnect = async () => {
    // await wallet.connect?.();
  };

  return (
    <div
      className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-100 transition"
      onClick={handleConnect}
    >
      <Image src={wallet.metaData.icon} alt={wallet.metaData.name} className="w-8 h-8"  width={32} height={32}/>
      <div>
        <p className="font-semibold">{wallet.metaData.name}</p>
        <p className="text-sm text-gray-500">{wallet.metaData.chain}</p>
      </div>
    </div>
  );
};

export default Wallet;
