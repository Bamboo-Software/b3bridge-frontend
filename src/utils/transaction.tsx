import { CCIPTransactionStatus, StargateTransactionStatus } from './enums/transaction'
import { BusFront, CheckCircle2, Clock, Loader2 } from 'lucide-react'

export function getStatusColor(status: StargateTransactionStatus | CCIPTransactionStatus): string {
  switch (status) {
    case StargateTransactionStatus.CREATED:
    case StargateTransactionStatus.INQUEUE:
    case CCIPTransactionStatus.SOURCE:
      return 'text-yellow-500'
    case StargateTransactionStatus.INFLIGHT:
    case StargateTransactionStatus.CONFIRMING:
    case CCIPTransactionStatus.CCIP:
    case CCIPTransactionStatus.VALIDATOR:
      return 'text-blue-500'
    case StargateTransactionStatus.DELIVERED:
    case CCIPTransactionStatus.TARGET:
      return 'text-green-600'
    default:
      return 'text-gray-500'
  }
}

export function getStatusProgress(status: StargateTransactionStatus| CCIPTransactionStatus) {
  switch (status) {
    case StargateTransactionStatus.CREATED:
    case CCIPTransactionStatus.SOURCE:
      return {
        percent: 10,
        label: 'Created',
        icon: <Clock className="w-4 h-4 text-yellow-500" />,
      };
    case StargateTransactionStatus.INQUEUE:
      return {
        percent: 25,
        label: 'In Queue',
        icon: <Clock className="w-4 h-4 text-yellow-500" />,
      };
    case StargateTransactionStatus.BUS_DISTRIBUTE:
      return {
        percent: 35,
        label: 'Bus Distribute',
        icon: <BusFront className="w-4 h-4 text-indigo-500 animate-bounce" />,
      };
    case StargateTransactionStatus.INFLIGHT:
      return {
        percent: 50,
        label: 'In Flight',
        icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
      };
    case StargateTransactionStatus.CONFIRMING:
    case CCIPTransactionStatus.CCIP:
    case CCIPTransactionStatus.VALIDATOR:
      return {
        percent: 75,
        label: 'Confirming',
        icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
      };
    case StargateTransactionStatus.DELIVERED:
    case CCIPTransactionStatus.TARGET:
      return {
        percent: 100,
        label: 'Delivered',
        icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      };
    default:
      return {
        percent: 0,
        label: 'Unknown',
        icon: <Clock className="w-4 h-4 text-gray-400" />,
      };
  }
}

