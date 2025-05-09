'use client'

import { useState, useEffect } from 'react';
import { auth, storage, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from 'firebase/auth';
import WorcseController from '../playground/controller';
import { ViemUtils, ViemContract } from '@/blockchain/viem';
import ChatInterface from '@/components/ChatInterface';

const HomePage = () => {
  const [currentUser, setCurrentUser] = useState('');
  const [file, setFile] = useState(null);
  const [myProjects, setMyProjects] = useState([])
  const [escrowContract, setContract] = useState();
  const [userAddr, setUserAddr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [walletError, setWalletError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Initialize wallet
    const initWallet = async () => {
      try {
        if (window.ethereum) {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Initialize ViemUtils
          await ViemUtils.registerWalletClient(window);
          const address = await ViemUtils.getConnectedAddress();
          setUserAddr(address);
          setWalletError(null);
        } else {
          setWalletError('Please install MetaMask or another Ethereum wallet');
        }
      } catch (err) {
        console.error('Failed to initialize wallet:', err);
        setWalletError('Failed to connect wallet. Please try again.');
      }
    };

    initWallet();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setUserAddr(null);
          setWalletError('Please connect your wallet');
        } else {
          setUserAddr(accounts[0]);
          setWalletError(null);
        }
      });
    }

    return () => {
      unsub();
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchProjects = async () => {
        try {
          // Query for projects where user is either DC or Supply Provider
          const q = query(
            collection(db, 'projects'),
            where('dcId', '==', currentUser.uid)
          );
          
          const spQuery = query(
            collection(db, 'projects'),
            where('spId', '==', currentUser.uid)
          );

          const [dcSnapshot, spSnapshot] = await Promise.all([
            getDocs(q),
            getDocs(spQuery)
          ]);

          const dcProjects = dcSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            userRole: 'DC'
          }));

          const spProjects = spSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            userRole: 'Supply Provider'
          }));

          setMyProjects([...dcProjects, ...spProjects]);
          
          // Set user role based on which query returned results
          if (dcProjects.length > 0) {
            setUserRole('DC');
          } else if (spProjects.length > 0) {
            setUserRole('Supply Provider');
          }

        } catch (e) {
          console.log('Error occurred: ', e);
        }
      };
      fetchProjects();
    }
  }, [currentUser]);

  const handleUpload = async (projectId) => {
    try {
      if (file) {
        setLoading(true);

        const storageRef = ref(storage, `uploads/${file.name}`);

        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);

        console.log("File uploaded. Download URL:", downloadURL);

        const addr = window.localStorage.getItem(`dep_contract_addr`);
        const contract = ViemContract.fromAddress(addr);
        console.log(`Instantiated Contract => ${contract}`)
        await WorcseController.performTransfer(contract)
        const projectRef = doc(db, 'projects', projectId); 
        await updateDoc(projectRef, { 
          completionStatus: 'completed',
          work: downloadURL,
          uploadedAt: new Date().toISOString(),
          fileName: file.name
        }); 
        setLoading(false);
        alert('Payment Complete');

        // Refresh projects after upload
        const updatedProject = {
          ...myProjects.find(p => p.id === projectId),
          completionStatus: 'completed',
          work: downloadURL,
          uploadedAt: new Date().toISOString(),
          fileName: file.name
        };
        setMyProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));

        setFile(null);
      } else {
        console.log("No file selected.");
      }
    } catch (e) {
      console.error("Error uploading file:", e);
      setLoading(false);
      alert('Error uploading file. Please try again.');
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth)
      console.log('Logged out')
      window.location.href = '/'
    } catch (e) {
      console.log('Error: ', e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              StreamPay Dashboard
            </h1>
            {userRole && (
              <p className="text-gray-400 mt-1">Logged in as: {userRole}</p>
            )}
          </div>
          <button 
            onClick={handleLogOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-6 text-gray-200">My Projects</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProjects.map((project) => (
                <div 
                  key={project.id}
                  className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700"
                >
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-400">{project.projectName}</h3>
                    
                    <div className="space-y-2 text-gray-300">
                      <p className="flex items-center">
                        <span className="text-gray-400 mr-2">Project ID:</span>
                        {project.projectId}
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-400 mr-2">Total Funds:</span>
                        <span className="text-green-400">{project.funds}</span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-400 mr-2">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          project.completionStatus === 'completed' 
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {project.completionStatus || 'In Progress'}
                        </span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-400 mr-2">Your Role:</span>
                        <span className="text-blue-400">{project.userRole}</span>
                      </p>
                      {project.work && (
                        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                          <p className="text-gray-400 mb-2">Uploaded Work:</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300 truncate">
                              {project.fileName || 'Work File'}
                            </span>
                            <a 
                              href={project.work} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View Work
                            </a>
                          </div>
                          {project.uploadedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded: {new Date(project.uploadedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 space-y-4">
                      {project.userRole === 'Supply Provider' && project.completionStatus !== 'completed' && (
                        <div className="relative">
                          <input 
                            type="file" 
                            onChange={(e) => setFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-500 file:text-white
                              hover:file:bg-blue-600
                              cursor-pointer"
                          />
                        </div>
                      )}
                      
                      <div className="flex space-x-4">
                        {project.userRole === 'Supply Provider' && project.completionStatus !== 'completed' && (
                          <button 
                            onClick={() => handleUpload(project.projectId)}
                            disabled={loading || !file}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200
                              ${loading || !file
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                          >
                            {loading ? 'Uploading...' : 'Upload & Complete'}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedProject && (
            <div className="lg:col-span-1">
              <ChatInterface 
                projectId={selectedProject.projectId}
                otherPartyId={selectedProject.userRole === 'DC' ? selectedProject.spId : selectedProject.dcId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage