import React, { useEffect } from 'react'
import Layout from '../pages/Layout'
import CheckFile from './CheckFile'
import '../index.css'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../features/authSlice'

const RecommendationList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isError, user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getMe());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            navigate("/");
        }
        if (user && user.role !== 'user') {
            navigate('/dashboard')
        }
    }, [isError, user, navigate]);

    return (
        <Layout>
            <CheckFile />
        </Layout>
    )
}

export default RecommendationList