// take the connection pool capabilities from the pg module
const { Pool } = require('pg');

let cfg = require('./config.json')

let express = require('express');
let cors = require('cors')
const app = express();
app.use(express.static('public')); // host public folder
app.use(cors()); // allow all origins -> Access-Control-Allow-Origin: *

const pool = require('./pool.js');  // the database pool

// EX3: this is necessary to allow parsing request bodies which contain json 
// it is also necessary to set the proper content type (application/json) in the request (e.g. in postman or RESTer)
let bodyParser = require('body-parser');
const { response, request } = require('express');
const { user } = require('pg/lib/defaults');
const res = require('express/lib/response');
const req = require('express/lib/request');
app.use(bodyParser.json()); // support json encoded bodies

app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send("This is a simple database-backed application");
});

const addUser = (request, response) => {
    if (request.body == null){
        response.status(400).json({
            "message": "body is empty"
        })
        return;
    }

    const id = request.body.id;
    const name = request.body.name;
    const password = request.body.password;
    const role = request.body.role;

    if (id == null || id === ""){
        response.status(400).json({
            "message": "id must be specified"
        })
        return;
    }

    if(name == null || name === ""){
        response.status(400).json({
            "message": "title must be specified"
        })
        return;
    }

    if (password == null || password === ""){
        response.status(400).json({
            "message": "password must be specified"
        })
        return;
    }

    if(role == null || role === ""){
        response.status(400).json({
            "message": "role must be specified"
        })
        return;
    }

    webuser = pool.query("INSERT INTO users(userid, name, role, password) VALUES ($1, $2, $3, $4)", [id, name, role, password], (error, results) => {
        if (error){
            response.status(409).send({"message": "Conflict: Add not possibly"});
        }
        response.status(200).json({"message": 'User with name ' + name + ' added'});
        return;
    });
}

const findUser = (request, response) => {
    const id = request.params.id;

    webuser = pool.query("SELECT * FROM users WHERE userid = $1", [id], (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No User with this name!!!");
        }
        response.status(200).send(getUser(results));
    });
}

const deleteUser = (request, response) => {
    const id = request.params.id;

    webuser = pool.query("Select * from users Where userid = $1", [id], (error, results) => {
        if(error){
            response.status(409).send("Conflict");
            return;
        }
        if(results.rows.length < 1) {
            res.status(404).json({
				"message": "no category with id="+id+" found - nothing to delete"
			});
			return;
        }
    })

    webuser = pool.query("DELETE FROM public.users WHERE userid = $1", [id], (error, results) => {
        if(error){
            response.status(409).json({
                "message": "Conflict: Delete not possibly"
            });
            return;
        }
        response.status(200).json({
            "message": 'User with id ' + id + ' deleted'
        });
        return;
    })
}

const updateUser = (request, response) => {
    const id = request.params.id;
    const name = request.body.name;
    const password = request.body.password;
    const role = request.body.role;

    webuser = pool.query("UPDATE public.users SET name = $1, password = $2, role = $3 WHERE userid = $4", [name, password, role, id], (error, results) => {
        if(error){
            response.status(404).send("User with this id is not avaiable.");
        }
        if(results.rowCount == 0){
            response.status(404).send("User with this id is not avaiable.");
        }
        response.status(200).json({"message":'User with id ' + id +' edited'});
    });
}

const findMenuItem = (request, response) => {
    const id = request.params.id;

    menuItem = pool.query("SELECT * FROM public.items Where itemid = $1;", [id], (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No Menu with this title!!!");
        }
        response.status(200).send(getMenuItem(results));
    });
}

const addMenuItem = (request, response) => {
    const id = request.body.id;
    const title = request.body.title;
    const description = request.body.description;
    const price = request.body.price;
    const likes = request.body.likes;
    const dislikes = request.body.dislikes;
    const status = request.body.status;
    const allergene = request.body.allergene;
    const categories = request.body.categories_id;

    if (id == null || id === ""){
        response.status(400).json({
            "message": "id must be specified"
        })
        return;
    }

    if(title == null || title === ""){
        response.status(400).json({
            "message": "title must be specified"
        })
        return;
    }

    if (description == null || description === ""){
        response.status(400).json({
            "message": "description must be specified"
        })
        return;
    }

    if(price == null || price === ""){
        response.status(400).json({
            "message": "price must be specified"
        })
        return;
    }

    if(allergene == null || allergene === ""){
        response.status(400).json({
            "message": "allergene must be specified"
        })
        return;
    }

    if(categories == null){
        response.status(400).json({
            "message": "categories must be specified"
        })
        return;
    }

    menuItem = pool.query("INSERT INTO public.items(itemid, title, description, price, likes, dislikes, status) VALUES ($1, $2, $3, $4, $5, $6, $7);", [id, title, description, price, likes, dislikes, status], (error, results) => {
        if(error){
            response.status(409).json({
                "message": "Conflict: Add not possibly"}
            );
        }
    });
    
    for (let category of categories){
        category_object = pool.query("INSERT INTO public.item_hascategory(itemid, categoryid) VALUES ($1, $2);", [id, category], (error, results) => {
            if(error){
                response.status(409).json({
                    "message": "Conflict: Add not possibly"}
                );
            }
            
        })
    }

    for (let allergen of allergene){
        allergen_object = pool.query("INSERT INTO public.item_hasallergens(itemid, allergen) VALUES ($1, $2);", [id, allergen], (error, results) => {
            if(error){
                response.status(409).json({
                    "message": "Conflict: Add not possibly"}
                );
            }
        });
    }
    response.status(200).json({"message": "Add was successful"});
    return;
}

const deleteMenuItem = (request, response) => {
    const id = request.params.id;

    menuItem = pool.query("Select * from items Where itemid = $1", [id], (error, results) => {
        if(error){
            response.status(409).send("Conflict");
            return;
        }
        if(results.rows.length < 1) {
            res.status(404).json({
				"message": "no menu item with id="+id+" found - nothing to delete"
			});
			return;
        }
    })

    menuItem = pool.query("DELETE FROM items WHERE itemid = $1", [id], (error, results) => {
        if(error){
            response.status(409).json({
                "message": "Conflict: Delete not possibly"
            });
            return;
        }
    });

    category = pool.query("Delete from item_hascategory Where itemid = $1", [id], (error, result) => {
        if(error){
            response.status(409).json({
                "message": "Conflict: Delete not possibly"
            });
            return;
        }
    });

    allergene = pool.query("Delete from item_hasallergens Where itemid = $1", [id], (error, results) => {
        if(error){
            response.status(409).json({
                "message": "Conflict: Delete not possibly"
            });
            return;
        }
    });

    response.status(200).json({
        "message": "Menu with the id " + id + " deleted"
    });
    return;
}

const deleteCategoryFromMenuItem = (request, response) => {
    const id = request.params.id;
    const category = request.params.category;

    menuItem = pool.query("DELETE FROM menu_item_category WHERE menu_item_id = $1 AND category_id = $2", [id, category], (error, results) => {
        if(error){
            response.status(409).send("Conflict: Delete not possibly");
        }
        response.status(200).json({"message": "Category " + category + " by menu with the id " + id + " deleted"});
        return;
    });
}

const updateMenuItem = (request, response) => {
    const id = request.params.id;
    const title = request.body.title;
    const description = request.body.description;
    const price = request.body.price;
    const status = request.body.status;

    menuItem = pool.query("UPDATE public.items	SET title=$1, description=$2, price=$3, status=$4 WHERE itemid = $5;", [title, description, price, status, id], (error, results) => {
        if(error){
            response.status(404).send("Menu item with this id is not avaiable.");
        }
        if(results.rowCount == 0){
            response.status(404).send("Menu item with this id is not avaiable.");
        }
        response.status(200).json({"message":"Menu Item with id " + id + " edited"});
    });
}

const likeMenuItem = (request, response) => {
    const id = request.params.id;

    menuItem = pool.query("UPDATE public.items SET likes=likes+1 WHERE itemid = $1;", [id], (error, results) => {
        if(error){
            response.status(404).send("Menu item with this id is not avaiable.");
        }
        if(results.rowCount == 0){
            response.status(404).send("Menu item with this id is not avaiable.");
        }
        response.status(200).json({"message":"Menu Item with id " + id + " liked"});
    });
}

const dislikeMenuItem = (request, response) => {
    const id = request.params.id;

    menuItem = pool.query("UPDATE public.items SET dislikes=dislikes+1 WHERE itemid = $1;", [id], (error, results) => {
        if(error){
            response.status(404).send("Menu item with this id is not avaiable.");
        }
        if(results.rowCount == 0){
            response.status(404).send("Menu item with this id is not avaiable.");
        }
        response.status(200).json({"message":"Menu Item with id " + id + " disliked"});
    });
}

const addCategorie = (request, response) => {
    if (request.body == null){
        response.status(400).json({
            "message": "body is empty"
        })
        return;
    }

    const id = request.body.id;
    const title = request.body.name;
    const description = request.body.description;

    if (id == null || id === ""){
        response.status(400).json({
            "message": "id must be specified"
        })
        return;
    }

    if(title == null || title === ""){
        response.status(400).json({
            "message": "title must be specified"
        })
        return;
    }

    if(description == null || description === ""){
        response.status(400).json({
            "message": "description must be specified"
        })
        return;
    }

    resultID = pool.query("SELECT * FROM public.category WHERE categoryid = $1", [id], (error, results) => {
        if (results.rowCount > 0) {
            res.status(400).json({
                "message": "object with id "+ id + " already exits"
            });
            return;
        }
    });

    category = pool.query("INSERT INTO public.category( categoryid, title, description) VALUES ($1, $2, $3)", [id, title, description], (error, results) => {
        if(error){
            response.status(409).send("Conflict: Add not possibly");
            return;
        }
        response.status(200).json({
            "message": "Category with the title " + title + " added"});
            return;
    });
}

const findCategory = (request, response) => {
    const id = request.params.id;

    category = pool.query("SELECT * FROM public.category WHERE categoryid = $1", [id], (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No Category with this title!!!");
        }
        response.status(200).send(getCategories(results));
    });
}

const deleteCategory = (request, response) => {
    const id = request.params.id;

    category = pool.query("Select * from category Where categoryid = $1", [id], (error, results) => {
        if(error){
            response.status(409).send("Conflict");
            return;
        }
        if(results.rows.length < 1) {
            res.status(404).json({
				"message": "no category with id="+id+" found - nothing to delete"
			});
			return;
        }
    })

    category = pool.query("DELETE FROM public.category WHERE categoryid = $1", [id], (error, results) => {
        if(error){
            response.status(409).json({
                "message": "Conflict: Delete not possibly"
            });
        }
        response.status(200).json({
            "message": "Category with the id " + id + " deleted"}
        );
        return;
    })
}

const updateCategory = (request, response) => {
    const id = request.params.id;
    const title = request.body.name;
    const description = request.body.description;

    category = pool.query("UPDATE public.category SET title = $1, description = $2 WHERE categoryid = $3", [title, description, id], (error, results) => {
        if(error){
            response.status(404).send("Category with this id is not avaiable.");
        }
        response.status(200).json({"message": "Category with id " + id + " edited"});
    });
}

const addCategorieToMenuItem = (request, response) => {
    const id = request.params.id;
    const category = request.params.category;
    
    menuItem = pool.query('SELECT * FROM new_menu_items WHERE menu_item_id = $1', [id], function (error, result) {
        if(error){
            response.status(404).send("Menu item is not avaiable.");
        }
        if(result.rowCount == 0){
            response.status(404).send("Menu item is not avaiable.");
        }
    });
    category_object = pool.query('INSERT INTO public.menu_item_category(menu_item_id, category_id) VALUES ($1,$2)', [id, category], (error, result) => {
        if(error){
            response.status(409).send("Conflict: Add not possibly");
            return;
        }
        response.status(200).json({"message": "Add category to menu was successful."});
    });
}

function getCategories(results){
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        resultMap[row.categoryid] = {
            id: row.categoryid,
            name: row.title,
            description: row.description
        }
    }

    let response = Object.values(resultMap);
    return response;
}

function getUser(results){
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        resultMap[row.userid] = {
            id: row.userid,
            name: row.name,
            role: row.role,
            password: row.password  
        };
    }

    let response = Object.values(resultMap);
    return response;
}

function getMenuItem(results){
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        if(resultMap[row.itemid] != null){
            if(row.categorytitle != null && resultMap[row.itemid].categories.indexOf(row.categorytitle) == -1){
                resultMap[row.itemid].categories.push(row.categorytitle);
            }
            if(row.allergen != null && resultMap[row.itemid].allergene.indexOf(row.allergen) == -1){
                resultMap[row.itemid].allergene.push(row.allergen);
            }
        }else {
            resultMap[row.itemid] = {
                id: row.itemid,
                title: row.title,
                description: row.description,
                price: row.price,
                likes: row.likes,
                dislikes: row.dislikes,
                status: row.status,
                allergene: row.allergen != null ? [row.allergen] : [],
                categories: row.categorytitle != null ? [row.categorytitle] : []
            };
        }
    }

    let response = Object.values(resultMap);
    console.log(response)
    return response;
}



const findAllCategories = async (request, response) => {
    category = await pool.query("SELECT * FROM public.category", (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No Categories");
        }

        response.status(200).send(getCategories(results));
    });
}

const findAllMenuItems = (request, response) => {
    menuItem = pool.query("SELECT distinct items.*, item_hasallergens.allergen, category.title as categorytitle FROM public.items Inner Join item_hasallergens On item_hasallergens.itemid = items.itemid Inner Join item_hascategory On item_hascategory.itemid = items.itemid Left Join category On category.categoryid = item_hascategory.categoryid;", (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No Menu Items");
        }
        response.status(200).send(getMenuItem(results));
    });
}

const findAllUsers = (request, response) => {
    webuser = pool.query("SELECT * FROM public.users", (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No User with this name!!!");
        }
        response.status(200).send(getUser(results));
    });
}

const loadProducts = function () {
    return new Promise((resolve, reject) => {
        pool.query(`select i.itemid, i.title, i.description, i.price, i.likes, i.dislikes, i.status, array_to_string(array_agg(h.allergen), ', ') as allergen 
        from items i, item_hasallergens h  where i.itemid = h.itemid group by i.itemid order by i.itemid  `, (err, res) => {
            if(err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}


module.exports = {
    addUser,
    findUser,
    deleteUser,
    updateUser,
    findMenuItem,
    addMenuItem,
    deleteMenuItem,
    deleteCategoryFromMenuItem,
    updateMenuItem,
    addCategorie,
    findCategory,
    deleteCategory,
    updateCategory,
    addCategorieToMenuItem,
    findAllCategories,
    findAllMenuItems,
    findAllUsers,
    likeMenuItem,
    dislikeMenuItem
}

app.post("/user", addUser);
app.get("/user/:id", findUser);
app.delete("/user/:id", deleteUser);
app.put("/user/:id", updateUser);
app.get("/users", findAllUsers);

app.get("/menuItem/:id", findMenuItem);
app.post("/menuItem", addMenuItem);
app.delete("/menuItem/:id", deleteMenuItem);
app.delete("/menuItem/category/:id/:category", deleteCategoryFromMenuItem);
app.put("/menuItem/:id", updateMenuItem);
app.post("/menuItem/category/:id/:category", addCategorieToMenuItem);
app.get("/menuItems/", findAllMenuItems)
app.put("/menuItem/like/:id", likeMenuItem);
app.put("/menuItem/dislike/:id", dislikeMenuItem);

app.post("/category", addCategorie);
app.get("/category/:id", findCategory);
app.delete("/category/:id", deleteCategory);
app.put("/category/:id", updateCategory);
app.get("/categories", findAllCategories);

app.get("/products/", (req, res) => {
    // TODO: write your code here to get the list of products from the DB pool
    loadProducts()
        .then(dbResult => {
         res.send(dbResult.rows);
		 console.log(dbResult.rows)
        })
        .catch(error => {
            console.log(`Error while trying to read from db: ${error}`);
            res.contentType("text/html");
            res.status(400).send("ErrorPage not found on the server")
        });
    });
	
let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:"+port);
