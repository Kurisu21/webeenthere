I am building a web application named "Webeenthere". It is a lightweight, beginner-friendly website builder inspired by platforms like Carrd.co, but targeted for freelancers, artists, small business owners, and digital creators. The system lets users easily create and manage one-page websites or digital portfolios.

I want this app to be built using:
- **Frontend**: HTML5, TailwindCSS, JavaScript (no React yet, make it simple and customizable)
- **Backend**: Node.js (Express.js)
- **Database**: MySQL (hosted locally via XAMPP, with plans to migrate to cloud services later)
- **File Storage**: Local `uploads/` folder for user-uploaded images
- **Authentication**: Simple login and signup system (username, email, password)
- **Website Builder Interface**:
    - Users can select a template OR start from scratch
    - Drag-and-drop sections like: Hero, About, Gallery, Contact, Social Links
    - Save website layout, content, and style in MySQL
    - Users can preview and publish their site to a URL like `webeenthere.com/username/sitename`
    - Optionally allow exporting HTML/CSS

Future roadmap (optional for now):
- AI prompt assistant for generating content (bio, site structure, styling help)
- Context-aware AI for suggesting design adjustments
- Domain support like `sitename.webeenthere.com`
- Analytics for site visits

Make the system modular and beginner-developer-friendly. Include organized file structure, comments in code, and a clean UI using TailwindCSS (dark/light mode toggle if possible).

Please generate:
- File structure
- Basic working Express server
- MySQL schema (users table, websites table)
- Simple Tailwind HTML frontend with minimal design
- Template saving and rendering logic
- User authentication
- Ability for logged-in users to create and save a new website (select template + customize)
