### SPUNKZ NFT Migration Assistant

- Checks connected wallet for balanceOf NFT then gets all token ID's using tokenOfOwnerByIndex function, this script will only work with NFT's that utilize ERC721Enumerable interface. NFT can be changed by editing SPUNKZ_ADDRESS in ```/constants/index.ts```
- Checks NFT allowance for SENDER_ADDRESS, if not approved as sender will display Approve button
- Once allowance is detected will show Batch Burn NFTs button

```
pnpm i  // install dependencies
pnpm dev  // run on local machine
pnpm build  // build for production
```