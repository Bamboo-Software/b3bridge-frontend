import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface TransactionAccordionProps {
  receiveAmount?: string;
  route?: string;
  estTime?: string;
  slippage?: string;
  totalFee?: string;
}

export default function TransactionAccordion({
  receiveAmount = "—",
  route = "—",
  estTime = "—",
  totalFee = "—",
}: TransactionAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-3">
        <AccordionTrigger className="pt-0 py-2 text-sm text-muted-foreground hover:no-underline no-underline cursor-pointer">
          Transaction
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-foreground">
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between">
              <span>You will receive</span>
              <span>{receiveAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Route</span>
              <span>{route}</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Time</span>
              <span>{estTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Fee</span>
              <span>{totalFee}</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
