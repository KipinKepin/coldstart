import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IoPencil, IoTrash } from 'react-icons/io5'

const UserList = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        getUsers()
    }, [])

    const getUsers = async () => {
        const response = await axios.get('http://localhost:5000/users')
        setUsers(response.data)
        console.log(response.data);
    }

    const deleteUser = async (userId) => {
        await axios.delete(`http://localhost:5000/users/${userId}`)
        getUsers()
    }

    return (
        <div>
            <h1 className="title has-text-dark">Users</h1>
            <h2 className="subtitle has-text-dark">List of Users</h2>
            <Link to={'/users/add'} className='button is-success is-small mb-4'>Add User</Link>
            <div className="table-container">
                <table className='table is-striped is-fullwidth is-narrow'>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.uuid}>
                                <td>{index + 1}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <Link to={`/users/edit/${user.uuid}`} className='button is-small is-info crud'>
                                        <IoPencil />
                                    </Link>
                                    <button onClick={() => deleteUser(user.uuid)} className='button is-small is-danger crud'>
                                        <IoTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UserList