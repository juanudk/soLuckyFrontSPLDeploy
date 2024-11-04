'use client'

import { useState, ChangeEvent } from 'react'
import { ChevronUp, ChevronDown } from "lucide-react"
import dynamic from 'next/dynamic';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { commitmentLevel, lotteryProgramInterface } from '../utils/constants';
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function Component() {
  const [isHidden, setIsHidden] = useState(false)
  const [lotteryId, setLotteryId] = useState('')
  const [isRandomOutside, setIsRandomOutside] = useState<boolean>(false)
  const [ticketPrice, setTicketPrice] = useState('')
  const [lotteryPDA, setLotteryPDA] = useState('')
  const [maxTickets, setMaxTickets] = useState('')
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const handleCreateLottery = async () => {
    console.log('Creating lottery with:', { lotteryId, isRandomOutside, ticketPrice, maxTickets })
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      /* Create the program interface combining the IDL, program ID, and provider */
      const program = new Program(lotteryProgramInterface as any, provider);

      // Generate the PDA for the Dev account using the specified seed
      let lotteryIdBN = new anchor.BN(lotteryId); // Change as necessary
      let ticketPriceBN = new anchor.BN(Number(ticketPrice) * LAMPORTS_PER_SOL)
      let maxTicketsBN = new anchor.BN(maxTickets)
      const seedsLottery = [lotteryIdBN.toArrayLike(Buffer, "le", 8)];
      // Check if the account exists and fetch its balance if needed
      const lotteryPDA = anchor.web3.PublicKey.findProgramAddressSync(seedsLottery, program.programId)[0];
      const bal = await connection.getBalance(lotteryPDA);
      if (bal > 0) {
        console.log(`Account ${lotteryPDA} is already initialized`);
        return;
      }else{
        await program.methods.initialize(lotteryIdBN, isRandomOutside, ticketPriceBN, maxTicketsBN).accounts({ lotteryInfo: lotteryPDA }).rpc()
        setLotteryPDA(`${lotteryPDA}`)
      }
      alert('Lottery created successfully!')
    } else {
      alert("Wallet is not connected. Please connect your wallet.");
    }
  }

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
                Lottery ID
              </label>
              <input
                id="lotteryId"
                type="text"
                placeholder="Enter lottery ID"
                value={lotteryId}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLotteryId(e.target.value)}
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
                Ticket Price (SOL)
              </label>
              <input
                id="ticketPrice"
                type="number"
                placeholder="Enter ticket price"
                value={ticketPrice}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTicketPrice(e.target.value)}
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
