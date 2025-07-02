import { useConnect } from "wagmi";
import { WalletIcon } from "lucide-react";
import { cn } from "@/utils";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { walletConfig } from '@/utils/constants/wagmi';

interface WalletConnectModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ open, onClose }: WalletConnectModalProps) {
  const { connect, connectors, isPending } = useConnect();

  const supportedConnectorIds = walletConfig.map(w => w.connectorId);

  const supportedConnectors = connectors.filter((c) =>
    supportedConnectorIds.includes(c.id)
  );

  const getWalletInfo = (connectorId: string) => {
    return walletConfig.find(w => w.connectorId === connectorId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {supportedConnectors.map((connector) => {
            const wallet = getWalletInfo(connector.id);
            return (
              <Button
                key={connector.id}
                onClick={() => connect({ connector })}
                disabled={isPending}
                variant="outline"
                className={cn(
                  "w-full flex items-center gap-3 justify-start px-4 py-3 border-primary/20 hover:bg-primary/10 transition cursor-pointer ",
                )}
              >
                {wallet?.logo ? (
                  <img src={wallet.logo} alt={wallet.name} className="w-7 h-7 rounded-md" />
                ) : (
                  <WalletIcon className="w-7 h-7" />
                )}
                <span className="font-medium text-base">
                  {wallet?.name || connector.name}
                </span>
              </Button>
            );
          })}
        </div>
        <DialogFooter className="mt-2">
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer text-black hover:text-black"
            type="button"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}