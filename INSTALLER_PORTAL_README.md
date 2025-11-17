# Installer Portal - Subcontractor Access System

## Overview

The Installer Portal provides a mobile-optimized interface for subcontractors to access their assigned installation projects, update task statuses, and upload progress photos.

## Features

### For Installers
- **Mobile-Friendly Dashboard**: View all assigned projects in a responsive interface
- **Project Details**: Access customer information, location, and project notes
- **Task Management**: Update task status (pending, in progress, completed, blocked)
- **Photo Documentation**: Upload before, progress, after, and issue photos
- **Real-Time Updates**: See project changes as they happen

### For Administrators
- **Auto-Generated Projects**: Orders with installation automatically create install projects
- **Team-Based Access**: Installers only see projects assigned to their team
- **Progress Tracking**: View uploaded photos and task updates from installers
- **Secure Access**: Role-based security ensures data protection

## Access URLs

- **Admin/PM Dashboard**: `/installs/dashboard`
- **Installer Portal**: `/installer`
- **Project Detail**: `/installer/project/:projectId`

## Setup Instructions

### 1. Create Installer Account
1. Navigate to Backend → Authentication
2. Click "Add User"
3. Enter installer's email and generate a password
4. Save the credentials

### 2. Assign Installer Role
1. Go to Backend → Database → user_roles table
2. Click "Insert row"
3. Set:
   - `user_id`: The UUID from step 1
   - `role`: "installer"
4. Save the row

### 3. Add to Team
1. In the Install Projects Dashboard, click "Manage Teams"
2. Select the team or create a new one
3. Click "View Members" on the team
4. Click "Add Member"
5. Enter installer details with the **same email** from step 1
6. Save the member

### 4. Share Access
Send the installer:
- Portal URL: `https://your-domain.com/installer`
- Their login email and password
- Brief instructions on using the portal

## Installation Flow

### Estimator → Order → Install Project

1. **Customer** creates an estimate and checks "Include Installation Service"
   - Installation cost automatically calculated as 15% of materials
   - Displays in estimate total

2. **Customer** places order with installation checkbox selected
   - Order created with installation cost included
   - Install project automatically generated with:
     - Project name: "Installation for Order #[orderId]"
     - Customer details from order
     - Installation address from shipping address
     - Start date: 1 week from order
     - Target completion: 2 weeks from order
     - Budget: Installation cost
     - Status: "pending"

3. **Admin/PM** assigns team to project
   - Go to Install Projects Dashboard
   - Click on the project
   - Navigate to "Assignments" tab
   - Click "Assign Team"
   - Select team and set schedule

4. **Installer** receives access
   - Logs into `/installer` portal
   - Sees assigned project
   - Can view details, update tasks, upload photos

## Technical Details

### Database Schema

**installation_photos** table:
- `project_id`: Links to install_projects
- `uploaded_by`: User who uploaded
- `photo_url`: Storage URL
- `photo_type`: before | progress | after | issue
- `description`: Optional notes
- `task_id`: Optional link to specific task

### Storage Bucket

**installation-photos**:
- Private bucket
- 10MB file size limit
- Supports: JPEG, PNG, WEBP
- Folder structure: `{project_id}/{timestamp}-{filename}`

### Security

**Row-Level Security Policies**:
- Installers can only view/update projects assigned to their team
- Installers can only upload photos for their assigned projects
- Admins and PMs have full access to all projects and photos
- Team membership verified via email match

### Role Hierarchy

- **admin**: Full system access
- **project_manager**: Project and team management
- **installer**: View assigned projects, update status, upload photos
- **user**: Place orders, view own orders

## Mobile Optimization

The portal is optimized for mobile devices with:
- Touch-friendly interface
- Large tap targets
- Simplified navigation
- Sticky headers
- Bottom-safe-area padding
- Image upload from camera
- Responsive grid layouts

## Photo Upload Process

1. Installer taps photo type button (before/progress/after/issue)
2. Selects photo from camera/gallery
3. File validated (size, type)
4. Uploaded to storage bucket
5. Record created in installation_photos table
6. Photo appears in gallery immediately

## Common Workflows

### Starting a Project
1. Installer logs in
2. Views "My Projects"
3. Taps on scheduled project
4. Updates status to "in_progress"
5. Uploads "before" photos

### Completing Tasks
1. Views task list in project
2. Taps status dropdown
3. Changes from "pending" to "in_progress"
4. When done, changes to "completed"

### Reporting Issues
1. Encounters problem during install
2. Uploads photo with type "issue"
3. Admin/PM receives notification
4. Can view issue photo in admin dashboard

## Future Enhancements (Phase 3+)

- Push notifications for new assignments
- Offline mode with sync
- Time tracking per task
- Material usage logging
- Customer signature capture
- QR code project access
- Invoice submission
- GPS check-in/check-out
