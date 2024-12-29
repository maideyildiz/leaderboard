# Leaderboard Project

## Overview

The Leaderboard project is a web application designed to manage and display a leaderboard for various games.
It provides functionalities for user registration, login, and score submission, while efficiently handling data with caching and database integration.

## Features

- User Registration and Authentication
- Score Submission and Leaderboard Management
- Rate Limiting and Error Handling
- Integration with MongoDB and Redis

## Technologies

- **Backend**: Node.js, Express
- **Database**: MongoDB, Redis
- **Authentication**: JSON Web Tokens (JWT)
- **Environment Configuration**: dotenv

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Docker (for containerized database services)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/maideyildiz/leaderboard.git
   cd leaderboard
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root directory and configure the required variables based on `.env.example`.

4. Start the application:
   ```bash
   npm run start:dev
   ```

### Running the Application

The application will start running at `http://localhost:3000`. Ensure that Docker is running as it is required to start the MongoDB and Redis services.

You can also access the application at [https://leaderboard-production-bfa1.up.railway.app/](https://leaderboard-production-bfa1.up.railway.app/).

### Testing

A Postman collection for testing the API endpoints is available at [Leaderboard.postman_collection.json](Leaderboard.postman_collection.json).

## API Endpoints

- **User Registration**: `POST /api/register`
- **User Login**: `POST /api/login`
- **Submit Score**: `POST /api/score`
- **Get Leaderboard**: `GET /api/leaderboard`
- **Get Player Rank**: `GET /api/rank`

## License

This project is licensed under the ISC License.

## Contact

For any questions or feedback, please open an issue on the [GitHub repository](https://github.com/maideyildiz/leaderboard/issues).
