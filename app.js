const express = require('express')
const app = express()
const port =  process.env.PORT || 3000
const mongoose = require('./db/conn')
const path = require('path')
const staticpath = path.join(__dirname, './public')
const hbs = require('hbs')
const viewpath = path.join(__dirname, './templates/views')
const partialspath = path.join(__dirname, './templates/partials')
const User = require('./models/user')
const dotenv = require('dotenv').config()
const bcrypt = require('bcryptjs')
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(express.static(staticpath))
app.set('view engine', 'hbs')
app.set('views', viewpath)
hbs.registerPartials(partialspath)

app.get('/', (req,res)=>{
    res.render('index')
})
app.get('/about', (req,res)=>{
    res.render('about')
})
app.get('/contact', (req,res)=>{
    res.render('contact')
})
app.post('/contact', async(req,res)=>{
    try {
        const password = req.body.password
        const cpassword = req.body.cpassword
    
        if(password ===  cpassword){
            const contactUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                cpassword: req.body.cpassword,
            })
    
            const token = await contactUser.generateAuthToken()
    
            const result = await contactUser.save()
            res.status(201).render('index')
            console.log(result);
        }else{
            res.send('passwords not match')
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get('/login', (req,res)=>{
    res.render('login')
})

app.post('/login', async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password

        const result = await User.findOne({email:email})
        const token = await result.generateAuthToken()

  const isMatch = await bcrypt.compare(password, result.password)
    if(isMatch){
        res.status(201).render('index')
    }else{
        res.send('invalid user credentials')
    }
    } catch (error) {
        res.status(400).send('not registered user')
    }
})

app.listen(port, ()=>{
    console.log('listening 3000');
})