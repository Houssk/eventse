var nodemailer = require('nodemailer');

/**** ATTENTION : Bien remplir les infos ci-dessous, sinon beug ****/
var sender      = "toto", // Ici nom du sender
  auth_email    = 'toto@gmail.com', // Ici adresse mail
  auth_password = 'toto'; // Ici password

var smtpTransport = nodemailer.createTransport({
  service: "Gmail", // Ici nom du service utilisé
  auth: {
    user: auth_email,
    pass: auth_password
  }
});

exports.sender = sender;
exports.auth_email = auth_email;
exports.smtpTransport = smtpTransport;