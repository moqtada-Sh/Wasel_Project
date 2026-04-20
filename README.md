Wasel Mobility API

📌 Overview

Wasel Mobility API is a backend project developed to manage and monitor mobility-related data such as incidents and checkpoints.
The system allows users to report incidents (like accidents, delays, or hazards) and retrieve information about road conditions.

The main goal of this project is to build a clean and scalable RESTful API that can handle real-world traffic data efficiently.

⚙️ Tech Stack

Node.js
Express.js
MySQL
Sequelize ORM
JWT Authentication
Docker (for database)

Project Structure

The project follows a clean architecture approach:

Routes → handle API endpoints
Controllers → process incoming requests
Services → contain business logic
Models (Sequelize) → interact with the database

Authentication

The system uses JWT for authentication.

After login, the user receives a token that should be included in protected requests:

Authorization: Bearer <token>

## 📡 Main API Endpoints

### 🔐 Auth

POST /api/v1/auth/register → register new user

POST /api/v1/auth/login → login user

POST /api/v1/auth/refresh → refresh token

🚧 Incidents

GET /api/v1/incidents → get all incidents (pagination & filters)

GET /api/v1/incidents/:id → get incident by id

POST /api/v1/incidents → create incident (requires authentication)

PUT /api/v1/incidents/:id → update incident

DELETE /api/v1/incidents/:id → delete incident

PATCH /api/v1/incidents/:id/status → change incident status (admin / moderator)

📍 Checkpoints

GET /api/v1/checkpoints → get all checkpoints

GET /api/v1/checkpoints/:id → get checkpoint by id

POST /api/v1/checkpoints → create checkpoint (admin only)

PUT /api/v1/checkpoints/:id → update checkpoint (admin only)

DELETE /api/v1/checkpoints/:id → delete checkpoint (admin only)

🧾 Reports 

GET /api/v1/reports → get all reports

GET /api/v1/reports/:id → get report by id

POST /api/v1/reports → create report (authenticated users)

POST /api/v1/reports/:id/vote → vote on report

PATCH /api/v1/reports/:id/moderate → moderate report (admin / moderator)

🔔 Alerts & Notifications

POST /api/v1/alerts/subscriptions → create subscription

GET /api/v1/alerts/subscriptions/me → get user subscriptions

PATCH /api/v1/alerts/subscriptions/:id/mute → mute subscription

DELETE /api/v1/alerts/subscriptions/:id → delete subscription

GET /api/v1/alerts/notifications/me → get user notifications

PATCH /api/v1/alerts/notifications/:id/read → mark notification as read

🧭 Routing

POST /api/v1/routing/estimate → estimate route between two points

GET /api/v1/routing/history → get user route history

GET /api/v1/routing/:id → get route by id

🌍 Context (External Services)

GET /api/v1/context/weather → get weather by coordinates

GET /api/v1/context/reverse → reverse geocoding (lat/lng → address)

GET /api/v1/context/route → get route using external API


How to Run the Project
1. Clone the repository
git clone <repo-link>
cd wasel
2. Install dependencies
npm install
3. Run database using Docker
docker compose up
4. Run the server
npm run dev

Testing
Functional Testing

All endpoints were tested using Apidog to ensure correct responses and validation.

Performance Testing

Performance testing was done using k6 with different scenarios:

Read-heavy workloads
Write-heavy workloads
Mixed workloads
Spike testing
Soak testing

 Full results are available in the Wiki.


 Documentation

Full project documentation is available in the Wiki, including:

System architecture
Database schema (ERD)
API design explanation
Performance testing results

 Check the Wiki for more details.

 API Documentation (API-Dog)

All APIs are documented using API-Dog, including request/response formats and authentication flow.



 Conclusion

This project demonstrates building a structured backend system using Node.js and Express, with proper API design, database integration, and performance testing.

Team : 
Moqtada Shehadeh
Rashid Maraaba
Batool AbuYaman
Ghaidaa Halabi 
