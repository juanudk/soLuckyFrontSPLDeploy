'use client'

import { useState, ChangeEvent, useCallback, useEffect } from 'react'
import { ChevronUp, ChevronDown } from "lucide-react"
import dynamic from 'next/dynamic';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, BN, web3 } from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { commitmentLevel, dev, devId, lotteryProgramInterface, mkt, mktId, op, opId } from '../utils/constants';
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
import * as anchor from "@coral-xyz/anchor";
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, transfer, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

export default function Component() {
  const [isHidden, setIsHidden] = useState(false)
  const [lotteryId, setLotteryId] = useState('')
  const [isRandomOutside, setIsRandomOutside] = useState<boolean>(false)
  const [ticketPrice, setTicketPrice] = useState('')
  const [ticketTax, setTicketTax] = useState('')
  const [token, setToken] = useState('')
  const [owner, setOwner] = useState('')
  const [tokenPick, setTokenPick] = useState('')
  const [ownerPick, setOwnerPick] = useState('')
  const [lotteryPDA, setLotteryPDA] = useState('')
  const [maxTickets, setMaxTickets] = useState('')
  const [lotteryIdPick, setLotteryIdPick] = useState(0)
  const [batchSize, setBatchSize] = useState(0)
  const [entropy, setEntropy] = useState(0)
  const [oldLottery, setOldLottery] = useState('')
  const [newLottery, setNewLottery] = useState('')
  const [lotteryPDAStr, setLotteryPDAStr] = useState('')
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const handleSetLotteryId = async (lotteryIdStr: string) => {
    setLotteryId(lotteryIdStr)
  }
  const handleSetToken = async (tokenStr: string) => {
    setToken(tokenStr)
  }
  const handleSetOwner = async (ownerStr: string) => {
    setOwner(ownerStr)
  }
  const genLotteryPDA = useCallback(async () => {
    if (wallet && lotteryId && token && owner) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      const program: any = new Program(lotteryProgramInterface, provider);
      const lotteryIdBN = new anchor.BN(lotteryId);
      const seedsLottery = [lotteryIdBN.toArrayLike(Buffer, "le", 8), new PublicKey(token).toBuffer(), new PublicKey(owner).toBuffer()];
      const lotteryPDA = anchor.web3.PublicKey.findProgramAddressSync(seedsLottery, program.programId)[0];
      setLotteryPDAStr(lotteryPDA.toString())
    } else {
      setLotteryPDAStr("")
    }
  }, [lotteryId, token, owner])

  useEffect(() => {
    genLotteryPDA()
  }, [lotteryId, token, owner])
  const handleCreateLottery = async () => {
    console.log('Creating lottery with:', { lotteryId, isRandomOutside, ticketPrice, maxTickets })
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      const program: any = new Program(lotteryProgramInterface, provider);

      // const lotteryIdBN = new anchor.BN(lotteryId);
      const lotteryIdBN = new anchor.BN(2);
      const ticketPriceBN = new anchor.BN(Number(ticketPrice) * LAMPORTS_PER_SOL)
      const ticketTaxBN = new anchor.BN(Number(ticketPrice) * LAMPORTS_PER_SOL)
      const seedsLottery = [lotteryIdBN.toArrayLike(Buffer, "le", 8), new PublicKey(token).toBuffer(), new PublicKey(owner).toBuffer()];
      const lotteryPDA = anchor.web3.PublicKey.findProgramAddressSync(seedsLottery, program.programId)[0];
      const bal = await connection.getBalance(lotteryPDA);
      if (bal > 0) {
        console.log(`Account ${lotteryPDA} is already initialized`);
        return;
      } else {
        await program.methods.initialize(lotteryIdBN, new PublicKey(token), wallet.publicKey, true, ticketPriceBN, ticketTaxBN, maxTickets).accounts({ lotteryInfo: lotteryPDA } as any).rpc()
        setLotteryPDA(`${lotteryPDA}`)
      }
      alert('Lottery created successfully!')
    } else {
      alert("Wallet is not connected. Please connect your wallet.");
    }
  }

  const pickWinner = async () => {
    if (lotteryIdPick > 0 && entropy > 0 && batchSize > 0 && tokenPick && ownerPick) {
      if (wallet) {
        const provider = new AnchorProvider(connection, wallet, {
          preflightCommitment: commitmentLevel,
        });

        if (!provider) return;

        // Create the program interface combining the IDL, program ID, and provider
        const program: any = new Program(
          lotteryProgramInterface,
          provider
        );

        const lotteryNumber = new BN(lotteryIdPick);

        // Derive the lottery info account from the lottery number
        const seeds = [lotteryNumber.toArrayLike(Buffer, "le", 8)];
        const lotteryPDA = PublicKey.findProgramAddressSync(
          seeds,
          program.programId
        )[0];

        const seedsDev = [devId.toArrayLike(Buffer, "le", 8)];
        const devPDA = web3.PublicKey.findProgramAddressSync(
          seedsDev,
          program.programId
        )[0];

        const seedsMkt = [mktId.toArrayLike(Buffer, "le", 8)];
        const mktPDA = web3.PublicKey.findProgramAddressSync(
          seedsMkt,
          program.programId
        )[0];
  

        let lotteryIdBN = new BN(lotteryIdPick)
        const tokenPk = new PublicKey(tokenPick)
        const ownerPk =new PublicKey(ownerPick)
        const seedsUser = [lotteryIdBN.toArrayLike(Buffer, "le", 8), wallet.publicKey.toBuffer(), tokenPk.toBuffer(), ownerPk.toBuffer()];
        const userPDA = PublicKey.findProgramAddressSync(
          seedsUser,
          program.programId
        )[0];
        try {
          console.log(lotteryNumber.toString(), (new anchor.BN(entropy)).toString(), (new anchor.BN(batchSize)).toString())
          const bal = await connection.getBalance(userPDA);
          if (bal == 0) {
            console.log(`Account ${userPDA} should be initialized`)
            await program.methods.initializeUser(lotteryNumber, tokenPk, ownerPk).accounts({ user: userPDA }).rpc()
          } else {
            console.log(`Account ${userPDA} already initialized`)
          }
          const seedsOp = [opId.toArrayLike(Buffer, "le", 8)];
          let opPDA = anchor.web3.PublicKey.findProgramAddressSync(
            seedsOp,
            program.programId
          )[0];
          const seedsLottery = [lotteryIdBN.toArrayLike(Buffer, "le", 8), new PublicKey(tokenPick).toBuffer(), ownerPk.toBuffer()];
          const lotteryPDA = anchor.web3.PublicKey.findProgramAddressSync(seedsLottery, program.programId)[0];
          let lotteryATA = await getAssociatedTokenAddress(
            tokenPk,
            lotteryPDA,
            true
          );
          let devATA = await getAssociatedTokenAddress(
            tokenPk,
            dev
          );
          let mktATA = await getAssociatedTokenAddress(
            tokenPk,
            mkt
          );
          let signerATA = await getAssociatedTokenAddress(
            tokenPk,
            wallet.publicKey
          );
          await program.methods.pickWinner(lotteryNumber, tokenPk, ownerPk, new anchor.BN(entropy), new anchor.BN(batchSize))
            .accounts({
              lotteryInfo: lotteryPDA,
              dev: devPDA,
              mkt: mktPDA,
              user: userPDA,
              op: opPDA,
              lotteryTokenAccount: lotteryATA,
              devTokenAccount: devATA,
              mktTokenAccount: mktATA,
              signerTokenAccount: signerATA,
              burnTokenAccount: devATA,
            })
            .rpc();

          console.log('Successfully picked a winner');
        } catch (error) {
          console.error('Error picking a winner:', error);
          // alert(`Error: ${error.message}`);
        }
      } else {
        alert('Wallet is not connected. Please connect your wallet.');
      }
    } else {
      alert("Invalid lottery Id entropy, batch size, token or owner")
    }
  };
  const rollover = async () => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      // Create the program interface combining the IDL, program ID, and provider
      const program: any = new Program(
        lotteryProgramInterface,
        provider
      );


      try {
        const oldLotteryData = await program.account.lotteryInfo.fetch(oldLottery)
        const tokenPk = oldLotteryData.token
        const ownerPk = oldLotteryData.owner
        const lotteryNumber = oldLotteryData.lotteryId
        const seedsGlobal = [tokenPk.toBuffer(), ownerPk.toBuffer()];
        let globalPDA = PublicKey.findProgramAddressSync(
          seedsGlobal,
          program.programId
        )[0];
        let oldLotteryATA = await getAssociatedTokenAddress(
          tokenPk,
          new PublicKey(oldLottery),
          true
        );
        let newLotteryATA = await getAssociatedTokenAddress(
          tokenPk,
          new PublicKey(newLottery),
          true
        );
        let signerATA = await getAssociatedTokenAddress(
          tokenPk,
          wallet.publicKey
        );

        const recipientAccountInfo = await connection.getAccountInfo(newLotteryATA);
        const instructions = [];

        if (!recipientAccountInfo) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              newLotteryATA,
              new PublicKey(newLottery),
              tokenPk
            )
          );
        }
        if (instructions.length > 0) {
          const transaction = new Transaction().add(...instructions);
          transaction.feePayer = wallet.publicKey;
          transaction.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash

          // Sign and send the transaction
          const signedTransaction = await wallet.signTransaction(transaction);
          const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });

          // Confirm the transaction
          await connection.confirmTransaction(signature, 'confirmed');
          console.log("Transaction successful:", signature);
        }

        await program.methods.rollover(lotteryNumber, tokenPk, ownerPk)
          .accounts({
            oldLottery,
            newLottery,
            global: globalPDA,
            oldLotteryTokenAccount: oldLotteryATA,
            newLotteryTokenAccount: newLotteryATA
          })
          .rpc();

        console.log('Successfully rolled over funds to the new lottery');
      } catch (error) {
        console.error('Error during rollover:', error);
      }
    } else {
      alert('Wallet is not connected. Please connect your wallet.');
    }
  };

  return (
    <div className="min-h-screen bg-purple-600 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 px-4 py-2">
        <WalletMultiButtonDynamic />
      </div>

      <h1 className="text-4xl font-bold text-white mb-4">Create a New Lottery</h1>

      <div className="w-full max-w-2xl bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Create Lottery</span>
            <span className="text-sm">Fill in the information below</span>
          </div>
        </div>
        <div className={`p-6 space-y-4 ${isHidden ? 'hidden' : ''}`}>
          <div className="space-y-4">
            <div>
              <label htmlFor="lotteryId" className="block text-sm font-medium mb-1">
                Lottery ID {lotteryPDAStr}
              </label>
              <input
                id="lotteryId"
                type="text"
                placeholder="Enter lottery ID"
                value={lotteryId}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSetLotteryId(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="token" className="block text-sm font-medium mb-1">
                Token
              </label>
              <input
                id="token"
                type="text"
                placeholder="Enter token"
                value={token}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSetToken(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="owner" className="block text-sm font-medium mb-1">
                Owner
              </label>
              <input
                id="owner"
                type="text"
                placeholder="Enter lottery ID"
                value={owner}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSetOwner(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                role="switch"
                aria-checked={isRandomOutside}
                onClick={() => setIsRandomOutside(!isRandomOutside)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isRandomOutside ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`${isRandomOutside ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
              <label htmlFor="random-outside" className="text-sm font-medium">
                Random outside
              </label>
            </div>
            <div>
              <label htmlFor="ticketPrice" className="block text-sm font-medium mb-1">
                Ticket Price (Token)
              </label>
              <input
                id="ticketPrice"
                type="number"
                placeholder="Enter ticket price ex: 1"
                value={ticketPrice}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTicketPrice(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="ticketTax" className="block text-sm font-medium mb-1">
                Ticket Tax (SOL)
              </label>
              <input
                id="ticketTax"
                type="number"
                placeholder="Enter ticket tax ex: 0.01"
                value={ticketTax}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTicketTax(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="maxTickets" className="block text-sm font-medium mb-1">
                Maximum Tickets
              </label>
              <input
                id="maxTickets"
                type="number"
                placeholder="Enter maximum number of tickets"
                value={maxTickets}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxTickets(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <p>Lottery PDA {lotteryPDA && lotteryPDA}</p>
            </div>
          </div>
          <button
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition duration-200 ease-in-out"
            onClick={handleCreateLottery}
          >
            Create Lottery
          </button>
          <div>
            <label htmlFor="lotteryIdPick" className="block text-sm font-medium mb-1">
              Lottery Id Pick Winner
            </label>
            <input
              id="lotteryIdPick"
              type="number"
              placeholder="Enter lottery id to pick winner"
              value={lotteryIdPick}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLotteryIdPick(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="token" className="block text-sm font-medium mb-1">
              Token Pick Winner
            </label>
            <input
              id="token"
              type="text"
              placeholder="Enter token"
              value={tokenPick}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTokenPick(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="owner" className="block text-sm font-medium mb-1">
              Owner Pick Winner
            </label>
            <input
              id="owner"
              type="text"
              placeholder="Enter lottery ID"
              value={ownerPick}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setOwnerPick(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="entropy" className="block text-sm font-medium mb-1">
              Entropy
            </label>
            <input
              id="entropy"
              type="number"
              placeholder="Enter entropy to add to sorted number"
              value={entropy}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEntropy(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="batchSize" className="block text-sm font-medium mb-1">
              Batch size
            </label>
            <input
              id="batchSize"
              type="number"
              placeholder="Enter batch size"
              value={batchSize}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBatchSize(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition duration-200 ease-in-out"
            onClick={pickWinner}
          >
            Pick winner
          </button>
          <div>
            <label htmlFor="lastLottery" className="block text-sm font-medium mb-1">
              Last lottery
            </label>
            <input
              id="lastLottery"
              type="text"
              placeholder="Enter lottery id to pick winner"
              value={oldLottery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setOldLottery(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="newLottery" className="block text-sm font-medium mb-1">
              New lottery
            </label>
            <input
              id="newLottery"
              type="text"
              placeholder="Enter entropy to add to sorted number"
              value={newLottery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewLottery(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition duration-200 ease-in-out"
            onClick={rollover}
          >
            Rollover
          </button>
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-center">
          <button
            className="text-purple-400 hover:text-purple-300 flex items-center"
            onClick={() => setIsHidden(!isHidden)}
          >
            {isHidden ? (
              <>
                Show
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Hide
                <ChevronUp className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
