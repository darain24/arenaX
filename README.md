# ArenaX – Community Sports Management and Engagement Platform

---

## 1. Project Title  
**ArenaX – Community Sports Management and Engagement Platform**

---

## 2. Problem Statement  
Sports enthusiasts often struggle to find local games, manage team events, and stay updated on match statistics or player progress. Current platforms are fragmented — some focus only on news, others on booking or team communication.  
ArenaX aims to bring everything into one place — a unified platform for local sports communities to organize matches, track stats, and engage socially with other players and teams.

---

## 3. System Architecture  

### **Architecture Flow**
Frontend (React + Vite) → Express.js API (CRUD + Auth) → MySQL (relational database)  
↓  
(Optional) AI Insights & Recommendation Layer

### **Tech Stack Overview**
- **Frontend:** React JS, Tailwind CSS  
- **Backend:** Node.js + Express.js  
- **Database:** MySQL (relational database)  
- **Authentication:** JWT-based user authentication  

### **Hosting**
- Frontend → Vercel  
- Backend → Render  
- Database → MySQL  

---

## 4. Key Features  

| Category | Features |
|----------|----------|
| **Authentication & User Management** | Register, login, JWT sessions, profile customization |
| **Sports Match Management** | Create, Read, Update, Delete (CRUD) matches |
| **Team Management** | CRUD operations for teams — add, edit, delete, and view |
| **Score Tracking** | Input and update scores, auto-generate leaderboards |
| **News & Updates** | Sports feed for local and global news |
| **Community & Chat** | Discussion boards or chat for players and fans |
| **Analytics (Future)** | Player and team performance summaries via AI |
| **Data Handling** | Searching, Sorting, Filtering, and Pagination for match listings, teams, and player stats |
| **Routing** | Multi-page navigation using React Router |
| **Dynamic Data Fetching** | API-based CRUD operations and lazy loading for faster performance |

---

## 5. Tech Stack  

| Layer | Technologies |
|--------|-------------|
| **Frontend** | React JS, Tailwind CSS |
| **Routing & State** | React Router, React Query / Context API |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (relational database) |
| **Authentication** | JWT (JSON Web Tokens) |
| **CRUD APIs** | Express-based RESTful endpoints for Matches, Teams, and Users |
| **Hosting** | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 6. API Overview  

| Endpoint | Method | Description | Access |
|----------|---------|-------------|---------|
| /api/auth/signup | POST | Register a new user | Public |
| /api/auth/login | POST | Authenticate and issue JWT | Public |
| /api/matches | GET | Fetch all matches (supports search, filter, pagination) | Authenticated |
| /api/matches/:id | GET | Get match details by ID | Authenticated |
| /api/matches | POST | Create a new match | Authenticated |
| /api/matches/:id | PUT | Update match details | Authenticated |
| /api/matches/:id | DELETE | Delete a match | Authenticated |
| /api/teams | GET | Get all teams with members | Authenticated |
| /api/teams | POST | Create a team | Authenticated |
| /api/teams/:id | PUT | Update team details | Authenticated |
| /api/teams/:id | DELETE | Delete a team | Authenticated |
| /api/leaderboard | GET | Get performance leaderboard | Authenticated |

---

