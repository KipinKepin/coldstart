import express from 'express'
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/Users.js'
import { adminOnly, userOnly, verifyUser } from '../middleware/AuthUser.js'

const router = express.Router()

router.get('/users', verifyUser, adminOnly, getUsers)
router.get('/users/:id', verifyUser, adminOnly, getUserById)
router.post('/users', verifyUser, adminOnly, createUser)
router.patch('/users/:id', verifyUser, adminOnly, updateUser)
router.delete('/users/:id', verifyUser, adminOnly, deleteUser)
router.get('/recommendation', userOnly)
router.post('/register', createUser)

export default router