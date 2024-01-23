'use client'

import { useState, useEffect } from 'react';
import { auth, storage, db } from "@/firebase";
import { signOut } from "firebase/auth";

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, query, where } from "firebase/firestore"
import { onAuthStateChanged } from 'firebase/auth';

const dc = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [myProjects, setMyProjects] = useState([])

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (currentUser != null) {
            const fetchProjects = async () => {
                try {

                    const q = query(collection(db, 'projects'), where('dcId', '==', currentUser.uid));
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
    const handleLogOut = async () => {
        try {
            await signOut(auth)
            console.log('Logged out')
            window.location.href = '/DC'
        } catch (e) {
            console.log('Error: ', e)
        }
    }
    return (
        <div>
            <h1 className='text-3xl text-center'>DC</h1>
            <button><a href='/DC/Initiate'>Initiate Project</a></button> <br />
            <button>My Projects</button><br />
            {myProjects.map((project) => {
                return (
                    <div key={project.id}>
                        <div className="pt-2 transform transition-transform bg-blue-900 rounded-md pl-4 m-4">

                            <p className="font-bold font-sans hover:text-blue-500">{project.projectName}</p>
                            <div className="text-gray-300 font-semibold font-sans">
                                <p className="">DC ID: {project.dcId}</p>
                                <p>TOTAL FUNDS: {project.funds}</p>
                                <p className="pb-3">ProjectStatus: {project.completionStatus}</p>


                            </div>
                        </div>
                    </div>
                )

            })}
            <button onClick={handleLogOut} className='bg-blue-500 rounded-lg p-2'>Log out</button>
        </div>
    )
}

export default dc