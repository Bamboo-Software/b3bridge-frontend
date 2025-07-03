export function getLayerZeroScanLink(txHash: string): string {
  const baseUrl = import.meta.env.VITE_LAYER_ZERO_SCAN_URL || "";
  return `${baseUrl}${txHash}`;
}