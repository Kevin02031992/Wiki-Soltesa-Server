const dbpgMysql = require('../util/database-mysql');
const emailController = require('./email');
const authenticateToken = require('../middleware/authenticateToken');

var forge = require('node-forge');

/***********************************************************************************/
// Obtener la lista de usuarios existentes en el sistema y 
// retornarla junto con la descripción de sus roles
/***********************************************************************************/
exports.getUsers = (req, res, next) => {

    dbpgMysql.query(`
        SELECT 
            user_cod as cod,
            user_name as name,
            email, 
			(SELECT description 
			FROM role 
			Where role.cod = role) as role,
            role as role_cod,
            status
        FROM user
        `
    ).then(result => {
        res.status(200).json(result[0]);
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    })

};

/***********************************************************************************/
// Obtener la lista de roles y sus descripciones
/***********************************************************************************/
exports.getRoles = (req, res, next) => {

    dbpgMysql.query(`SELECT * FROM role`
    ).then(result => {
        res.status(200).json(result[0]);
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    })

};

/***********************************************************************************/
// Actualizar contraseña de un usuario 
/***********************************************************************************/
exports.updatePassword = (req, res, next) => {

    console.log(req.user);

    var rsa = forge.pki.privateKeyFromPem(process.env.RSA_PRIVATE_KEY);

    old = rsa.decrypt(forge.util.decode64(req.body.old), "RSA-OAEP");

    newPassword = rsa.decrypt(forge.util.decode64(req.body.new), "RSA-OAEP");

    old = encrypted(old);

    newPassword = encrypted(newPassword);

    user = req.user.user;

    dbpgMysql.query(`
        SELECT pin = '${old}' as valid
        From user 
        where user_cod='${user}'`
    ).then((result) => {
        if (result[0][0].valid) {
            dbpgMysql.query(`
                UPDATE user
                SET pin='${newPassword}'
                WHERE user_cod='${user}'; `
            ).then(() => {
                res.status(200).json();
            }).catch(err => {
                res.status(500).json('Internal Server Error');
            });
        }
    })
};

/***********************************************************************************/
// Encriptado de textos usando Node-Forge con un SHA-256
/***********************************************************************************/
function encrypted(plainText) {
    var md = forge.md.sha256.create();
    md.update(plainText);
    return md.digest().toHex();
}

/***********************************************************************************/
// Creación de un usuario
/***********************************************************************************/
exports.createUser = (req, res, next) => {

    cod = req.body.cod;
    username = req.body.name;
    email = req.body.email;
    role = req.body.role;
    state = req.body.status;
    pin = getRandomInt();
    pind = pin;
    pin = encrypted(pin + '');

    dbpgMysql.query(
        `SELECT 
            EXISTS(
                    SELECT 
                        user_cod 
                    FROM user 
                    WHERE 
                        user_cod = '${cod}' 
                        or email = '${email}')`
    ).then(result => {
        if (result[0][0].exists) {
            res.status(200).json(false);
        } else {
            dbpgMysql.query(`
            INSERT INTO user(
                user_cod, user_name, pin, email, role, status)
                VALUES(lower('${cod}'), '${username}', '${pin}', lower('${email}'), ${role}, ${state});`
            ).then(() => {
                emailController.sendEmail(pind, username, email);
                res.status(200).json(true);
            })
        }
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    })

};

/***********************************************************************************/
// Actualizar un usuario
/***********************************************************************************/
exports.updateUser = (req, res, next) => {

    cod = req.body.cod;
    username = req.body.name;
    email = req.body.email;
    role = req.body.role;
    state = req.body.status;

    dbpgMysql.query(`
        SELECT EXISTS(
            SELECT user_cod 
                FROM user 
                WHERE user_cod != '${cod}' 
                AND email = '${email}')`
    ).then((exist) => {
        if (exist[0][0].exists) {
            res.status(200).json(false);
        } else {
            dbpgMysql.query(`
                UPDATE user
                SET user_name='${username}', 
                    email= lower('${email}'), 
                    role=${role}, 
                    status=${state}
                WHERE user_cod='${cod}';
        `).then(() => {
                res.status(200).json(true);
            }).catch(err => {
                res.status(500).json('Internal Server Error');
            });
        }
    })
};

/***********************************************************************************/
// Realizar inicio de sesión 
/***********************************************************************************/
exports.login = (req, res, next) => {
    var rsa = forge.pki.privateKeyFromPem(process.env.RSA_PRIVATE_KEY);

    user = req.body.user;

    console.log('Login accedido' );
    console.log(user);
    password = rsa.decrypt(forge.util.decode64(req.body.password), "RSA-OAEP");

    password = encrypted(password);

    date = new Date();

    dbpgMysql.query(`
        SELECT 
            user_cod AS user, 
            user_name AS name, 
            email, 
            role, 
            status
	    FROM 
            user 
        WHERE 
            (user_cod = lower('${user}') 
            OR email = lower('${user}')) 
            AND pin = '${password}' 
            AND status = 1;`,
    ).then((tokenInfo) => {
        if (tokenInfo.rowCount != 0) {
            res.send({ 'token': authenticateToken.authorization( tokenInfo[0][0]) });
            dbpgMysql.query(`
                INSERT INTO action_log(user, description, date, action) VALUES ( lower('${user}'), 'Inicio de sesión de usuario', '${date.toISOString().split('T')[0]}', 4);`
            )
        } else {
            res.status(401).send(null);
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json('Internal Server Error');
    });

}

/***********************************************************************************/
// Generador Random de contraseñas de 4 dígitos numéricos
/***********************************************************************************/
function getRandomInt() {
    return Math.floor(Math.random() * (9999 - 1000)) + 1000;
}