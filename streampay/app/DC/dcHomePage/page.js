'use client'

import { useState, useEffect } from 'react';
import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore"
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogOut, Plus, ExternalLink, MessageSquare } from 'lucide-react'
import ChatInterface from '@/components/ChatInterface';

const DCDashboard = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);

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
                        projectId: doc.id,
                        ...doc.data(),
                        userRole: 'DC'
                    }));
                    console.log('Fetched projects:', projectsData);
                    setMyProjects(projectsData);
                    setLoading(false);
                } catch (e) {
                    console.log('Error occurred: ', e);
                    setLoading(false);
                }
            }
            fetchProjects();
        }
    }, [currentUser]);

    const handleLogOut = async () => {
        try {
            await signOut(auth);
            console.log('Logged out');
            window.location.href = '/DC';
        } catch (e) {
            console.log('Error: ', e);
        }
    }

    const handleProjectSelect = (project) => {
        console.log('Selected project:', project);
        setSelectedProject(project);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        DC Dashboard
                    </h1>
                    <div className="flex space-x-4">
                        <Button asChild variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                            <Link href="/DC/Initiate">
                                <Plus className="mr-2 h-4 w-4" /> Initiate Project
                            </Link>
                        </Button>
                        <Button onClick={handleLogOut} variant="destructive">
                            <LogOut className="mr-2 h-4 w-4" /> Log out
                        </Button>
                    </div>
                </header>

                <main>
                    <h2 className="text-2xl font-semibold mb-6">My Projects</h2>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        </div>
                    ) : myProjects.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {myProjects.map((project) => (
                                        <Card key={project.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-all duration-300">
                                            <CardHeader>
                                                <CardTitle className="text-xl font-bold text-purple-400">{project.projectName}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <p className="text-gray-400">Project ID: {project.projectId}</p>
                                                    <p className="text-gray-400">Total Funds: <span className="text-green-400">{project.funds} ETH</span></p>
                                                    <p className="text-white">Status: 
                                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                            project.completionStatus === 'completed' ? 'bg-green-500' :
                                                            project.completionStatus === 'in progress' ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}>
                                                            {project.completionStatus || 'pending'}
                                                        </span>
                                                    </p>
                                                    <div className="flex space-x-3 pt-2">
                                                        <Button 
                                                            onClick={() => handleProjectSelect(project)}
                                                            variant="secondary" 
                                                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                        >
                                                            <MessageSquare className="mr-2 h-4 w-4" /> Chat
                                                        </Button>
                                                        {project.work && (
                                                            <Button asChild variant="secondary" className="flex-1">
                                                                <Link href={project.work}>
                                                                    <ExternalLink className="mr-2 h-4 w-4" /> View Work
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {selectedProject && (
                                <div className="lg:col-span-1">
                                    <ChatInterface 
                                        projectId={selectedProject.projectId}
                                        otherPartyId={selectedProject.spId}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400">No projects found. Start by initiating a new project!</p>
                    )}
                </main>
            </div>
        </div>
    )
}

export default DCDashboard