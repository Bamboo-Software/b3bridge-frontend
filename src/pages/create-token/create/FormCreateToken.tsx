/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import Image from '@/components/ui/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import FormCreateTokenLogo from '@/assets/icons/form-create-token-logo.svg';
import { CreateTokenFormSchema } from './CreateTokenFormValidation';
import { MultiSelect } from '@/components/ui/multiselect';
import { configLaunchPadsChains } from '@/utils/constants/chain';
import { getChainImage } from '@/utils/blockchain/chain';
import { ChainTokenSource } from '@/utils/enums/chain';
import { Controller, type Control, type FieldErrors, type SubmitHandler, type UseFormRegister, type UseFormReturn, type UseFormSetValue, type UseFormWatch } from 'react-hook-form';
import type { Chain } from 'viem';
import { useUploadFileMutation } from '@/services/upload';

type FormValues = z.infer<typeof CreateTokenFormSchema>;

interface FormCreateTokenProps {
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
  errors: FieldErrors<FormValues>;
  onSubmit: SubmitHandler<FormValues>;
  handleSubmit: UseFormReturn<FormValues>['handleSubmit'];
  next: () => void;
}

const FormCreateToken: React.FC<FormCreateTokenProps> = ({
  register,
  control,
  setValue,
  watch,
  errors,
  onSubmit,
  handleSubmit
}) => {
  const selectedChains = watch('targetChains');
  const totalSupply = watch('totalSupply');
 const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoUrl, setLogoUrl] = useState<string | null>(null);
const [uploadFile] = useUploadFileMutation();

useEffect(() => {
  const uploadLogo = async () => {
    if (logoFile) {
      try {
        const res = await uploadFile(logoFile).unwrap();
        const uploadedUrl = res.data.url;
        setLogoUrl(uploadedUrl);
        setValue('logoUrl', uploadedUrl);
      } catch (error) {
        console.error('Upload logo failed:', error);
      }
    }
  };

  uploadLogo();
}, [logoFile]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="max-w-[670px] mx-auto dark:bg-[#111417] dark:border-[#373B40] dark:text-white h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex justify-between">
            <span>Create OFT Token</span>
            <Image src={FormCreateTokenLogo} alt="FormCreateTokens" className="h-16 w-16" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chains */}
          <div className="space-y-2 w-full">
            <Label className="font-semibold text-[16px] w-full">Chains</Label>
            <Controller
              name="targetChains"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <MultiSelect
                  className="!bg-transparent border-input !w-[615px]"
                  variant="default"
                  badgeClassName="!bg-[color:var(--gray-night)]"
                  value={field.value || []}
                  onValueChange={field.onChange}
                  options={configLaunchPadsChains.map((chain: Chain) => ({
                    label: (
                      <div className="flex items-center gap-2">
                        <Image
                          objectFit="contain"
                          src={getChainImage({
                            chainId: chain.id,
                            source: ChainTokenSource.Local,
                          })}
                          alt={chain.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{chain.name}</span>
                      </div>
                    ),
                    value: chain.id.toString(),
                  }))}
                  placeholder="Select chain(s)"
                />
              )}
            />
            {errors.targetChains && (
              <p className="text-red-500 text-sm">{errors.targetChains.message}</p>
            )}
          </div>

          {/* Total Supply per Chain */}
          {selectedChains && selectedChains.length !== 0 && (
  <Label className="font-semibold text-[16px]">Total Supply</Label>
)}
{selectedChains && selectedChains.map((id) => {
  const chainMeta = configLaunchPadsChains.find((c) => c.id.toString() === id.toString());
  if (!chainMeta) return null;
  return (
    <div
      key={id}
      className="flex items-center justify-between p-3 rounded-md mb-2 bg-[#1b1e21]"
    >
      <div className="flex items-center gap-2">
        <img
          src={getChainImage({ chainId: chainMeta.id, source: ChainTokenSource.Local })}
          alt={chainMeta.name}
          className="w-5 h-5"
        />
        <span className="dark:text-white text-sm font-medium">{chainMeta.name}</span>
      </div>
      <Input
        type="number"
                  value={totalSupply[id] || ''}
        onChange={(e) => {
                    const newTotalSupply = {
                      ...totalSupply,
                      [id]: e.target.value,
                    };
                    setValue('totalSupply', newTotalSupply);
                    setValue('chainFields', {
                      ...watch('chainFields'),
                      [id]: { totalSupply: e.target.value },
                    });
        }}
        placeholder="0.0"
        className="w-[120px] text-right bg-transparent border-none dark:text-white placeholder-gray-500 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
})}
          {errors.chainFields && (
            <p className="text-red-500 text-sm">
              {Object.entries(errors.chainFields).map(([chainId, error]) => (
                <span key={chainId}>
                  {error?.totalSupply?.message || `Invalid configuration for chain ${chainId}`}
                </span>
              ))}
            </p>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label className="font-semibold text-[16px]">Name</Label>
            <Input
              {...register('name')}
              className="border-none dark:text-white dark:placeholder-gray-400"
              placeholder="Token Name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Symbol */}
          <div className="space-y-2">
            <Label className="font-semibold text-[16px]">Symbol</Label>
            <Input
              {...register('symbol')}
              className="border-none dark:text-white dark:placeholder-gray-400"
              placeholder="Token Symbol"
            />
            {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol.message}</p>}
          </div>

          {/* Decimals */}
          <div className="space-y-2">
            <Label className="font-semibold text-[16px]">Decimals</Label>
            <Input
              type="number"
              {...register('decimals')}
              className="border-none dark:text-white dark:placeholder-gray-400 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="Decimals"
            />
            {errors.decimals && <p className="text-red-500 text-sm">{errors.decimals.message}</p>}
          </div>

          {/* Upload Logo */}
          <div className="space-y-2">
            <Label className="font-semibold text-[16px]">Upload token logo</Label>
            <Controller
              name="logoUrl"
              control={control}
              render={() => (
                <>
                  <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) setLogoFile(file);
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
                      if (file) setLogoFile(file);
                    }}
                  />
                </>
              )}
            />
        <div className="w-full flex justify-center">
          {logoUrl && (
            <div className="mt-2">
              <img
                src={logoUrl}
                alt="Preview"
                className="h-[100px] rounded-md border dark:border-[#4e4e4e] object-contain"
              />
            </div>
          )}
        </div>
      </div>
          {selectedChains && selectedChains.length > 0 && (
            <div className="text-sm rounded-md p-3 flex flex-wrap gap-4 justify-start">
              <span className="font-semibold text-[#34D3FF]">Creation fees:</span>
              {selectedChains && selectedChains.map((id, index) => {
                const chainMeta = configLaunchPadsChains.find((c) => c.id.toString() === id.toString());
                if (!chainMeta) return null;

                return (
                  <span key={id} className="text-[#34D3FF]">
                    {totalSupply[id] || 0} {chainMeta.name}
                    {index !== selectedChains.length - 1 && (
                      <span className="mx-1 text-[#6B7280]">|</span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] shadow-[0_0px_10px_0_var(--blue-primary)] border-none rounded-lg cursor-pointer hover:opacity-90 hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground"
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default FormCreateToken;