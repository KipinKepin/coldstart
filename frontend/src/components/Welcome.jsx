import React from 'react'
import { useSelector } from 'react-redux'

const Welcome = () => {
    const { user } = useSelector((state) => state.auth)
    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <h2
                className="subtitle has-text-centered has-text-light is-size-2 has-text-weight-bold"
                style={{ background: '#000', padding: '1rem', borderRadius: '1rem' }}
            >
                Welcome back, {user && user.name}
            </h2>
        </div>
    )
}

export default Welcome