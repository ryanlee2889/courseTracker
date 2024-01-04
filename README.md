# React Firebase Application

This is a full-stack application that tracks the status of Rutgers Courses via the Schedule of Classes endpoint and e-mails the user when it opens up.

## Features

- React for the frontend
- Firebase for backend services like authentication and database
- Axios for making HTTP requests
- Express for setting up the server

## Setup

1. Clone the repository
2. Install the dependencies with `npm install`
3. Start the project with `npm start`

## Firebase Configuration

The Firebase configuration is defined in `firebase.js`. You need to replace the placeholders in the `firebaseConfig` object with your actual Firebase project settings.

```javascript
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
```
Example Firestore configuration:
![Application Screenshot](https://i.imgur.com/V7jy0Xn.png)

## Nodemailer Setup

The Nodemailer configuration is defined in `server.js`. Replace the user and pass with your information. You will need to create an app-password if you are using gmail.

```javascript
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '',
      pass: ''
    }
  });
```
