import { ViemUtils } from "@/blockchain/viem";
import { parseEther } from 'viem';
const worcseContractABI = require('@/blockchain/contract/WorcseContract.json');
import bytecode from '@/blockchain/contract/bytecode';

class WorcseController {
    static async initializeWallet() {
        try {
            await ViemUtils.registerWalletClient(window);
            return true;
        } catch (error) {
            console.error('Failed to initialize wallet:', error);
            throw error;
        }
    }

    static deployProject = async (seller) => {
        try {
            await this.initializeWallet();
            const address = await ViemUtils.getConnectedAddress();
            const buyer = address;
            const contract = await ViemUtils.deployContract({
                name: 'WorcseContract',
                abi: worcseContractABI.abi,
                bytecode: bytecode,
                args: [buyer, seller],
            });
            console.log(`Deployed New Contract => ${contract}`);
            return contract;
        } catch (error) {
            console.error('Failed to deploy project:', error);
            throw error;
        }
    }

    static performRefund = async (contract) => {
        try {
            await this.initializeWallet();
            if (contract === null) throw new Error('Contract is null');
            const res = await contract.write({
                functionName: 'refundFunds',
                args: []
            });
            console.log(res);
            return res;
        } catch (error) {
            console.error('Failed to perform refund:', error);
            throw error;
        }
    }

    static performTransfer = async (contract) => {
        try {
            await this.initializeWallet();
            if (contract === null) throw new Error('Contract is null');
            const res = await contract.write({
                functionName: 'releaseFunds',
                args: []
            });
            console.log(res);
            return res;
        } catch (error) {
            console.error('Failed to perform transfer:', error);
            throw error;
        }
    }

    static getBalance = async (contract) => {
        try {
            if (contract === null) throw new Error('Contract is null');
            const res = await contract.read({
                functionName: 'amount'
            });
            return Number(res) / 10 ** 18;
        } catch (error) {
            console.error('Failed to get balance:', error);
            throw error;
        }
    }

    static deposit = async (contract, amtInEth) => {
        try {
            await this.initializeWallet();
            if (contract === null) throw new Error('Contract is null');
            const res = await contract.write({
                functionName: 'depositFunds',
                value: parseEther(amtInEth),
            });
            return res;
        } catch (error) {
            console.error('Failed to deposit:', error);
            throw error;
        }
    }
}

export default WorcseController;