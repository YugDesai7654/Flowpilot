# FlowPilot - Finance Management Platform

<div align="center">
  <img src="/public/logo.png" alt="FlowPilot Logo" width="120" height="120" />
  <h1>FlowPilot</h1>
  <p><strong>All-in-One Dashboard for Smarter Company Management</strong></p>
  <p>Manage your finances, projects, and teams — all from a single intuitive platform.</p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.17.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24.11-black?style=for-the-badge)](https://next-auth.js.org/)
</div>

## 🌟 Features

### 🔐 Authentication & User Management
- **Multi-role System**: Admin, Employee, and Owner roles with different permissions
- **Company-based Isolation**: Users are organized by company with data isolation
- **Employee Approval System**: Admins can approve/reject employee registrations
- **Secure Authentication**: NextAuth.js with JWT tokens and bcrypt password hashing
- **Session Management**: Persistent sessions with automatic logout

### 💰 Financial Management
- **Transaction Tracking**: Comprehensive income and expense management
- **Multi-bank Support**: Manage transactions across multiple bank accounts
- **Category Management**: Organized transaction categories (Revenue, Payroll, Operations, IT Expenses, etc.)
- **Financial Analytics**: Interactive charts and visualizations
- **Invoice Tracking**: Link transactions to invoices and payment IDs
- **Real-time Dashboard**: Live financial overview with key metrics

### 📊 Dashboard & Analytics
- **Interactive Charts**: Area charts, bar charts, and financial visualizations
- **Real-time Data**: Live updates of financial metrics
- **Responsive Design**: Optimized for desktop and mobile devices
- **Customizable Widgets**: Modular dashboard components
- **Data Export**: Export financial data for reporting

### 🚀 Project Management
- **Project Creation**: Create and manage projects with detailed information
- **Team Assignment**: Assign project heads and team members
- **Task Management**: Create and track tasks within projects
- **Client Management**: Track client information and project relationships
- **Financial Tracking**: Monitor project revenue, costs, and profitability
- **Project Status**: Track project progress and completion

### 👥 Team Management
- **Employee Directory**: Manage team members and their roles
- **Approval Workflow**: Admin approval system for new employees
- **Role-based Access**: Different permissions based on user roles
- **Company Structure**: Multi-company support with data isolation

### 🏦 Bank Account Management
- **Multi-account Support**: Manage multiple bank accounts
- **Account Details**: Track account information and balances
- **Transaction Linking**: Link transactions to specific accounts
- **Account Analytics**: Financial insights per account

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Framer Motion** - Animation library
- **Recharts** - Chart library for data visualization
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB 6.17.0** - NoSQL database
- **Mongoose 8.15.1** - MongoDB object modeling
- **NextAuth.js 4.24.11** - Authentication solution
- **bcryptjs** - Password hashing
- **JWT** - JSON Web Tokens

### Development Tools
- **ESLint** - Code linting
- **Turbopack** - Fast bundler for development
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## 📁 Project Structure

```
finance-management/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── banks/         # Bank management APIs
│   │   │   ├── projects/      # Project management APIs
│   │   │   ├── tasks/         # Task management APIs
│   │   │   ├── transactions/  # Transaction APIs
│   │   │   └── user/          # User management APIs
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   ├── profile/           # User profile page
│   │   ├── projects/          # Project management pages
│   │   └── signup/            # Registration page
│   ├── components/            # Reusable UI components
│   │   ├── admin/             # Admin-specific components
│   │   ├── providers/         # Context providers
│   │   └── ui/                # Base UI components
│   ├── dbConfing/             # Database configuration
│   ├── helpers/               # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Library configurations
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── mongodb.ts        # MongoDB connection
│   │   └── validations/      # Schema validations
│   └── models/               # MongoDB models
│       ├── bankModel.ts      # Bank account model
│       ├── companyModel.ts   # Company model
│       ├── projectModel.ts   # Project model
│       ├── taskModel.ts      # Task model
│       ├── transactionModel.js # Transaction model
│       └── userModel.ts      # User model
├── public/                   # Static assets
└── middleware.ts            # Next.js middleware
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mkuldeepsinh/flowPilot.git
   cd flowPilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL=your_mongodb_connection_string
   
   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=http://localhost:3000
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Environment
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

### Database Setup

The application uses MongoDB with the following collections:
- **Users**: User accounts and authentication
- **Companies**: Company information
- **Projects**: Project management data
- **Tasks**: Task tracking within projects
- **Transactions**: Financial transactions
- **Banks**: Bank account information

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/employees` - Get company employees
- `POST /api/user/employees/approve` - Approve employee
- `POST /api/user/employees/reject` - Reject employee

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/[id]` - Get transaction details
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Banks
- `GET /api/banks` - Get all bank accounts
- `POST /api/banks` - Create new bank account
- `GET /api/banks/[id]` - Get bank account details
- `PUT /api/banks/[id]` - Update bank account
- `DELETE /api/banks/[id]` - Delete bank account

## 🎨 UI Components

The application uses a comprehensive set of UI components built with Radix UI and Tailwind CSS:

- **Navigation**: Sidebar, navbar, breadcrumbs
- **Forms**: Input fields, select dropdowns, checkboxes, radio buttons
- **Data Display**: Tables, cards, badges, avatars
- **Feedback**: Alerts, toasts, loading states
- **Overlays**: Modals, drawers, popovers, tooltips
- **Charts**: Interactive financial charts and visualizations

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **Role-based Access**: Different permissions per user role
- **Company Isolation**: Data separation between companies
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Built-in NextAuth.js protection
- **Secure Cookies**: HTTP-only cookies in production

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Touch devices

## 🚀 Performance Features

- **Server-side Rendering**: Next.js SSR for better SEO
- **Static Generation**: Pre-rendered pages where possible
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Bundle Optimization**: Turbopack for faster builds

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/mkuldeepsinh/flowPilot/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Roadmap

- [ ] Real-time notifications
- [ ] Advanced reporting features
- [ ] Mobile app development
- [ ] Integration with accounting software
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Automated backups

---

<div align="center">
  <p>Built with ❤️ by the FlowPilot Team</p>
  <p>Visit us at: <a href="https://flowpilot-alpha.vercel.app">flowpilot-alpha.vercel.app</a></p>
</div>
