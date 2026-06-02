# Day 2 MERN Stack Internship Assignment

This repository contains my Day 2 internship assignment. The objective of this assignment was to understand asynchronous JavaScript, work with Node.js native modules, build REST APIs using Express.js, and interact with backend services using the Fetch API.

## Tasks Completed

### Task 2.1 - Backend Engineering

In this task, I developed a Node.js and Express.js server that reads user data from a local JSON file, processes the data, and exposes it through a REST API endpoint.

#### Concepts Used

* Node.js
* Express.js
* Async/Await
* Promises
* File System Module (fs)
* Path Module
* JSON Parsing
* Error Handling
* REST API Development

#### Features Implemented

* Read data from `users.json`
* Parse JSON data
* Filter users based on:

  * Age greater than or equal to 18
  * Active user status
* Return filtered data as JSON response
* Proper error handling using Try/Catch
* API response summary generation

#### API Endpoint

```text
GET /users
```

---

### Task 2.2 - API Client Testing

In this task, I created a frontend client using HTML and JavaScript that communicates with the Express.js backend using the native Fetch API.

#### Concepts Used

* Fetch API
* Async/Await
* Browser Console Logging
* API Communication
* Error Handling
* JSON Data Processing

#### Features Implemented

* Fetch data from Express API
* Display structured API response in browser console
* Display user information using console.table()
* Handle API errors gracefully
* Interactive button-based data retrieval

---

## Project Structure

```text
Day2/
├── server.js
├── users.json
├── client.html
├── package.json
├── package-lock.json
└── README.md
```

---

## Installation

Install required dependencies:

```bash
npm install
```

Or install Express and CORS manually:

```bash
npm install express cors
```

---

## Running the Backend Server

```bash
node server.js
```

Server will start at:

```text
http://localhost:3000
```

API Endpoint:

```text
http://localhost:3000/users
```

---

## Running the Client

Open:

```text
client.html
```

in your browser using Live Server or any local server.

Click the **Fetch Users** button and check the browser console (F12 → Console) to view the API response.

---

## Learning Outcomes

Through this assignment, I gained practical experience in:

* Asynchronous JavaScript Programming
* Working with Promises and Async/Await
* Building APIs with Express.js
* Reading files using Node.js fs module
* JSON Data Processing
* Frontend and Backend Communication
* API Testing using Fetch API
* Error Handling Techniques
* Git and GitHub Workflow

---

## Conclusion

Both assigned tasks were completed successfully and tested. This assignment strengthened my understanding of backend development, API creation, asynchronous programming, and client-server communication using modern JavaScript technologies.

---

## Submitted By

**Sanskar Gupta**

**MERN Stack Internship – Day 2 Submission**
