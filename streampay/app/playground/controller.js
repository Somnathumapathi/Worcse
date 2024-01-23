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


export default WorcseController;