// @ts-ignore
import { useEffect, useState } from "react";
import { type Address, formatEther, formatUnits, type Abi } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { BURN_ADDRESS, MULTICALL_ADDRESS, SENDER_ADDRESS, SPUNKZ_ADDRESS } from "../constants";
import { nftAbi } from "../constants/nftAbi";
import { useNFTBalance } from "./useNftBalance";

export function useNftMigrate(account = BURN_ADDRESS) {
    const { chainId, address } = useAccount();
    const [nftBalance, setNftBalance] = useState<number>(0);
    const [nftBurnBalance, setNftBurnBalance] = useState<number>(0);
    const [nftApproved, setNftApproved] = useState<boolean>(false);
    const { myTokenIds, myTokenIdsBn, refetchBalance } = useNFTBalance(nftBalance, account ?? BURN_ADDRESS);

    const nftContract = {
        address: SPUNKZ_ADDRESS,
        abi: nftAbi as Abi,
    };

    // Contract reads for allowance, balanceOf and balanceOf burn address

    const contractCalls = [
        {
            address: SPUNKZ_ADDRESS,
            abi: nftAbi as Abi,
            functionName: "isApprovedForAll",
            args: [address as Address, SENDER_ADDRESS as Address],
        },
        {
            address: SPUNKZ_ADDRESS,
            abi: nftAbi as Abi,
            functionName: "balanceOf",
            args: [address as Address],
        },
        {
            address: SPUNKZ_ADDRESS,
            abi: nftAbi as Abi,
            functionName: "balanceOf",
            args: [BURN_ADDRESS],
        },
    ];

    const { data: nftReads, refetch: refetchReads } = useReadContracts({
        contracts: contractCalls,
        allowFailure: false,
        multicallAddress: MULTICALL_ADDRESS as Address,
    });

    const refresh = () => {
        refetchReads();
        refetchBalance();
    };

    useEffect(() => {
        if (nftReads) {
            setNftBalance(Number(nftReads[1]));
            setNftBurnBalance(Number(nftReads[2]));
            setNftApproved(Boolean(nftReads[0]));
        }
    }, [nftReads, address]);

    return { nftApproved, nftBalance, nftBurnBalance, myTokenIds, myTokenIdsBn, refresh };
}
