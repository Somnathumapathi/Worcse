'use client';
import React from 'react'
import { useState, useEffect } from 'react'
import WorcseController from './controller';

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