'use client'
import { useState, ChangeEvent } from 'react'
import dynamic from 'next/dynamic';
import { ChevronUp, ChevronDown } from "lucide-react"
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
import * as anchor from "@coral-xyz/anchor";
import {
  connection,
  commitmentLevel,
  lotteryProgramId,
  lotteryProgramInterface,
  mkt,
  dev
} from "../utils/constants";
import { Lottery } from '../types/lottery';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export default function Component() {
  const [isHidden, setIsHidden] = useState(false)
  const [userPrize, setUserPrize] = useState(500)
  const [isClaimed, setIsClaimed] = useState(false)
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [userTickets, setUserTickets] = useState([
    { id: 1, numbers: [1, 2, 3, 4, 5, 6] },
    { id: 2, numbers: [7, 8, 9, 10, 11, 12] },
    { id: 3, numbers: [13, 14, 15, 16, 17, 18] },
  ])
  const [newTicketNumbers, setNewTicketNumbers] = useState(['', '', '', '', '', ''])

  //const claimPrize = () => {
    //setIsClaimed(true)
    //// In a real application, you would call an API or smart contract here
  //}

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...newTicketNumbers]
    newNumbers[index] = value
    setNewTicketNumbers(newNumbers)
  }

  const handlePickWinner = () => {
    const key = 1; // Replace with the actual key value needed
    const batchSize = 10; // Replace with the desired batch size
    pickWinner(key, batchSize);
  };

  const buyTicket = async () => {
    // Validate all fields are filled and numbers are between 1 and 99
    if (newTicketNumbers.some(num => num === '' || parseInt(num) < 0 || parseInt(num) > 9)) {
      alert('Please fill all fields with numbers between 1 and 99')
      return
    }
    if (wallet) {
      const newTicket = {
        id: userTickets.length + 1,
        numbers: newTicketNumbers.map(num => parseInt(num)),
      }
      const lotteryNumber = new anchor.BN(1)
      //setUserTickets([...userTickets, newTicket])
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });

      if (!provider) return;

      /* create the program interface combining the idl, program Id, and provider */
      console.log("wallet")
      const program = new Program(
        lotteryProgramInterface as any,
        provider
      );

      const seedsUser = [lotteryNumber.toArrayLike(Buffer, "le", 8), wallet.publicKey.toBuffer()];
      let valueAccountUser = PublicKey.findProgramAddressSync(
        seedsUser,
        program.programId
      )[0];
      const bal = await connection.getBalance(valueAccountUser);
      const chosedNumber =  new anchor.BN("1"+newTicketNumbers.join(""))
      if (bal == 0) {
        console.log(`Account ${valueAccountUser} should be initialized`)
        await program.methods.initializeUser(lotteryNumber).accounts({ user: valueAccountUser }).rpc()
      } else {
        console.log(`Account ${valueAccountUser} already initialized`)
      }
      const seeds = [new anchor.BN(lotteryNumber).toArrayLike(Buffer, "le", 8)];
      let valueAccount = anchor.web3.PublicKey.findProgramAddressSync(
        seeds,
        program.programId
      )[0];
      await program.methods.buyTicket(lotteryNumber, chosedNumber).accounts({ lotteryInfo: valueAccount, dev, mkt, user: valueAccountUser }).rpc()

      setUserTickets([...userTickets, newTicket])
      setNewTicketNumbers(['', '', '', '', '', '']) // Reset input fields
    }
  }
  const OP_WALLET = new anchor.web3.PublicKey("9TFNhwunYo48L5vaW2HLNoCgrwkipy7YZqekAoZABwuK"); // Replace with the actual OP_WALLET key

  const pickWinner = async (batchSize) => {
    // Ensure the wallet is connected
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });
  
      if (!provider) return;
  
      // Create the program interface combining the IDL, program ID, and provider
      const program = new Program(
        lotteryProgramInterface as any,
        provider
      );
  
      // Generate a random number for entropy
      const entropy = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  
      // Execute the pick_winner method
      try {
        await program.methods.pickWinner(OP_WALLET.toBuffer(), entropy, batchSize)
          .accounts({
            lotteryInfo: lotteryInfoAccount, // Replace with the actual lottery account
            signer: wallet.publicKey,         // The wallet making the claim
          })
          .rpc();
  
        console.log('Successfully picked a winner');
      } catch (error) {
        console.error('Error picking a winner:', error);
        alert(`Error: ${error.message}`);
      }
    } else {
      alert('Wallet is not connected. Please connect your wallet.');
    }
  };
  
  const claimPrize = async () => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });
  
      if (!provider) return;
  
      // Create the program interface combining the IDL, program ID, and provider
      const program = new Program(
        lotteryProgramInterface as any,
        provider
      );
  
      try {
        await program.methods.claimPrize()
          .accounts({
            lotteryInfo: lotteryAccount, // Replace with the actual lottery account
            signer: wallet.publicKey,
            user: userAccount, // Replace with the actual user account
          })
          .rpc();
  
        console.log('Successfully claimed prize');
      } catch (error) {
        console.error('Error claiming prize:', error);
        alert(`Error: ${error.message}`);
      }
    } else {
      alert('Wallet is not connected. Please connect your wallet.');
    }
  };

  const claimDev = async () => {
    // Ensure the wallet is connected
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });
  
      if (!provider) return;
  
      // Create the program interface combining the IDL, program ID, and provider
      const program = new Program(
        lotteryProgramInterface as any,
        provider
      );
  
      // The infoAccount should be defined as the account holding the developer funds
      const infoAccount = dev; // Replace with the correct public key or variable if necessary
  
      // Execute the claim_dev method
      try {
        await program.methods.claimDev()
          .accounts({
            info: infoAccount,
            signer: wallet.publicKey, // The wallet making the claim
          })
          .rpc();
  
        console.log('Successfully claimed developer funds');
      } catch (error) {
        console.error('Error claiming developer funds:', error);
        alert(`Error: ${error.message}`);
      }
    } else {
      alert('Wallet is not connected. Please connect your wallet.');
    }
  };

  const claimMkt = async () => {
    // Ensure the wallet is connected
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });
  
      if (!provider) return;
  
      // Create the program interface combining the IDL, program ID, and provider
      const program = new Program(
        lotteryProgramInterface as any,
        provider
      );
  
      // The infoAccount should be defined as the account holding the market funds
      const infoAccount = mkt; // Replace with the correct public key or variable if necessary
  
      // Execute the claim_mkt method
      try {
        await program.methods.claimMkt()
          .accounts({
            info: infoAccount,
            signer: wallet.publicKey, // The wallet making the claim
          })
          .rpc();
  
        console.log('Successfully claimed market funds');
      } catch (error) {
        console.error('Error claiming market funds:', error);
        alert(`Error: ${error.message}`);
      }
    } else {
      alert('Wallet is not connected. Please connect your wallet.');
    }
  };

  const rollover = async () => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitmentLevel,
      });
  
      if (!provider) return;
  
      // Create the program interface combining the IDL, program ID, and provider
      const program = new Program(
        lotteryProgramInterface as any,
        provider
      );
  
      // Check if the connected wallet is the OP wallet
      if (wallet.publicKey.toString() !== OP_WALLET.toString()) {
        alert('You do not have permission to perform this action.');
        return;
      }
  
      // Retrieve the old lottery account and new lottery account (replace with actual accounts)
      const oldLotteryAccount = oldLotteryAccount; // Replace with the actual old lottery account
      const newLotteryAccount = newLotteryAccount; // Replace with the actual new lottery account
  
      try {
        await program.methods.rollover()
          .accounts({
            oldLottery: oldLotteryAccount,
            newLottery: newLotteryAccount,
            signer: wallet.publicKey,
          })
          .rpc();
  
        console.log('Successfully rolled over funds to the new lottery');
      } catch (error) {
        console.error('Error during rollover:', error);
        alert(`Error: ${error.message}`);
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

      <h1 className="text-4xl font-bold text-white mb-4">Get your tickets now!</h1>

      <div className="text-2xl font-bold text-yellow-300 mb-8">
        6<span className="text-lg">h</span> 49<span className="text-lg">m</span> until the draw
      </div>

      <div className="w-full max-w-2xl bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Next Draw</span>
            <span className="text-sm">#1432 | Draw: Oct 29, 2024, 9:00 PM</span>
          </div>
        </div>
        <div className={`p-6 space-y-4 ${isHidden ? 'hidden' : ''}`}>
          <div className="flex justify-between items-center">
            <span className="text-xl">Prize Pot</span>
            <span className="text-3xl text-purple-400">~$31,453</span>
          </div>
          <div className="text-sm text-gray-400">16,925 SOL</div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Your Prize</h3>
            <div className="flex justify-between items-center">
              <span className="text-2xl text-green-400">{userPrize} SOL</span>
              <button
                onClick={claimPrize}
                disabled={isClaimed}
                className={`px-4 py-2 rounded-md ${isClaimed ? 'bg-gray-600 text-gray-400' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                {isClaimed ? "Claimed" : "Claim Prize"}
              </button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Your tickets</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {userTickets.map((ticket) => (
                <div key={ticket.id} className="bg-gray-700 p-2 rounded-md text-xs">
                  <div className="font-semibold mb-1">Ticket #{ticket.id}</div>
                  <div className="flex justify-between">
                    {ticket.numbers.map((number, index) => (
                      <span key={index} className="bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center">
                        {number}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-center">Buy a new ticket</h4>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {newTicketNumbers.map((num, index) => (
                  <input
                    key={index}
                    type="number"
                    min="1"
                    max="99"
                    value={num}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumberChange(index, e.target.value)}
                    className="bg-gray-700 text-white rounded-md p-2 w-full"
                    placeholder={(index + 1).toString()}
                  />
                ))}
              </div>
              <button
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md"
                onClick={buyTicket}
              >
                Buy Ticket
              </button>
            </div>
            
          </div>
          <div className="text-sm">
            Match the winning number in the same order to share prizes. Current prizes up for grabs:
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Match first 3', value: '846 SOL', subvalue: '$1,573' },
              { label: 'Match first 4', value: '1,693 SOL', subvalue: '$3,145' },
              { label: 'Match first 5', value: '3,385 SOL', subvalue: '$6,291' },
              { label: 'Match all 6', value: '6,770 SOL', subvalue: '$12,581' },
            ].map((item, index) => (
              <div key={index} className="text-sm">
                <div className="text-purple-400">{item.label}</div>
                <div>{item.value}</div>
                <div className="text-gray-500">~{item.subvalue}</div>
              </div>
            ))}
          </div>
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
