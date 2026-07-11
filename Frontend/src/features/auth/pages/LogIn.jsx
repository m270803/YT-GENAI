import React, { useState } from 'react'
import "../auth.form.scss"
import { useNavigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'


const LogIn = () => {

    const {loading, handleLogin } = useAuth()


    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        handleLogin({email,password})
        navigate('/')
    }

    if(loading){
        return(<main><h1>Loading.......</h1></main>)
    }

  return (
    <main>
        <div className="form-container">
            <h1 className="">Login</h1>
            <form action="" className="" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input onChange={(e) => {setEmail(e.target.value)}} type="email" id="email" name='email' placeholder='enter your email' />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input onChange={(e) => {setPassword(e.target.value)}} type="password" id="password" name='password' placeholder='enter your passwrord' />
                </div>
                <button className="button primary-button"> submit </button>
            </form>
            <p className="">dont have a account ? <Link to={"/register"} >Register</Link></p>
        </div>
    </main>
  )
}

export default LogIn