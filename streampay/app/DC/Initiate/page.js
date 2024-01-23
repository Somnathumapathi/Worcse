import React from 'react'

const initiate = () => {
  return (
    <div>
        <h1 className='text-center text-3xl uppercase p-4'>Initiate a New Project</h1>
        <div>
            Enter project details: <br/> 
            <input type="text"  name="projectName" placeholder='Project Name' className='p-2 px-4 m-4 rounded-lg'/><br/>
            <input type='number' name='projectFund' placeholder='Project Fund'  className='p-2 px-4 m-4 rounded-lg'/> <br/>
            <input type='text' name='supplyProviderID' placeholder='Supply Provider ID'  className='p-2 px-4 m-4 rounded-lg'/> <br/>
            <button type='submit' className='p-2 m-4 border-2 border-slate-50 rounded-lg'>SUBMIT</button>
        </div>
    </div>
  )
}

export default initiate