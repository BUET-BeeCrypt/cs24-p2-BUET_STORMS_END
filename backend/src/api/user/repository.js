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
	const query = `SELECT user_id, "name", username, email, active, banned, role_name FROM "User" order by user_id asc;`;
	const result = await pool.query(query,[]);
	return result.rows;
}

const getUser = async(user_id) => {
	const query = `SELECT user_id, "name", username, email, active, banned, role_name FROM "User" WHERE user_id = $1`;
	const result = await pool.query(query,[user_id]);
	if( result.rows.length === 0 ){
		throw {code:404, message: `User not found`};
	}
	return result.rows[0];
}

const createUser = async (user) => {
	const query = `INSERT INTO "User" (name, username, email, password ) VALUES ($1, $2, $3, $4) RETURNING 
	"user_id", "name", "username", "email", "active", "role_name"
	`;
	const result = await pool.query(query, [user.name, user.username, user.email, user.password]);
	if (result.rows.length === 0) {
		throw {code:404,message: `User not created`};
	}
	return result.rows[0];
}

const deleteUser = async(user_id) => {
	const query = `DELETE FROM "User" WHERE user_id = $1`;
	const result = await pool.query(query,[user_id]);
	// check if user was deleted
	if( result.rowCount === 0 ){
		throw {code:404, message: `User not found`};
	}
	return;
}

const updateUser = async (user_id, username, email, name, banned, active) => {
	const query = `UPDATE "User" SET username = $2, email = $3, "name" = $4, banned = $5, active = $6 WHERE user_id = $1 RETURNING 
	"user_id", "name", "username", "email","role_name", "active", "banned"
	`;
	const result = await pool.query(query, [user_id, username, email, name, banned, active]);
	if (result.rows.length === 0) {
		throw {code:404, message: `User not found`};
	}
	return result.rows[0];
}

const updateProfile = async (user_id, username, email, name) => {
	const query = `UPDATE "User" SET username = $2, email = $3, "name" = $4 WHERE user_id = $1 RETURNING 
	"user_id", "name", "username", "email","role_name", "active", "banned"
	`;
	const result = await pool.query(query, [user_id, username, email, name]);
	if (result.rows.length === 0) {
		throw {code:404, message: `User not found`};
	}
	return result.rows[0];
}

const getRoles = async() => {
	const query = `SELECT * FROM "Role"`;
	const result = await pool.query(query,[]);
	return result.rows;
}


const updateUserRole = async(user_id, role_name) => {
	const query = `UPDATE "User" SET role_name = $2 WHERE user_id = $1`;
	const result = await pool.query(query,[user_id,role_name]);
	// check if user was updated
	if( result.rowCount === 0 ){
		throw {code:404, message: `User not found`};
	}
	return;
}

// const deleteUserRole = async(user_id, role_id) => {
// 	const query = `DELETE FROM user_role WHERE user_id = $1 and role_id = $2`;
// 	const result = await pool.query(query,[user_id, role_id]);
// 	return;
// }


const getUserByUsername = async (username) => {
	const query = `SELECT * FROM "User" WHERE username = $1`;
	const result = await pool.query(query, [username]);
	if (result.rows.length === 0) {
		return null;
	}
	return result.rows[0];
}

const getUserByEmail = async (email) => {
	const query = `SELECT * FROM "User" WHERE email = $1`;
	const result = await pool.query(query, [email]);
	if (result.rows.length === 0) {
		return null;
	}
	return result.rows[0];
}



module.exports = {
	createUser,
	getUsers,
	getUser,
	deleteUser,
	updateUser,
	updateProfile,
	getRoles,
	updateUserRole,
	getUserByUsername,
	getUserByEmail
	// deleteUserRole
};