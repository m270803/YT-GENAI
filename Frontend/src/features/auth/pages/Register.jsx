import React, { useState } from 'react'
import { use } from 'react'
import { useNavigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'


const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const {loading,handleRegister} = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({username,email,password})
        navigate("/")
    }

    if(loading){
        return(<main><h1>loading....</h1></main>)
    }

  return (
    <main>
        <div className="form-container">
            <h1 className="">Register</h1>
            <form action="" className="" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Email</label>
                    <input
                    onChange={(e) => {setUsername(e.target.value)}}
                     type="username" id="username" name='username' placeholder='enter your username' />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                    onChange={(e) => {setEmail(e.target.value)}}
                     type="email" id="email" name='email' placeholder='enter your email' />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                    onChange={(e) => {setPassword(e.target.value)}}
                     type="password" id="password" name='password' placeholder='enter your passwrord' />
                </div>
                <button className="button primary-button"> submit </button>
            </form>
            <p className="">already have an account ? <Link to={"/login"} >Login</Link></p>
        </div>
    </main>
  )
}

export default Register