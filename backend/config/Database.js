import { Sequelize } from "sequelize";

const db = new Sequelize('mern_flask', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

export default db