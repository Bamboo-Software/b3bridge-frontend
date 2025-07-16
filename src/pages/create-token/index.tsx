/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormCreateToken from './create/FormCreateToken';
import ConfirmCreateToken from './create/ConfirmCreateToken';
import SuccessCreateToken from './create/SuccessCreateToken';
import { CreateTokenFormSchema, type CreateTokenFormValues } from './create/CreateTokenFormValidation';
import { useCreateTokenMutation } from '@/services/pre-sale/create-token';
import type { CreateTokenPayload } from '@/utils/interfaces/token';
import { WalletConnectionRequired } from '../common/WalletConnectionRequired';
import { useAccount } from 'wagmi';
import { parseNumberWithCommas } from '@/utils';

const CreateTokenPage: React.FC = () => {
  const [createToken] = useCreateTokenMutation();
  const [current, setCurrent] = useState(0);
   const { isConnected } = useAccount();
   const methods = useForm<CreateTokenFormValues>({
    resolver: zodResolver(CreateTokenFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      decimals: 18,
      description: "",
      website: "https://bamboosoft.io/",
      whitepaper: "https://mytoken.com/whitepaper.pdf",
      telegram: "https://t.me/mytoken",
      twitter: "https://twitter.com/mytoken",
      discord: "https://discord.gg/mytoken",
      github: "https://github.com/mytoken/contracts",
      category: "defi",
      tags: ["defi", "gaming", "cross-chain"],
      targetChains: [],
      tokenType: "OFT",
      totalSupply: "0",
      targetChainOptions: [],
      logoUrl: "",
      chainFields: {},
    },
  });
 const { register, watch, control, setValue, formState: { errors }, handleSubmit, getValues } = methods;
  const formData = useMemo(() => watch(), [watch]);
  console.log("🚀 ~ formData:", formData)

  const next = () => {
    setCurrent(current + 1);
  };

  const handleCreateToken = async () => {
  const data = getValues();
  console.log("🚀 ~ handleCreateToken ~ data:", data)

  const chainFields: CreateTokenPayload["chainFields"] = {};
  const normalizedTargetChainOptions = data.targetChainOptions?.map(opt => ({
    ...opt,
    totalSupply: opt.totalSupply ? parseNumberWithCommas(opt.totalSupply) : "0"
  })) || [];

  if (data.targetChains.length === 1) {
    const totalSupply = data.totalSupply || "0";
    chainFields[data.targetChains[0]] = { totalSupply };
  } else if (data.targetChains.length > 1) {
    for (const chainId of data.targetChains) {
      const chainOption = data.targetChainOptions?.find(opt => opt.chainId === chainId);
      const supply = chainOption?.totalSupply || "0";
      chainFields[chainId] = { totalSupply: supply };
    }
  }

      const {
      chainFields: _,
      ...cleanedData
    } = data;

    if (data.targetChains.length > 1) {
      delete cleanedData.totalSupply;
    }

    const payload: CreateTokenPayload = {
      ...cleanedData,
      ...(data.targetChains.length === 1
        ? { totalSupply: parseNumberWithCommas(data.totalSupply || "0") }
        : { targetChainOptions: normalizedTargetChainOptions }),
      logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : "",
    };
    console.log("🚀 ~ handleCreateToken ~ payload:", payload)

  try {
    const result = await createToken(payload).unwrap();
    const chainFieldsFromResult = (result?.data || []).reduce((acc, item) => {
      acc[item.chainId] = {
        totalSupply: item.totalSupply || "0",
        id: item.id || "0",
        systemWalletAddress: item.systemWalletAddress || "0",
        paymentTokenAddress: item.paymentTokenAddress || "0",
        deployFee: item.deployFee || "0",
        platformFee: item.platformFee || "0",
        transactions: {
          native: {
            payStatus: "",
            payHash: item?.deployTxHash || "",
            amount: item.deployFee || "0",
            gasEstimate: "",
          },
        },
      };
      return acc;
    }, {} as CreateTokenFormValues["chainFields"]);

    setValue("chainFields", chainFieldsFromResult);
    next();
  } catch (err) {
    console.error("❌ Failed to create token:", err);
  }
};


  const steps = [
    {
      content: (
        <FormCreateToken
          register={register}
          control={control}
          setValue={setValue}
          watch={watch}
          errors={errors}
          onSubmit={handleCreateToken}
          handleSubmit={handleSubmit}
          next={next}
        />
      ),
    },
    {
      content: <ConfirmCreateToken formData={watch()} next={next} />,
    },
    {
      content: <SuccessCreateToken formData={formData} next={next} />,
    },
  ];
if (!isConnected) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <WalletConnectionRequired
          title='Connect Wallet to Create Token'
          description='Please connect your wallet to browse .'
        />
      </div>
    );
  }
  return <FormProvider {...methods}>
      <div>{steps[current].content}</div>
    </FormProvider>
};

export default CreateTokenPage;
