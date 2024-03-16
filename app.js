const express = require('express')
const app = express()

const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('views', './views');

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }));

const session = require('express-session')
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000 }
}))

const cookieParser = require('cookie-parser')
app.use(cookieParser('secret'))

const flash = require('connect-flash');
app.use(flash())

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// mongoDB
const {Contact} = require('./model/contact')
require('./utils/db')


const PORT = 3000;


// HTTP request
// page respon
app.get('/', async (req, res, next) => {
    const contactData = await Contact.find()
    res.render('contact', {
        layout: 'layout/main-layout',
        title: 'CONTACT',
        loadContactsData: contactData,
        msgScs: req.flash('msgScs'),
        err: req.flash('err'),
    })
})

app.get('/add', (req, res) => {
    res.render('add', {
        layout: 'layout/main-layout',
        title: 'ADD CONTACT',
        err: req.flash('err'),
    })
})

// manipulate data
app.post('/contact-add', async function(req, res) {

    try {
        if (req.body.email){
            await Contact.create({
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
            })
        } else {
            await Contact.create({
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
            })
        }

        req.flash('msgScs', `You have successfully added ${req.body.name} to contacts`)
        res.redirect('/');
    } catch (err) {
        req.flash('err', err.message
            .replace("Contact validation failed: ", '')
            .replace("name: Path ", '')
            .replace("phoneNumber: ", '')
            .replace("email: ", '')
            .split(",")
        );

        res.redirect('/add');
    }
});

app.delete('/contact-delete/:id', async (req, res) => {
    const id = req.params.id

    await Contact.findByIdAndDelete(id);

    req.flash('msgScs', `You have successfully delete ${req.body.name} from contacts`)

    res.redirect('/');
})

app.put('/contact-edit', async (req, res) => {
    const id = req.body.id;

    try {
        if (req.body.email === "") {
            await Contact.findByIdAndUpdate(id, {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
            }, { new: true, runValidators: true })
        } else {
            await Contact.findByIdAndUpdate(id, {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
            }, { new: true, runValidators: true })
        }

        req.flash('msgScs', `You have successfully change a ${req.body.oldName} to ${req.body.name} contact`)
        res.redirect('/');
    } catch (err) {
        req.flash('err', err.message
            .replace("Validation failed: ", '')
            .replace("name: Path ", '')
            .replace("phoneNumber: ", '')
            .replace("email: ", '')
            .split(",")
        );

        res.redirect('/');
    }
})

// error respon
app.use('/', (req, res) => {
    res.status(404)
    res.render('err', {
        layout: 'layout/main-layout',
        title: 'ERROR'
    })
})


app.listen(PORT, () => {
    console.log(`Contact app listening on PORT ${PORT}`)
    console.log(`Open to http://localhost:3000`)
})