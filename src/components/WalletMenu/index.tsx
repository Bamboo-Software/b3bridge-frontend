import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface WalletMenuProps {
  isConnected: boolean;
  onDisconnect: () => void;
}

const WalletMenu = ({ isConnected, onDisconnect }: WalletMenuProps) => {
  if (!isConnected) {
    return <Button onClick={() => console.log("Connect")}>Connect</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Connected</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onDisconnect}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletMenu;
