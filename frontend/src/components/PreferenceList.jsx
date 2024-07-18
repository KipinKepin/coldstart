import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { IoPencil, IoTrash } from "react-icons/io5";
import { getRecommendations } from './Recommendation';
import modelCosine from '../app/models/exercise_recommender_model.json';
import modelTFIDF from '../app/models/tf_idf_model.json';
import stopWords from './stopwords.js';
import { useDispatch, useSelector } from 'react-redux'

const PreferenceList = () => {
    const [preferences, setPreferences] = useState([]);
    const [combinedMatrix, setCombinedMatrix] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [rekomendasi, setRekomendasi] = useState([]);
    const [error, setError] = useState(null)
    const [rusak, setRusak] = useState(null);
    const { isError, user } = useSelector((state) => state.auth);

    useEffect(() => {
        getPreferences();
    }, []);

    useEffect(() => {
        if (preferences.length === 0) return;

        const combined = preferences.map(preferensi => {
            let gender_matrix = [0, 0];
            let age_matrix = [0, 0, 0, 0, 0];
            let fitness_matrix = [0, 0, 0, 0];
            let exercise_frequency_matrix = [0, 0, 0, 0, 0];
            let exercise_duration_matrix = [0, 0, 0];
            let balanced_diet_matrix = [0, 0, 0];
            let motivation_matrix = [0, 0, 0, 0];

            const genders = ['Male', 'Female'];
            gender_matrix = genders.map(range => (range === preferensi.gender ? 1 : 0));

            const ageRanges = ['15 to 18', '19 to 25', '26 to 30', '31 to 39', '40 and above'];
            age_matrix = ageRanges.map(range => (range === preferensi.age ? 1 : 0));

            const fitnessLevels = ["Unfit", "Average", "Good", "Very good"];
            fitness_matrix = fitnessLevels.map(level => (level === preferensi.fitnessLevel ? 1 : 0));

            const exerciseFrequencies = ["Never", "1 to 2 times a week", "3 to 4 times a week", "5 to 6 times a week", "Everyday"];
            exercise_frequency_matrix = exerciseFrequencies.map(freq => (freq === preferensi.exerciseFrequency ? 1 : 0));

            const exerciseDurations = ["30 minutes", "1 hour", "2 hours"];
            exercise_duration_matrix = exerciseDurations.map(duration => (duration === preferensi.exerciseDuration ? 1 : 0));

            const balancedDiets = ["No", "Not always", "Yes"];
            balanced_diet_matrix = balancedDiets.map(option => (option === preferensi.balancedDiet ? 1 : 0));

            const motivasi = ["I want to be fit", "I want to lose weight", "I want to relieve stress", "I want to increase muscle mass and strength"];
            motivation_matrix = motivasi.map(option => (option === preferensi.motivation ? 1 : 0));

            const combinedMatrix = [
                ...gender_matrix,
                ...age_matrix,
                ...fitness_matrix,
                ...exercise_frequency_matrix,
                ...exercise_duration_matrix,
                ...balanced_diet_matrix,
                ...motivation_matrix
            ];

            return combinedMatrix.join(', ');
        });

        setCombinedMatrix(combined);

        let keywords = ["relaks", "tenang", "nyaman", "damai", "santai", "meditasi", "pikiran", "yoga", "pernapasan", "keseimbangan"];
        const { test_data, nama_olahraga, combined_normalized_data, powered_normalized_data } = modelCosine;

        const datasetPath = process.env.PUBLIC_URL + "/datas/dataset_TA.csv";
        fetch(datasetPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.text();
            })
            .then(text => {
                const rows = text.split("\n").map(row => row.split(","));
                const headers = rows[0].map(header => header.trim());
                if (!headers.includes("Exercise")) {
                    setRusak(true);
                    function calculateTF(corpus, stopWords, keywords) {
                        let tf = {};

                        for (let i = 0; i < corpus.length; i++) {
                            let totalWords = corpus[i].length;
                            let kalimatClean = corpus[i].filter(kata => !stopWords.includes(kata.toLowerCase()));

                            tf[i] = {};

                            kalimatClean.forEach(kata => {
                                let lowerKata = kata.toLowerCase();
                                if (keywords.includes(lowerKata)) {
                                    if (!tf[i][lowerKata]) {
                                        tf[i][lowerKata] = 0;
                                    }
                                    tf[i][lowerKata] += 1 / totalWords;
                                }
                            });
                        }

                        return tf;
                    }

                    function calculateIDF(corpus, stopWords, keywords) {
                        let df = {};
                        let totalDocuments = corpus.length;

                        corpus.forEach(kalimat => {
                            let kataKalimat = new Set(kalimat.filter(kata => !stopWords.includes(kata.toLowerCase())).map(kata => kata.toLowerCase()));

                            kataKalimat.forEach(kata => {
                                if (keywords.includes(kata)) {
                                    if (!df[kata]) {
                                        df[kata] = 0;
                                    }
                                    df[kata]++;
                                }
                            });
                        });

                        let idf = {};
                        keywords.forEach(kata => {
                            let lowerKata = kata.toLowerCase();
                            idf[kata] = Math.log(totalDocuments / (df[lowerKata] + 1));
                        });

                        return idf;
                    }

                    function calculateTFIDF(corpus, stopWords, keywords) {
                        let tf = calculateTF(corpus, stopWords, keywords);
                        let idf = calculateIDF(corpus, stopWords, keywords);
                        let tfidf = [];

                        for (let i = 0; i < corpus.length; i++) {
                            let tfidfKalimat = [];
                            for (let j = 0; j < keywords.length; j++) {
                                let kata = keywords[j];
                                if (tf[i][kata]) {
                                    let tfidfValue = tf[i][kata] * idf[kata];
                                    tfidfKalimat.push(tfidfValue);
                                } else {
                                    tfidfKalimat.push(0.0);
                                }
                            }
                            let totalTFIDFKalimat = tfidfKalimat.reduce((acc, val) => acc + val, 0);
                            tfidfKalimat.push(totalTFIDFKalimat);
                            tfidf.push(tfidfKalimat);
                        }

                        let totalTFIDF = tfidf.map(tfidfRow => tfidfRow.slice(0, -1).reduce((acc, val) => acc + val, 0));
                        let indexedResult = totalTFIDF.map((value, index) => [index, value]);
                        let sortedIndexedResult = indexedResult.sort((a, b) => b[1] - a[1]);

                        let top3Indices = sortedIndexedResult.slice(0, 3).map(item => item[0]);

                        let listRekomendasi = [];
                        let rangkumanDanTautan = [];

                        for (let i of top3Indices) {
                            listRekomendasi.push(modelTFIDF.olahraga[i]); // Replace with your array name for sports
                            rangkumanDanTautan.push(
                                `${modelTFIDF.isi[i]}<br><a href='${modelTFIDF.link_jurnal[i]}'>Link to Journal</a>` // Replace with appropriate arrays or data
                            );
                        }

                        return {
                            tf: tf,
                            idf: idf,
                            tfidf: tfidf,
                            totalTFIDF: totalTFIDF,
                            indexedResult: indexedResult,
                            sortedIndexedResult: sortedIndexedResult,
                            top3Indices: top3Indices,
                            listRekomendasi: listRekomendasi,
                            rangkumanDanTautan: rangkumanDanTautan
                        };
                    }

                    const {
                        tf,
                        idf,
                        tfidf,
                        totalTFIDF,
                        indexedResult,
                        sortedIndexedResult,
                        top3Indices,
                        listRekomendasi,
                        rangkumanDanTautan
                    } = calculateTFIDF(modelTFIDF.corpus, stopWords, keywords);

                    setRekomendasi(listRekomendasi);
                    console.log('TF:', tf);
                    console.log('Top 3 Indices:', top3Indices);
                    console.log('List Rekomendasi:', listRekomendasi);
                    console.log('Rangkuman dan Tautan:', rangkumanDanTautan);

                } else {
                    const newRecommendations = combined.map((user_pref, index) => {
                        const userPrefArray = user_pref.split(', ').map(Number);

                        function dotProduct(arr1, arr2) {
                            return arr1.map((val, index) => val * arr2[index]);
                        }

                        function sumArray(arr) {
                            return arr.reduce((acc, val) => acc + val, 0);
                        }

                        let sum_combined;
                        let dot = [];
                        const hasil_dot = combined_normalized_data.map(exercise => {
                            const exerciseName = exercise[0];
                            const exerciseData = exercise.slice(1); // Remove the exercise name
                            const multipliedData = dotProduct(userPrefArray, exerciseData);
                            sum_combined = sumArray(multipliedData);
                            dot.push(sum_combined);
                            return { name: exerciseName, sum: sum_combined };
                        });

                        let sum_powered;
                        let sum = [];
                        let exercise_name = [];
                        const result_powered = powered_normalized_data.map(exercise => {
                            exercise_name.push(exercise[0]);
                            const exerciseName = exercise[0];
                            const exerciseData = exercise.slice(1); // Remove the exercise name
                            sum_powered = sumArray(exerciseData);
                            const sqrtSum = Math.sqrt(sum_powered);
                            sum.push(sum_powered);
                            return { name: exerciseName, sum: sum_powered, sqrtSum: sqrtSum };
                        });

                        let sum_pref = sumArray(userPrefArray);

                        let similarity = [];
                        for (let i = 0; i < dot.length; i++) {
                            if (sum[i] !== 0) {
                                similarity.push(dot[i] / (sum[i] * Math.sqrt(sum_pref)));
                            } else {
                                similarity.push(0);
                            }
                        }

                        const indexedArray = similarity.map((value, index) => ({ index, value }));

                        indexedArray.sort((a, b) => b.value - a.value);

                        const topThreeIndices = indexedArray.slice(0, 3).map(item => item.index);

                        let new_exer = [];
                        for (let i = 0; i < topThreeIndices.length; i++) {
                            new_exer.push(exercise_name[topThreeIndices[i]]);
                        }

                        return new_exer;
                    });

                    setRecommendations(newRecommendations);
                }
            });

    }, [preferences]);

    const getPreferences = async () => {
        const response = await axios.get('http://localhost:5000/preferences');
        console.log(response.data);

        setPreferences(response.data);
    };
    const deletePreference = async (preferenceId) => {
        await axios.delete(`http://localhost:5000/preferences/${preferenceId}`);
        getPreferences();
    };

    return (
        <div className='mt-4'>
            <em className="subtitle has-text-dark">List of preferences</em>
            <br />
            <Link to={'/preferences/add'} className='button is-success is-small my-4'>Add Preference</Link>
            <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'scroll' }}>
                <table className='table is-bordered is-fullwidth is-narrow is-vcentered has-text-centered my-4'>
                    <thead>
                        <tr>
                            <th className='has-text-centered'>No</th>
                            <th className='has-text-centered'>Gender</th>
                            <th className='has-text-centered'>Age</th>
                            <th className='has-text-centered'>Fitness Level</th>
                            <th className='has-text-centered'>Exercise Frequency</th>
                            <th className='has-text-centered'>Exercise Duration</th>
                            <th className='has-text-centered'>Balance Diet</th>
                            <th className='has-text-centered'>Motivation</th>
                            <th className='has-text-centered'>Created by</th>
                            <th className='has-text-centered'>Actions</th>
                            {!rusak ?
                                (
                                    <>
                                        <th className='has-text-centered'>User's Matrix</th>
                                        <th className='has-text-centered'>Recommendations</th>
                                    </>
                                )
                                : ''
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {preferences.map((preference, index) => (
                            <tr key={preference.uuid} className='is-size-7'>
                                <td className="is-vcentered">{index + 1}</td>
                                <td className="is-vcentered">{preference.gender}</td>
                                <td className="is-vcentered">{preference.age}</td>
                                <td className="is-vcentered">{preference.fitnessLevel}</td>
                                <td className="is-vcentered">{preference.exerciseFrequency}</td>
                                <td className="is-vcentered">{preference.exerciseDuration}</td>
                                <td className="is-vcentered">{preference.balanceDiet}</td>
                                <td className="is-vcentered">{preference.motivation}</td>
                                <td className="is-vcentered">{preference.user.name}</td>
                                <td className="is-vcentered">
                                    <Link to={`/preferences/edit/${preference.uuid}`} className='button is-small is-info crud'>
                                        <IoPencil />
                                    </Link>
                                    <button onClick={() => deletePreference(preference.uuid)} className='button is-small is-danger crud'>
                                        <IoTrash />
                                    </button>
                                </td>
                                <td>{combinedMatrix[index]}</td>
                                {!rusak ?
                                    <td className="is-vcentered has-text-centered">
                                        {recommendations[index] && recommendations[index].map((recommendation, recIdx) => (
                                            <div key={recIdx}>
                                                {recommendation}
                                            </div>
                                        ))}
                                    </td>
                                    : ''
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PreferenceList;
