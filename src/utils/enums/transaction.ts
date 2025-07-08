export enum StargateTransactionStatus {
  CREATED = "CREATED",
  INQUEUE = "INQUEUE",
  BUS_DISTRIBUTE = "BUS_DISTRIBUTE",
  INFLIGHT = "INFLIGHT",
  CONFIRMING = "CONFIRMING",
  DELIVERED = "DELIVERED"
}
export enum CCIPTransactionStatus {
  SOURCE = "SOURCE",
  CCIP = "CCIP",
  VALIDATOR = "VALIDATOR",
  TARGET = "TARGET",
}

export enum TransactionStatus {
  IDLE = "idle",
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error"
}