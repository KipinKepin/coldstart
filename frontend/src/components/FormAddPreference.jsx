import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FormAddPreference = () => {
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [fitness, setFitness] = useState('');
    const [frequency, setFrequency] = useState('');
    const [duration, setDuration] = useState('');
    const [diet, setDiet] = useState('');
    const [motivation, setMotivation] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const savePreference = async (e) => {
        e.preventDefault();

        try {
            await axios.post('http://localhost:5000/preferences', {
                gender: gender,
                age: age,
                fitnessLevel: fitness,
                exerciseFrequency: frequency,
                exerciseDuration: duration,
                balanceDiet: diet,
                motivation: motivation,
            });
            navigate('/preferences');
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    };

    return (
        <div className="add">
            <em className="subtitle has-text-dark" style={{ fontSize: '1rem' }}>Add preference</em>
            <div className="card is-shadowless mt-2" style={{ width: 'fit-content', position: 'absolute', top: '60%', left: '60%', transform: 'translate(-100%, -75%)', scale: '.8' }}>
                <p className="has-text-centered has-text-danger">{msg}</p>
                <div className="card-content">
                    <div className="content">
                        <form onSubmit={savePreference}>
                            <div className="field">
                                <label className="label">Gender</label>
                                <div className="control">
                                    <select className="select select-bordered w-full max-w-xs" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="" disabled selected>Choose one</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Age</label>
                                <div className="control">
                                    <select className="select select-bordered w-full max-w-xs" value={age} onChange={(e) => setAge(e.target.value)}>
                                        <option value="" disabled selected>Choose one</option>
                                        <option value="15 to 18">15 to 18</option>
                                        <option value="19 to 25">19 to 25</option>
                                        <option value="26 to 30">26 to 30</option>
                                        <option value="31 to 39">31 to 39</option>
                                        <option value="40 and above">40 and above</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field is-mobile">
                                <label className="label">Fitness Level</label>
                                <div className="control">
                                    <select className="select select-bordered w-full max-w-xs" value={fitness} onChange={(e) => setFitness(e.target.value)}>
                                        <option value="" disabled selected>Choose one</option>
                                        <option value="Unfit">Unfit</option>
                                        <option value="Average">Average</option>
                                        <option value="Good">Good</option>
                                        <option value="Very good">Very good</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field is-mobile">
                                <label className="label">Exercise Frequency</label>
                                <div className="control">
                                    <select className="select select-bordered w-full max-w-xs" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                                        <option value="" disabled selected>Choose one</option>
                                        <option value="Never">Never</option>
                                        <option value="1 to 2 times a week">1 to 2 times a week</option>
                                        <option value="3 to 4 times a week">3 to 4 times a week</option>
                                        <option value="5 to 6 times a week">5 to 6 times a week</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field is-mobile">
                                <label className="label">Exercise Duration</label>
                                <div className="control">
                                    <select className="select select-bordered w-full max-w-xs" value={duration} onChange={(e) => setDuration(e.target.value)}>
                                        <option value="" disabled selected>Choose one</option>
                                        <option value="Never">Never</option>
                                        <option value="30 minutes">30 minutes</option>
                                        <option value="1 hour">1 hour</option>
                                        <option value="2 hours">2 hours</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field is-mobile">
                                <label className="label">Balanced Diet</label>
                                <div className="control">
                                    <select className="select select-bordered w-full max-w-xs" value={diet} onChange={(e) => setDiet(e.target.value)}>
                                        <option value="" disabled selected>Choose one</option>
                                        <option value="No">No</option>
                                        <option value="Not Always">Not Always</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field is-mobile">
                                <label className="label">Motivation</label>
                                <div className="control">
                                    <select className="select select-bordered w-full max-w-xs" value={motivation} onChange={(e) => setMotivation(e.target.value)}>
                                        <option value="" disabled selected>Choose one</option>
                                        <option value="I want to be fit">I want to be fit</option>
                                        <option value="I want to lose weight">I want to lose weight</option>
                                        <option value="I want to relieve stress">I want to relieve stress</option>
                                        <option value="I want to increase muscle mass and strength">I want to increase muscle mass and strength</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field mt-5">
                                <div className="control">
                                    <button className='button is-success is-fullwidth'>Save</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormAddPreference;