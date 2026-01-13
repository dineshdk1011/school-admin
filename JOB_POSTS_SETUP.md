# Job Posts Feature Setup Guide

## ✅ What Has Been Implemented

1. **Sidebar Menu**: Added "Job Post" menu item to the sidebar navigation
2. **Job Posts Page**: Created a complete job posting management page with:
   - **Add New Job** functionality with form to create job posts
   - **List of Available Jobs** with search and filter capabilities
   - **View Applications** feature that shows all users who applied for each job
   - **Update Application Status** directly from the applications view

3. **Types**: Added `JobPost` and `JobApplicationWithJob` interfaces to `types.ts`

4. **Routing**: Added `/job-posts` route to the application

## 🔥 Firebase Firestore Setup Required

### Step 1: Update Firestore Security Rules

You need to add permissions for the new `jobPosts` collection in your Firebase Console.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pranav-global-school---pgs**
3. Navigate to **Firestore Database** → **Rules** tab
4. Add the following rule for `jobPosts` collection:

```javascript
// Allow read/write access to jobPosts collection
match /jobPosts/{document=**} {
  allow read, write: if true;
}
```

### Complete Updated Rules

Here's the complete rules file with the new `jobPosts` collection added:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to admin collection for login
    match /admin/{document=**} {
      allow read: if true;
      allow write: if false; // Prevent writes for security
    }
    
    // Allow read/write access to gallery collection
    match /gallery/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to admissionForms collection
    match /admissionForms/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to contactForms collection
    match /contactForms/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to jobApplications collection
    match /jobApplications/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to jobPosts collection
    match /jobPosts/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to homePage collection (for video and banner)
    match /homePage/{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish** to save the rules
6. Wait 10-30 seconds for rules to propagate

## 📋 How It Works

### Job Posts Collection Structure

Each job post document in Firestore will have the following structure:

```javascript
{
  title: "Mathematics Teacher",
  description: "Job description and responsibilities...",
  department: "Academic",
  location: "New York",
  type: "Full-time", // Full-time, Part-time, Contract, Temporary
  requirements: "Required qualifications...",
  salary: "$50,000 - $70,000", // Optional
  status: "active", // active or closed
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Linking Job Applications to Job Posts

The system links job applications to job posts by matching:
- **Job Post Title** (from `jobPosts` collection) 
- **Position Field** (from `jobApplications` collection)

When you click "View Applications" on a job post, it:
1. Gets the job post title
2. Searches all `jobApplications` where `position` matches the job title
3. Displays all matching applications with user details

## 🎯 Features

### Add New Job
- Click "Add New Job" button
- Fill in the form:
  - **Title*** (required)
  - **Description*** (required)
  - **Department*** (required)
  - **Location** (optional)
  - **Job Type** (Full-time, Part-time, Contract, Temporary)
  - **Status** (Active or Closed)
  - **Salary** (optional)
  - **Requirements** (optional)
- Click "Add Job" to save

### List Jobs
- View all job posts in a table
- Search by title or department
- Filter by status (All, Active, Closed)
- See creation date and current status

### View Applications
- Click "View Applications" on any job post
- See all users who applied for that specific job
- View applicant details:
  - Name, Email, Phone
  - City
  - Resume link
  - Cover letter
  - Application date
- Update application status directly from the modal

## 🔍 Testing

1. **Add a Job Post**:
   - Navigate to Job Post page
   - Click "Add New Job"
   - Fill in the form and submit
   - Verify it appears in the list

2. **View Applications**:
   - Click "View Applications" on a job post
   - If there are applications with matching position, they will appear
   - If no applications match, you'll see "No applications found"

3. **Update Application Status**:
   - In the applications modal, use the dropdown to change status
   - The status updates immediately in Firestore

## ⚠️ Important Notes

1. **Job Application Matching**: The system matches applications to job posts by comparing:
   - Job Post `title` field
   - Job Application `position` field
   
   Make sure these match exactly for applications to appear.

2. **Firestore Rules**: The current rules allow all reads/writes for development. For production, consider using authenticated rules (see `FIRESTORE_SETUP.md` for production rules).

3. **Data Structure**: Job posts are stored in the `jobPosts` collection. Job applications remain in the `jobApplications` collection and are linked by position matching.

## 🚀 Next Steps

1. Update Firestore rules as shown above
2. Test adding a new job post
3. Verify applications appear when clicking "View Applications"
4. Consider adding more fields or features as needed
