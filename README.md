# Chips Corral

## What is Chips Corral?
Chips Corral is a community-forum site for CU Boulder students. It gives students the opporunity to make forums for different clubs, activities, classes, or anything of their choosing and then post in those forums respectively creating communities for all their needs.

## Who made Chips Corral?
Chips Corral was developed by team 101-2 for CSCI 3308 Software Development Methods and Tools in the Spring 2019 semester.

## How can I access Chips Corral?
Chips Corral is currently live at https://cub-forum.herokuapp.com/

# Code

## File Structure
```
├── resources
│   ├── css
│   │   ├── General.css
│   │   ├── Header.css
│   │   ├── Home.css
│   │   ├── Profile.css
│   │   └── Welcome.css
│   ├── javascript
│   │   ├── home.js
│   │   ├── profile.js
│   │   └── threads.js
│   └── sql
│       ├── comments_table.sql
│       ├── posts_table.sql
│       ├── threads_table.sql
│       └── users_table.sql
├── routes
│   ├── home.js
│   ├── users.js
│   └── welcome.js
├── views
│   ├── pages
│   │   ├── home.html
│   │   ├── profile.html
│   │   ├── thread_template.html
│   │   └── welcome.html
│   └── templates
│       ├── _home-header.njk
│       └── _main-header.njk
├── .gitignore
├── README.md
├── package-lock.json
├── package.json
└── server.js
```
## How To Run
Chip's Corral was written using nodeJS. Node and NPM must be installed in order to run the project locally.

1. Clone Chip's Corral github:
   ```
   git clone https://github.com/101-2/ChipsCorral.git
   ```
2. Inside the ChipsCorral directory, install node packages:
   ```
   npm install
   ```
3. For developement, nodemon was used to run the project. Nodemon automatically detects changes in the project and restarts the server. To run with nodemon use:
   ```
   npm run dev
   ```
4. To run ChipsCorral normally, use:
   ```
   npm start
   ```

Alternatively, Chip's Corral is deployed through Heroku and can be accessed at https://cub-forum.herokuapp.com/

