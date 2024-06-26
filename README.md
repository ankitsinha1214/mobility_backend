# Backend Node.js Application

## Description
This Node.js application provides user management functionality including signup, signin with password hashing, email verification using OTP, and JWT token authentication.

## Installation
1. Clone the repository to your local machine:
```bash
git clone https://github.com/ankitsinha1214/mobility_backend.git
```
2. Install the required dependencies, run the following command:
```bash
npm install
```
## Usage
To start the server, run the following command:
```bash
nodemon index.js
```

## Features
- Signup: Users can register for a new account by providing their name, email, and password. Passwords are securely hashed before being stored in the database.
- Signin: Registered users can sign in using their email and password. Passwords are hashed and compared with the stored hash for authentication.
- Email Verification: Upon signup, users receive an email containing an OTP (One-Time Password) for verification. Users must verify their email address by entering the OTP.
- JWT Token Authentication: After successful signup or signin, users receive a JWT (JSON Web Token) which is used for subsequent authentication.
- User Management: The application provides endpoints for managing user details, including fetching user details and get all users.

## Endpoints

### Signup
Endpoint: /api/signup
Method: POST
Description: Register a new user with name, email, and password. Returns JWT token upon successful signup.

### Signin
Endpoint: /api/login
Method: POST
Description: Authenticate user with email and password. Returns JWT token upon successful authentication.

### Email Verification
Endpoint: /api/verifyotp
Method: POST
Description: Verify user's email address using OTP (One-Time Password) received via email.

### Resend OTP
Endpoint: /api/resendotp
Method: POST
Description: Resend OTP (One-Time Password) to the email.

### Fetch User Details
Endpoint: /api/user/:id
Method: GET
Description: Fetch user details by user ID. Requires JWT token for authentication.

### Get all Users Details
Endpoint: /api/users
Method: GET
Description: get all user details (e.g., name, email). Requires JWT token for authentication

## Dependencies

- express: Fast, unopinionated, minimalist web framework for Node.js.
- jsonwebtoken: JSON Web Token implementation for generating and verifying JWT tokens.
- bcryptjs: Library for hashing passwords securely.
- nodemailer: Module for sending emails from Node.js applications.
- mongoose: MongoDB object modeling tool designed to work in an asynchronous environment.
- dotenv: Zero-dependency module to load environment variables from a .env file.
