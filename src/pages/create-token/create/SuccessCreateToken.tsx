"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, Copy, Check } from "lucide-react"
import type React from "react"
import { useMemo, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "@/components/ui/image"
import FromCreateTokenLogo from "@/assets/icons/form-create-token-logo.svg"
import { Separator } from "@/components/ui/separator"
import { useChainList } from "@/hooks/useChainList"
type ConfirmCreateTokenProps = {
  next: () => void
}
const TARGET_KEYS = ["ethereum", "avalanche", "bsc"];
const SuccessCreateToken = ({ next }: ConfirmCreateTokenProps) => {
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
    const { data: allChains } = useChainList();
   
     const CHAINS = useMemo(
       () => (allChains || []).filter((c) => TARGET_KEYS.includes(c.chainKey!.toLowerCase())),
       [allChains]
     );
   
     const CHAIN_META = useMemo(
       () =>
         Object.fromEntries(
           CHAINS.map((chain) => [
             chain.id,
             {
               label: chain.nativeCurrency?.symbol ?? chain.chainKey ?? "UNKNOWN",
               icon: chain.logo ?? "",
             },
           ])
         ),
       [CHAINS]
     );
     console.log("🚀 ~ ConfirmCreateToken ~ CHAIN_META:", CHAIN_META)
  const [openChains, setOpenChains] = useState({
    eth: true,
    avalanche: true,
    bsc: true,
  })

  const toggleChain = (chain: string) => {
    setOpenChains((prev) => ({
      ...prev,
      [chain]: !prev[chain as keyof typeof prev],
    }))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    next()
  }

  const copyAddress = (address: string, chain: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(chain)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const address = "0Xh5zLJjTnY9RJoyytH7BS33zqmFqYGDXwxESSiqnyLaR"

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[670px] mx-auto">
      <Card className="dark:bg-[#111417] bg-[#111417] dark:border-[#373B40] border-[#373B40] text-white max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-6">
          <CardTitle className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-semibold text-white">Your token was created!</span>
            </div>
           <Image src={FromCreateTokenLogo} alt='FromCreateTokens' className='h-16 w-16' />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          {/* Token Information Section */}
          <div className="space-y-4 bg-[#1b1e21] p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Name</span>
              <span className="text-[#34D3FF] font-medium">Defi</span>
            </div>
            <Separator className="bg-[#373B40]"/>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Symbol</span>
              <span className="text-[#34D3FF] font-medium">Defi Bamboo</span>
            </div>
             <Separator className="bg-[#373B40]"/>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Decimals</span>
              <span className="text-[#34D3FF] font-medium">18</span>
            </div>
          </div>

          {/* Chain Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Chain</h3>

            {/* ETH Chain */}
            <Collapsible open={openChains.eth} onOpenChange={() => toggleChain("eth")}>
              <div className="bg-[#1a1d21] rounded-lg p-4">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-white font-medium">ETH</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${openChains.eth ? "rotate-180" : ""}`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total supply</span>
                    <span className="text-[#34D3FF] font-medium">1,000,000</span>
                  </div>
                    <Separator className="bg-[#373B40]"/>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Address</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#34D3FF]  text-sm">{address}</span>
                      <button
                        type="button"
                        onClick={() => copyAddress(address, "eth")}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedAddress === "eth" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                    <Separator className="bg-[#373B40]"/>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Avalanche Chain */}
            <Collapsible open={openChains.avalanche} onOpenChange={() => toggleChain("avalanche")}>
              <div className="bg-[#1a1d21] rounded-lg p-4">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-white font-medium">Avalanche</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${openChains.avalanche ? "rotate-180" : ""}`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total supply</span>
                    <span className="text-[#34D3FF] font-medium">1,000,000</span>
                  </div>
                    <Separator className="bg-[#373B40]"/>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Address</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#34D3FF] text-sm">{address}</span>
                      <button
                        type="button"
                        onClick={() => copyAddress(address, "avax")}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedAddress === "avax" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                     <Separator className="bg-[#373B40]"/>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* BSC Chain */}
            <Collapsible open={openChains.bsc} onOpenChange={() => toggleChain("bsc")}>
              <div className="bg-[#1a1d21] rounded-lg p-4">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-white font-medium">BSC</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${openChains.bsc ? "rotate-180" : ""}`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total supply</span>
                    <span className="text-[#34D3FF] font-medium">1,000,000</span>
                  </div>
                     <Separator className="bg-[#373B40]"/>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Address</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#34D3FF] text-sm">{address}</span>
                      <button
                        type="button"
                        onClick={() => copyAddress(address, "bsc")}
                        className="text-gray-400 hover:text-white"
                      >
                        {copiedAddress === "bsc" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                     <Separator className="bg-[#373B40]"/>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

                  {/* Submit Button */}
        <div className="flex justify-between items-center">
          <Button
            type="submit"
            className="dark:bg-[#1E242D] text-white py-3 text-base font-medium"
          >
            View Transaction
          </Button>
          <Button
            type="submit"
            className="dark:bg-[#1E242D] text-white py-3 text-base font-medium"
          >
            Create new token
          </Button>
          <Button
            type="submit"
            className="bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
        shadow-[0_0px_10px_0_var(--blue-primary)]
        border-none
        rounded-lg
        cursor-pointer
        hover:opacity-90
        hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground"
          >
            Create Launchpad
          </Button>

                  </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default SuccessCreateToken
