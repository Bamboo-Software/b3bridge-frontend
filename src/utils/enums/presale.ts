export enum PaymentStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed'
}

export enum DeploymentStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  DEPLOYING = 'Deploying',
  SUCCESS = 'Success',
  FAILED = 'Failed'
}

export enum PresaleStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  ACTIVE = 'Active',
  // ENDED = 'Ended',
  CANCELLED = 'Cancelled',
  FINALIZED = 'Finalized'
}

export enum Category {
  DEFI = 'defi',
  GAMING = 'gaming',
  NFT = 'nft',
  DAO = 'dao',
  UTILITY = 'utility',
  MEME = 'meme'
}