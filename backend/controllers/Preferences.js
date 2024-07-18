import Preferences from "../models/PreferenceModel.js";
import Users from "../models/UserModel.js";
import { Op } from "sequelize";

export const getPreferences = async (req, res) => {
    try {
        let response;
        if (req.role === "admin") {
            response = await Preferences.findAll({
                attributes: ['uuid', 'gender', 'age', 'fitnessLevel', 'exerciseFrequency', 'exerciseDuration', 'balanceDiet', 'motivation'],
                include: [{
                    model: Users,
                    attributes: ['uuid', 'name'],
                }]
            });
        } else {
            response = await Preferences.findAll({
                attributes: ['uuid', 'gender', 'age', 'fitnessLevel', 'exerciseFrequency', 'exerciseDuration', 'balanceDiet', 'motivation'],
                where: {
                    userId: req.userId  // Ensure req.userId is used here
                },
                include: [{
                    model: Users,
                    attributes: ['uuid', 'name'],
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const getPreferenceById = async (req, res) => {
    try {
        const preference = await Preferences.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!preference) return res.status(404).json({ msg: "Data tidak ditemukan" });
        let response;
        if (req.role === "admin") {
            response = await Preferences.findOne({
                attributes: ['uuid', 'gender', 'age', 'fitnessLevel', 'exerciseFrequency', 'exerciseDuration', 'balanceDiet', 'motivation'],
                where: {
                    id: preference.id
                },
                include: [{
                    model: Users,
                    attributes: ['uuid', 'name'],
                }]
            });
        } else {
            response = await Preferences.findOne({
                attributes: ['uuid', 'gender', 'age', 'fitnessLevel', 'exerciseFrequency', 'exerciseDuration', 'balanceDiet', 'motivation'],
                where: {
                    [Op.and]: [{ id: preference.id }, { userId: req.userId }]
                },
                include: [{
                    model: Users,
                    attributes: ['uuid', 'name'],
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createPreference = async (req, res) => {
    const { gender, age, fitnessLevel, exerciseFrequency, exerciseDuration, balanceDiet, motivation } = req.body;
    try {
        await Preferences.create({
            gender: gender,
            age: age,
            fitnessLevel: fitnessLevel,
            exerciseFrequency: exerciseFrequency,
            exerciseDuration, balanceDiet: exerciseDuration, balanceDiet,
            motivation: motivation,
            userId: req.userId
        });
        res.status(201).json({ msg: "Preference Created Successfuly" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const updatePreference = async (req, res) => {
    try {
        const preference = await Preferences.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!preference) return res.status(404).json({ msg: "Data tidak ditemukan" });
        const { gender, age, fitnessLevel, exerciseFrequency, exerciseDuration, balanceDiet, motivation } = req.body;
        if (req.role === "admin") {
            await Preferences.update({ gender, age, fitnessLevel, exerciseFrequency, exerciseDuration, balanceDiet, motivation }, {
                where: {
                    id: preference.id
                }
            });
        } else {
            if (req.userId !== preference.userId) return res.status(403).json({ msg: "Akses terlarang" });
            await Preferences.update({ gender, age, fitnessLevel, exerciseFrequency, exerciseDuration, balanceDiet, motivation }, {
                where: {
                    [Op.and]: [{ id: preference.id }, { userId: req.userId }]
                }
            });
        }
        res.status(200).json({ msg: "Preference updated successfuly" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const deletePreference = async (req, res) => {
    try {
        const preference = await Preferences.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!preference) return res.status(404).json({ msg: "Data tidak ditemukan" });
        const { gender, age, fitnessLevel, exerciseFrequency, exerciseDuration, balanceDiet, motivation } = req.body;
        if (req.role === "admin") {
            await Preferences.destroy({
                where: {
                    id: preference.id
                }
            });
        } else {
            if (req.userId !== preference.userId) return res.status(403).json({ msg: "Akses terlarang" });
            await Preferences.destroy({
                where: {
                    [Op.and]: [{ id: preference.id }, { userId: req.userId }]
                }
            });
        }
        res.status(200).json({ msg: "Preference deleted successfuly" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
