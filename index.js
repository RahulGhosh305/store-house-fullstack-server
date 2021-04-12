const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
require('dotenv').config()


const port = process.env.PORT || 5000




//* Mongo Data Base
const MongoClient = require('mongodb').MongoClient;
const { ObjectID } = require('mongodb').ObjectID;
const { request } = require('express')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ensig.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const storeHouseCollection = client.db("storeHouseDb").collection("allProduct");
  const userOrderedCollection = client.db("storeHouseDb").collection("userOrdered");

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  //* ADD SINGLE PRODUCT TO MONGO DATABASE
  app.post('/addProduct', (req, res) => {
    const newProduct = req.body;
    console.log(newProduct);
    storeHouseCollection.insertOne(newProduct)
    .then(result => {
      console.log('Inserted Count', result.insertedCount);
      res.send(result.insertedCount > 0)
    })
  })
  //* GET ALL PRODUCT TO SHOW HOME PAGE 
  app.get('/products',(req, res) => {
    storeHouseCollection.find({})
    .toArray((err, items) => {
      res.send(items)
    })
  })
  //* GET SINGLE PRODUCT TO CHECKOUT
  app.get('/product/:productId', (req, res)=>{
    storeHouseCollection.find({_id : ObjectID(req.params.productId)})
    .toArray((err, item)=>{
      res.send(item)
    })
  })
  //* DELETE PRODUCT FORM ADMIN MANAGEMENT
  app.delete('/delete/:id', (req, res)=>{
    storeHouseCollection.deleteOne({_id : ObjectID(req.params.id)})
    .then(result => {
      console.log(result);
    })
  })
  //* ADD SPECIFIC USER ORDER PRODUCT
  app.post('/checkoutToOrdered', (req, res) => {
    const checkoutProductWithUserDetails = req.body
    console.log(checkoutProductWithUserDetails);
    userOrderedCollection.insertOne(checkoutProductWithUserDetails)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })
  //* GET SPECIFIC USER ORDER LIST 
  app.get('/orderItems', (req, res) => {
    console.log(req.query.email);
    userOrderedCollection.find({email : req.query.email})
    .toArray((err, items) => {
      res.send(items)
    })
  })
  
  // client.close();
});


app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})

