import express from 'express'
import {
    getPreferences,
    getPreferenceById,
    createPreference,
    updatePreference,
    deletePreference
} from '../controllers/Preferences.js'
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router()

router.get('/preferences', verifyUser, getPreferences)
router.get('/preferences/:id', verifyUser, getPreferenceById)
router.post('/preferences', verifyUser, createPreference)
router.patch('/preferences/:id', verifyUser, updatePreference)
router.delete('/preferences/:id', verifyUser, deletePreference)

export default router