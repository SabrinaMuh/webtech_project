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
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const { send } = require('express/lib/response');


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

    menuItem = pool.query("DELETE FROM public.item_hascategory WHERE itemid = $1 And categoryid = $2;", [id, category], (error, results) => {
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
        response.status(200).json({"message": "Category with id " + iwd + " edited"});
    });
}

const addCategorieToMenuItem = (request, response) => {
    const id = request.params.id;
    const category = request.params.category;

    category_object = pool.query('INSERT INTO public.item_hascategory(itemid, categoryid) VALUES ($1, $2);', [id, category], (error, result) => {
        if(error){
            response.status(409).send("Conflict: Add not possibly");
            return;
        }
        response.status(200).json({"message": "Add category to menu was successful."});
    });
}

const askPayment = (request, response) =>{
    if (request.body == null){
        response.status(400).json({
            "message": "body is empty"
        })
        return;
    }


    const totalSum = request.body.totalSum;
    const shoppingCart = request.body.shoppingCart;
    const paymentRef = request.body.paymentRef;
    const tableNumber = request.params.table;

   
    

    if(totalSum == null || totalSum === ''){
        response.status(400).json({
            "message": "totalSum must be specified"
        })
        return;
    }
    if(shoppingCart == null || shoppingCart === ''){
        response.status(400).json({
            "message": "shoppingCart must be specified"
        })
        return;
    }
    if(paymentRef == null || paymentRef === '' || paymentRef === '00sd0sd'){
        response.status(200).json(0);
        return;
    }
   
    const token = mockPaymentServerCheck(paymentRef,request.body );
    //response.status(200).send(JSON.stringify(token)); 
    console.log(shoppingCart);

    order = pool.query("INSERT INTO orders(status, orderdate, tableid, paymentpreference, paymenttoken, totalamount) values ($1, $2, $3, $4, $5, $6) RETURNING orderid;",
     ["open", new Date(), tableNumber , paymentRef, token,totalSum ], (error, results) => {
        if(error){
            response.status(409).send("Conflict: Add not possibly");
            return;
        }
        resultRow = results.rows;
        let orderID = 0;
        for(const row of resultRow){
            orderID =  row.orderid
            
        }
        response.status(200).json(orderID);
        insertOrderedItems(shoppingCart, orderID);
            return;
    });

    

  
    
}

function insertOrderedItems(data, orderID){
    console.log(data);
    for(let d of data){
        object = pool.query('insert into ordereditems (itemid,quantity, status,orderid,orderdate) values ($1, $2, $3,$4,$5);', [d.itemid, d.quantity, 'open',orderID,new Date()  ], (error, result) => {
            if(error){
                //response.status(409).send("Conflict: Add not possibly");
                return;
            }
            //response.status(200).json({"message": "Add ordereditems  was successful."});
        });


    }

}





const findOrder = (request, response) =>{
    const id = request.params.id;

    order = pool.query("SELECT * FROM orders where orderid = $1", [id], (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No Order with this Id!!!");
        }
        response.status(200).send(getOrder(results));
        
    });
}


function getOrder(results){
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        resultMap[row.orderid] = {
            orderid: row.orderid,
            status: row.status,
            orderdate: row.orderdate,
            tableid: row.tableid,
            paymentpreference: row.paymentpreference,
            paymenttoken: row.paymenttoken,
            totalamount: row.totalamount
        };
    }
    let response = Object.values(resultMap);
    return response;
}

const findOrderedItems = (request, response) =>{
    const id = request.params.id;

    orderedItems = pool.query("select o.ordereditemsid, o.itemid, o.quantity, o.status, o.orderid, o.orderdate, i.title from ordereditems o, items i where orderid = $1 and i.itemid = o.itemid", [id], (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No OrderedItems with this Id!!!");
        }
        //response.status(200).send(getOrderedItems(results));
        response.status(200).send((results.rows));

    });
}

function getOrderedItems(results){
    resultRow = results.rows;

    let resultMap = []

    for(const row of resultRow){
        resultMap[row.orderid] = {
            ordereditemsid: row.ordereditemsid,
            itemid: row.itemid,
            quantity: row.quantity,
            status: row.status,
            orderid: row.orderid,
            orderdate: row.orderdate
        };
    }
    let response = Object.values(resultMap);
    return response;
}




function mockPaymentServerCheck(paymentRef, req){
    if(paymentRef === 'jsnuebgfglwh3u'){
        const token = jwt.sign(req, "SECRET", { expiresIn: "3h" });
        console.log(token);
        return token;
    }else{
        return 'PaymentRef failure';

    }


}

const addReview =  (request, response) =>{
    if (request.body == null){
        response.status(400).json({
            "message": "body is empty"
        })
        return;
    }

    const firstname = request.body.firstname;
    const surname = request.body.surname;
    const reviewdate = request.body.reviewdate;
    const textcomment = request.body.textcomment;
    const stars = request.body.stars;
    

    if(reviewdate == null || reviewdate === ''){
        response.status(400).json({
            "message": "reviewdate must be specified"
        })
        return;
    }
    if(textcomment == null || textcomment === ''){
        response.status(400).json({
            "message": "textcomment must be specified"
        })
        return;
    }

    if(stars == null || stars === ''){
        response.status(400).json({
            "message": "stars must be specified"
        })
        return;
    }
    if(firstname == null || firstname === ''){
        response.status(400).json({
            "message": "firstname must be specified"
        })
        return;
    }
    if(surname == null || surname === ''){
        response.status(400).json({
            "message": "surname must be specified"
        })
        return;
    }
    

    review = pool.query("INSERT INTO reviews(firstname, surname, reviewdate, textcomment, stars) VALUES ($1, $2, $3, $4, $5)", [firstname, surname, reviewdate,textcomment, stars], (error, results) => {
        if(error){
            response.status(409).send("Conflict: Add not possibly");
            return;
        }
        response.status(200).json({
            "message": "Review  added"});
            return;
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
function getToppSeller(results){
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
                categories: row.categorytitle != null ? [row.categorytitle] : ['Top Seller']
            };
        }
    }

    let response = Object.values(resultMap);
    console.log(response)
    return response;
}

function getAllergene(results) {
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        resultMap[row.allergen] = row.allergen;
    }

    let response = Object.values(resultMap);
    return response;
}

function getCategoriesForMenuItem(results) {
    resultRow = results.rows;

    let resultMap = [];

    for(const row of resultRow){
        resultMap[row.categoryid] = {
            id: row.categoryid,
            name: row.title
        };
    }

    let response = Object.values(resultMap);
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

const findAllMenuItems = async (request, response) => {
    items = await pool.query("SELECT distinct items.*, item_hasallergens.allergen, category.title as categorytitle FROM public.items Inner Join item_hasallergens On item_hasallergens.itemid = items.itemid Inner Join item_hascategory On item_hascategory.itemid = items.itemid Left Join category On category.categoryid = item_hascategory.categoryid ", (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No Menu Items");
        }
        response.status(200).send(getMenuItem(results));
    });

}

const findAllMenuItems2 = async (request, response) => {
    items = await pool.query(`select  items.*,  array_to_string(array_agg(item_hasallergens.allergen), ', ') as allergen  from ordereditems, items, item_hasallergens where items.itemid =  item_hasallergens.itemid and items.itemid = ordereditems.itemid and ordereditems.orderdate > CURRENT_DATE - INTERVAL '30' day  group by items.itemid order by SUM(quantity) desc limit 5;
    SELECT distinct items.*, item_hasallergens.allergen, category.title as categorytitle FROM public.items Inner Join item_hasallergens On item_hasallergens.itemid = items.itemid Inner Join item_hascategory On item_hascategory.itemid = items.itemid Left Join category On category.categoryid = item_hascategory.categoryid `, (error, results) => {
        if(error){
            response.status(404).send(error);
        }
        if(results.rowCount == 0){
            response.status(404).send("No Menu Items");
        }
        const topSeller = getToppSeller(results[0]);
        const menuItems =  getMenuItem(results[1]);

        response.status(200).send({
            topSeller,
            menuItems
        });
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
        pool.query(` select  items.*,  array_to_string(array_agg(item_hasallergens.allergen), ', ') as allergen  from ordereditems, items, item_hasallergens where items.itemid =  item_hasallergens.itemid and items.itemid = ordereditems.itemid and ordereditems.orderdate > CURRENT_DATE - INTERVAL '30' day  group by items.itemid order by SUM(quantity) desc limit 5 `, (err, res) => {
            if(err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

const loadReviews = function () {
    return new Promise((resolve, reject) => {
        pool.query(`select * from reviews order by reviewdate asc`, (err, res) => {
            if(err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}
const findAllergeneForMenuItem = (request, response) => {
    const id = request.params.id;

    allergene = pool.query("SELECT allergen FROM public.item_hasallergens Where itemid = $1;", [id], (error, results) => {
        if(error){
            response.status(404).json({"message": error});
        }
        response.status(200).send(getAllergene(results));
    });
}

const addAllergeneToMenuItem = (request, response) => {
    const id = request.params.id;
    const allergen = request.params.allergen;

    allergene = pool.query("INSERT INTO public.item_hasallergens(itemid, allergen) VALUES ($1, $2);", [id, allergen], (error, results) => {
        if(error){
            response.status(404).json({"message": error});
        }
        response.status(200).json({"message": "Allergene was added to " + id});
    })
}

const deleteAllergeneFromMenuItem = (request, response) => {
    const id = request.params.id;
    const allergen = request.params.allergen;

    allergene = pool.query("DELETE FROM public.item_hasallergens WHERE itemid = $1 And allergen = $2;", [id, allergen], (error, results) => {
        if(error){
            response.status(404).json({"message": error});
        }
        response.status(200).json({"message": "Allergene was deleted from " + id});
    });
}

const findCategoriesForMenuItem = (request, response) => {
    const id = request.params.id;

    categories = pool.query("SELECT category.categoryid, category.title FROM item_hascategory Left Join category On item_hascategory.categoryid = category.categoryid Where item_hascategory.itemid = $1;", [id], (error, results) => {
        if(error){
            response.status(404).json({"message": error});
        }
        response.status(200).send(getCategoriesForMenuItem(results));
    });
}

const changeNullValueAllergene = (request, response) => {
    const id = request.params.id;
    const allergen = request.params.allergen;

    allergene = pool.query("UPDATE public.item_hasallergens	SET allergen=$1 WHERE itemid = $2;", [allergen, id], (error, results) => {
        if(error){
            response.status(404).json({"message": error});
        }
        response.status(200).json({"message": "Allergene was added to " + id});
    });
}

const changeValueToNullAllergene = (request, response) => {
    const id = request.params.id;

    allergene = pool.query("UPDATE public.item_hasallergens	SET allergen=null WHERE itemid = $1;", [id], (error, results) => {
        if(error){
            response.status(404).json({"message": error});
        }
        response.status(200).json({"message": "Allergene was deleted from " + id});
    });
}

const changeNullValueCategories = (request, response) => {
    const id = request.params.id;
    const category = request.params.category;

    categories = pool.query("UPDATE public.item_hascategory SET categoryid=$1 WHERE itemid=$2;", [category, id], (error, results) => {
        if(error){
            response.status(404).json({"message": error});
        }
        response.status(200).json({"message": "Category was added to " + id});
    });
}

const changeValueToNullCategories = (request, response) => {
    const id = request.params.id;

    allergene = pool.query("UPDATE public.item_hascategory SET categoryid=null WHERE itemid=$1;", [id], (error, results) => {
        if(error){
            response.status(404).json({"message": error});
        }
        response.status(200).json({"message": "Category was deleted from " + id});
    });
}

const addWaiterCall = (request, response) => {

    const table = request.params.table;
    var date = new Date();
    var dateString = date.getFullYear() + '-' + date.getMonth()+1 + '-' + date.getDate() + "";
    const status = 'waiting';

    category_object = pool.query('INSERT INTO public.consultations(tableid, timestamp, status) VALUES ($1, $2, $3);', [table, dateString, status], (error, result) => {
        if(error){
            response.status(409).send("Conflict: Adding the Consultation not possibly");
            console.log("Conflict: Adding the Consultation not possibly");
            return;
        }
        response.status(200).json({"message": "Adding the Consultation was successfull"});
        console.log("Adding the Consultation was successfull");
    });
}

const loadConsulID = (request, response) => {
    const tableid = request.params.table;
    id = pool.query("SELECT consulid FROM public.consultations where tableid = ($1) and status = 'waiting'", [tableid], (error, results) => {
        if(error){
            response.status(404).send(error);
            return;
        }
        if(results.rowCount == 0){
            response.status(404).send("No Waiter-Call at this Table");
            return;
        }

    let resultMap = [];

    let rows = results.rows

    for(const row of rows){
        resultMap[row.consulid] = row.consulid;
    }

    let data = Object.values(resultMap);
    
    console.log(data[0]);

    response.status(200).send(data);   
    });
}

const loadConsulStatus = (request, response) => {
    const tableid = request.params.table;
    const id = request.params.id;
    pool.query("SELECT status FROM public.consultations where consulid = ($1) and tableid = ($2)", [id, tableid], (error, results) => {
        if(error){
            response.status(404).send(error);
            return;
        }
        if(results.rowCount == 0){
            response.status(404).send("No Status for this ID/Table");
            return;
        }

        let resultMap = [];

        let rows = results.rows

        for(const row of rows){
            resultMap[row.status] = row.status;
        }

        let data = Object.values(resultMap);
    
        console.log(data[0]);

        response.status(200).send(data);  
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
    changeNullValueCategories,
    changeValueToNullCategories,
    findAllCategories,
    findAllMenuItems,
    findAllMenuItems2,
    findAllUsers,
    likeMenuItem,
    dislikeMenuItem,
    findAllergeneForMenuItem,
    addAllergeneToMenuItem,
    deleteAllergeneFromMenuItem,
    changeNullValueAllergene,
    changeValueToNullAllergene,
    findCategoriesForMenuItem,
    addReview,
    askPayment,
    addReview,
    addWaiterCall,
    loadConsulID,
    loadConsulStatus,
    getOrder,
    getOrderedItems,
    loadProducts
    

}

app.post("/user", addUser);
app.get("/user/:id", findUser);
app.delete("/user/:id", deleteUser);
app.put("/user/:id", updateUser);
app.get("/users", findAllUsers);

app.get("/menuItem/:id", findMenuItem);
app.post("/menuItem", addMenuItem);
app.delete("/menuItem/:id", deleteMenuItem);
app.delete("/menuItem/categories/:id/:category", deleteCategoryFromMenuItem);
app.put("/menuItem/:id", updateMenuItem);
app.post("/menuItem/categories/:id/:category", addCategorieToMenuItem);
app.put("/menuItem/categories/:id/:category", changeNullValueCategories);
app.put("/menuItem/categories/:id", changeValueToNullCategories);
app.get("/menuItems/", findAllMenuItems)
app.put("/menuItem/like/:id", likeMenuItem);
app.put("/menuItem/dislike/:id", dislikeMenuItem);
app.get("/menuItem/allergene/:id", findAllergeneForMenuItem);
app.post("/menuItem/allergene/:id/:allergen", addAllergeneToMenuItem);
app.put("/menuItem/allergene/:id/:allergen", changeNullValueAllergene);
app.put("/menuItem/allergene/:id", changeValueToNullAllergene);
app.delete("/menuItem/allergene/:id/:allergen", deleteAllergeneFromMenuItem);
app.get("/menuItem/categories/:id", findCategoriesForMenuItem);

app.post("/category", addCategorie);
app.get("/category/:id", findCategory);
app.delete("/category/:id", deleteCategory);
app.put("/category/:id", updateCategory);
app.get("/categories", findAllCategories);





app.post("/:table/dashboard/reviews", addReview);

app.post("/:table/dashboard/payment", askPayment);

app.post("/:table/callWaiter", addWaiterCall);
app.get("/:table/getCallID", loadConsulID);
app.get("/:table/getCallStatus/:id", loadConsulStatus);

app.get("/:table/getOrder/:id", findOrder);

app.get("/:table/getOrderedItems/:id", findOrderedItems);


app.get("/:table/dashboard/products", findAllMenuItems2);


    app.get("/:table/dashboard/reviews", (req, res) => {
        // TODO: write your code here to get the list of products from the DB pool
        loadReviews()
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
