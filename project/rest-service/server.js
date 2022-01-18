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

    webuser = pool.query("INSERT INTO users(user_id, name, password, role_id) VALUES ($1, $2, $3, $4)", [id, name, password, role], (error, results) => {
        if (error){
            response.status(409).send({"message": "Conflict: Add not possibly"});
        }
        response.status(200).json({"message": 'User with name ' + name + ' added'});
        return;
    });
}

const findUser = (request, response) => {
    const id = request.params.id;

    webuser = pool.query("SELECT * FROM users JOIN roles ON roles.role_id = users.role_id WHERE users.user_id = $1", [id], (error, results) => {
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

    webuser = pool.query("Select * from users Where user_id = $1", [id], (error, results) => {
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

    webuser = pool.query("DELETE FROM public.users WHERE user_id = $1", [id], (error, results) => {
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

    webuser = pool.query("UPDATE public.users SET name = $1, password = $2, role_id = $3 WHERE user_id = $4", [name, password, role, id], (error, results) => {
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

    menuItem = pool.query("SELECT new_menu_items.*, categories.category_name FROM new_menu_items Inner Join menu_item_category On menu_item_category.menu_item_id = new_menu_items.menu_item_id Left Join categories on menu_item_category.category_id = categories.category_id Where new_menu_items.menu_item_id = $1", [id], (error, results) => {
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

    menuItem = pool.query("INSERT INTO new_menu_items( menu_item_id, menu_item_title, description, price, allergene) VALUES ($1, $2, $3, $4, $5);", [id, title, description, price, allergene], (error, results) => {
        if(error){
            response.status(409).json({
                "message": "Conflict: Add not possibly"}
            );
        }
    });
    
    for (let category of categories){
        category = pool.query("INSERT INTO menu_item_category(menu_item_id, category_id) VALUES ($1, $2);", [id, category], (error, results) => {
            if(error){
                response.status(409).json({
                    "message": "Conflict: Add not possibly"}
                );
            }
            
        })
    }
    response.status(200).json({"message": "Add was successful"});
    return;
}

const deleteMenuItem = (request, response) => {
    const id = request.params.id;

    menuItem = pool.query("Select * from new_menu_items Where menu_item_id = $1", [id], (error, results) => {
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

    menuItem = pool.query("DELETE FROM public.new_menu_items WHERE menu_item_id = $1", [id], (error, results) => {
        if(error){
            response.status(409).json({
                "message": "Conflict: Delete not possibly"
            });
            return;
        }
    });

    category = pool.query("Delete from menu_item_category Where menu_item_id = $1", [id], (error, result) => {
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

    menuItem = pool.query("DELETE FROM menu_items WHERE menu_item_id = $1 AND category_id = $2", [id, category], (error, results) => {
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
    const allergene = request.body.allergene;

    menuItem = pool.query("UPDATE public.new_menu_items SET menu_item_title=$1, description=$2, price=$3, allergene=$4 WHERE menu_item_id = $5", [title, description, price, allergene, id], (error, results) => {
        if(error){
            response.status(404).send("Menu item with this id is not avaiable.");
        }
        if(results.rowCount == 0){
            response.status(404).send("Menu item with this id is not avaiable.");
        }
        response.status(200).json({"message":"Menu Item with id " + id + " edited"});
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

    resultID = pool.query("SELECT * FROM public.categories WHERE category_id = $1", [id], (error, results) => {
        if (results.rows.length > 0) {
            res.status(400).json({
                "message": "object with id "+ id + " already exits"
            });
            return;
        }
    });

    category = pool.query("INSERT INTO public.categories( category_id, category_name) VALUES ($1, $2)", [id, title], (error, results) => {
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

    category = pool.query("SELECT * FROM public.categories WHERE category_id = $1", [id], (error, results) => {
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

    category = pool.query("Select * from categories Where category_id = $1", [id], (error, results) => {
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

    category = pool.query("DELETE FROM public.categories WHERE category_id = $1", [id], (error, results) => {
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

    category = pool.query("UPDATE public.categories SET category_name = $1 WHERE category_id = $2", [title, id], (error, results) => {
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
    category = pool.query('INSERT INTO public.menu_item_category(menu_item_id, category_id) VALUES ($1,$2)', [id, category], (error, result) => {
        if(error){
            throw error;
        }
        response.status(200).json({"message": "Add category to menu was successful."});
    });
}

function getCategories(results){
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        resultMap[row.category_id] = {
            id: row.category_id,
            name: row.category_name
        }
    }

    let response = Object.values(resultMap);
    return response;
}

function getUser(results){
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        resultMap[row.user_id] = {
            id: row.user_id,
            name: row.name,
            password: row.password,
            role_title: row.role_title
        };
    }

    let response = Object.values(resultMap);
    return response;
}

function getMenuItem(results){
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        if(resultMap[row.menu_item_id] != null){
            if(row.category_name != null){
                resultMap[row.menu_item_id].categories.push(row.category_name);
            }
        }else {
            resultMap[row.menu_item_id] = {
                id: row.menu_item_id,
                title: row.menu_item_title,
                description: row.description,
                price: row.price,
                allergene: row.allergene,
                categories: row.category_name != null ? [row.category_name] : []
            };
        }
    }

    let response = Object.values(resultMap);
    return response;
}

const findAllCategories = async (request, response) => {
    category = await pool.query("SELECT * FROM public.categories", (error, results) => {
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
    menuItem = pool.query("SELECT new_menu_items.*, categories.category_name FROM new_menu_items Inner Join menu_item_category On menu_item_category.menu_item_id = new_menu_items.menu_item_id Left Join categories on menu_item_category.category_id = categories.category_id;", (error, results) => {
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
    webuser = pool.query("SELECT users.*, roles.role_title FROM users JOIN roles ON roles.role_id = users.role_id", (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No User with this name!!!");
        }
        response.status(200).send(getUser(results));
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
    findAllUsers
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

app.post("/category", addCategorie);
app.get("/category/:id", findCategory);
app.delete("/category/:id", deleteCategory);
app.put("/category/:id", updateCategory);
app.get("/categories", findAllCategories);
	
let port = 3000;
app.listen(port);
console.log("Server running at: http://localhost:"+port);
