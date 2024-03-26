const pool = require(`../../db/pool`);

/*
CREATE TABLE public.`Users`
(
    user_id serial NOT NULL,
    name character varying(256) NOT NULL,
    email character varying(256) NOT NULL,
    password character varying(512) NOT NULL,
    PRIMARY KEY (user_id)
);
*/

const getUsers = async() => {
	const query = `SELECT name, email from "User"`;
	const result = await pool.query(query,[]);
	return result.rows;
}

const getUser = async(user_id) => {
	const query = `SELECT name, email FROM "User" WHERE user_id = $1`;
	const result = await pool.query(query,[user_id]);
	if( result.rows.length === 0 ){
		throw {code:404, message: `User not found`};
	}
	return result.rows[0];
}

const createUser = async (user) => {
	const query = `INSERT INTO "User" (name, username, email, password ) VALUES ($1, $2, $3, $4) RETURNING *`;
	const result = await pool.query(query, [user.name, user.username, user.email, user.password]);
	if (result.rows.length === 0) {
		throw {code:404,message: `User not created`};
	}
	return result.rows[0];
}

const deleteUser = async(user_id) => {
	const query = `DELETE FROM "User" WHERE user_id = $1`;
	const result = await pool.query(query,[user_id]);
}

const updateUser = async (user_id, user) => {
	const query = `UPDATE "User" SET name = $2 WHERE user_id = $1`;
	const result = await pool.query(query,[user_id, user.name]);
	return;
}

const getRoles = async() => {
	const query = `SELECT * FROM "Role"`;
	const result = await pool.query(query,[]);
	return result.rows;
}


const getUserRoles = async(user_id) => {
	const query = `SELECT * FROM "Role" JOIN user_role ON "Role".role_id = user_role.role_id and user_role.user_id = $1`;
	const result = await pool.query(query,[user_id]);
	return result.rows;
}

const addUserRole = async(user_id, role_id) => {
	const query = `INSERT INTO user_role(user_id, role_id) VALUES($1, $2)`
	const result = await pool.query(query,[user_id,role_id]);
	return;
}

const deleteUserRole = async(user_id, role_id) => {
	const query = `DELETE FROM user_role WHERE user_id = $1 and role_id = $2`;
	const result = await pool.query(query,[user_id, role_id]);
	return;
}





module.exports = {
	createUser,
	getUsers,
	getUser,
	deleteUser,
	updateUser,
	getRoles,
	getUserRoles,
	addUserRole,
	deleteUserRole
};