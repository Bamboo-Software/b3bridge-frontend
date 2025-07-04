import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAccount } from "wagmi"
import { TransactionItem } from './components/TransactionItem'
import { useTokenList } from '@/hooks/useTokenList'
import { ChainTokenSource } from '@/utils/enums/chain'
import { useTransactionStore } from '@/hooks/useTransactionStore'

interface TransactionModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function TransactionModal({ open, setOpen }: TransactionModalProps) {
  const { address } = useAccount()
  const allTx = useTransactionStore(state => state.allTx)
  const userTxs = address ? allTx?.[address] || [] : []
  const { data: tokenList, loading: tokenListLoading } = useTokenList(undefined, undefined, undefined, ChainTokenSource.Stargate)
  const isLoading = tokenListLoading
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!w-3xl !max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Transactions</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></span>
            <span>Loading...</span>
          </div>
        ) : address ? (
          userTxs.length > 0 ? (
            userTxs.map((tx, idx) => (
              <TransactionItem
                key={tx.txHash + idx}
                tx={tx}
                tokenList={tokenList}
              />
            ))
          ) : (
            <div className="text-muted-foreground py-6">No transactions found.</div>
          )
        ) : (
          <div className="text-muted-foreground py-6">Please connect your wallet.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
