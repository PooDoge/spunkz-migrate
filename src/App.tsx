// @ts-ignore
import {
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import spunkBurnImg from "./images/spunkburn.webp";
import { watchAccount } from "@wagmi/core";
import { useEffect, useState } from "react";
import {
  BURN_ADDRESS,
  SENDER_ADDRESS,
  SPUNKZ_ADDRESS,
  TX_URL,
  ADDRESS_URL,
} from "./constants";
import { nftAbi } from "./constants/nftAbi";
import { senderAbi } from "./constants/senderAbi";
import { useNftMigrate } from "./hooks/useNftMigrate";
import { GetAccountReturnType } from "wagmi/actions";

function App() {
  const [burnTxHash, setBurnTxHash] = useState<string | null>(null);
  const [allBurnedTokens, setAllBurnedTokens] = useState<Array<number> | null>(
    null
  ); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  const account = useAccount();
  const { connector: activeConnector } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const {
    nftApproved,
    nftBalance,
    nftBurnBalance,
    myTokenIds,
    myTokenIdsBn,
    refresh,
  } = useNftMigrate(account.address);
  const {
    writeContract: writeApprove,
    data: txApprove,
    isSuccess: isWriteSuccess,
    isPending: txPending,
    isError,
  } = useWriteContract();

  const { writeContract: writeBurn, data: txBurn } = useWriteContract();

  const {
    data: txResult,
    isError: txError,
    isFetched,
    isLoading: txLoading,
  } = useWaitForTransactionReceipt({
    hash: txApprove,
  });

  const {
    data: txBurnResult,
    isError: txBurnError,
    isFetched: isBurnFetched,
  } = useWaitForTransactionReceipt({
    hash: txBurn,
  });



  let burnTx;

  function handleBurn() {
    burnTx = writeBurn({
      abi: senderAbi,
      address: SENDER_ADDRESS,
      functionName: "batchTransferToSingleWallet",
      args: [SPUNKZ_ADDRESS, BURN_ADDRESS, myTokenIdsBn as any],
    });
  }

  let approveTx;

  function handleApprove() {
    approveTx = writeApprove({
      abi: nftAbi,
      address: SPUNKZ_ADDRESS,
      functionName: "setApprovalForAll",
      args: [SENDER_ADDRESS, true],
    });
  }

  useEffect(() => {
    if (isBurnFetched) {
      if (txBurnResult) {
        // get burnt token ids from localstorage and combine with current burnt token ids and save in same localstorage
        /*
        const burnedTokens = JSON.parse(
          localStorage.getItem("burnedTokens") || "[]"
        );
        const newBurnedTokens = burnedTokens.concat(myTokenIds);
        localStorage.setItem("burnedTokens", JSON.stringify(newBurnedTokens)); */
        setAllBurnedTokens(myTokenIds);
        setBurnTxHash(String(txBurnResult?.transactionHash));
        refresh();
      }
      if (txBurnError) {
        refresh();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBurnFetched, txBurnError]);

  useEffect(() => {
    if (isFetched) {
      if (txResult) {
        refresh();
      }
      if (txError) {
        refresh();
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched, txResult, txError]);

  const config = useConfig();
  const unwatch = watchAccount(config, {
    onChange(data) {
      console.log("Account changed!", data);
      refresh();
    },
  });

  return (
    <>
      <div>
        <h2>Step 1: Connect Wallet</h2>

        <w3m-button />

        <div>
          <p />
          Status:{" "}
          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
          <p />
          {account.address && (
            <>
              Wallet Address: {JSON.stringify(account.address)}
              <br />
            </>
          )}
          {account.chainId === 109 ? (
            <p>Connected to Shibarium</p>
          ) : (
            <>
              <p /> Switch to Shibarium!
              <p />
            </>
          )}
        </div>
      </div>

      {account.status === "connected" && account.chainId === 109 && (
        <div>
          <h2>Step 2: Approve SPUNKZ Migration</h2>
          Holding: {nftBalance} NFTs: {JSON.stringify(myTokenIds)}
          <p />
          Total Burnt By Holders: {nftBurnBalance} NFTs
          <p />
          {!nftApproved && (
            <>
              Must Approve NFT Collection First!
              <p />
              <button onClick={() => handleApprove()} type="button">
                Approve All
              </button>
            </>
          )}
        </div>
      )}

      {account.status === "connected" &&
        account.chainId === 109 &&
        nftApproved && (
          <div>
            <h2>Step 3: Burn <abbr title="Non Fungible Tokens">NFTs</abbr></h2>
            <button onClick={() => handleBurn()} type="button">
              🔥 Batch Burn NFTs
            </button>
            <p>
            ⚠️ This action cannot be undone! ⚠️
            </p>
            <p>
            <img src={spunkBurnImg} alt="Spunkz Burn" className="responsive" />
            </p>
            <p />
            {account.address && (
              <>
                Once transaction is confirmed, grab your TX hash from{" "}
                below and use it to fill out the SPUNKZ <abbr>NFT</abbr>{" "}
                <a href="https://forms.gle/ZocDAthHCiQTL9Do6" target="_blank">
                  migration form here
                </a>
              </>
            )}
            <p />
            {burnTxHash && (
              <>
              Your Wallet: {account.address}
              <br />
                Burn TX Hash:{" "}
                <a href={`${TX_URL}/${burnTxHash}`} target="_blank">
                  {TX_URL}/{burnTxHash}
                </a>
              </>
            )}
          </div>
        )}

      <div>
        <p />
        {allBurnedTokens && (<>
        Burnt TokenIDs (copy and save somewhere): {JSON.stringify(allBurnedTokens)}
        
        </>)}
        <p />
        Current Status: {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      <div>
        <p />
        {error?.message}
      </div>
    </>
  );
}

export default App;
