// @ts-ignore
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { base, shibarium } from "wagmi/chains";

/* export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
}) */

export const projectId = "e5016e9c50d889efd2ef7eaff69fc801";

export const metadata = {
  name: "SPUNKZ Migrate",
  description: "Migrate your SPUNKZ to Base",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const chains = [shibarium, base] as const;
export const config = defaultWagmiConfig({
  chains: chains,
  projectId,
  metadata,
});


