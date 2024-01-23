'use client'

import { useState, useEffect } from 'react';
import { auth, storage, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, query, where } from "firebase/firestore"
import { onAuthStateChanged } from 'firebase/auth';

const HomePage = () => {
    const [currentUser, setCurrentUser] = useState('');
    const [file, setFile] = useState(null);
    const [myProjects, setMyProjects] = useState([])

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if(currentUser) {
        const fetchProjects = async () => {
    try{
        
            const q = query(collection(db, 'projects'), where('spId', '==', currentUser.uid));
        const snap = await getDocs(q);
        const projectsData = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setMyProjects(projectsData)
        console.log('Fetched', currentUser.uid)
        
       
        
    } catch (e) {
        console.log('Error occured: ', e)
    }
        } 
        fetchProjects()
    }

    }, [currentUser])

      const handleUpload = async () => {
        try {
          if (file) {
            
            const storageRef = ref(storage, `uploads/${file.name}`);
    
            await uploadBytes(storageRef, file);
    
            
            const downloadURL = await getDownloadURL(storageRef);
    
            console.log("File uploaded. Download URL:", downloadURL);
    
            setFile(null);
          } else {
            console.log("No file selected.");
          }
        } catch (e) {
          console.error("Error uploading file:", e);
        }
      };

      const handleLogOut = async () => {
        try{
          await signOut(auth)
          console.log('Logged out')
          window.location.href='/'
        } catch (e) {
          console.log('Error: ', e)
        }
      }
    return (
        <div>
            <h1>HomePage</h1>
            <h2>My projects:</h2>
            {myProjects.map((project)=> { return (
                <div key={project.id}>
                <div className="pt-2 transform transition-transform bg-blue-900 rounded-md pl-4 m-4">

<p className="font-bold font-sans hover:text-blue-500">{project.projectName}</p>
<div className="text-gray-300 font-semibold font-sans">
<p className="">DC ID: 753Y629838</p>
<p>TOTAL FUNDS: 1000</p>
<p className="pb-3">ProjectStatus: In progress</p>
<button className="absolute bottom-5 right-5 rounded-md bg-slate-500 p-2 hover:bg-white hover:scale-103 duration-300" onClick={handleUpload}>Upload</button>
<input type="file" className='pb-3' onChange={(e) => setFile(e.target.files[0])} />
</div>
</div>
            </div>
            )
                
            })}

            <button onClick={handleLogOut}>Logout</button>
        </div>
        
    )
}
export default HomePage