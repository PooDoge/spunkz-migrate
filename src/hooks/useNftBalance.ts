// @ts-ignore
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { MULTICALL_ADDRESS, SPUNKZ_ADDRESS } from "../constants";
import { nftAbi } from "../constants/nftAbi";

/**
 * Custom hook to fetch the user's NFT balance in an array of tokenId's for a specific pool.
 * @param poolId - The ID of the pool.
 * @param balance - User's total NFT balanceOf.
 * @param account - (Optional) The account address.
 * @returns An object containing the NFT token IDs and a refetch function.
 */
export function useNFTBalance(balance: number, account?: Address) {
  const { chainId, address } = useAccount();

  const [myTokenIds, setMyTokenIds] = useState<Array<number> | null>(null);
  const [myTokenIdsBn, setMyTokenIdsBn] = useState<Array<BigNumber> | null>(null);

  const nftContract = {
    address: SPUNKZ_ADDRESS,
    abi: nftAbi,
  } as const;

  const idReads: Array<any> = [];

  for (let i = 0; i < balance; i++) {
    idReads.push({
      ...nftContract,
      functionName: "tokenOfOwnerByIndex",
      args: [address, i],
    });
  }

  const {
    data: readData,
    isError,
    isLoading,
    refetch,
  } = useReadContracts({ allowFailure: false, contracts: idReads, multicallAddress: MULTICALL_ADDRESS });

  const refetchBalance = () => {
    refetch();
  };

  useEffect(() => {
    if (readData) {
      const tokenIdArray: Array<Number> = [];
      for (let i = 0; i < readData.length; i++) {
        tokenIdArray[i] = Number(readData[i]);
      }
      setMyTokenIds(tokenIdArray);
      setMyTokenIdsBn(readData);
      // console.log(tokenIdArray);
    }
  }, [readData]);

  return { myTokenIds, myTokenIdsBn, refetchBalance };
}
