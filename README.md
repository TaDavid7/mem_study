# Flashcard Study App

A full-stack flashcard learning platform built with Next.js, React, Express, and MongoDB.
This app lets users create, organize, and study flashcards grouped into folders. It includes a speedrun and multiplayer mode, using Socket.io for real-time gameplay across multiple players
Currently the backend of the app is deployed on AWS EC2 and the frontend on Vercel. The backend currently has a CI/CD pipeline where any git commits automatically update the render of the app.

---

# Setup
For a quick demo use this link mem-study.vercel.app

### Clone the repository

``` bash
git clone https://github.com/TaDavid7/mem_study.git
```

### Mongo_URL setup

For quick testing, make an account and project, where you should make a cluster (free version should be fine). Then click the connect option (drivers) and select node.js with a version 6.7 or later and copy the connection string you get. Remembering to replace the database password and username to what you set. Under network access, make sure to give whatever ip address your on access 

### Backend setup
```bash
cd backend
npm install
# in app.js add you mongo connection string or create a .env and set MONGO_URL = your-mongodb-url
npm run dev
```

### Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

Open the app on http://localhost:3000 and it should be running

For any changes make to the backend, stop the frontend instance and the backend and rerun. Or if preferred, install nodemon if you want automatic refreshes.

--- 
#Future improvements
- User authentication
- Import/export flashcard sets
- Use machine learning algorithms for spaced repetition as a study mode


# Author
Build by David T.
Perfect for expanding/testing your own studying purposes

## License
Licensed under the Apache License 2.0 – see the [LICENSE](LICENSE) file for details.
