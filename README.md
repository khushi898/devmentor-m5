# DevMentor — AI-Assisted Learning Platform

**Milestone 5 Final Capstone · Full Stack + AI Engineering Program (Cohort 10)**
**Flavour B — Developer Learning Companion**

DevMentor helps engineers learn a new tech stack from their own material. Upload documentation PDFs, course notes or technical books, and DevMentor turns them into an active learning system: grounded chat with citations, flashcards and quizzes, voice Q&A, and an AI study planner that builds a topic-by-topic revision schedule.

| | |
|---|---|
| **Live app** | https://client-blue-gamma-25.vercel.app |
| **API** | https://devmentor-m5-api.onrender.com/api/health |
| **Demo video** | _Add link here_ |
| **Author** | Khushi Patel |

> The API runs on Render's free tier and sleeps when idle. The first request after a pause can take up to about 50 seconds while it wakes up.

### Test credentials (two accounts)

| Account | Email | Password |
|---|---|---|
| User A | `demo.a@devmentor.app` | `DemoPass123` |
| User B | `demo.b@devmentor.app` | `DemoPass123` |

Log in as User A, upload a PDF, then log in as User B: User B cannot see any of User A's data.

---

## Features

### Authentication and multi-user data
- Register and log in with **bcrypt** password hashing and **JWT** (7-day expiry)
- Protected routes on the **frontend** (`ProtectedRoute`) and the **API** (`