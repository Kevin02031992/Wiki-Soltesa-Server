const { Console, log } = require('console');
const dbpgMysql = require('../util/database-mysql');

const fs = require('fs');

/***********************************************************************************/
// Obtener las publicaciones de acuerdo con los siguientes parámetros de búsqueda
// @index: Índice de pagina en que se encuentra el usuario.
// @pageSize: Numero de registros que debe retornar la consulta.
// @searchValue: Criterio de búsqueda indicado por el usuario.
/***********************************************************************************/
exports.getPosts = (req, res, next) => {

    index = req.body.index;

    searchValue = req.body.searchValue;

    pageSize = req.body.pageSize;

    user = req.user.user;

    dbpgMysql.query(`
        SELECT
            post.post_cod as cod,
            post.title,
            user_name as creator,
            COALESCE((
                SELECT true
                FROM favorite_post
                WHERE post.post_cod = favorite_post.post_cod AND favorite_post.user_cod = '${user}'), FALSE) AS favorite,
            post.description,
            post.date as creation_date
        FROM post
            JOIN user ON user.user_cod = post.user_cod
            LEFT JOIN post_has_categories on post.post_cod = post_has_categories.post
            LEFT JOIN category on post_has_categories.category = category.cod 
        WHERE
            post.status = 1 AND 
            post.visibility = true AND
            (LOWER(post.title) like LOWER('%${searchValue}%') OR
            LOWER(post.description) like LOWER('%${searchValue}%') OR
            LOWER(category.description) like LOWER('%${searchValue}%'))
        GROUP BY post.post_cod, post.title, post.description, user_name, post.date
        ORDER BY post.date DESC`
    ).then(posts => {

        rowCount = posts[0].length;
        posts = posts[0].splice(index, pageSize);

        dbpgMysql.query('SELECT post_has_categories.cod, post, description FROM post_has_categories join category on category.cod = post_has_categories.category'
        ).then(categories => {

            categories = categories[0];
            posts.forEach(x => {

                var temp = categories.filter(function (item) {
                    if (item.post == x.cod) {
                        return item;
                    }
                });

                x.post_categories = temp;
                x.files = [];
                x.comments = [];
            });

            res.status(200).json([rowCount, posts])
        })
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

};

/***********************************************************************************/
// Obtener las publicaciones de un usuario de acuerdo con los siguientes parámetros de búsqueda
// @index: Índice de pagina en que se encuentra el usuario.
// @pageSize: Numero de registros que debe retornar la consulta.
// @searchValue: Criterio de búsqueda indicado por el usuario.
// @isFavorite: Indica si se solicitan las publicaciones favoritas del usuario 
/***********************************************************************************/
exports.getUserPosts = (req, res, next) => {

    user = req.user.user;

    role = req.user.role;

    pageSize = req.body.pageSize;

    index = req.body.index * pageSize;

    searchValue = req.body.value;

    isFavorite = req.body.isFavorite;

    type = req.body.type;

    request = '';

    if (type === 'per') {
        request = `SELECT
            post.post_cod as cod,
            post.title,
            user_name as creator,
            post.status as status,
            COALESCE((
                SELECT true
                FROM favorite_post
                WHERE post.post_cod = favorite_post.post_cod and favorite_post.user_cod = '${user}'), FALSE) AS favorite,
            post.description,
            post.date as creation_date
        FROM post
            JOIN user ON user.user_cod = post.user_cod
            LEFT JOIN post_has_categories on post.post_cod = post_has_categories.post
            LEFT JOIN category on post_has_categories.category = category.cod
        WHERE
            user.user_cod = '${user}' AND
            (LOWER(post.title) like LOWER('%${searchValue}%') OR
            LOWER(post.description) like LOWER('%${searchValue}%') OR
            LOWER(category.description) like LOWER('%${searchValue}%'))
        GROUP BY post.post_cod, post.title, post.description, user_name, post.date, post.status
        ORDER BY post.date DESC`
    }

    if (type === 'des') {
        request = `SELECT
            post.post_cod as cod,
            post.title,
            user_name as creator,
            true AS favorite,
            post.description,
            post.date as creation_date
        FROM post
            JOIN user ON user.user_cod = post.user_cod
            LEFT JOIN post_has_categories on post.post_cod = post_has_categories.post
            LEFT JOIN category on post_has_categories.category = category.cod 
            JOIN favorite_post on favorite_post.post_cod = post.post_cod
        WHERE
            favorite_post.user_cod = '${user}' AND
            (LOWER(post.title) like LOWER('%${searchValue}%') OR
            LOWER(post.description) like LOWER('%${searchValue}%') OR
            LOWER(category.description) like LOWER('%${searchValue}%'))
        GROUP BY post.post_cod, post.title, post.description, user_name, post.date
        ORDER BY post.date DESC`
    }

    if (type === 'asig') {

        request = `SELECT
        post.post_cod as cod,
        post.title,
        user_name as creator,
        post.status as status,
        COALESCE((
            SELECT true
            FROM favorite_post
            WHERE post.post_cod = favorite_post.post_cod and favorite_post.user_cod = '${user}'), FALSE) AS favorite,
        post.description,
        post.date as creation_date
    FROM assign_editor_user
        JOIN post ON assign_editor_user.post_cod = post.post_cod
        JOIN user ON user.user_cod = post.user_cod
        LEFT JOIN post_has_categories on post.post_cod = post_has_categories.post
        LEFT JOIN category on post_has_categories.category = category.cod
    WHERE
        assign_editor_user.user_cod = '${user}' AND
        (LOWER(post.title) like LOWER('%${searchValue}%') OR
        LOWER(post.description) like LOWER('%${searchValue}%') OR
        LOWER(category.description) like LOWER('%${searchValue}%'))
    GROUP BY post.post_cod, post.title, post.description, user_name, post.date, post.status
    ORDER BY post.date DESC`
    }



    dbpgMysql.query(request
    ).then(posts => {

        rowCount = posts[0].length;
        posts = posts[0].splice(index, pageSize)

        dbpgMysql.query(
            'SELECT post_has_categories.cod, post, description FROM post_has_categories join category on category.cod = post_has_categories.category'
        ).then(categories => {
            categories = categories[0];


            posts.forEach(x => {

                var temp = categories.filter(function (item) {
                    if (item.post == x.cod) {
                        return item;
                    }
                });

                x.post_categories = temp;
                x.files = [];
                x.comments = [];
            });

            res.status(200).json([rowCount, posts]);
        })


    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

};

/***********************************************************************************/
// Obtener una publicación con categorías, archivos y comentarios.
// @cod: Código de la publicación.
/***********************************************************************************/
exports.getPost = (req, res, next) => {

    cod = req.params.cod;

    user = req.user.user;

    dbpgMysql.query(`
        SELECT 
	        post_cod as cod, 
	        title, 
	        description, 	
	        user_name as creator, 
	        date as creation_date, 
	        visibility, 
	        comments as comment,
	        EXISTS(
                SELECT 
                        * 
                    FROM favorite_post 
                    WHERE post.post_cod = favorite_post.post_cod and favorite_post.user_cod = '${user}'
            ) AS favorite
        FROM post 
            JOIN user ON user.user_cod = post.user_cod
        WHERE post_cod = ${cod}`
    ).then(post => {
        post = post[0][0];

        dbpgMysql.query(
            `
            SELECT 
                post_has_categories.cod, 
                post, 
                description 
            FROM post_has_categories 
                join category on category.cod = post_has_categories.category
            WHERE post_has_categories.post = ${cod} 
            `
        ).then(categories => {
            categories = categories[0];

            dbpgMysql.query(`
                SELECT 
                    file_cod AS cod, 
                    name, 
                    type, 
                    True as upload
                FROM file
                WHERE post_cod = ${cod};
                `
            ).then(files => {

                dbpgMysql.query(`
                    SELECT 
                        comment_cod AS cod, 
                        description AS comment, 
                        user_cod AS user, date  
                    FROM comment
                    WHERE post_cod = ${cod} ORDER BY date DESC ;
                    `
                ).then(comments => {


                    post.post_categories = categories;
                    post.files = files[0];
                    post.comments = comments[0];

                    res.status(200).json(post);
                })
            })
        })

    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

};

/***********************************************************************************/
// Publicar comentario 
// @user: Usuario que realiza el commentario
// @Comment: Texto del comentario
// @post: Código de la publicación.
/***********************************************************************************/
exports.postComment = (req, res, next) => {

    user = req.user.user;
    comment = req.body.comment;
    date = new Date();
    post = req.body.post;

    dbpgMysql.query(`
        INSERT INTO comment
            (user_cod, description, post_cod, date)
            VALUES ('${user}', '${comment}', ${post}, '${date.toLocaleDateString()}');
        `).then(() => {

        res.status(200).json();

    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

};

/***********************************************************************************/
// Proceso para asignar el estado de favorito a una publicación. 
// @user: Usuario que agrega el favorito.
// @post: Código de la publicación.
/***********************************************************************************/
exports.postFavorite = (req, res, next) => {

    user = req.user.user;
    cod = req.body.cod;

    insertQuery = ` INSERT INTO favorite_post(user_cod, post_cod) VALUES ('${user}', ${cod}); `;

    deleteQuery = `DELETE FROM favorite_post WHERE post_cod = ${cod} and user_cod = '${user}'`

    dbpgMysql.query(`Select cod FROM favorite_post WHERE post_cod = ${cod} and user_cod = '${user}' `).then((result) => {

        if (result[0].length > 0) {
            dbpgMysql.query(
                deleteQuery
            ).then(() => {
                res.status(200).json();
            })
        } else {
            dbpgMysql.query(insertQuery
            ).then(() => {
                res.status(200).json();
            })
        }

    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });
}

/***********************************************************************************/
// Retorna el listado de categorías disponibles en el sistema. 
/***********************************************************************************/
exports.getCategories = (req, res, next) => {
    dbpgMysql.query(`
        SELECT *
        FROM category
        `
    ).then(posts => {
        res.status(200).json(posts[0]);
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

};

/***********************************************************************************/
// Permite eliminar un comentario de una publicación.
/***********************************************************************************/
exports.deleteComment = (req, res, next) => {

    date = new Date();
    user = req.user.user;

    dbpgMysql.query(`
        DELETE 
        FROM comment
        WHERE comment_cod = ${req.params.cod};`
    ).then(() => {
        res.status(200).json();
    }).catch(() => {
        res.status(500).json('Internal Server Error');
    });
}

/***********************************************************************************/
// Permite eliminar una publicación.
/***********************************************************************************/
exports.deletePost = (req, res, next) => {

    date = new Date();
    user = req.user.user;
    
    dbpgMysql.query(`
        SELECT rute  
        FROM file
        WHERE post_cod = ${req.params.cod}; `
    ).then((routes) => {
        dbpgMysql.query(`
            DELETE 
            FROM post_has_categories
            WHERE post = ${req.params.cod};
         
            DELETE 
            FROM file
            WHERE post_cod = ${req.params.cod};
         
            DELETE 
            FROM favorite_post
            WHERE post_cod = ${req.params.cod};
         
            DELETE 
            FROM comment
            WHERE post_cod = ${req.params.cod};
         
            DELETE 
            FROM post
            WHERE post_cod = ${req.params.cod};
             `
        ).then(() => {
            if (routes[0].length > 0) {
                routes[0].forEach(route => {
                    fs.unlinkSync('./files/' + route.rute);

                });
            }

            res.status(200).json();
        })

    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

};

/***********************************************************************************/
// Permite subir los archivos adjuntos de una publicación. 
/***********************************************************************************/
exports.uploadFiles = (req, res, next) => {
    console.log(req.files);
    cod = req.params.cod;

    dbpgMysql.query(`
        SELECT post_cod FROM post ORDER BY post_cod DESC LIMIT 1; 
          `).then((date) => {

        if (req.params.cod == 0) {
            cod = date[0][0].post_cod;
        }

        req.files.forEach(file => {
            dbpgMysql.query(`
                INSERT INTO file(
                    rute, type, post_cod, name)
                    VALUES ('${(file.path).substring(5)}', '${file.mimetype}', ${cod}, '${file.originalname}');
                  `
            )
        });

        res.status(200).json(true);
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

}


/***********************************************************************************/
// Permite agregar una nueva publicación. 
/***********************************************************************************/
exports.newPost = (req, res, next) => {

    title = req.body.title;
    description = req.body.description;
    creator = req.user.user;
    creation_date = (new Date()).toISOString().split('T')[0];
    post_categories = req.body.post_categories;
    files = req.body.files;
    favorite = req.body.favorite;
    comment = req.body.comment;
    visibility = req.body.visibility;

    post_categories.forEach(category => {

        if (category.cod == 0) {
            dbpgMysql.query(`INSERT INTO category(description) VALUES ('${category.description}');`
            ).catch(err => {
                res.status(500).json('Internal Server Error');
                return;
            });
        }
    });

    dbpgMysql.query(`
                INSERT INTO post(
                    title, description, user_cod, date, user_approver, status, comments, visibility)
                    VALUES ('${title}', '${description}', '${creator}', ('${creation_date}')  , null, 2, ${comment}, ${visibility});
                `
    ).then(() => {
        dbpgMysql.query(`
                    SELECT post_cod FROM post ORDER BY post_cod DESC LIMIT 1;  

                    `
        ).then(cod => {
            cod = cod[0][0].post_cod;
            
            for (let index = 0; index < post_categories.length; index++) {
                const element = post_categories[index];
                
            }
            
            post_categories.forEach(x => {

                dbpgMysql.query(`
                        INSERT INTO post_has_categories(
                            post, category)
                            VALUES ('${cod}', (Select cod from category where description = '${x.description}' LIMIT 1));

                      `
                )
            })
            
            res.status(200).json(true);
            
        })
    }).catch(err => {
        
        res.status(500).json('Internal Server Error');
        
    });


}

/***********************************************************************************/
// Permite actualizar una publicación.
/***********************************************************************************/
exports.updatePost = (req, res, next) => {

    console.log(req.body);
    cod = req.body.cod;
    title = req.body.title;
    description = req.body.description;
    creator = req.user.user;
    creation_date = req.body.creation_date;
    post_categories = req.body.post_categories;
    files = req.body.files;
    favorite = req.body.favorite;
    comment = req.body.comment;
    visibility = req.body.visibility;

    post_categories.forEach(category => {
        if (category.cod == 0) {
            dbpgMysql.query({
                text: `
                INSERT INTO category(
                     description)
                    VALUES ('${category.description}');
                    `
            }).catch(err => {
                res.status(500).json('Internal Server Error');
                return;
            });
        }
    });

    let text = `Delete From file where post_cod = ${cod} `;

    let select = `Select name From file where post_cod = ${cod}`;


    if (files.length > 0) {
        select += 'and (';
        text += 'and (';
        files.forEach((file) => {
            text += ` file_cod != ${file.cod} or`;
            select += ` file_cod != ${file.cod} or`
        })
        text = text.slice(0, text.length - 2)
        select = select.slice(0, select.length - 2)
        text += ' )';
        select += ' )';
    }

    text += ';';
    select += ';';

    dbpgMysql.query(
        select
    ).then((result) => {
        result[0].forEach((file) => {
            fs.unlinkSync('./files/' + file.name);
        })
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

    dbpgMysql.query(` DELETE FROM post_has_categories WHERE post = ${cod}; ${text}
        UPDATE post SET title='${title}', description='${description}', comments=${comment}, status= 2, visibility=${visibility} WHERE post_cod=${cod};`
    ).then(() => {

        post_categories.forEach(category => {
            dbpgMysql.query(`
                INSERT INTO post_has_categories(
                post, category)
                VALUES ('${cod}', (Select cod from category where description = '${category.description}' LIMIT 1));`
            )
        })
        res.status(200).json();
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });


}

/***********************************************************************************/
// Permite la descarga de un archivo adjunto de una publicación.
/***********************************************************************************/
exports.getFile = (req, res, next) => {


    dbpgMysql.query(`
        SELECT rute  
        FROM file
        WHERE file_cod = ${req.params.cod}; `
    ).then((routes) => {
        res.download('./files/' + routes[0][0].rute, routes[0][0].rute, function (err) {
            if (err) {
            } else {
                next();
            } 
        });
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

}
/***********************************************************************************/
// Retorna el listado de publicaciones pedientes de aprovación.
/***********************************************************************************/
exports.getPendingPost = (req, res, next) => {

    let type = req.body.type;

    let value = req.body.value;

    let pageSize = req.body.pageSize;

    let index = req.body.index * pageSize;

    dbpgMysql.query(`
        SELECT 
	        post.post_cod as cod, 
	        post.title, 	
	        user_name as creator, 
	        false AS favorite, 
            post.description, 
            post.date as creation_date,
            post.status
        FROM post 	
            JOIN user ON user.user_cod = post.user_cod
            LEFT JOIN post_has_categories on post.post_cod = post_has_categories.post
            LEFT JOIN category on post_has_categories.category = category.cod
        WHERE 
            (LOWER(post.title) like LOWER('%${value}%') OR 
            LOWER(post.description) like LOWER('%${value}%')) and post.status = ${type} GROUP BY post.post_cod, post.title, post.description, user_name, post.date `
    ).then(posts => {

        rowCount = posts[0].length;
        posts = posts[0].splice(index, pageSize);

        dbpgMysql.query(
            'SELECT post_has_categories.cod, post, description FROM post_has_categories join category on category.cod = post_has_categories.category'
        ).then(categories => {

            categories = categories[0];
            posts.forEach(x => {

                var temp = categories.filter(function (item) {
                    if (item.post == x.cod) {
                        return item;
                    }
                });

                x.post_categories = temp;
                x.files = [];
                x.comments = [];
            });

            res.status(200).json([rowCount, posts]);

        })
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

}

/***********************************************************************************/
// Permite cambiar el estado de una publicación.
/***********************************************************************************/
exports.updateState = (req, res, next) => {
    cod = req.body.cod;
    state = (req.body.status) ? 1 : 3;
    user = req.user.user;
    date = new Date();

    dbpgMysql.query(
        `
        UPDATE post SET status= ${state}, user_approver= '${user}'
	    WHERE post_cod=${cod};
    `
    ).then(() => {
        res.status(200).json();

    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });
}

/***********************************************************************************/
// Permite obtener los comentarios de una publicación.
/***********************************************************************************/
exports.getComments = (req, res, next) => {

    cod = req.params.cod;
    dbpgMysql.query(`
        SELECT 
        comment_cod AS cod, 
        description AS comment, 
        user_cod AS user, date  
        FROM comment
        WHERE post_cod = ${cod} ORDER BY date DESC ;
        `
    ).then(comments => {
        res.status(200).json(comments[0]);
    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

};

/***********************************************************************************/
// Asigna la edición de una publicación a un usuario 
// @assignedUser: Usuario asignado a realizar el cambio 
// @post: Código de la publicación asignada.
/***********************************************************************************/
exports.assignPost = (req, res, next) => {

    //admin = req.user.user;
    assignedUser = req.body.assignedUser;
    post = req.body.post;


    console.log(assignedUser, post);
    res.status(200).json();

    dbpgMysql.query(`
        INSERT INTO assign_editor_user
            (user_cod, post_cod)
            VALUES ('${assignedUser}', ${post});
        `).then(() => {

        res.status(200).json();

    }).catch(err => {
        res.status(500).json('Internal Server Error');
    });

};
