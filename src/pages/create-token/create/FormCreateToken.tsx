import {
  useForm,
  Controller,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from '@/components/ui/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {  UploadCloud } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import FromCreateTokenLogo from "@/assets/icons/form-create-token-logo.svg"
import { CreateTokenFormSchema } from "./CreateTokenFormValidation";
import { MultiSelect } from "@/components/ui/multiselect";
import { configLaunchPadsChains } from "@/utils/constants/chain";
import { getChainImage } from "@/utils/blockchain/chain";
import { ChainTokenSource } from "@/utils/enums/chain";
import type { Chain } from "viem";

type FormValues = z.infer<typeof CreateTokenFormSchema>;

interface FromCreateTokenProps{
    next: () => void
}
const FormCreateToken: React.FC<FromCreateTokenProps> = ({next}:FromCreateTokenProps) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateTokenFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      decimals: "18",
      chains: [],
      tokenType: "OFT",
      totalSupply: {},
      logo: null,
    },
  });

  const logoFile = watch("logo");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!(logoFile instanceof File)) return;
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const inputRef = useRef<HTMLInputElement | null>(null);

 
  const selectedChains = watch("chains");
  const totalSupply = watch("totalSupply");

  const onSubmit: SubmitHandler<FormValues> = (data) => {
      console.log("Submit data:", data);
      next()
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="max-w-[670px] mx-auto dark:bg-[#111417] dark:border-[#373B40] dark:text-white max-h-[80vh] overflow-y-scroll">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex justify-between">
            <span>
               Create OFT Token
            </span>
           <Image src={FromCreateTokenLogo} alt='FromCreateTokens' className='h-16 w-16' />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Chains */}
          <div className="space-y-2 w-full">
            <Label className="font-semibold text-[16px] w-full">Chains</Label>
           <Controller
            name='chains'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <MultiSelect
                className='!bg-transparent border-input !w-[615px]'
                variant='default'
                badgeClassName='!bg-[color:var(--gray-night)]'
                value={field.value || []}
                onValueChange={field.onChange}
                options={configLaunchPadsChains.map((chain: Chain) => ({
                  label: (
                    <div className='flex items-center gap-2'>
                      <Image
                        objectFit='contain'
                        src={getChainImage({
                          chainId: chain.id,
                          source: ChainTokenSource.Local,
                        })}
                        alt={chain.name}
                        className='w-5 h-5 rounded-full'
                      />
                      <span>{chain.name}</span>
                    </div>
                  ),
                  value: chain.id.toString(),
                }))}
                placeholder='Select chain(s)'
              />
            )}
          />
        </div>
            {errors.chains && (
              <p className="text-red-500 text-sm">{errors.chains.message}</p>
            )}

          {/* Total Supply per Chain */}
          {selectedChains.length!==0 &&
          <Label className="font-semibold text-[16px]">Total Supply</Label>
          }
        {selectedChains.map((id) => {
            const chainMeta = configLaunchPadsChains.find((c) => c.id.toString() === id.toString());
            if (!chainMeta) return null;

            return (
                <div
                key={id}
                className="flex items-center justify-between p-3 rounded-md mb-2 bg-[#1b1e21]"
                >
                {/* Chain Info */}
                <div className="flex items-center gap-2">
                    <img src={getChainImage({ chainId: chainMeta.id, source: ChainTokenSource.Local })} alt={chainMeta.name} className="w-5 h-5" />
                    <span className="dark:text-white text-sm font-medium">{chainMeta.name}</span>
                </div>

                {/* Input */}
                <Input
                    type="number"
                    value={totalSupply[id] || ""}
                    onChange={(e) =>
                    setValue("totalSupply", {
                        ...totalSupply,
                        [id]: e.target.value,
                    })
                    }
                    placeholder="0.0"
                    className="w-[120px] text-right bg-transparent border-none dark:text-white placeholder-gray-500 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                </div>
            );
            })}

          {/* Name */}
          <div className="space-y-2">
            <Label className="font-semibold text-[16px]">Name</Label>
            <Input
              {...register("name")}
              className=" border-none dark:text-white dark:placeholder-gray-400"
              placeholder="Token Name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Symbol */}
          <div className="space-y-2">
            <Label className="font-semibold text-[16px]">Symbol</Label>
            <Input
              {...register("symbol")}
              className=" border-none dark:text-white dark:placeholder-gray-400"
              placeholder="Token Symbol"
            />
            {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol.message}</p>}
          </div>

          {/* Decimals */}
          <div className="space-y-2">
            <Label className="font-semibold text-[16px]">Decimals</Label>
            <Input
              type="number"
              {...register("decimals")}
              className=" border-none dark:text-white dark:placeholder-gray-400  appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="Decimals"
            />
            {errors.decimals && <p className="text-red-500 text-sm">{errors.decimals.message}</p>}
          </div>

          {/* Upload Logo */}
          <div className="space-y-2">
            <Label className="font-semibold text-[16px]">Upload token logo</Label>
            <Controller
              name="logo"
              control={control}
              render={({ field: { onChange } }) => (
                <>
                  <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) onChange(file);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className="w-full h-[130px] dark:bg-[#111417] border-2 border-dashed dark:border-[#4e4e4e] rounded-md flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[#00d4ff] transition-all"
                  >
                    <UploadCloud className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-[16px] text-[#fff]">Select image to upload</p>
                    <p className="text-[14px] text-[#9CA3AF]">or drag and drop it here</p>
                  </div>
                  <Input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                  />
                </>
              )}
            />
            <div className="w-full flex justify-center">
            {logoPreview && (
              <div className="mt-2">
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="h-[100px] rounded-md border dark:border-[#4e4e4e] object-contain"
                />
              </div>
            )}
            </div>
          </div>
        {selectedChains.length > 0 && (
            <div className="text-sm rounded-md p-3 flex flex-wrap gap-4 justify-start">
                <span className="font-semibold text-[#34D3FF]">Creation fees:</span>
                {selectedChains.map((id, index) => {
                const chainMeta = configLaunchPadsChains.find((c) => c.id.toString() === id.toString());
                if (!chainMeta) return null;

                return (
                    <span key={id} className="text-[#34D3FF]">
                    {totalSupply[id] || 0} {chainMeta.name}
                    {index !== selectedChains.length - 1 && <span className="mx-1 text-[#6B7280]">|</span>}
                    </span>
                );
                })}
            </div>
            )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
        shadow-[0_0px_10px_0_var(--blue-primary)]
        border-none
        rounded-lg
        cursor-pointer
        hover:opacity-90
        hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground"
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default FormCreateToken;
