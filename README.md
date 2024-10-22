# Tour Portal API

Welcome to the Tour Portal API! This project provides a RESTful API for managing tours, reviews, and user authentication. 

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication (sign up, login, logout)
- CRUD operations for tours
- Review system for tours
- Search and filter tours using various parameters

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- JWT (JSON Web Tokens) for authentication
- Pug for templating (if applicable)
- Redis (for caching)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kunaladarsh/tour-portal.git
   cd tour-portal

2. Install the dependencies:
   ```bash
   npm install
3. Set up your environment variables. Create a .env file in the root directory:
   ```bash
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/tour-portal
   JWT_SECRET=your_jwt_secret
   JWT_SECRET_REFRESH =your_jwt_refresh_secret
4. npm start
   ```bash
   npm start

## Usage
Once the server is running, you can access the API at http://localhost:3000. Use tools like Postman or curl to interact with the endpoints.

## API Endpoints

### Authentication
- **POST** `/api/auth/signup`: Register a new user.
- **POST** `/api/auth/login`: Log in a user.
- **POST** `/api/auth/logout`: Log out a user.

### Tours
- **GET** `/api/tours`: Retrieve all tours.
- **GET** `/api/tours/:id`: Retrieve a specific tour by ID.
- **POST** `/api/tours`: Create a new tour.
- **PUT** `/api/tours/:id`: Update a tour by ID.
- **DELETE** `/api/tours/:id`: Delete a tour by ID.

### Reviews
- **POST** `/api/tours/:id/reviews`: Add a review for a specific tour.
- **GET** `/api/tours/:id/reviews`: Get reviews for a specific tour.


