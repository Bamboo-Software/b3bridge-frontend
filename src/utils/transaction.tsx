import { StargateTransactionStatus } from './enums/transaction'
import { CheckCircle2, Clock, Loader2 } from 'lucide-react'

export function getStatusColor(status: StargateTransactionStatus): string {
  switch (status) {
    case StargateTransactionStatus.CREATED:
    case StargateTransactionStatus.INQUEUE:
      return 'text-yellow-500'
    case StargateTransactionStatus.INFLIGHT:
    case StargateTransactionStatus.CONFIRMING:
      return 'text-blue-500'
    case StargateTransactionStatus.DELIVERED:
      return 'text-green-600'
    default:
      return 'text-gray-500'
  }
}

export function getStatusProgress(status: StargateTransactionStatus) {
  switch (status) {
    case StargateTransactionStatus.CREATED:
      return { percent: 10, label: 'Created', icon: <Clock className="w-4 h-4 text-yellow-500" /> }
    case StargateTransactionStatus.INQUEUE:
      return { percent: 25, label: 'In Queue', icon: <Clock className="w-4 h-4 text-yellow-500" /> }
    case StargateTransactionStatus.INFLIGHT:
      return { percent: 50, label: 'In Flight', icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> }
    case StargateTransactionStatus.CONFIRMING:
      return { percent: 75, label: 'Confirming', icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> }
    case StargateTransactionStatus.DELIVERED:
      return { percent: 100, label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4 text-green-600" /> }
    default:
      return { percent: 0, label: 'Unknown', icon: <Clock className="w-4 h-4 text-gray-400" /> }
  }
}
