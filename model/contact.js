const mongoose = require('mongoose');
require('../utils/db')

const validator = require('validator')

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    phoneNumber: {
        type: String,
        required: true,
        validate: [
            {
                validator: function(value) {
                    return validator.isMobilePhone(value, 'id-ID');
                },
                message: 'Phone number is not valid for Indonesia number'
            },
            {
                validator: async function(value) {
                    const valid = await Contact.findOne({ phoneNumber: value });
                    return !valid;
                },
                message: 'Phone number is already in use'
            }
        ]
    },
    email: {
        type: String,
        required: false,
        validate: [
            {
                validator: function(value) {
                    if (!value) return true;
                    return validator.isEmail(value);
                },
                message: 'Email address is not valid'
            },
            {
                validator: async function(value) {
                    if (!value) return true;
                    const valid = await Contact.findOne({ email: value });
                    return !valid;
                },
                message: 'E-mail is already in use'
            }
        ]
    }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
    Contact
}