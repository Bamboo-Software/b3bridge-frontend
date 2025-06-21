import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { BridgeFormData } from "./BridgeFormWrap";
import { bridgeFormSchema, type BridgeFormValues } from "@/types/schemas/bridge";
import ether from "@/assets/icons/ether.svg";
import sei from "@/assets/icons/sei.svg";
import { useState, useEffect } from "react";

const CHAINS = [
  { name: "Ethereum", avatar: ether, id: "ether" },
  { name: "SEI", avatar: sei, id: "sei" },
];

interface BridgeFormProps {
  onSubmit: (data: BridgeFormData) => void;
}

const BridgeForm = ({ onSubmit }: BridgeFormProps) => {
  const [fromChain, setFromChain] = useState(CHAINS[0]);
  const [toChain, setToChain] = useState(CHAINS[1]);

  const form = useForm<BridgeFormValues>({
    resolver: zodResolver(bridgeFormSchema),
    defaultValues: {
      fromChain: CHAINS[0],
      toChain: CHAINS[1],
      fromWalletAddress: "",
      toWalletAddress: "",
      tokenAddress: "",
      amount: "",
    },
  });

  // Đảm bảo không chọn cùng một chain ở cả From và To
  useEffect(() => {
    if (fromChain.id === toChain.id) {
      // Nếu fromChain và toChain giống nhau, tự động chọn chain khác cho toChain
      const otherChain = CHAINS.find(chain => chain.id !== fromChain.id);
      if (otherChain) {
        setToChain(otherChain);
        form.setValue("toChain", otherChain);
      }
    }
  }, [fromChain, toChain, form]);

  const handleSubmit = (values: BridgeFormValues) => {
    onSubmit({
      ...values,
      timestamp: new Date().toISOString(),
    });
    
    // Không reset form để người dùng có thể thấy dữ liệu đã nhập
    // form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Section */}
          <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5 shadow-sm">
            <h3 className="font-medium text-lg border-b pb-2 text-primary">From</h3>
            
            <FormField
              control={form.control}
              name="fromChain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <Select 
                    value={fromChain.id}
                    onValueChange={(value) => {
                      const chain = CHAINS.find(c => c.id === value) || CHAINS[0];
                      setFromChain(chain);
                      field.onChange(chain);
                      
                      // Nếu toChain giống với fromChain mới, tự động chọn chain khác
                      if (toChain.id === value) {
                        const otherChain = CHAINS.find(c => c.id !== value);
                        if (otherChain) {
                          setToChain(otherChain);
                          form.setValue("toChain", otherChain);
                        }
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CHAINS.map((chain) => (
                        <SelectItem key={chain.id} value={chain.id}>
                          <div className="flex items-center gap-2">
                            <img src={chain.avatar} alt={chain.name} className="w-5 h-5"/>
                            <span>{chain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fromWalletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      className="bg-background/50"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your wallet address for the {fromChain.name} network.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Thêm trường Token Address */}
            <FormField
              control={form.control}
              name="tokenAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      className="bg-background/50"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the token contract address you want to bridge.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.0"
                      {...field}
                      className="bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* To Section */}
          <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5 shadow-sm">
            <h3 className="font-medium text-lg border-b pb-2 text-primary">To</h3>
            
            <FormField
              control={form.control}
              name="toChain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <Select 
                    value={toChain.id}
                    onValueChange={(value) => {
                      // Không cho phép chọn chain giống với fromChain
                      if (value === fromChain.id) {
                        return;
                      }
                      
                      const chain = CHAINS.find(c => c.id === value) || CHAINS[1];
                      setToChain(chain);
                      field.onChange(chain);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CHAINS.map((chain) => (
                        <SelectItem 
                          key={chain.id} 
                          value={chain.id}
                          disabled={chain.id === fromChain.id} // Disable option nếu giống với fromChain
                        >
                          <div className="flex items-center gap-2">
                            <img src={chain.avatar} alt={chain.name} className="w-5 h-5"/>
                            <span>{chain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a different chain than the source chain.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="toWalletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      className="bg-background/50"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your wallet address for the {toChain.name} network.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Bridge Tokens"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BridgeForm;