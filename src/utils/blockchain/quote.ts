import type { IQuote } from '../interfaces/quote';

export function isSameQuote(a?: IQuote | null, b?: IQuote | null): boolean {
  if (!a || !b) return false;
  return (
    a.route === b.route &&
    a.srcToken === b.srcToken &&
    a.dstToken === b.dstToken &&
    a.srcAmount === b.srcAmount &&
    a.dstAmount === b.dstAmount &&
    a.srcAddress === b.srcAddress &&
    a.dstAddress === b.dstAddress &&
    a.duration?.estimated === b.duration?.estimated &&
    JSON.stringify(a.fees) === JSON.stringify(b.fees)
  );
}