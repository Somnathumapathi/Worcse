'use client'

import { useState, useEffect } from 'react';
import { auth, storage, db } from "@/firebase";
import { signOut } from "firebase/auth";

const dc = () => {
    const handleLogOut = async () => {
        try{
          await signOut(auth)
          console.log('Logged out')
          window.location.href='/DC'
        } catch (e) {
          console.log('Error: ', e)
        }
      }
  return (
    <div>
        <h1 className='text-3xl text-center'>DC</h1>
        <button><a href='/DC/Initiate'>Initiate Project</a></button> <br/>
        <button>My Projects</button><br/>
        <button onClick={handleLogOut} className='bg-blue-500 rounded-lg p-2'>Log out</button>
    </div>
  )
}

export default dc