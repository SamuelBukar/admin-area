# Harmony Hub - Complete Features & Functionality Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Security](#authentication--security)
3. [Dashboard](#dashboard)
4. [Template Builder](#template-builder)
5. [Pages Management](#pages-management)
6. [User Management](#user-management)
7. [Settings](#settings)
8. [UI/UX Features](#uiux-features)
9. [Technical Stack](#technical-stack)
10. [Widgets & Elements](#widgets--elements)
11. [Permissions & Roles](#permissions--roles)
12. [API & Data Management](#api--data-management)

---

## Overview

**Harmony Hub** is a comprehensive drag-and-drop document template builder application built with React, TypeScript, and modern web technologies. It enables users to create, manage, and publish interactive forms and document templates with a visual builder interface.

### Key Capabilities
- **Visual Template Builder**: Drag-and-drop interface for creating forms and documents
- **Page Management**: Create, edit, publish, and manage pages
- **User Management**: Role-based access control with permissions
- **Theme Support**: Light and dark mode with system preference detection
- **Two-Factor Authentication**: Enhanced security with 2FA
- **Real-time Preview**: Preview templates before publishing
- **Responsive Design**: Works seamlessly on desktop and mobile devices

---

## Authentication & Security

### Login System
- **Email/Password Authentication**: Standard login with email and password
- **Session Persistence**: User sessions stored in localStorage
- **Auto-login**: Remembers user sessions across browser sessions
- **Protected Routes**: All dashboard routes require authentication

### Two-Factor Authentication (2FA)
- **Email-based 2FA**: Verification codes sent via email
- **Enable/Disable**: Users can enable or disable 2FA from settings
- **Verification Flow**: 
  1. User requests 2FA code
  2. Code sent to registered email
  3. User enters code to verify
  4. 2FA enabled/disabled based on verification
- **Status Display**: Clear indication of 2FA status in settings

### Security Features
- **Password Management**: Change password functionality
- **Account Deletion**: Secure account deletion with confirmation
- **Permission Checks**: All actions validated against user permissions
- **Protected API Routes**: Backend routes protected by authentication

---

## Dashboard

### Overview
The main dashboard provides a comprehensive view of the application's key metrics and quick actions.

### Features

#### Statistics Cards
- **Total Templates**: Count of all created templates
- **Published Pages**: Number of published pages
- **Total Users**: Count of registered users
- **Completion Rate**: Percentage of completed forms/templates

#### Recent Activity Feed
- Displays recent actions and updates
- Shows activity icons and timestamps
- Includes actions like:
  - Template creation
  - Page publishing
  - User additions
  - System updates

#### Quick Actions
- **Create New Template**: Navigate to builder
- **Create New Page**: Open page creation modal
- **Add Team Member**: Open user creation modal

### Data Loading
- Uses TanStack Query for data fetching
- Loading skeletons during data fetch
- Error handling with fallback UI

---

## Template Builder

### Overview
The Template Builder is a full-screen, drag-and-drop interface for creating document templates and forms.

### Key Features

#### Full-Screen Workspace
- **Hidden Sidebar**: Main sidebar hidden on builder page
- **Hidden Navbar**: Top navbar hidden for immersive experience
- **Dedicated Header**: Builder-specific header with actions
- **Canvas Area**: Large workspace for template building

#### Drag-and-Drop System
- **Widget Sidebar**: Left sidebar with draggable widgets
- **Drop Zones**: Canvas accepts dropped widgets
- **Nested Drop Support**: Containers and grids accept nested widgets
- **Visual Feedback**: Drag-over indicators and hover effects

#### Widget Categories

**Text Elements:**
- Title
- Subtitle
- Paragraph
- Divider

**Form Inputs:**
- Text Input
- Text Area
- Checkbox
- Radio Group
- Dropdown (Select)
- Date Picker

**Layout Elements:**
- 2-Column Grid (with nested widget support)
- Container (with nested widget support)
- Spacer (vertical space)
- Image

#### Editing Capabilities

**Inline Editing:**
- **Text Elements**: Click to edit directly on canvas
- **Spacer Height**: Click to adjust vertical space
- **Real-time Updates**: Changes reflect immediately

**Modal Editing:**
- **Form Inputs**: Edit properties via modal
  - Label, placeholder, required status
  - Styling options (colors, fonts, spacing)
- **Images**: Edit via modal
  - Upload from computer (base64 encoding)
  - Enter image URL
  - Alt text, dimensions, alignment
  - Live preview

**Styling Options:**
- Text color
- Background color
- Font size
- Font weight
- Font family
- Padding
- Margin

#### Builder Actions

**Header Actions:**
- **Back Button**: Return to dashboard
- **Save**: Save template to localStorage
- **Preview**: Open preview in new tab
- **Publish**: Publish template as page
- **Clear**: Clear all elements
- **User Menu**: Access user profile and logout

**Element Actions:**
- **Edit**: Open edit modal or inline edit
- **Delete**: Remove element (with confirmation)
- **Duplicate**: Copy element (future feature)

#### Nested Elements Support
- **Containers**: Can hold multiple widgets
- **Grid Columns**: Each column can hold widgets
- **Recursive Operations**: Delete/update works recursively
- **Drag-and-Drop**: Nested drag-and-drop fully supported

#### Image Support
- **Local Upload**: Upload images from computer
- **URL Input**: Enter image URLs
- **Base64 Encoding**: Local images converted to base64
- **Preview**: Live preview in edit modal
- **Validation**: File type and size validation (max 5MB)
- **Error Handling**: Graceful error messages for failed loads

---

## Pages Management

### Overview
The Pages section manages all created and published pages/templates.

### Features

#### Page List View
- **Card-based Layout**: Each page displayed as a card
- **Status Badges**: Visual indicators for Published/Draft status
- **Metadata Display**: 
  - Page title and slug
  - Last updated timestamp
  - View count
  - Status (Published/Draft)

#### Search & Filtering
- **Search Bar**: Search by title or slug
- **Status Filter**: Filter by All/Published/Draft
- **Sort Options**:
  - Last Updated
  - Most Views
  - Title (A-Z)

#### Bulk Operations
- **Multi-select**: Checkbox selection for multiple pages
- **Select All**: Select/deselect all filtered pages
- **Bulk Delete**: Delete multiple pages at once

#### Page Actions
- **View**: View page details
- **Edit**: Open page in builder for editing
- **Duplicate**: Create a copy of the page
- **Delete**: Remove page (with confirmation)
- **Open Live**: Open published page in new tab
- **Copy Preview Link**: Copy preview URL to clipboard

#### Page Creation
- **Create Modal**: Form to create new pages
- **Fields**:
  - Page title
  - Page slug (auto-generated from title)
  - Description (optional)
- **Validation**: Required fields and format validation

#### Permission-Based Actions
- **Create**: Requires `pages.create` permission
- **Edit**: Requires `pages.edit` permission
- **Delete**: Requires `pages.delete` permission
- **Publish**: Requires `pages.publish` permission
- **Tooltips**: Show permission messages when disabled

---

## User Management

### Overview
The User Management section allows administrators to manage team members and their permissions.

### Features

#### User List
- **Card Layout**: Each user displayed as a card
- **Avatar**: User initials in colored avatar
- **User Info**:
  - Full name
  - Email address
  - Role badge
  - Status badge (Active/Inactive)
  - Join date

#### Statistics
- **Total Users**: Count of all users
- **Active Users**: Count of active users
- **Admins**: Count of admin users

#### Search
- **Search Bar**: Search by name or email
- **Real-time Filtering**: Results update as you type

#### User Actions
- **Add New User**: Create new user modal
- **Edit User**: Edit user details (future feature)
- **Delete User**: Remove user (with confirmation)

#### User Creation
- **Create Modal**: Form to add new users
- **Fields**:
  - Full name
  - Email address
  - Role selection (Viewer, Editor, Admin, Land Administrator)
- **Validation**: Email format and required fields

#### Permission-Based Access
- **Create**: Requires `users.create` permission
- **Edit**: Requires `users.edit` permission
- **Delete**: Requires `users.delete` permission
- **Tooltips**: Show permission messages when disabled

---

## Settings

### Overview
The Settings page allows users to manage their account preferences and security settings.

### Tabs

#### 1. Profile
- **Profile Information**:
  - Full name (editable)
  - Email address (editable)
  - Save button
- **Account Deletion**:
  - Delete account button
  - Confirmation modal
  - Warning about data loss

#### 2. Notifications
- **Email Notifications**: Toggle on/off
- **Push Notifications**: Toggle on/off
- **Save Preferences**: Save notification settings

#### 3. Security
- **Password Management**:
  - Current password field
  - New password field
  - Confirm password field
  - Update password button
- **Two-Factor Authentication**:
  - Enable/Disable 2FA
  - Status indicator
  - Enable modal with verification flow
  - Success/error messages

#### 4. Appearance
- **Theme Selection**:
  - Light mode
  - Dark mode
  - System (follows OS preference)
- **Theme Toggle**: Also available in navbar
- **Default Theme**: Light mode (configurable)

---

## UI/UX Features

### Layout System

#### Dashboard Layout
- **Left Sidebar**: 
  - Navigation links
  - User info at bottom
  - Logout button
  - Full-height sidebar
- **Top Navbar**:
  - Search bar
  - Theme toggle
  - Notifications icon
  - User avatar dropdown
  - Mobile menu (hamburger)
- **Content Area**: Main content with padding and spacing

#### Responsive Design
- **Mobile Menu**: Slide-out menu for mobile devices
- **Responsive Grids**: Adapts to screen size
- **Touch-Friendly**: Large touch targets on mobile
- **Breakpoints**: sm, md, lg, xl breakpoints

### Theme System

#### Light/Dark Mode
- **Theme Toggle**: Available in navbar and settings
- **Default**: Light mode
- **System Preference**: Option to follow OS theme
- **Persistence**: Theme preference saved
- **Smooth Transitions**: Theme changes animate smoothly

#### Theme Implementation
- Uses `next-themes` library
- CSS variables for colors
- Dark mode classes via Tailwind
- No flash on page load

### Navigation

#### Sidebar Navigation
- Dashboard
- Builder
- Pages
- User Management
- Settings

#### Breadcrumbs
- Current page indicator
- Navigation history (future feature)

#### Mobile Navigation
- Hamburger menu
- Slide-out drawer
- All navigation links
- User info and logout

### Notifications

#### Toast Notifications
- **Position**: Top-right corner
- **Types**: Success, Error, Info, Warning
- **Auto-dismiss**: Configurable timeout
- **Actions**: Dismiss button
- **Stacking**: Multiple toasts stack vertically

#### Notification Icons
- Bell icon in navbar
- Notification count badge (future feature)
- Notification center (future feature)

### Loading States

#### Skeletons
- Loading placeholders for cards
- Loading placeholders for lists
- Maintains layout during loading

#### Spinners
- Button loading states
- Form submission indicators
- Async operation feedback

### Modals

#### Modal Types
- **Create Page Modal**: Form to create new pages
- **Create User Modal**: Form to add new users
- **Delete Confirm Modal**: Confirmation for deletions
- **Publish Modal**: Publish template as page
- **Enable 2FA Modal**: 2FA setup flow
- **Edit Form Modal**: Edit widget properties

#### Modal Features
- **Backdrop**: Click outside to close
- **Keyboard**: ESC to close
- **Focus Trap**: Focus stays within modal
- **Accessibility**: ARIA labels and roles

### Animations

#### Fade-in Animations
- Page load animations
- Staggered card animations
- Smooth transitions

#### Hover Effects
- Card hover shadows
- Button hover states
- Link hover effects

---

## Technical Stack

### Frontend Framework
- **React 18**: Latest React with hooks
- **TypeScript**: Type-safe development
- **Vite 5**: Fast build tool and dev server

### UI Libraries
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Material Design icons

### State Management
- **React Context**: Auth context, theme context
- **TanStack Query**: Server state management
- **localStorage**: Client-side persistence

### Routing
- **React Router DOM v6**: Client-side routing
- **Protected Routes**: Route guards for authentication
- **Dynamic Routes**: Page detail routes

### Forms
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Notifications
- **Sonner**: Toast notification library

### Theme
- **next-themes**: Theme management library

### Build Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type checking
- **ESLint**: Code linting (if configured)

---

## Widgets & Elements

### Text Elements

#### Title
- **Type**: `TITLE`
- **Default Content**: "Document Title"
- **Editable**: Inline editing
- **Styling**: Full styling options

#### Subtitle
- **Type**: `SUBTITLE`
- **Default Content**: "Section Subtitle"
- **Editable**: Inline editing
- **Styling**: Full styling options

#### Paragraph
- **Type**: `PARAGRAPH`
- **Default Content**: "Enter your paragraph text here..."
- **Editable**: Inline editing
- **Styling**: Full styling options

#### Divider
- **Type**: `DIVIDER`
- **Default Content**: Empty
- **Visual**: Horizontal line separator
- **Styling**: Color and thickness

### Form Input Elements

#### Text Input
- **Type**: `INPUT`
- **Properties**:
  - Label
  - Placeholder
  - Required flag
- **Styling**: Full styling options

#### Text Area
- **Type**: `TEXTAREA`
- **Properties**:
  - Label
  - Placeholder
  - Required flag
- **Styling**: Full styling options

#### Checkbox
- **Type**: `CHECKBOX`
- **Properties**:
  - Label
  - Checked state
- **Styling**: Full styling options

#### Radio Group
- **Type**: `RADIO`
- **Properties**:
  - Label
  - Options array
  - Required flag
- **Styling**: Full styling options

#### Dropdown (Select)
- **Type**: `SELECT`
- **Properties**:
  - Label
  - Options array
  - Required flag
- **Styling**: Full styling options

#### Date Picker
- **Type**: `DATE`
- **Properties**:
  - Label
  - Placeholder
  - Required flag
- **Styling**: Full styling options

### Layout Elements

#### 2-Column Grid
- **Type**: `GRID`
- **Properties**:
  - Columns: 2
  - Children: 2D array (one array per column)
- **Features**:
  - Each column can hold multiple widgets
  - Drag-and-drop into columns
  - Responsive layout

#### Container
- **Type**: `CONTAINER`
- **Properties**:
  - Title (optional)
  - Children: Array of widgets
- **Features**:
  - Can hold multiple widgets
  - Drag-and-drop support
  - Visual container with border

#### Spacer
- **Type**: `SPACE`
- **Properties**:
  - Height: Number (in pixels)
- **Features**:
  - Inline editing of height
  - Visual feedback during editing
  - Creates vertical space

#### Image
- **Type**: `IMAGE`
- **Properties**:
  - URL: Image source (URL or base64)
  - Alt text: Accessibility text
  - Width: CSS width value
  - Height: CSS height value
  - Alignment: left, center, right
- **Features**:
  - Local file upload
  - URL input
  - Live preview
  - Error handling
  - Base64 encoding for local images

---

## Permissions & Roles

### User Roles

#### Viewer
- **Permissions**:
  - View pages (read-only)
  - View settings (read-only)
- **Use Case**: Read-only access for stakeholders

#### Editor
- **Permissions**:
  - Create pages
  - Edit pages
  - Publish pages
  - Create templates
  - Edit templates
  - View settings (read-only)
- **Use Case**: Content creators and form builders

#### Admin
- **Permissions**:
  - All Editor permissions
  - Delete pages
  - Delete templates
  - Create users
  - Edit users
  - Delete users
  - Edit settings
- **Use Case**: Full system administration

#### Land Administrator
- **Permissions**:
  - All Admin permissions
  - Manage all pages regardless of owner
- **Use Case**: Super admin with cross-organization access

### Permission System

#### Permission Structure
```typescript
{
  pages: { create, edit, delete, publish },
  users: { create, edit, delete },
  templates: { create, edit, delete },
  settings: { view, edit }
}
```

#### Permission Checks
- **Client-side**: UI elements disabled based on permissions
- **Tooltips**: Show permission messages
- **Server-side**: API validates permissions (future)

#### Permission Helpers
- `hasPermission(resource, action)`: Check if user has permission
- `getPermissionsForRole(role)`: Get permissions for role
- `checkPermission(role, resource, action)`: Validate permission

---

## API & Data Management

### Data Fetching

#### TanStack Query
- **Queries**: Data fetching with caching
- **Mutations**: Data updates with optimistic updates
- **Error Handling**: Automatic error handling
- **Loading States**: Built-in loading states

#### Custom Hooks
- `useDashboardStats()`: Fetch dashboard statistics
- `useRecentActivity()`: Fetch recent activity
- `usePages()`: Fetch all pages
- `usePageDetail(id)`: Fetch single page
- `useUsers()`: Fetch all users
- `useDeletePage()`: Delete page mutation
- `useDeleteUser()`: Delete user mutation
- `usePublishPage()`: Publish page mutation
- `useUpdatePageTemplate()`: Update page template
- `useUnpublishPage()`: Unpublish page mutation
- `useDuplicatePage()`: Duplicate page mutation

### Data Persistence

#### localStorage
- **User Session**: Stored user data
- **Draft Templates**: Auto-saved templates
- **Theme Preference**: Theme selection
- **Settings**: User preferences

#### API Simulation
- **Mock API**: Simulated backend API
- **Delays**: Simulated network delays
- **Error Simulation**: Test error handling
- **Data Structure**: Consistent data models

### Data Models

#### User
```typescript
{
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission;
  twoFactorEnabled: boolean;
  status?: 'active' | 'inactive';
  joinedAt?: string;
}
```

#### Page
```typescript
{
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'published' | 'draft';
  templateId?: string;
  elements?: FormElement[];
  publishedAt?: string;
  createdBy?: string;
  views: number;
  updatedAt: string;
}
```

#### FormElement
```typescript
{
  id: string;
  type: WidgetType;
  content: ElementContent;
  styles?: Record<string, string>;
}
```

---

## Additional Features

### Preview System
- **Preview Button**: Opens preview in new tab
- **Full Preview**: Renders template as it will appear
- **Print Support**: Print-friendly styles
- **Responsive Preview**: Mobile and desktop views

### Search Functionality
- **Global Search**: Search bar in navbar
- **Page Search**: Search within pages list
- **User Search**: Search within users list
- **Real-time Filtering**: Results update as you type

### Error Handling
- **404 Page**: Custom not found page
- **Error Boundaries**: React error boundaries
- **API Errors**: Graceful error messages
- **Validation Errors**: Form validation feedback

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG compliant colors

### Performance
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Optimistic Updates**: Instant UI updates

---

## Future Enhancements

### Planned Features
- **Template Library**: Pre-built templates
- **Form Validation**: Client-side validation rules
- **Export Options**: PDF, Word, HTML export
- **Collaboration**: Real-time collaboration
- **Version History**: Template versioning
- **Analytics**: Form submission analytics
- **Custom Widgets**: User-defined widgets
- **API Integration**: Connect to external APIs
- **Webhooks**: Event notifications
- **Multi-language**: Internationalization support

---

## Conclusion

Harmony Hub is a comprehensive document template builder with a rich feature set covering authentication, template building, page management, user management, and extensive customization options. The application is built with modern web technologies and follows best practices for accessibility, performance, and user experience.

For technical support or feature requests, please refer to the development team or project documentation.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Documentation Version**: 1.0

