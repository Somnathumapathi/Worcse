"use client";

import { createWalletClient, custom, createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { parseEther, getAddress, decodeEventLog, parseAbi } from 'viem';
import { ganache } from './ganache';
const worcseContractABI = require('@/blockchain/contract/WorcseContract.json');
const API_URL = 'https://31a0-117-254-38-136.ngrok-free.app';

let eventUnsubscriberList = [];

class ViemUtils {

    static walletClient = null;
    static publicClient = null;
    static initialized = false;
    static chain = ganache;



    static registerWalletClient = (windowObject) => {
        this.walletClient = createWalletClient({
            chain: this.chain,
            transport: custom(windowObject.ethereum)
        });
        this.publicClient = createPublicClient({
            chain: this.chain,
            transport: http(API_URL)
        });
        this.initialized = true;
        console.log('walletclient registered with window');
    }

    static getConnectedAddress = async () => {
        if (!this.initialized) return this.handleWalletClientUninitializedCase();
        const [addr] = await this.walletClient.getAddresses();
        return getAddress(addr);
    }

    static sendTransaction = async ({ from, to, valueInEth }) => {
        if (!this.initialized) return this.handleWalletClientUninitializedCase();
        if (from === undefined) {
            from = await this.getConnectedAddress();
            console.log(`sendTransaction: 'from' address automatically set to: ${from}`)
        }
        const hash = await this.walletClient.sendTransaction({
            account: from,
            to: to,
            value: parseEther(valueInEth)
        })
        console.log(`TXHash: ${hash}`);

        const txdata = await this.publicClient.waitForTransactionReceipt({ hash: hash });
        console.log(txdata);
        return txdata;
    }

    static getBalanceInWei = async (addr) => {
        if (!this.initialized) return this.handleWalletClientUninitializedCase();
        return await this.publicClient.getBalance({
            address: addr
        });
    }

    static signMessage = async (message) => {
        const account = await this.getConnectedAddress();
        const signature = await walletClient.signMessage({
            account,
            message: message,
        });
        return signature;
    }

    static deployContract = async ({
        name,
        abi,
        bytecode,
        args,
    }) => {
        if (!this.initialized) throw new Error('ViemUtils uninitialized!');
        const account = await this.getConnectedAddress();
        const hash = await ViemUtils.walletClient.deployContract({
            abi: abi,
            account: account,
            bytecode: bytecode,
            args: args,
            gas: 5000000,
        });
        const txdata = await this.publicClient.waitForTransactionReceipt({ hash: hash });
        console.log(txdata);
        const contractAddress = txdata.contractAddress;
        console.log(`Contract Deployed to Address: ${contractAddress}`);
        window.localStorage.setItem(`dep_contract_addr`, contractAddress);

        const contract = new ViemContract({
            name: name,
            abi: abi,
            address: contractAddress,
        })
        return contract;
    }


    static handleWalletClientUninitializedCase() {
        console.error('WalletClient uninitialized!!!!');
    }
}




class ViemContract {
    contractName = null;
    contractABI = null;
    contractAddress = null;
    initialized = false;

    static fromAddress(addr) {
        ViemUtils.registerWalletClient(window);
        return new ViemContract({
            name: 'Worcse',
            abi: worcseContractABI.abi,
            address: addr,
        })
    }

    constructor({ name, abi, address }) {
        if (!ViemUtils.initialized) throw new Error('ViemUtils uninitialized!');
        this.contractABI = abi;
        this.contractAddress = address;
        this.contractName = name;
        this.initialized = true;
        console.log(`ViemContract(${this.contractName}) initialized!`);
    }


    write = async ({ functionName, args = [], value }) => {
        if (!ViemUtils.initialized) return handleUnitializedUtils();
        if (!this.initialized) return handleUninitializedContract();
        const account = await ViemUtils.getConnectedAddress();
        const { request } = await ViemUtils.publicClient.simulateContract({
            account,
            address: this.contractAddress,
            abi: this.contractABI,
            args: [...args],
            value: value,
            functionName: functionName,
        })
        const hash = await ViemUtils.walletClient.writeContract(request);
        const txdata = await ViemUtils.publicClient.waitForTransactionReceipt({ hash: hash });
        return txdata;
    }

    read = async ({ functionName, args = [] }) => {
        if (!ViemUtils.initialized) return handleUnitializedUtils();
        if (!this.initialized) return handleUninitializedContract();
        const data = await ViemUtils.publicClient.readContract({
            address: this.contractAddress,
            abi: this.contractABI,
            functionName: functionName,
            args: [...args]
        });
        return data;
    }


    listenToEvent = ({ eventDefinition, indexedArguments, callback }) => {
        if (!this.initialized) return handleUninitializedContract();
        const eventName = eventDefinition.substring(6, eventDefinition.indexOf('('));
        const unwatch = ViemUtils.publicClient.watchContractEvent({
            address: this.contractAddress,
            abi: this.contractABI,
            eventName: eventName,
            args: indexedArguments !== undefined ? { ...indexedArguments } : undefined,
            onLogs: logs => {
                const parsedData = decodeEventLog({
                    abi: parseAbi([eventDefinition]),
                    data: logs[0].data,
                    topics: logs[0].topics,
                    strict: false
                });
                callback(parsedData);
            }
        });
        eventUnsubscriberList.push({
            contract: this.contractName,
            dispose: unwatch,
        });
        console.log(`Started Listening to ${eventName} event`);
    }


    getEventLog = async ({ eventName }) => {
        if (!ViemUtils.initialized) return handleUnitializedUtils();
        if (!this.initialized) return handleUninitializedContract();
        const logs = await ViemUtils.publicClient.getContractEvents({
            abi: this.contractABI,
            address: this.contractAddress,
            eventName: eventName,
        });
        console.log(`Received Logs => ${logs}`);
        return logs;
    }


    stopListeningToEvents = async () => {
        const remlist = eventUnsubscriberList.filter((x) => x.contract !== this.contractName);
        const evlist = eventUnsubscriberList.filter((x) => x.contract === this.contractName);
        for (let ev of evlist) {
            await ev.dispose();
        }
        eventUnsubscriberList = [...remlist];
    }


    handleUninitializedContract() {
        throw new Error('ViemContract uninitialized!!!!');
    }

    handleUnitializedUtils() {
        throw new Error('ViemUtils uninitialized!!!!');
    }
}




export { ViemUtils, ViemContract };