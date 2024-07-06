// @ts-ignore
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BURN_ADDRESS, SENDER_ADDRESS, SPUNKZ_ADDRESS } from "./constants";
import { nftAbi } from "./constants/nftAbi";
import { senderAbi } from "./constants/senderAbi";
import { useNftMigrate } from "./hooks/useNftMigrate";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const { nftApproved, nftBalance, nftBurnBalance, myTokenIds, myTokenIdsBn, refresh } = useNftMigrate(account.address);
  const { writeContract, data: txData, isSuccess: isWriteSuccess, isPending: txPending, isError } = useWriteContract();

  const {
    data: txResult,
    isError: txError,
    isFetched,
    isLoading: txLoading,
  } = useWaitForTransactionReceipt({
    hash: txData,
  });

  let burnTx;

  function handleBurn() {
    burnTx = writeContract({
      abi: senderAbi as const,
      address: SENDER_ADDRESS,
      functionName: "batchTransferToSingleWallet",
      args: [SPUNKZ_ADDRESS, BURN_ADDRESS, myTokenIdsBn],
    });
  }

  let approveTx;

  function handleApprove() {
    approveTx = writeContract({
      abi: nftAbi as const,
      address: SPUNKZ_ADDRESS,
      functionName: "setApprovalForAll",
      args: [SENDER_ADDRESS, true],
    });
  }

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

  return (
    <>
      <div>
        <h2>Step 1: Connect Wallet</h2>

        <w3m-button />

        <div>
          <p />
          Status: {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
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
              <p /> Switch to Shibarium
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
          Total Burnt: {nftBurnBalance} NFTs
          <p />
          {!nftApproved && (
            <>
              Must Approve NFT Collection First!
              <p />
            </>
          )}
          <button onClick={() => handleApprove()} type="button">
            Approve All
          </button>
        </div>
      )}

      {account.status === "connected" && account.chainId === 109 && nftApproved && (
        <div>
          <h2>Step 3: Migrate NFTs</h2>
          <button onClick={() => handleBurn()} type="button">
            Migrate NFTs
          </button>
          {burnTx && <p>{burnTx}</p>}
        </div>
      )}

      <div>
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
