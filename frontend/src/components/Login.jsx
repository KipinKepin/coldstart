import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LoginUser, reset } from '../features/authSlice'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { user, isError, isSuccess, isLoading, message } = useSelector((state) => state.auth)

    useEffect(() => {
        if (user || isSuccess) {
            navigate("/dashboard")
        }
        dispatch(reset())
    }, [user, isSuccess, dispatch, navigate])

    const Auth = (e) => {
        e.preventDefault()
        dispatch(LoginUser({ email, password }))
    }

    return (
        <section className="hero is-success is-fullheight is-fullwidth" style={{ maxHeight: '100vh', background: 'url(../../public/background.jpg)' }}>
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-4">
                            <form className='box' onSubmit={Auth}>
                                {isError && <p className='has-text-centered has-text-danger'>{message}</p>}
                                <h1 className='title is-3 has-text-primary-light has-text-centered'>Sign In</h1>
                                <div className="field">
                                    <label className="label">Email</label>
                                    <div className="control">
                                        <input type="text" className='input' placeholder='Email' onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Password</label>
                                    <div className="control">
                                        <input type="password" className='input' placeholder='********' onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>
                                <div className="field mt-5">
                                    <div className="control">
                                        <button type='submit' className='button is-success is-fullwidth'>
                                            {isLoading ? "Loading..." : "Login"}
                                        </button>
                                    </div>
                                </div>
                                <div className="field mt-2 has-text-right">
                                    <p><em>Don't have any account?</em></p>
                                    <a href="/register">Register now</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login