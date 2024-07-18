import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, reset } from '../features/authSlice';

const Navbar = () => {
    const [isActive, setIsActive] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        console.log('Current user:', user);
    }, [user]);

    const logout = () => {
        dispatch(LogOut());
        dispatch(reset());
        navigate('/');
    };

    const toggleBurger = () => {
        setIsActive(!isActive);
    };

    return (
        <div style={{ height: '10vh' }}>
            <nav className="navbar p-3" role="navigation" aria-label="main navigation" style={{ background: 'transparent' }}>
                <div className="navbar-brand">
                    <a className="title button is-ghost" href="/dashboard" style={{ color: 'black', textDecoration: 'none' }}>
                        FUN WORKOUT DEL
                    </a>

                    <a role="button" className={`navbar-burger ${isActive ? 'is-active' : ''}`} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={toggleBurger}>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="navbarBasicExample" className={`navbar-menu ${isActive ? 'is-active' : ''}`} style={isActive ? { position: 'absolute', top: '0%', left: '0', transform: 'translate(0%, 0%)', height: '100vh' } : {}}>
                    <div className="navbar-end">
                        <div className="navbar-item">
                            <div className="buttons" style={isActive ? { display: 'flex', flexDirection: 'column' } : {}}>
                                {user && user.role === 'admin' && (
                                    <a className="button is-dark has-text-primary-85" href='/users'>
                                        Users
                                    </a>
                                )}
                                {user && user.role === 'user' && (
                                    <a className="button is-dark has-text-primary-85" href='/recommendation'>
                                        Recommendation
                                    </a>
                                )}
                                <a className="button is-dark has-text-primary-85" href='/preferences'>
                                    History
                                </a>
                                <button className="button is-dark has-text-primary-85">
                                    About Us
                                </button>
                                <button className="button is-danger" onClick={logout}>
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
