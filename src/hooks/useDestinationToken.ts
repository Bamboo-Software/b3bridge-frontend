import { useEffect, useState } from 'react'
import { getCrossChainTokenAddress } from '@/utils/blockchain/chain'
import { useTokenList } from '@/hooks/useTokenList'
import type { ITokenInfo } from '@/utils/interfaces/token'
import type { IChainInfo } from '@/utils/interfaces/chain'
import { ChainTokenSource } from '@/utils/enums/chain'
import { getTokenData } from '@/utils/blockchain/token'
import type { Address } from 'viem'
export function useDestinationToken(
  srcToken?: ITokenInfo | null,
  srcChain?: IChainInfo | null,
  destChain?: IChainInfo | null
): {
  destinationToken: ITokenInfo | undefined;
  isLoading: boolean;
} {
  const [destinationToken, setDestToken] = useState<ITokenInfo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isReady = !!srcToken && !!srcChain && !!destChain;

  const { data: destTokenList } = useTokenList(
    isReady ? destChain : undefined,
    isReady ? srcChain.chainKey : undefined,
    isReady ? srcToken.address : undefined
  );

  useEffect(() => {
    if (!isReady) {
      setDestToken(undefined);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function handleLocalToken() {
      if (
        srcChain?.source === ChainTokenSource.Local &&
        srcToken?.address &&
        srcChain.id &&
        destChain?.id
      ) {
        const destTokenAddress = getCrossChainTokenAddress(
          srcChain.id,
          destChain.id,
          srcToken.address.toLowerCase()
        );

        if (!destTokenAddress) {
          if (!cancelled) {
            setDestToken(undefined);
            setIsLoading(false);
          }
          return;
        }
        const data = await getTokenData(destChain.id, destTokenAddress as Address);
        if (!cancelled) {
          setDestToken({
            ...data,
            symbol: data.symbol,
            address: destTokenAddress as Address,
            chainId: destChain.id,
          } as ITokenInfo);
          setIsLoading(false);
        }
      }
    }

    if (srcChain?.source === ChainTokenSource.Local) {
      setDestToken(undefined);
      handleLocalToken();
    } else if (
      srcChain?.source === ChainTokenSource.Stargate &&
      destTokenList &&
      destChain?.chainKey
    ) {
      const found = destTokenList.find(token => token.chainKey === destChain.chainKey);
      if (!cancelled) {
        setDestToken(found);
        setIsLoading(false);
      }
    } else {
      if (!cancelled) {
        setDestToken(undefined);
        setIsLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [
    isReady,
    srcChain?.source,
    srcChain?.id,
    srcToken?.address,
    destChain?.id,
    destChain?.chainKey,
    destTokenList,
  ]);

  return { destinationToken, isLoading };
}
// export function useDestinationToken(
//   srcToken?: ITokenInfo | null,
//   srcChain?: IChainInfo | null,
//   destChain?: IChainInfo | null
// ): { destinationToken: ITokenInfo | undefined; isLoading: boolean } {
//   const [destinationToken, setDestToken] = useState<ITokenInfo | undefined>(undefined);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const isReady = !!srcToken && !!srcChain && !!destChain;

//   const { data: destTokenList } = useTokenList(
//     isReady ? destChain : undefined,
//     isReady ? srcChain.chainKey : undefined,
//     isReady ? srcToken.address : undefined
//   );

//   useEffect(() => {
//     if (!isReady) {
//       setDestToken(undefined);
//       setIsLoading(false);
//       return;
//     }

//     let cancelled = false;
//     setIsLoading(true);

//     async function handleLocalToken() {
//       if (
//         srcChain?.source === ChainTokenSource.Local &&
//         srcToken?.address &&
//         srcChain.id &&
//         destChain?.id
//       ) {
//         const destTokenAddress = getCrossChainTokenAddress(
//           srcChain.id,
//           destChain.id,
//           srcToken.address.toLowerCase()
//         );

//         if (!destTokenAddress) {
//           if (!cancelled) {
//             setDestToken(undefined);
//             setIsLoading(false);
//           }
//           return;
//         }
//         const data = await getTokenData(destChain.id, destTokenAddress as Address);
//         if (!cancelled) {
//           setDestToken({
//             ...data,
//             symbol: data.symbol,
//             address: destTokenAddress as Address,
//             chainId: destChain.id,
//           } as ITokenInfo);
//           setIsLoading(false);
//         }
//       }
//     }

//     if (srcChain?.source === ChainTokenSource.Local) {
//       setDestToken(undefined);
//       handleLocalToken();
//     } else if (
//       srcChain?.source === ChainTokenSource.Stargate &&
//       destTokenList &&
//       destChain?.chainKey
//     ) {
//       const found = destTokenList.find(
//         token => token.chainKey === destChain.chainKey
//       );
//       if (!cancelled) {
//         setDestToken(found);
//         setIsLoading(false);
//       }
//     } else {
//       if (!cancelled) {
//         setDestToken(undefined);
//         setIsLoading(false);
//       }
//     }

//     return () => {
//       cancelled = true;
//     };
//   }, [
//     isReady,
//     srcChain?.source,
//     srcChain?.id,
//     srcToken?.address,
//     destChain?.id,
//     destChain?.chainKey,
//     destTokenList,
//   ]);

//   return { destinationToken, isLoading };
// }