'use client';
import React from 'react'
import { useState, useEffect } from 'react'
import { ViemUtils } from "@/blockchain/viem";
import { parseEther } from 'viem';
const worcseContractABI = require('@/blockchain/contract/WorcseContract.json');
import bytecode from '@/blockchain/contract/bytecode';


class WorcseController {
    static deployProject = async (seller) => {
        ViemUtils.registerWalletClient(window);
        const address = await ViemUtils.getConnectedAddress();
        const buyer = address;
        const contract = await ViemUtils.deployContract({
            name: 'WorcseContract',
            abi: worcseContractABI.abi,
            bytecode: bytecode,
            args: [buyer, seller],
        });
        console.log(`Deployed New Contract => ${contract}`)
        return contract;
    }

    static performRefund = async (contract) => {
        ViemUtils.registerWalletClient(window);
        if (contract === null) return console.error('NULLCONTRACT');
        const res = await contract.write({
            functionName: 'refundFunds',
            args: []
        });
        console.log(res);
    }

    static performTransfer = async (contract) => {
        ViemUtils.registerWalletClient(window);
        if (contract === null) return console.error('NULLCONTRACT');
        const res = await contract.write({
            functionName: 'releaseFunds',
            args: []
        });
        console.log(res);
    }

    static getBalance = async (contract) => {
        if (contract === null) return console.error('NULLCONTRACT');
        const res = await contract.read({
            functionName: 'amount'
        });
        return Number(res) / 10 ** 18;
    }

    static deposit = async (contract, amtInEth) => {
        if (contract === null) return console.error('NULLCONTRACT');
        const res = await contract.write({
            functionName: 'depositFunds',
            value: parseEther(amtInEth),
        });
    }
}



const Playground = () => {
    const [escrowContract, setContract] = useState();
    const [userAddr, setUserAddr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [funds, setFunds] = useState(0);


    const initiate = async () => {
        setLoading(true);
        //TODO: handle the firebase shit here
        //TODO: Get the Seller's Wallet address
        const contract = await WorcseController.deployProject("0xBF667f7ab57ce8494856773b9b1486f8B276A680")
        setContract(contract);
        await setbalance(contract);
        setLoading(false);
    }

    const setbalance = async (contract) => {
        const bal = await WorcseController.getBalance(contract);
        console.log(`balance is => ${bal}`)
        setFunds(bal);
    }

    const refund = async () => {
        setLoading(true);
        await WorcseController.performRefund(escrowContract);
        await setbalance(escrowContract);
        setLoading(false);
    }

    const transfer = async () => {
        setLoading(true);
        await WorcseController.performTransfer(escrowContract);
        await setbalance(escrowContract);
        setLoading(false);

    }

    const send = async () => {
        setLoading(true);
        await WorcseController.deposit(escrowContract, '0.05');
        await setbalance(escrowContract);
        setLoading(false);
    }


    if (loading) {
        return <center>LOADING</center>
    }
    return (

        <div>
            <h1 className='text-center text-5xl uppercase p-4'>Worcse Playground</h1>
            {/* <center>
                {
                    (escrowContract) ? <h4 className='text-center text-1xl uppercase p-4'>Contract: {escrowContract.address}</h4> : <h4>No Contract</h4>
                }
            </center> */}



            <h4 className='text-center text-1xl uppercase p-4'>Balance: {funds} ETH</h4>
            <center>
                <div>
                    <button type='submit' className='p-2 m-4 border-2 border-slate-50 rounded-lg' onClick={initiate}>DEPLOY</button>
                    <button type='submit' className='p-2 m-4 border-2 border-slate-50 rounded-lg' onClick={send}>SEND</button>
                    <button type='submit' className='p-2 m-4 border-2 border-slate-50 rounded-lg' onClick={refund}>REFUND</button>
                    <button type='submit' className='p-2 m-4 border-2 border-slate-50 rounded-lg' onClick={transfer}>TRANSFER</button>
                </div>
            </center>

        </div>
    )
}

export default Playground