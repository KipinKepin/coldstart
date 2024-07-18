export const getRecommendations = (userPreferences, modelCosine, unique_exercises, exercise_to_index) => {
    const { train_data, nama_olahraga, rangkuman, link_jurnal } = modelCosine;

    function createExerciseVector(person, exerciseToIndex) {
        let vector = new Array(Object.keys(exerciseToIndex).length).fill(0);
        person.Exercise.split(";").forEach(exercise => {
            exercise = exercise.trim();
            if (exerciseToIndex.hasOwnProperty(exercise)) {
                vector[exerciseToIndex[exercise]] = 1;
            }
        });
        return vector;
    }

    let userPreferencesVector = userPreferences.slice(0, unique_exercises.length);
    if (userPreferencesVector.length < unique_exercises.length) {
        userPreferencesVector = userPreferencesVector.concat(Array(unique_exercises.length - userPreferencesVector.length).fill(0));
    }

    let trainVectors = train_data.map(person => createExerciseVector(person, exercise_to_index));
    if (trainVectors.length === 0) {
        return [];
    }

    function cosineSimilarity(vec1, vec2) {
        const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
        const magnitude = vec => Math.sqrt(vec.reduce((acc, val) => acc + val * val, 0));
        const mag1 = magnitude(vec1);
        const mag2 = magnitude(vec2);
        return dotProduct / (mag1 * mag2);
    }

    let similarities = trainVectors.map(vec => cosineSimilarity(userPreferencesVector, vec));
    similarities = similarities.filter(value => !isNaN(value));
    if (similarities.length === 0) {
        return [];
    }

    let similarityIndices = similarities
        .map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

    if (similarityIndices.length < 3) {
        return [];
    }

    let recommendedExercises = similarityIndices.flatMap(({ index }) =>
        trainVectors[index]
            .map((val, idx) => val === 1 ? unique_exercises[idx] : null)
            .filter(exercise => exercise !== null)
    );

    recommendedExercises = [...new Set(recommendedExercises)];

    recommendedExercises = recommendedExercises.slice(0, 3);

    function findIndices(namaOlahraga, recommendedExercises) {
        let indicesDict = {};

        recommendedExercises.forEach(word => {
            indicesDict[word.toLowerCase()] = [];
        });

        namaOlahraga.forEach((word, idx) => {
            let lowerWord = word.toLowerCase();
            if (lowerWord in indicesDict) {
                indicesDict[lowerWord].push(idx);
            }
        });

        return indicesDict;
    }

    let indicesDict = findIndices(nama_olahraga, recommendedExercises);
    let recommendations = [];

    for (let key in indicesDict) {
        let indices = indicesDict[key];
        let summaryLinks = [];

        for (let idx of indices) {
            summaryLinks.push({
                summary: rangkuman[idx],
                link: link_jurnal[idx]
            });
        }
        recommendations.push({
            exercise: key,
            details: summaryLinks
        });
    }

    return recommendations;
};
