import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { BridgeFormData } from "./BridgeFormWrap";
import { useBridgeTokens } from "@/lib/hooks/useBridgeTokens";
import { CHAINS, TOKENS } from "@/lib/configs";
import { shortenAddress } from "@/lib/utils";
import { useForm, type SubmitHandler } from "react-hook-form";
import { bridgeFormSchema, type BridgeFormValues } from "@/lib/types/schemas/bridge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const BridgeForm = () => {
  // const {
  //   form,
  //   fromChain,
  //   toChain,
  //   selectedTokenSymbol,
  //   selectedToken,
  //   destinationToken,
  //   availableTokens,
  //   handleFromChainChange,
  //   handleToChainChange,
  //   handleTokenChange,
  //   handleSubmit,
  // } = useBridgeTokens(onSubmit);

  // console.log("fromWalletAddress: ", form.getValues("fromWalletAddress"));
  const [fromChain, setFromChain] = useState(CHAINS[0]);
  const [tokenList, setTokenList] = useState([]);
  const [toChain, setToChain] = useState(CHAINS[0]);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>("eth");
  const { address, isConnected } = useAccount();

  const form = useForm<BridgeFormValues>({
    resolver: zodResolver(bridgeFormSchema),
    defaultValues: {
      fromChain: "",
      toChain: "",
      fromWalletAddress: "",
      toWalletAddress: "",
      tokenAddress: "",
      tokenSymbol: "",
      amount: "",
    },
  })

  useEffect(() => {
    if (isConnected && address) {
      form.setValue("fromWalletAddress", address);
    }
  }, [isConnected, address, form]);

  const onSubmit: SubmitHandler<BridgeFormValues> = (data) => console.log(data)
  const onInputChange = (key: "fromChain" | 'toChain', value: string) => {
    console.log('')
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Section */}
          <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5 shadow-sm">
            <h3 className="font-medium text-lg border-b pb-2 text-primary">
              From
            </h3>

            <FormField
              control={form.control}
              name="fromChain"
              render={() => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <Select
                  // defaultValue={form.getValues('fromChain')}
                  // onValueChange={(value) => onInputChange('fromChain', value)}
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
                            <img
                              src={chain.avatar}
                              alt={chain.name}
                              className="w-5 h-5"
                            />
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
                  <FormLabel className="flex flex-row items-end">
                    <span>Wallet Address</span>{" "}
                    {form.getValues("fromWalletAddress").length > 0 ? (
                      ""
                    ) : (
                      <span className="text-[9px] text-red-500">
                        (You need to connect wallet first)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder="0x..."
                      {...field}
                      className="bg-background/50"
                    />
                  </FormControl>
                  <FormDescription>
                    {/* Enter your wallet address for the {fromChain.name} network. */}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tokenSymbol"
              render={() => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <Select
                  // value={selectedTokenSymbol}
                  // onValueChange={handleTokenChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* {Object.values(TOKENS.[form.getValues('fromChain')].tokens).map((token: any) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <span>{token.name}</span>
                          </div>
                        </SelectItem>
                      ))} */}
                      <SelectItem key={Date.now()} value={'token.symbol' + Date.now()}>
                        <div className="flex items-center gap-2">
                          <span>USDC</span>
                        </div>
                      </SelectItem>

                      <SelectItem key={Date.now()} value={'token.symbol' + Date.now()}>
                        <div className="flex items-center gap-2">
                          <span>ETH</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <FormDescription>
                    Selected token: {selectedToken.name} (
                    {selectedToken.address.substring(0, 6)}...
                    {selectedToken.address.substring(
                      selectedToken.address.length - 4
                    )}
                    )
                  </FormDescription> */}
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
            <h3 className="font-medium text-lg border-b pb-2 text-primary">
              To
            </h3>

            <FormField
              control={form.control}
              name="toChain"
              render={() => (
                <FormItem>
                  <FormLabel>Chain</FormLabel>
                  <Select
                    defaultValue={form.getValues('toChain')}
                    onValueChange={(value) => onInputChange('toChain', value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CHAINS.filter((chain) => chain.id !== form.getValues('fromChain')).map((chain) => (
                        <SelectItem
                          key={chain.id}
                          value={chain.id}
                          disabled={chain.id === form.getValues('fromChain')}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={chain.avatar}
                              alt={chain.name}
                              className="w-5 h-5"
                            />
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
                  <FormLabel>Wallet Address Receiver</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0x..."
                      {...field}
                      className="bg-background/50"
                    />
                  </FormControl>
                  <FormDescription>
                    {/* Enter your wallet address for the {toChain.name} network. */}
                    Enter your wallet address for the {`toChain.name`} network.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 bg-primary/10 rounded-lg mt-4">
              <h4 className="text-sm font-medium mb-2">
                Destination Token Information
              </h4>
              <div className="text-sm">
                <p>
                  <span className="font-medium">Token:</span>{" "}
                  {`destinationToken.name`}
                </p>
                <p className="truncate">
                  <span className="font-medium">Address:</span>{" "}
                  {/* {shortenAddress(destinationToken.address)} */}
                  {`shortenAddress(destinationToken.address)`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Bridge Tokens"
            )}
          </button>
        </div>
      </form>
    </Form>
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    // <form onSubmit={handleSubmit(onSubmit)}>
    //   {/* register your input into the hook by invoking the "register" function */}
    //   <input defaultValue="test" {...register("example")} />

    //   {/* include validation with required or other standard HTML validation rules */}
    //   <input {...register("exampleRequired", { required: true })} />
    //   {/* errors will return when field validation fails  */}
    //   {errors.exampleRequired && <span>This field is required</span>}

    //   <input type="submit" />
    // </form>
  );
};

export default BridgeForm;
