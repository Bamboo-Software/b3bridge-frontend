import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { BridgeFormData } from "./BridgeFormWrap";
import { bridgeFormSchema, type BridgeFormValues } from "@/lib/types/schemas/bridge";
import { CHAINS, TOKENS } from "@/lib/configs";


interface BridgeFormProps {
  onSubmit: (data: BridgeFormData) => void;
}

const BridgeForm = ({ onSubmit }: BridgeFormProps) => {
  const [fromChain, setFromChain] = useState(CHAINS[0]);
  const [toChain, setToChain] = useState(CHAINS[1]);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>("eth");
  
  const getTokensForChain = (chainId: string) => {
    const chain = TOKENS[chainId as keyof typeof TOKENS];
    if (!chain) return [];
    
    return Object.values(chain.tokens).map(token => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address
    }));
  };
  
  const availableTokens = getTokensForChain(fromChain.id);
  
  const getSelectedToken = () => {
    const chain = TOKENS[fromChain.id as keyof typeof TOKENS];
    if (!chain) return { symbol: "", name: "", address: "" };
    
    const token = chain.tokens[selectedTokenSymbol as keyof typeof chain.tokens];
    return token || { symbol: "", name: "", address: "" };
  };
  
  const selectedToken = getSelectedToken();

  const form = useForm<BridgeFormValues>({
    resolver: zodResolver(bridgeFormSchema),
    defaultValues: {
      fromChain: CHAINS[0],
      toChain: CHAINS[1],
      fromWalletAddress: "",
      toWalletAddress: "",
      tokenAddress: selectedToken.address,
      tokenSymbol: selectedToken.symbol,
      amount: "",
    },
  });

  useEffect(() => {
    if (fromChain.id === toChain.id) {
      const otherChain = CHAINS.find(chain => chain.id !== fromChain.id);
      if (otherChain) {
        setToChain(otherChain);
        form.setValue("toChain", otherChain);
      }
    }
  }, [fromChain, toChain, form]);

  useEffect(() => {
    const token = getSelectedToken();
    form.setValue("tokenAddress", token.address);
    form.setValue("tokenSymbol", token.symbol);
  }, [fromChain, selectedTokenSymbol, form]);

  const handleSubmit = (values: BridgeFormValues) => {
    const fromChainData = {
      name: values.fromChain.name,
      id: values.fromChain.id,
      chainSelector: values.fromChain.chainSelector
    };
    
    const toChainData = {
      name: values.toChain.name,
      id: values.toChain.id,
      chainSelector: values.toChain.chainSelector
    };
    
    onSubmit({
      ...values,
      fromChain: fromChainData,
      toChain: toChainData,
      timestamp: new Date().toISOString(),
    });
  };

  // Lấy thông tin token ở chain đích
  const getDestinationToken = () => {
    const chain = TOKENS[toChain.id as keyof typeof TOKENS];
    if (!chain) return { symbol: "", name: "", address: "" };
    
    const token = chain.tokens[selectedTokenSymbol as keyof typeof chain.tokens];
    return token || { symbol: "", name: "", address: "" };
  };

  const destinationToken = getDestinationToken();

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
            
            <FormField
              control={form.control}
              name="tokenSymbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <Select 
                    value={selectedTokenSymbol}
                    onValueChange={(value) => {
                      setSelectedTokenSymbol(value);
                      field.onChange(value);
                      
                      const chain = TOKENS[fromChain.id as keyof typeof TOKENS];
                      if (chain) {
                        const token = chain.tokens[value as keyof typeof chain.tokens];
                        if (token) {
                          form.setValue("tokenAddress", token.address);
                        }
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <span>{token.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selected token: {selectedToken.name} ({selectedToken.address.substring(0, 6)}...{selectedToken.address.substring(selectedToken.address.length - 4)})
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
            
            <div className="p-3 bg-primary/10 rounded-lg mt-4">
              <h4 className="text-sm font-medium mb-2">Destination Token Information</h4>
              <div className="text-sm">
                <p><span className="font-medium">Token:</span> {destinationToken.name}</p>
                <p className="truncate"><span className="font-medium">Address:</span> {destinationToken.address}</p>
              </div>
            </div>
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