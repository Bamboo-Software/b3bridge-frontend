import type { BridgeFormData } from "./BridgeFormWrap";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TransferHistoryProps {
  history: BridgeFormData[];
}

const TransferHistory = ({ history }: TransferHistoryProps) => {
  
  
  if (history.length === 0) {
    return (
      <div className="text-center p-12 rounded-lg border border-dashed border-primary/20 bg-primary/5">
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-muted-foreground font-medium">No transfer history yet</p>
          <p className="text-sm text-muted-foreground">Complete a bridge transaction to see it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table className="border border-primary/20 rounded-lg overflow-hidden">
        <TableCaption>Your recent bridge transactions</TableCaption>
        <TableHeader className="bg-primary/5">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item, index) => (
            <TableRow key={index} className="hover:bg-primary/5 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {/* <img src={getChainAvatar(item.fromChain.id)} alt={item.fromChain.name} className="h-5 w-5" /> */}
                  </div>
                  <div>
                    <div className="font-medium">{item.fromChain.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {item.fromWalletAddress}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {/* <img src={getChainAvatar(item.toChain.id)} alt={item.toChain.name} className="h-5 w-5" /> */}
                  </div>
                  <div>
                    <div className="font-medium">{item.toChain.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {item.toWalletAddress}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{item.amount} {item.tokenSymbol}</div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Completed
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransferHistory;