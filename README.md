# Solana Pay Compressed Tokens

create solana pay qrcode/url to create, mint and transfer compressed tokens.
Also create airdrop campaigns, mint experience tokens and let attendees claim them by scanning a QR code

## Features

### Create Compressed Token

Enter the token name, symbol, decimals and metadata URI. And generate the solana Pay QR code/URL.
The qrcode/url contains a serializedTransaction which contain two instructions create compressed token, and create the metadata using metaplex.
The qr code can be scanned by any solana pay supported wallet(SolFlare), and the user will be prompted to approve the transaction.

### Mint Compressed Token

Enter the token mint address, amount(raw in decimals) and recipient wallet address. And generate the solana Pay QR code/URL.

### Transfer Compressed Token

Enter the token mint address, amount(raw in decimals) and recipient wallet address. And generate the solana Pay QR code/URL.

### cPOP

Once you have minted the tokens. And if you want to airdrop the tokens to multiple wallets. You can create a airdrop solana pay QR code/URL.
Enter the mint address, amount each account can claim, and total amount to airdrop, then click on create Airdrop this will result in two qr codes.
One if for the creator to deposit some tokens. And other qr code/ url is to claim the tokens. you can share the claim qr code with the attendees. And they can scan the qr code to claim the tokens.
