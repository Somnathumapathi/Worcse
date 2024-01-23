'use client';
import React from 'react'
import { useState, useEffect } from 'react'
import Project from '../../../models/project'
import { db, auth } from '@/firebase';
import { collection, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { query, where } from "firebase/firestore"
import { onAuthStateChanged } from 'firebase/auth'
import WorcseController from '../../playground/controller';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const initiate = () => {
  // const [items, setItems] = useState([]);
  // const [selectedItems, setSelectedItems] = useState([]);
  // const [totalPrice, setTotalPrice] = useState(0);
  // const [totalCalories, setTotalCalories] = useState(0);
  // const [totalCarb, setTotalCarb] = useState(0);
  // const [totalProtein, setTotalProtein] = useState(0);
  // const [totalfat, setTotalfat] = useState(0);
  // const [phno, setPhno] = useState(0);
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

  const initiate = async () => {
    const contract = await WorcseController.deployProject("0xBF667f7ab57ce8494856773b9b1486f8B276A680")
    setContract(contract);
    return contract;
  }

  const send = async (contract) => {
    await WorcseController.deposit(contract, fund);
    // await setbalance(contract);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsub();
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();

    setLoading(true);
    const c = await initiate();
    await timeout(2000);
    console.log('Starting send!');
    try {
      if (name != '' && fund != 0 && spId != '') {
        // const itemNames = selectedItems.map(item => (item.name))
        const newProject = new Project(name, projId, spId, currentUser.uid, completionStatus, fund);
        const docRef = await addDoc(collection(db, "projects"), {
          projectName: newProject.projectName,
          projectId: newProject.projectId,
          spId: newProject.supplyProviderId,
          dcId: newProject.dcId,
          completionStatus: newProject.completionStatus,
          funds: newProject.funds
        })
        const projectSnapshot = await getDoc(docRef)
        const updatedData = {
          ...projectSnapshot.data(), // Maintain existing data
          projectId: docRef.id, // Update the specific field
        };
        // const projectId = docRef.id();
        await updateDoc(docRef, updatedData);

        //Make the Payment
        await send(c);
        setLoading(false);
        alert("Contract Initiated successfully!")
        window.location.href = '/DC/dcHomePage';
      } else {
        alert("Enter all the fields")
      }
      setLoading(false);
    } catch (e) {
      console.log("Error occured: ", e)
      setLoading(false);
    }
  }


  if (loading) {
    return <center>LOADING</center>
  }

  return (
    <div>
      <h1 className='text-center text-3xl uppercase p-4'>Initiate a New Project</h1>
      <div>
        <div>    Enter project details: </div>
        <form onSubmit={handleAddProject}>
          <input type="text" name="projectName" placeholder='Project Name' value={name} onChange={(e) => setName(e.target.value)} className='p-2 px-4 m-4 rounded-lg text-black' /><br />
          <input type='number' name='projectFund' placeholder='Project Fund' value={fund} onChange={(e) => setFund(e.target.value)} className='p-2 px-4 m-4 rounded-lg text-black' /> <br />
          <input type='text' name='supplyProviderID' placeholder='Supply Provider ID' value={spId} onChange={(e) => setspId(e.target.value)} className='p-2 px-4 m-4 rounded-lg text-black' /> <br />
          <button type='submit' name='SUBMIT' className='p-2 m-4 border-2 border-slate-50 rounded-lg'>Submit</button>
        </form>
      </div>
    </div>
  )
}

export default initiate