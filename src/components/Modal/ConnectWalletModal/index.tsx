import ModalAntd, { ModalAntdProps } from "@/components/ModalAntd";
import { listWallets } from "@/provider/wagmi-provider";
import Wallet from "@/provider/wagmi-provider/ui/Wallet";

const ConnectWalletModal = ({
  open,
    onCancel,
}: {
  open: boolean;
        onCancel: () => void;
} & ModalAntdProps) => {
  return (
    <ModalAntd open={open} onCancel={onCancel} className="rounded-[20px] font-manrope">
      <p className=" font-normal leading-[32px] text-[24px] text-center">
        Connect a wallet
      </p>
      <p className="mt-[8px] font-normal text-[16px] leading-[24px] text-center text-gray">
        Please connect your wallet to continue.
      </p>
      <div className="grid gap-4 py-4">
        {listWallets.map((wallet) => (
          <div key={wallet.metaData.name}>
                <Wallet wallet={wallet} />
          </div>
        ))}
      </div>
    </ModalAntd>
  );
};

export default ConnectWalletModal;
