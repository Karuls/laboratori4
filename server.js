const express = require('express');
const { engine } = require('express-handlebars');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        cancelButton: function(url) {
            return `<a href="${url}" class="btn btn-cancel">Отказаться</a>`;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PHONEBOOK_FILE = path.join(__dirname, 'public/phonebook.json');

function readPhonebook() {
    const data = fs.readFileSync(PHONEBOOK_FILE, 'utf8');
    return JSON.parse(data);
}   

function writePhonebook(data) {
    fs.writeFileSync(PHONEBOOK_FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
    const phonebook = readPhonebook();
    res.render('index', { 
        contacts: phonebook,
        isMainPage: true
    });
});

app.get('/Add', (req, res) => {
    const phonebook = readPhonebook();
    res.render('add', { 
        contacts: phonebook,
        isAddPage: true
    });
});

app.get('/Update', (req, res) => {
    const phonebook = readPhonebook();
    const id = parseInt(req.query.id);
    const contact = phonebook.find(c => c.id === id);
    
    res.render('update', { 
        contacts: phonebook,
        selectedContact: contact,
        isUpdatePage: true
    });
});

app.post('/Add', (req, res) => {
    const phonebook = readPhonebook();
    const newContact = {
        id: phonebook.length > 0 ? Math.max(...phonebook.map(c => c.id)) + 1 : 1,
        name: req.body.name,
        phone: req.body.phone
    };
    phonebook.push(newContact);
    writePhonebook(phonebook);
    res.redirect('/');
});

app.post('/Update', (req, res) => {
    const phonebook = readPhonebook();
    const id = parseInt(req.body.id);
    const index = phonebook.findIndex(c => c.id === id);
    
    if (index !== -1) {
        phonebook[index].name = req.body.name;
        phonebook[index].phone = req.body.phone;
        writePhonebook(phonebook);
    }
    res.redirect('/');
});

app.get('/api/phonebook', (req, res) => {
    res.json(readPhonebook());
});

app.post('/Delete', (req, res) => {
    const phonebook = readPhonebook();
    const id = parseInt(req.body.id);
    const filtered = phonebook.filter(c => c.id !== id);
    writePhonebook(filtered);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
