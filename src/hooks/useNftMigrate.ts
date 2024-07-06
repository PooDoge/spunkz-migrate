// @ts-ignore
import { useEffect, useState } from "react";
import { type Address, formatEther, formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { BURN_ADDRESS, MULTICALL_ADDRESS, SENDER_ADDRESS, SPUNKZ_ADDRESS } from "../constants";
import { nftAbi } from "../constants/nftAbi";
import { useNFTBalance } from "./useNftBalance";

export function useNftMigrate(account = BURN_ADDRESS) {
    const { chainId } = useAccount();
    const [nftBalance, setNftBalance] = useState<number>(0);
    const [nftBurnBalance, setNftBurnBalance] = useState<number>(0);
    const [nftApproved, setNftApproved] = useState<boolean>(false);
    const { myTokenIds, myTokenIdsBn, refetchBalance } = useNFTBalance(nftBalance, account ?? BURN_ADDRESS);

    const nftContract = {
        address: SPUNKZ_ADDRESS,
        abi: nftAbi,
    };

    const { data: nftReads, refetch: refetchReads } = useReadContracts({
        allowFailure: false,
        contracts: [
            {
                ...nftContract,
                functionName: "isApprovedForAll",
                args: [account, SENDER_ADDRESS],
            },
            {
                ...nftContract,
                functionName: "balanceOf",
                args: [account],
            },
            {
                ...nftContract,
                functionName: "balanceOf",
                args: [BURN_ADDRESS],
            },
        ],
        multicallAddress: MULTICALL_ADDRESS,
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
    }, [nftReads]);

    return { nftApproved, nftBalance, nftBurnBalance, myTokenIds, myTokenIdsBn, refresh };
}
