'use client'

import Link from 'next/link'
import {auth} from '@/firebase'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    
    return () => unsub();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully!');
      console.log(auth.currentUser.uid)
      
    } catch (error) {
      console.error('Error signing in:', error.message);
    }
  };
  useEffect(() => {
    if (currentUser!=null) {
      window.location.href = 'homePage';
    }
  }, [currentUser]);
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-black flex-col">
      <h1 className="text-5xl font-bold text-blue-500 mb-3 display-block uppercase">Worcse</h1>
      <h2 className="text-3xl text-blue-500 mb-3 display-block uppercase">SupplyProvider</h2>
      

      
      
      <div className="absolute inset-1 bg-gray-800 rounded-lg z-10 p-5 relative w-[380px] h-[320px]">
      
        <form onSubmit={handleLogin}>
          <h2 className="text-2xl font-semibold text-blue-500 text-center mb-6">Login</h2>
          <div className="relative flex flex-col mb-6">
            <input
              type="email"
              id="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              
              className="relative z-10 border-0 border-b-2 border-blue-500 h-10 bg-transparent text-gray-100 outline-none px-2 peer"
             
            />
            <i className="bg-blue-500 rounded w-full bottom-0 left-0 absolute h-1 -z-10 transition-transform duration-300 origin-bottom transform peer-focus:h-1 peer-placeholder-shown:h-[0.5px]"></i>
            <label className="peer-focus:font-medium absolute text-sm duration-300 transform -translate-y-8 scale-75 top-3 left-0 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-500 text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-500 peer-focus:scale-75 peer-focus:-translate-y-8">Enter Email</label>
          </div>

          <div className="relative flex flex-col mb-6">
            <input
              type="password"
              id="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
              className="relative z-10 border-0 border-b-2 border-blue-500 h-10 bg-transparent text-gray-100 outline-none px-2 peer"
              
            />
            <i className="bg-blue-500 rounded w-full bottom-0 left-0 absolute h-1 -z-10 transition-transform duration-300 origin-bottom transform peer-focus:h-1 peer-placeholder-shown:h-[0.5px]"></i>
            <label className="peer-focus:font-medium absolute text-sm duration-300 transform -translate-y-8 scale-75 top-3 left-0 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-500 text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-500 peer-focus:scale-75 peer-focus:-translate-y-8">Enter Password</label>
          </div>

          <button
            type="submit"
            className="py-3 text-gray-100 bg-blue-700 w-full rounded hover:bg-blue-500 hover:scale-105 duration-300"
            
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-gray-600">
          Don't have an account?{' '}     
              <Link href='/registerPage' className="text-blue-500">Register</Link>
        </p>
        
      </div>
      
    
    </div>
  );
};

export default Login;