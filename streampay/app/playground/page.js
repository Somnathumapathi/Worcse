'use client';
import React from 'react'
import { useState, useEffect } from 'react'
import WorcseController from './controller';

const Playground = () => {
    const [escrowContract, setContract] = useState();
    const [userAddr, setUserAddr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [funds, setFunds] = useState(0);
    const [error, setError] = useState(null);

    const initiate = async () => {
        try {
            setLoading(true);
            setError(null);
            //TODO: handle the firebase shit here
            //TODO: Get the Seller's Wallet address
            const contract = await WorcseController.deployProject("0xBF667f7ab57ce8494856773b9b1486f8B276A680")
            setContract(contract);
            await setbalance(contract);
        } catch (error) {
            console.error('Failed to initiate:', error);
            setError(error.message || 'Failed to initialize project');
        } finally {
            setLoading(false);
        }
    }

    const setbalance = async (contract) => {
        try {
            const bal = await WorcseController.getBalance(contract);
            console.log(`balance is => ${bal}`)
            setFunds(bal);
        } catch (error) {
            console.error('Failed to get balance:', error);
            setError(error.message || 'Failed to get balance');
        }
    }

    const refund = async () => {
        try {
            setLoading(true);
            setError(null);
            await WorcseController.performRefund(escrowContract);
            await setbalance(escrowContract);
        } catch (error) {
            console.error('Failed to refund:', error);
            setError(error.message || 'Failed to perform refund');
        } finally {
            setLoading(false);
        }
    }

    const transfer = async () => {
        try {
            setLoading(true);
            setError(null);
            await WorcseController.performTransfer(escrowContract);
            await setbalance(escrowContract);
        } catch (error) {
            console.error('Failed to transfer:', error);
            setError(error.message || 'Failed to perform transfer');
        } finally {
            setLoading(false);
        }
    }

    const send = async () => {
        try {
            setLoading(true);
            setError(null);
            await WorcseController.deposit(escrowContract, '0.05');
            await setbalance(escrowContract);
        } catch (error) {
            console.error('Failed to send:', error);
            setError(error.message || 'Failed to send funds');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Playground</h1>
                
                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Contract Balance</h2>
                        <p className="text-2xl text-blue-400">{funds} ETH</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={initiate}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Initiate
                        </button>
                        <button
                            onClick={refund}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Refund
                        </button>
                        <button
                            onClick={transfer}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Transfer
                        </button>
                        <button
                            onClick={send}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Send 0.05 ETH
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Playground;