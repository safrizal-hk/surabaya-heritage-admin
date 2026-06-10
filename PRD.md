# Product Requirements Document (PRD)

# Surabaya Heritage Admin

Version: 1.0
Status: Draft
Author: Safrizal
Last Updated: June 2026

---

# 1. Product Overview

## Product Name

**Surabaya Heritage Admin**

## Product Description

Surabaya Heritage Admin is a web-based administration dashboard designed to manage the content and data of the Surabaya Heritage mobile application.

Surabaya Heritage is a location-based mobile application that helps users discover historical buildings and heritage sites in Surabaya. The application provides detailed information such as location, descriptions, photos, categories, reviews, and navigation assistance.

The admin dashboard serves as the central management system for maintaining and updating all application data stored in Supabase.

---

# 2. Problem Statement

Managing historical site information requires a centralized administration system to ensure that all information presented to users remains accurate, up-to-date, and consistent.

Without an administration dashboard, content management becomes inefficient and increases the risk of outdated or incorrect information being displayed in the mobile application.

The system should provide administrators with tools to:

* Manage historical places and landmarks.
* Manage categories.
* Moderate user reviews.
* Manage user accounts.
* Upload and organize media assets.

---

# 3. Product Goals

## Business Goals

* Provide a centralized platform for managing Surabaya Heritage data.
* Improve data accuracy and consistency across the mobile application.
* Simplify administrative workflows.
* Support future scalability and feature expansion.

## User Goals

Administrators should be able to:

* Add new heritage locations.
* Edit existing location information.
* Remove invalid or outdated data.
* Manage categories.
* Moderate reviews.
* Manage users and permissions.
* Upload and organize photos.

---

# 4. User Roles

## Admin

Administrators have full access to the dashboard.

Permissions:

* Login and logout
* Manage places
* Manage categories
* Manage reviews
* Manage users
* Upload and manage photos
* Create additional admin accounts

## User

Mobile application users.

Permissions:

* Browse heritage places
* Submit reviews
* Save bookmarks

Users do not have access to the admin dashboard.

---

# 5. Success Metrics

## MVP Success Metrics

* Administrators can successfully authenticate.
* All CRUD operations function correctly.
* Photo uploads are stored successfully in Supabase Storage.
* Dashboard data synchronizes properly with the Flutter application.
* No critical errors occur during standard operations.

## Long-Term Metrics

* Place creation process completed in less than 3 minutes.
* Photo upload success rate above 95%.
* Dashboard page load time below 3 seconds.

---

# 6. Functional Requirements

## FR-01 Authentication

### Login

Administrators can log in using email and password.

Inputs:

* Email
* Password

Validation Rules:

* Email is required.
* Password is required.
* Only users with the `admin` role can access the dashboard.

Expected Result:

* Successful authentication.
* Redirect to Dashboard.

---

### Logout

Administrators can securely sign out.

Expected Result:

* Session is terminated.
* User is redirected to the login page.

---

## FR-02 Dashboard

The dashboard provides an overview of platform activity.

### Statistics Cards

Display:

* Total Places
* Total Categories
* Total Users
* Total Reviews

### Recent Places

Display the five most recently created places.

### Recent Reviews

Display the five most recent reviews.

---

## FR-03 Place Management

### Place List

Display:

* Primary photo
* Place name
* Category
* Average rating
* Active status
* Creation date

Features:

* Search
* Sorting
* Filtering by category
* Pagination

---

### Create Place

Fields:

* Place Name
* Category
* Google Place ID (Optional)
* Address
* Latitude
* Longitude
* Description
* Opening Hours
* Phone Number
* Website
* Active Status

Validation:

* Place name is required.
* Category is required.
* Latitude is required.
* Longitude is required.

---

### Update Place

Administrators can modify all place information.

---

### Delete Place

Administrators can permanently delete a place.

Confirmation Message:

> Are you sure you want to delete this place?

---

### Map Location Selection

Administrators can:

* Click on a map to select a location.
* Automatically populate latitude and longitude.
* Manually enter coordinates if necessary.

---

## FR-04 Place Photo Management

### Upload Photos

Supported Formats:

* JPG
* JPEG
* PNG
* WEBP

Storage:

* Supabase Storage

---

### Set Primary Photo

Administrators can designate one photo as the primary image for a place.

---

### Delete Photo

Administrators can remove photos from the system.

---

## FR-05 Category Management

### Category List

Display:

* Category Name
* Icon
* Creation Date

Features:

* Search
* Pagination

---

### Create Category

Fields:

* Category Name
* Icon

---

### Update Category

Administrators can edit category information.

---

### Delete Category

Administrators can remove categories.

---

## FR-06 Review Management

### Review List

Display:

* User Name
* Place Name
* Rating
* Comment
* Review Date

Features:

* Search
* Rating Filter
* Pagination

---

### Update Review

Administrators can edit review content.

---

### Delete Review

Administrators can remove reviews.

---

## FR-07 User Management

### User List

Display:

* Name
* Email
* Role
* Registration Date

Features:

* Search
* Role Filter
* Pagination

---

### Create User

Fields:

* Name
* Email
* Password
* Role

Available Roles:

* admin
* user

---

### Update User

Administrators can edit:

* Name
* Email
* Avatar
* Role

---

### Delete User

Administrators can permanently delete user accounts.

---

# 7. Database Requirements

## users

| Field         | Type              |
| ------------- | ----------------- |
| id            | int4              |
| name          | varchar           |
| email         | varchar           |
| password_hash | varchar           |
| avatar_url    | text              |
| role          | enum(admin, user) |
| created_at    | timestamp         |

---

## categories

| Field      | Type      |
| ---------- | --------- |
| id         | int4      |
| name       | varchar   |
| icon       | varchar   |
| created_at | timestamp |

---

## places

| Field           | Type      |
| --------------- | --------- |
| id              | int4      |
| category_id     | int4      |
| google_place_id | varchar   |
| name            | varchar   |
| slug            | varchar   |
| address         | text      |
| lat             | numeric   |
| lng             | numeric   |
| description     | text      |
| opening_hours   | jsonb     |
| phone           | varchar   |
| website         | varchar   |
| avg_rating      | numeric   |
| review_count    | int4      |
| is_active       | boolean   |
| created_at      | timestamp |
| updated_at      | timestamp |

---

## place_photos

| Field      | Type      |
| ---------- | --------- |
| id         | int4      |
| place_id   | int4      |
| photo_url  | text      |
| caption    | varchar   |
| is_primary | boolean   |
| created_at | timestamp |

---

## reviews

| Field      | Type      |
| ---------- | --------- |
| id         | int4      |
| place_id   | int4      |
| user_id    | int4      |
| rating     | int4      |
| comment    | text      |
| created_at | timestamp |
| updated_at | timestamp |

---

## bookmarks

| Field      | Type      |
| ---------- | --------- |
| id         | int4      |
| place_id   | int4      |
| user_id    | int4      |
| created_at | timestamp |

---

# 8. Non-Functional Requirements

## Performance

* Page load time should be less than 3 seconds.
* Server-side pagination should be implemented.
* Images should be optimized for performance.

## Security

* Protected routes for authenticated users only.
* JWT-based authentication.
* Role-Based Access Control (RBAC).
* Encrypted password storage.
* Row Level Security (RLS) policies in Supabase.

## Scalability

* Support at least 10,000+ places.
* Support at least 100,000+ reviews.

## Availability

* Target uptime of 99%.

---

# 9. Technology Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* TanStack Table

## Maps

* React Leaflet
* OpenStreetMap

## Backend & Infrastructure

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

## Database ORM

* Drizzle ORM

## Deployment

* Vercel

---

# 10. Navigation Structure

Dashboard

### Place Management

* All Places
* Create Place

### Category Management

* All Categories
* Create Category

### Review Management

* All Reviews

### User Management

* All Users
* Create User

### Settings

* Profile
* Logout

---

# 11. MVP Scope

### Included

* Authentication
* Dashboard
* Place Management (CRUD)
* Place Photo Management (CRUD)
* Category Management (CRUD)
* Review Management (CRUD)
* User Management (CRUD)
* Photo Upload
* Search
* Filtering
* Sorting
* Pagination
* Role Management
* Interactive Map Location Picker

### Excluded

* Audit Logs
* Multi-language Support
* Notification System
* Analytics Dashboard
* Google Places Synchronization
* Real-time Monitoring
* Bulk Import/Export

---

# 12. Future Enhancements

* Audit Trail System
* Activity Logs
* CSV Import and Export
* PDF Reports
* Bulk Operations
* Advanced Role and Permission Management
* Google Places API Integration
* AI-Generated Place Descriptions
* Visitor Analytics Dashboard
* Content Approval Workflow
* Historical Data Tracking

---

# 13. Acceptance Criteria

The project will be considered complete when:

1. Administrators can log in successfully using admin credentials.
2. All CRUD operations function correctly without critical issues.
3. Uploaded photos are stored and retrieved successfully from Supabase Storage.
4. Data is synchronized correctly with the Flutter mobile application.
5. Only users with the admin role can access the dashboard.
6. Search, filtering, sorting, and pagination work as expected.
7. Locations can be selected through both map interaction and manual coordinate input.
8. Dashboard statistics accurately reflect database records.
9. User role management functions correctly.
10. The application is successfully deployed and accessible online.
