const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());

app.use('/soc', createProxyMiddleware({ 
  target: 'http://sis.rutgers.edu', 
  changeOrigin: true 
}));

app.use(express.json());


app.post('/send-email', async (req, res) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '',
      pass: ''
    }
  });

  let mailOptions = {
    from: '',
    to: req.body.email,
    subject: 'Course Status Update',
    text: `The status for ${req.body.courseName} has changed to Open.`
  };

  let info = await transporter.sendMail(mailOptions);

  res.send({ messageId: info.messageId });
});

app.listen(3001);