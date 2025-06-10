const contactController = {
    getContactPage: (req, res) => {
        res.render('pages/ContactUs/contactus', {
            title: 'Contact Us'
        });
    }
};

module.exports = contactController; 