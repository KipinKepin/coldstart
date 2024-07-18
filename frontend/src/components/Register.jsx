import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [role, setRole] = useState("user");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const saveUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/register", {
                name: name,
                email: email,
                password: password,
                confPassword: confPassword,
                role: role,
            });
            alert("Registrasi berhasil, silahkan login dengan akun anda")
            navigate("/");
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    };

    return (
        <section className="hero is-success is-fullheight is-fullwidth" style={{ maxHeight: '100vh', background: 'url(../../public/background.jpg)' }}>
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-4">
                            <form className='box' onSubmit={saveUser}>
                                <p className="has-text-centered">{msg}</p>
                                <h1 className='title is-3 has-text-primary-light has-text-centered'>Register</h1>
                                <div className="field">
                                    <label className="label">Name</label>
                                    <div className="control">
                                        <input type="text" className='input' placeholder='Name' value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Email</label>
                                    <div className="control">
                                        <input type="text" className='input' placeholder='Email' value={email}
                                            onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Password</label>
                                    <div className="control">
                                        <input type="password" className='input' placeholder='********' value={password}
                                            onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Confirm Password</label>
                                    <div className="control">
                                        <input type="password" className='input' placeholder='********' value={confPassword}
                                            onChange={(e) => setConfPassword(e.target.value)} />
                                    </div>
                                </div>
                                <div className="field mt-5">
                                    <div className="control">
                                        <button type='submit' className='button is-success is-fullwidth'>Register</button>
                                    </div>
                                </div>
                                <div className="field mt-2 has-text-right">
                                    <p><em>Already have an account?</em></p>
                                    <a href="/">Login now</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Register