'use client';
import React from 'react'
import { useState, useEffect } from 'react'
import Project from '../../../models/project'
import { db, auth } from '@/firebase';
import { collection, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { query, where } from "firebase/firestore"
import { onAuthStateChanged } from 'firebase/auth';


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
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return () => unsub();
    }, []);

    const handleAddProject = async (e) => {
        e.preventDefault();
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
                
                alert("Project Initiated successfully!")
                window.location.href = '/DC/dcHomePage';
            } else {
                alert("Enter all the fields")
            }

        } catch (e) {
            console.log("Error occured: ", e)
        }
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