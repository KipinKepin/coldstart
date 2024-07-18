import React from 'react'
import Navbar from '../components/Navbar'
// import 'bulma/css/bulma.css'

const Layout = ({ children }) => {
    return (
        <React.Fragment>
            <Navbar />
            <div className='container' style={{ height: '90vh' }}>{children}</div>
        </React.Fragment>
    )
}

export default Layout