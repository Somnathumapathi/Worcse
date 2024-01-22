'use client'

import { auth } from "@/firebase"
import { signOut } from "firebase/auth"

const HomePage = () => {
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
            <button onClick={handleLogOut}>Logout</button>
        </div>
    )
}
export default HomePage