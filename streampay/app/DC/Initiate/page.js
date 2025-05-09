'use client';
import React from 'react'
import { useState, useEffect } from 'react'
import Project from '../../../models/project'
import { db, auth } from '@/firebase';
import { collection, getDoc, addDoc, updateDoc, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { query, where } from "firebase/firestore"
import { onAuthStateChanged } from 'firebase/auth'
import WorcseController from '../../playground/controller';
import { ViemUtils } from '@/blockchain/viem';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const initiate = () => {
  const [fund, setFund] = useState(0);
  const [spId, setspId] = useState('');
  const [dcId, setdcId] = useState('');
  const [projId, setProjID] = useState('');
  const [name, setName] = useState('');
  const [completionStatus, setCompletionStatus] = useState('pending');
  const [currentUser, setCurrentUser] = useState(null)
  const [escrowContract, setContract] = useState();
  const [userAddr, setUserAddr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supplyProviders, setSupplyProviders] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Initialize wallet client
    const initWallet = async () => {
      try {
        if (window.ethereum) {
          ViemUtils.registerWalletClient(window);
          const address = await ViemUtils.getConnectedAddress();
          setUserAddr(address);
        } else {
          setError('Please install MetaMask or another Ethereum wallet');
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
        setError('Failed to connect wallet. Please try again.');
      }
    };

    // Fetch supply providers
    const fetchSupplyProviders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'supplyProvider'));
        const providers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Fetched supply providers:', providers);
        setSupplyProviders(providers);
      } catch (err) {
        console.error('Failed to fetch supply providers:', err);
        setError('Failed to load supply providers');
      }
    };

    initWallet();
    fetchSupplyProviders();
    return () => unsub();
  }, []);

  const initiate = async () => {
    try {
      if (!userAddr) {
        throw new Error('Wallet not connected');
      }
      const contract = await WorcseController.deployProject("0xBF667f7ab57ce8494856773b9b1486f8B276A680");
      setContract(contract);
      return contract;
    } catch (err) {
      console.error('Failed to deploy contract:', err);
      throw new Error('Failed to deploy contract. Please ensure your wallet is connected.');
    }
  }

  const send = async (contract) => {
    try {
      if (!userAddr) {
        throw new Error('Wallet not connected');
      }
      await WorcseController.deposit(contract, fund);
    } catch (err) {
      console.error('Failed to send deposit:', err);
      throw new Error('Failed to send deposit. Please try again.');
    }
  }

  const handleAddProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userAddr) {
        throw new Error('Please connect your wallet first');
      }

      if (name === '' || fund === 0 || spId === '') {
        throw new Error('Please fill in all fields');
      }

      // Get the selected supply provider's details
      const selectedProvider = supplyProviders.find(p => p.id === spId);
      if (!selectedProvider) {
        throw new Error('Selected supply provider not found');
      }

      console.log('Selected supply provider:', selectedProvider);

      const c = await initiate();
      await timeout(2000);
      console.log('Starting send!');

      // Create project document
      const docRef = await addDoc(collection(db, "projects"), {
        projectName: name,
        projectId: '', // Will be updated after creation
        spId: selectedProvider.supplyProviderId, // Use the supply provider's ID instead of document ID
        dcId: currentUser.uid, // Use DC's name
        completionStatus: completionStatus,
        funds: fund,
        spName: selectedProvider.supplyProviderName || selectedProvider.name // Store SP name for reference
      });

      // Update the project with its ID
      await updateDoc(docRef, {
        projectId: docRef.id
      });

      await send(c);
      alert("Contract Initiated successfully!");
      window.location.href = '/DC/dcHomePage';
    } catch (err) {
      console.error("Error occurred: ", err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-blue-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Initiate New Project
          </h1>
          <p className="mt-2 text-gray-400">Create a new project and connect with supply providers</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700">
          <form onSubmit={handleAddProject} className="space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="projectFund" className="block text-sm font-medium text-gray-300 mb-2">
                Project Fund (ETH)
              </label>
              <input
                type="number"
                id="projectFund"
                name="projectFund"
                placeholder="Enter project fund amount"
                value={fund}
                onChange={(e) => setFund(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                disabled={loading}
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="supplyProviderId" className="block text-sm font-medium text-gray-300 mb-2">
                Select Supply Provider
              </label>
              <select
                id="supplyProviderId"
                name="supplyProviderId"
                value={spId}
                onChange={(e) => setspId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                disabled={loading}
              >
                <option value="">Select a supply provider</option>
                {supplyProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.supplyProviderName || provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!userAddr || loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  !userAddr || loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02]'
                }`}
              >
                {!userAddr ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect Wallet First
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Project...
                  </span>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default initiate