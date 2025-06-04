# Smartronics Project Setup & Team Guide

## 1. Project Structure (MVC Pattern)
We organized the project using the MVC (Model-View-Controller) pattern for clarity and teamwork. This helps separate concerns and makes the codebase easier to maintain and scale.

**Folder Structure:**
```
Smartronics/
├── config/           # Configuration files (e.g., database connection)
├── controllers/      # Route logic and business logic (functions for each route)
├── middleware/       # Custom middleware functions (e.g., authentication, error handling)
├── models/           # Database models (Mongoose schemas for MongoDB)
├── public/           # Static files (CSS, JS, images)
│   ├── css/          # Stylesheets
│   ├── js/           # Client-side JavaScript
│   └── images/       # Product and site images
├── routes/           # Express route definitions (URL endpoints)
├── views/            # EJS templates for HTML pages
│   ├── pages/        # Main pages (home, product, cart, etc.)
│   └── partials/     # Reusable HTML parts (header, footer, nav)
├── .gitignore        # Files/folders to ignore in git
├── package.json      # Project dependencies and scripts
├── server.js         # Main server file (entry point)
```

---

## 2. Node.js & Express Server Setup
- **server.js** is the entry point of the application.
- Connects to MongoDB using Mongoose.
- Sets up Express to handle HTTP requests and responses.
- Serves static files from the `public` directory.
- Uses EJS as the view engine to render dynamic HTML pages.
- Defines a basic route for the home page (`/`).
- **Note:** The port number is now hardcoded as `3000` in `server.js` (no longer using environment variables).

**How to run the server:**
```bash
npm start
```
Or, for development with auto-reload (if you have nodemon):
```bash
npm run dev
```

---

## 3. Environment Variables (No Longer Used)
- **Update:** We no longer use a `.env` file or the `dotenv` package. All configuration values (like the port and MongoDB URI) are now hardcoded in the code for simplicity.
- If you want to use environment variables in the future, you can reintroduce a `.env` file and the `dotenv` package.

---

## 4. MongoDB Connection
- **config/db.js** contains the logic to connect to MongoDB using Mongoose.
- The connection string is now hardcoded as `'mongodb://localhost:27017/smartronics'`.
- If MongoDB is not running, the server will show a connection error (this is expected until the DB is set up).
- Deprecated options were removed for compatibility with the latest MongoDB driver.

---

## 5. Git & GitHub Setup
- Initialized a git repository with `git init`.
- Created a `.gitignore` file to ignore `node_modules`, `.env`, and other unnecessary files.
- To connect to GitHub:
  1. Create a new repo on GitHub (do not initialize with README or .gitignore).
  2. Add the remote:
     ```bash
     git remote add origin https://github.com/yourusername/smartronics.git
     git branch -M main
     git push -u origin main
     ```
- To collaborate:
  - Use `git add .`, `git commit -m "message"`, `git push` to share your work.
  - Use `git pull` to get the latest changes from teammates.
  - Use branches for features or bug fixes (recommended):
    ```bash
    git checkout -b feature/your-feature
    # work, then
    git add .
    git commit -m "Add your feature"
    git push origin feature/your-feature
    ```

---

## 6. Cleaning Up Corrupted Files
- Some files were corrupted (contained binary/non-UTF8 content).
- We fixed this by deleting the bad content and replacing it with clean, valid code.
- Always use a code editor (VS Code, Sublime, etc.) and save files as UTF-8.

---

## 7. Frontend File Preparation
- The following files are ready for your HTML/CSS/JS:
  - `views/pages/index.ejs` (main page)
  - `views/partials/header.ejs` (header)
  - `views/partials/footer.ejs` (footer)
  - `public/css/style.css` (main stylesheet)
  - `public/js/main.js` (main JS file)
- **Write your HTML code in the `.ejs` files inside `views/pages/`.**
- Use partials for reusable components (header, footer, navigation, etc.).
- Link your CSS and JS in your EJS files:
  ```html
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/main.js"></script>
  ```

---

## 8. Running & Debugging the Server
- Start the server with `npm start`.
- If you see errors about MongoDB, make sure MongoDB is installed and running, or comment out the DB connection until setup is complete.
- If you see warnings about deprecated options, update your code as we did in `config/db.js`.
- Check the terminal for logs and errors.

---

## 9. Next Steps for the Team
- Add content to your EJS, CSS, and JS files to build the frontend.
- Set up MongoDB together and create your models in the `models/` folder (e.g., User, Product, Order, Cart).
- Implement routes and controllers for your app's features (authentication, product listing, cart, etc.).
- Use GitHub for collaboration and code reviews.
- Follow the MVC pattern for all new features.

---

## 10. Key Files & Their Purpose
| File/Folder                | Purpose                                      |
|---------------------------|----------------------------------------------|
| server.js                  | Main server setup                            |
| config/db.js               | MongoDB connection logic                     |
| routes/                    | Route definitions                            |
| controllers/               | Route logic/business logic                   |
| models/                    | Database schemas                             |
| views/pages/               | Main HTML pages (EJS templates)              |
| views/partials/            | Reusable HTML parts (header, footer, etc.)   |
| public/css/style.css       | Main stylesheet                              |
| public/js/main.js          | Main JavaScript file                         |
| .gitignore                 | Files/folders to ignore in git               |
| package.json               | Project dependencies and scripts             |

---

## 11. Why EJS?
- EJS (Embedded JavaScript) lets you write HTML pages with dynamic content from your server.
- You can use variables, loops, and includes (for partials) in your HTML.
- Example:
  ```html
  <h1>Welcome, <%= user.name %>!</h1>
  <%- include('../partials/header') %>
  ```

---

## 12. Troubleshooting & Best Practices
- **Corrupted files:** Always use a code editor and save as UTF-8.
- **MongoDB errors:** Make sure MongoDB is running, or comment out DB code if not needed yet.
- **.env file:** Not used in the current setup. If you want to use environment variables in the future, reintroduce `.env` and `dotenv`.
- **node_modules:** Never commit this folder; always use `.gitignore`.
- **Collaboration:** Communicate with your team, use branches, and review each other's code.
- **Documentation:** Update this file as you add new features or change the setup.

---

## 13. Checklist for New Team Members
- [ ] Clone the repo from GitHub
- [ ] Run `npm install` to install dependencies
- [ ] Start the server with `npm start`
- [ ] Pull the latest changes before starting new work (`git pull`)
- [ ] Use branches for new features or fixes
- [ ] Commit and push your changes regularly

---

## 14. Useful Commands
- Start server: `npm start`
- Start server with nodemon: `npm run dev`
- Install a new package: `npm install package-name`
- Add all changes: `git add .`
- Commit changes: `git commit -m "message"`
- Push to GitHub: `git push`
- Pull from GitHub: `git pull`
- Create a new branch: `git checkout -b branch-name`

---

**This document is for all team members to understand what's been done, why, and how to continue building the project together! Update it as your project grows.** 