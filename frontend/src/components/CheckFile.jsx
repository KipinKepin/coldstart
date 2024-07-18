import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import modelCosine from '../app/models/exercise_recommender_model.json';
import modelTFIDF from '../app/models/tf_idf_model.json'
import stopWords from "./stopwords.js";

const DatasetChecker = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [preferency, setPreferensi] = useState(null);
    const [combinedMatrix, setCombinedMatrix] = useState([]);
    const [rekomendasi, setRekomendasi] = useState([]);
    const [rusak, setRusak] = useState(null)
    const [rangkumanTautan, setRangkumanTautan] = useState([])

    const getPreferences = async () => {
        try {
            const response = await axios.get('http://localhost:5000/preferences');
            console.log(response.data[response.data.length - 1])
            setPreferensi(response.data[response.data.length - 1]);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getPreferences();
    }, []);

    useEffect(() => {
        if (preferency && Object.keys(preferency).length > 0) {
            const genders = ['Male', 'Female']
            const ageRanges = ['15 to 18', '19 to 25', '26 to 30', '31 to 39', '40 and above'];
            const fitnessLevels = ["Unfit", "Average", "Good", "Very good"];
            const exerciseFrequencies = ["Never", "1 to 2 times a week", "3 to 4 times a week", "5 to 6 times a week", "Everyday"];
            const exerciseDurations = ["30 minutes", "1 hour", "2 hours"];
            const balancedDiets = ["No", "Not always", "Yes"];
            const motivasi = ["I want to be fit", "I want to lose weight", "I want to relieve stress", "I want to increase muscle mass and strength"];

            const gender_matrix = genders.map(range => (range === preferency.gender ? 1 : 0));
            const age_matrix = ageRanges.map(range => (range === preferency.age ? 1 : 0));
            const fitness_matrix = fitnessLevels.map(level => (level === preferency.fitnessLevel ? 1 : 0));
            const exercise_frequency_matrix = exerciseFrequencies.map(freq => (freq === preferency.exerciseFrequency ? 1 : 0));
            const exercise_duration_matrix = exerciseDurations.map(duration => (duration === preferency.exerciseDuration ? 1 : 0));
            const balanced_diet_matrix = balancedDiets.map(option => (option === preferency.balancedDiet ? 1 : 0));
            const motivation_matrix = motivasi.map(option => (option === preferency.motivation ? 1 : 0));

            const combinedMatrix = [
                ...gender_matrix,
                ...age_matrix,
                ...fitness_matrix,
                ...exercise_frequency_matrix,
                ...exercise_duration_matrix,
                ...balanced_diet_matrix,
                ...motivation_matrix
            ];
            console.log(combinedMatrix);
            // let referensi = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1]
            setCombinedMatrix(combinedMatrix);
        }
    }, [preferency]);

    useEffect(() => {
        if (combinedMatrix.length > 0) {
            const datasetPath = process.env.PUBLIC_URL + "/datas/dataset_TA.csv";
            const { test_data, nama_olahraga, rangkuman, link_jurnal, combined_normalized_data, powered_normalized_data } = modelCosine;

            let keywords;
            console.log(preferency.motivation);
            if (preferency.motivation === 'I want to be fit') {
                keywords = ["bugar", "sehat", "kuat", "aktif", "segar", "stamina", "vitalitas", "daya", "gerak", "prima"]
            }
            else if (preferency.motivation === 'I want to lose weight') {
                keywords = ["langsing", "kurus", "turun", "lemak", "diet", "kalori", "ramping", "berat", "ringan", "tubuh"]
            }
            else if (preferency.motivation === 'I want to relieve stress') {
                keywords = ["rileks", "tenang", "nyaman", "damai", "santai", "bebas", "lega", "lepas", "pikiran", "terapi"]
            }
            else {
                keywords = ["otot", "kekuatan", "massa", "tenaga", "angkat", "beban", "latihan", "protein", "fitnes", "kekar"]
            }

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
                        setRusak(true)
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
                        setRekomendasi(listRekomendasi)
                        setRangkumanTautan(rangkumanDanTautan)
                        console.log('TF:', tf);
                        console.log('Top 3 Indices:', top3Indices);
                        console.log('List Rekomendasi:', listRekomendasi);
                        console.log('Rangkuman dan Tautan:', rangkumanDanTautan);
                    }
                    else {
                        // add code here
                        const user_pref = [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0]
                        console.log(combined_normalized_data);

                        function dotProduct(arr1, arr2) {
                            return arr1.map((val, index) => val * arr2[index]);
                        }

                        function sumArray(arr) {
                            return arr.reduce((acc, val) => acc + val, 0);
                        }

                        let sum_combined;
                        let dot = []
                        const hasil_dot = combined_normalized_data.map(exercise => {
                            const exerciseName = exercise[0];
                            const exerciseData = exercise.slice(1); // Remove the exercise name
                            const multipliedData = dotProduct(combinedMatrix, exerciseData);
                            sum_combined = sumArray(multipliedData);
                            dot.push(sum_combined)
                            return { name: exerciseName, sum: sum_combined };
                        });

                        console.log(dot);
                        console.log(hasil_dot);
                        console.log(powered_normalized_data);

                        let sum_powered;
                        let sum = []
                        let exercise_name = []
                        const result_powered = powered_normalized_data.map(exercise => {
                            exercise_name.push(exercise[0])
                            const exerciseName = exercise[0]
                            const exerciseData = exercise.slice(1); // Remove the exercise name
                            sum_powered = sumArray(exerciseData);
                            const sqrtSum = Math.sqrt(sum_powered)
                            sum.push(sum_powered)
                            return { name: exerciseName, sum: sum_powered, sqrtSum: sqrtSum };
                        });
                        console.log(exercise_name);
                        console.log(sum);
                        // const bawah = 
                        let sum_pref = sumArray(combinedMatrix)
                        console.log(sum_pref);
                        console.log(result_powered);

                        let similarity = []
                        for (let i = 0; i < dot.length; i++) {
                            if (sum[i] !== 0) {
                                similarity.push(dot[i] / (sum[i] * Math.sqrt(sum_pref)))
                            }
                            else {
                                similarity.push(0)
                            }
                        }
                        console.log(similarity);

                        const indexedArray = similarity.map((value, index) => ({ index, value }));

                        // Sort the array based on the values in descending order
                        indexedArray.sort((a, b) => b.value - a.value);

                        // Extract the indices of the top 3 values
                        const topThreeIndices = indexedArray.slice(0, 3).map(item => item.index);

                        console.log(topThreeIndices);
                        let new_exer = []
                        for (let i = 0; i < topThreeIndices.length; i++) {
                            console.log(exercise_name[topThreeIndices[i]]);
                            new_exer.push(exercise_name[topThreeIndices[i]])
                        }
                        function findIndices(nama_olahraga, new_exer) {
                            // Dictionary to store the results
                            let indicesDict = {};
                            new_exer.forEach(word => indicesDict[word.toLowerCase()] = []);

                            // Iterate through nama_olahraga and store indices in indicesDict
                            nama_olahraga.forEach((word, idx) => {
                                let lowerWord = word.toLowerCase();
                                console.log(lowerWord);
                                if (indicesDict.hasOwnProperty(lowerWord)) {
                                    indicesDict[lowerWord].push(idx);
                                }
                            });

                            return indicesDict;
                        }
                        const indicesDict = findIndices(nama_olahraga, new_exer);

                        // Output the indices search results
                        for (let key in indicesDict) {
                            console.log(`${key}:`);
                            indicesDict[key].forEach(idx => {
                                console.log(rangkuman[idx]);
                                console.log(link_jurnal[idx]);
                            });
                            console.log();  // Output a blank line after each group of values
                        }

                        // Transform `indicesDict` to `recommendations` format
                        let newRecommendations = [];
                        for (let key in indicesDict) {
                            let details = indicesDict[key].map(idx => ({
                                summary: rangkuman[idx],
                                link: link_jurnal[idx]
                            }));
                            newRecommendations.push({
                                exercise: key,
                                details: details
                            });
                        }

                        setRecommendations(newRecommendations);
                    }
                })
                .catch(error => {
                    setError(error.message);
                });
        }
    }, [combinedMatrix]);

    let sekarang = new Set(rekomendasi)
    if (sekarang.length != 1) {
        console.log('a');
    }
    else {
        console.log('b');
    }

    console.log(rangkumanTautan)
    return (
        <>
            {rusak &&
                <div role="alert" className="alert alert-warning mt-12" style={{ position: 'absolute', top: '0', width: 'max-content', left: '50%', transform: 'translate(-50%, 0)' }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>

                    <span><em><a className="text-white font-bold" href="https://en.wikipedia.org/wiki/Cold_start_(recommender_systems)">Coldstart </a></em>is occur, your recommendation will be given by journals.</span>
                </div>
            }
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                {preferency && Object.keys(preferency).length > 0 ?
                    <div className="hero bg-base-content bg-opacity-50 rounded-box text-black">
                        <div className="hero-content">
                            <div className="max-w-md">
                                <h1 className="text-5xl font-bold text-center mb-3">Your Exercises Recommendations</h1>
                                <div className="join join-vertical w-full">
                                    {!rusak ?
                                        recommendations.map((recommendation, idx) => (
                                            <div className="collapse collapse-arrow join-item border border-base-300" key={idx}>
                                                <input type="radio" name="my-accordion-4" />
                                                <div className="collapse-title font-medium">
                                                    {idx + 1}. {recommendation.exercise}
                                                </div>
                                                <div className="collapse-content bg-base-100 text-white" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {recommendation.details.map((detail, detailIdx) => (
                                                        <div key={detailIdx}>
                                                            <p>{detail.summary}. <a href={detail.link} className='text-primary'><em>(link jurnal)</em></a></p>
                                                            <br />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                        :
                                        [...new Set(rekomendasi)].map((recommendation, idx) => (
                                            <div className="collapse collapse-arrow join-item border border-base-300" key={idx}>
                                                <input type="radio" name="my-accordion-4" id={`rekomendasi-${idx}`} />
                                                <div className="collapse-title font-medium">
                                                    {idx + 1}. {recommendation}
                                                </div>
                                                <div className="collapse-content bg-base-100 text-white" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    <p>
                                                        {rangkumanTautan[idx].split('<a')[0].replace(/<br>/g, '')}.
                                                        <a href={rangkumanTautan[idx].match(/href='(.*?)'/)[1]} className='text-primary'><em> (Link to Journal)</em></a>
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <Link to={'/preferences/add'} className='button is-success is-small my-4'>Add Preference</Link>
                }
            </div>
        </>
    );
};

export default DatasetChecker;