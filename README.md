# 🚀 Wasel Mobility API

![Node.js](https://img.shields.io/badge/Node.js-18+-green)

![Express](https://img.shields.io/badge/Express.js-Backend-black)

![MySQL](https://img.shields.io/badge/Database-MySQL-blue)

---

## 📌 Overview

Wasel Mobility API is a backend project developed to manage and monitor mobility-related data such as incidents and checkpoints.

The system allows users to:

* Report incidents (accidents, delays, hazards)
* View checkpoints
* Retrieve road condition data

The goal is to build a clean and scalable RESTful API that simulates real-world traffic systems.

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* MySQL
* Sequelize ORM
* JWT Authentication
* Docker

---

## 🏗️ Project Structure

The project follows a clean architecture:

* **Routes** → define API endpoints
* **Controllers** → handle requests
* **Services** → business logic
* **Models (Sequelize)** → database interaction

---

## 🧠 Architecture

```
Client → API → Controllers → Services → Database
```

---

## 🔐 Authentication

The system uses JWT authentication.

After login, the user receives a token:

```
Authorization: Bearer <token>
```

---

## 📡 Main API Endpoints

### 🔐 Auth

* `POST /api/v1/auth/register`
* `POST /api/v1/auth/login`
* `POST /api/v1/auth/refresh`

---

### 🚧 Incidents

* `GET /api/v1/incidents`
* `GET /api/v1/incidents/:id`
* `POST /api/v1/incidents`
* `PUT /api/v1/incidents/:id`
* `DELETE /api/v1/incidents/:id`
* `PATCH /api/v1/incidents/:id/status`

---

### 📍 Checkpoints

* `GET /api/v1/checkpoints`
* `GET /api/v1/checkpoints/:id`
* `POST /api/v1/checkpoints`
* `PUT /api/v1/checkpoints/:id`
* `DELETE /api/v1/checkpoints/:id`

---

### 🧾 Reports

* `GET /api/v1/reports`
* `GET /api/v1/reports/:id`
* `POST /api/v1/reports`
* `POST /api/v1/reports/:id/vote`
* `PATCH /api/v1/reports/:id/moderate`

---

### 🔔 Alerts & Notifications

* `POST /api/v1/alerts/subscriptions`

* `GET /api/v1/alerts/subscriptions/me`

* `PATCH /api/v1/alerts/subscriptions/:id/mute`

* `DELETE /api/v1/alerts/subscriptions/:id`

* `GET /api/v1/alerts/notifications/me`

* `PATCH /api/v1/alerts/notifications/:id/read`

---

###  Routing

* `POST /api/v1/routing/estimate`
* `GET /api/v1/routing/history`
* `GET /api/v1/routing/:id`

---

### 🌍 Context (External APIs)

* `GET /api/v1/context/weather`
* `GET /api/v1/context/reverse`
* `GET /api/v1/context/route`

---

## 🚀 How to Run the Project

```bash
git clone <repo-link>
cd wasel
npm install
docker compose up
npm run dev
```

---

## 🧪 Testing

### Functional Testing

All endpoints were tested using **API-Dog**.

### Performance Testing

Performance testing was conducted using **k6**:

* Read-heavy workloads
* Write-heavy workloads
* Mixed workloads
* Spike testing
* Soak testing

👉 Full results are available in the Wiki.

---

## 📘 Documentation

Full project documentation is available in the Wiki, including:

* System architecture
* Database schema (ERD)
* API design explanation
* Performance testing results

---

##  API Documentation (API-Dog)

All APIs are documented using API-Dog, including:

* Endpoint descriptions
* Request/response schemas
* Authentication flow
* Error formats

---

## 🧠 Conclusion

This project demonstrates building a structured backend system using Node.js and Express, with proper API design, database integration, and performance testing.

---

## 👨‍💻 Team

* Moqtada Shehadeh
  
* Rashid Maraaba
  
* Batool AbuYaman
  
* Ghaidaa Halabi
