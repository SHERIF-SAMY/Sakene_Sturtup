# Volume 1 — Product & Business Blueprint

This volume defines the business foundation, product vision, target market, user personas, business model, and the complete MVP scope for **Agarly**.

It serves as the primary reference for founders, designers, developers, AI coding agents, and future team members to understand what Agarly is, why it exists, who it serves, and how it creates value.

## Contents

1. Executive Summary
2. Vision
3. Mission
4. Core Values
5. Problem Statement
6. Solution Overview
7. Target Market
8. Market Opportunity
9. User Personas
10. User Journey
11. Value Proposition
12. Business Model
13. Revenue Streams
14. Product Features (MVP)
15. Product Roadmap
16. Success Metrics (KPIs)
17. Risks & Assumptions
18. Go-To-Market Strategy
19. Future Vision
20. Appendix

# Volume 2 — UX & Design Blueprint

This document defines the complete User Experience (UX) and User Interface (UI) specifications for **Agarly**.

The objective is to ensure that every screen, interaction, and component follows one consistent design language while providing the simplest possible experience for university students, brokers, and property owners.

This document should be considered the single source of truth for designers and frontend developers.

---

# Design Philosophy

Agarly is **not** a traditional real estate website.

Agarly is a **Student Housing Platform**.

The interface should feel closer to:

- Airbnb
- Uber
- Booking.com
- Stripe Dashboard

rather than traditional classified websites.

The experience should focus on:

- Simplicity
- Trust
- Speed
- Modern UI
- Mobile First
- Minimal Clicks

---

# Design Principles

## 1. Simplicity

Users should never feel overwhelmed.

Every page should have one clear purpose.

---

## 2. Trust

Users should immediately feel the platform is safe.

Use:

- Verification Badges
- Reviews
- Ratings
- Real Photos
- Visit Status
- Broker Profile

---

## 3. Speed

Users should reach any apartment in less than three clicks.

---

## 4. Mobile First

More than 80% of users are expected to use mobile devices.

Every screen must be designed for mobile before desktop.

---

## 5. Accessibility

- High color contrast
- Large buttons
- Readable typography
- Keyboard support
- Screen reader compatibility

---

# Branding

The provided Agarly branding must be used exactly.

## Primary Color

Blue

Used for:

- Primary Buttons
- Active Icons
- Links
- Focus States

---

## Secondary Colors

White

Light Gray

Dark Gray

Success Green

Warning Orange

Danger Red

---

## Typography

Primary Font

Plus Jakarta Sans

Weights

- 400
- 500
- 600
- 700

---

# Spacing System

Base Unit

8px

Examples

8

16

24

32

40

48

64

---

# Border Radius

Cards

16px

Buttons

12px

Inputs

12px

Modal

24px

---

# Shadows

Very soft

No heavy shadows

Modern floating cards

---

# Icons

Lucide Icons

Outlined style

Rounded appearance

---

# Layout

Maximum Width

1440px

Content Width

1280px

Grid

12 Columns

---

# Responsive Breakpoints

Mobile

0–767px

Tablet

768–1023px

Laptop

1024–1439px

Desktop

1440+

---

# Navigation

## Desktop

Top Navigation

Logo

Search

Notifications

Profile

---

## Mobile

Bottom Navigation

Home

Search

Bookings

Favorites

Profile

---

# Main Pages

## Landing Page

Purpose

Introduce Agarly and allow users to immediately search.

Sections

Hero

Search

Popular Universities

Featured Apartments

How It Works

Testimonials

Footer

---

## Search Page

Components

Search Bar

Filters

Map Toggle

Sort

Apartment Cards

Pagination

---

## Property Details

Sections

Gallery

Video

Basic Information

Amenities

Rooms

Beds

Location

Nearby Places

Broker Information

Reviews

Book Visit Button

---

## Book Visit

Steps

Choose Date

Choose Time

Review

Payment

Confirmation

---

## Student Dashboard

Pages

Overview

Saved Apartments

Bookings

Notifications

Profile

Settings

---

## Broker Dashboard

Pages

Overview

Properties

Listings

Rooms

Beds

Visits

Calendar

QR Codes

Analytics

Settings

---

## Admin Dashboard

Users

Properties

Universities

Cities

Reports

Analytics

Verification Requests

Payments

QR Analytics

---

# UI Components

Buttons

Primary

Secondary

Ghost

Danger

Icon Button

---

Cards

Apartment Card

Broker Card

Review Card

Analytics Card

Statistic Card

---

Inputs

Text

Email

Phone

OTP

Password

Textarea

Search

---

Selectors

Dropdown

Date Picker

Time Picker

Checkbox

Radio

Switch

Slider

---

Feedback

Toast

Alert

Dialog

Loading Spinner

Skeleton

Progress Bar

---

Tables

Users

Properties

Bookings

Payments

Reports

---

Maps

Google Maps

Marker

Current Location

University Radius

Nearby Places

---

Media

Image Gallery

Video Player

360 Tour (Future)

---

QR Components

Broker QR

Property QR

Download QR

Share QR

---

# Empty States

Every page must include a custom empty state.

Examples

No Apartments Found

No Bookings

No Notifications

No Favorites

No Messages

---

# Loading States

Every page must include

Skeleton Loader

Lazy Loading

Image Placeholder

---

# Error States

Network Error

Server Error

Unauthorized

Forbidden

404

500

---

# Notifications

Success

Warning

Error

Info

---

# Search Experience

Search should support

University

City

District

Budget

Apartment Type

Room

Bed

Amenities

Availability

Gender

---

# Apartment Card

Must include

Cover Image

Price

Apartment Type

Distance to University

Broker Verified Badge

Rating

Available Beds

Book Visit Button

Favorite Button

---

# Broker Profile

Profile Picture

Name

Verification Badge

Rating

Number of Listings

Response Time

QR Code

Share Button

Contact

---

# QR Experience

Each broker receives

Unique QR Code

Unique Public Page

Example

agarly.com/broker/ahmed-ali

Users scanning the QR should immediately see

Broker Information

Available Listings

Reviews

Book Visit

---

# Micro Animations

Hover Effects

Card Lift

Button Press

Smooth Page Transitions

Loading Animations

Framer Motion should be used sparingly.

---

# Design Rules

No page should exceed one primary CTA.

No component should have more than three visual hierarchy levels.

Every important action must be reachable within three clicks.

Every form must support validation.

Every page must be responsive.

Every page must support dark mode in the future.

---

# Deliverables

The UX/UI Blueprint should provide enough detail for:

- UI Designers
- Frontend Developers
- AI Coding Agents
- QA Engineers

without requiring additional clarification.

# Volume 3 — Software Architecture Blueprint

This document defines the complete software architecture of Agarly.

It serves as the technical blueprint for frontend developers, backend developers, DevOps engineers, AI coding agents, and future engineering teams.

The architecture prioritizes:

- Scalability
- Performance
- Security
- Maintainability
- AI Readiness
- Cloud Native Design

---

# System Architecture

Agarly follows a modern three-tier architecture.

```
                Client Layer
        -------------------------
        Web (Next.js)
        Mobile (Future)

                │

        REST API + JWT

                │

          Backend (FastAPI)

                │

────────────────────────────────────────

Business Layer

Authentication

Property Service

Listing Service

Visit Service

Broker Service

Notification Service

Search Service

QR Service

Review Service

Analytics Service

Admin Service

Payment Service (Future)

────────────────────────────────────────

                │

Data Layer

PostgreSQL

Redis

Cloudflare R2

Meilisearch

Firebase

Google Maps

```

---

# Architecture Style

Backend

Monolithic Modular Architecture

Reason

Simple deployment

Easy development

Easy scaling later

Can evolve into Microservices.

---

# Technology Stack

## Frontend

Framework

Next.js 15

Language

TypeScript

UI

React 19

Tailwind CSS v4

shadcn/ui

State Management

Zustand

Server State

TanStack Query

Forms

React Hook Form

Validation

Zod

Animation

Framer Motion

Icons

Lucide Icons

Charts

Recharts

Maps

Google Maps API

---

## Backend

Framework

FastAPI

Language

Python

ORM

SQLAlchemy

Migration

Alembic

Validation

Pydantic

Authentication

JWT

Refresh Token

Background Jobs

FastAPI Background Tasks

API Documentation

OpenAPI

Swagger

---

## Database

Primary Database

PostgreSQL

---

## Cache

Redis

Used For

Authentication

Sessions

Search Cache

OTP

Rate Limiting

---

## Object Storage

Cloudflare R2

Stores

Images

Videos

Documents

QR Images

---

## Search Engine

Meilisearch

Search By

University

City

District

Price

Room

Bed

Broker

Amenities

---

## Notifications

Firebase Cloud Messaging

Email

Future

SMS

---

## Payments (Future)

Paymob

---

## AI Services

OpenAI

Gemini

Future

Self-hosted LLM

---

# Project Structure

```
agarly/

frontend/

backend/

database/

infrastructure/

docs/

```

---

# Frontend Structure

```
src/

app/

components/

features/

hooks/

lib/

services/

types/

styles/

constants/

```

---

# Backend Structure

```
app/

api/

core/

models/

schemas/

services/

repositories/

middlewares/

utils/

config/

```

---

# Layered Architecture

Controller Layer

↓

Service Layer

↓

Repository Layer

↓

Database

Business Logic must never exist inside API routes.

---

# Feature Modules

Authentication

Broker

Student

Owner

Property

Listing

Room

Bed

Visit

Review

QR

Notification

Analytics

Admin

University

City

Amenities

Payments

---

# Authentication

Login

Register

Refresh Token

Logout

Forgot Password

Reset Password

Phone Verification

Email Verification

---

# User Roles

Student

Broker

Owner

Admin

Super Admin

---

# Authorization

Role Based Access Control

Every endpoint must validate

Authentication

Authorization

Ownership

---

# API Standards

REST API

JSON

Camel Case Responses

Pagination

Filtering

Sorting

Searching

---

# Naming Conventions

Database

snake_case

Backend

snake_case

Frontend

camelCase

React Components

PascalCase

---

# Error Handling

Every API returns

```

{
success,
message,
data,
errors
}

```

Standard HTTP Codes

200

201

400

401

403

404

409

422

500

---

# Logging

Application Logs

Authentication Logs

Error Logs

Audit Logs

Admin Logs

---

# Configuration

Environment Variables

```

DATABASE_URL

JWT_SECRET

REDIS_URL

R2_KEY

R2_SECRET

GOOGLE_MAPS_KEY

OPENAI_KEY

PAYMOB_KEY

```

---

# File Upload

Allowed

Images

Videos

PDF

Maximum Image Size

10 MB

Maximum Video Size

100 MB

Compression Required

Image Optimization

Automatic Resize

---

# QR Service

Responsibilities

Generate QR

Store QR

Track QR Scans

Generate Public URL

Analytics

Every Broker has

Broker QR

Every Property has

Property QR

---

# Visit Engine

States

Pending

Confirmed

Cancelled

Completed

No Show

Expired

Business Rules

Student cannot double book.

Broker cannot exceed calendar capacity.

Completed visits can receive reviews.

---

# Search Engine

Search Types

Keyword

University

Location

Price

Apartment Type

Room

Bed

Amenities

Availability

Verified Brokers

---

# Notification Engine

Supports

Email

Push

In-App

Future

SMS

Triggers

Booking

Cancellation

Approval

Reminder

Review

Verification

---

# Analytics Engine

Track

Page Views

Searches

QR Scans

Bookings

Conversion Rate

Popular Universities

Popular Districts

Broker Performance

---

# Security

HTTPS Only

JWT

Refresh Tokens

Password Hashing

Input Validation

SQL Injection Protection

XSS Protection

CSRF Protection

Rate Limiting

Secure File Upload

Audit Logs

---

# Performance

SSR

Lazy Loading

Pagination

Image Optimization

Caching

Database Indexes

Connection Pooling

Compression

---

# Scalability

Designed to support

100,000+

Users

50,000+

Properties

1M+

Images

1000+

Concurrent Users

Without architectural changes.

---

# Monitoring

Future

Prometheus

Grafana

Sentry

Uptime Robot

---

# DevOps

Docker

Docker Compose

GitHub Actions

Nginx

Coolify

Cloudflare

---

# Deployment Environments

Development

Testing

Staging

Production

---

# Future Microservices

When scaling becomes necessary, the following services can be extracted:

Authentication Service

Search Service

Notification Service

Payment Service

AI Recommendation Service

QR Service

Analytics Service

Media Service

without requiring major changes to the overall architecture.

---

# Engineering Principles

Single Responsibility Principle

Clean Architecture

SOLID Principles

DRY

KISS

Convention over Configuration

API First

Mobile First

AI Ready

Cloud Native

Security by Design

Performance First

Developer Experience First

These principles must guide every future engineering decision made within Agarly.

# Volume 4 — Database Blueprint

This document defines the complete database architecture for Agarly.

It includes:

- Entity Relationship Design (ERD)
- Database Tables
- Relationships
- Constraints
- Indexes
- Naming Conventions
- Database Rules

This document is considered the single source of truth for the backend team.

---

# Database Philosophy

The database is designed around the business, not the UI.

Everything starts from one simple concept:

```
User

↓

Property

↓

Listing

↓

Visit
```

A property may have multiple listings.

Example:

Apartment A

↓

Listing 1 → Entire Apartment

Listing 2 → Room 1

Listing 3 → Room 2

Listing 4 → Bed 1

Listing 5 → Bed 2

This design gives maximum flexibility.

---

# Database Engine

PostgreSQL

Version

17+

Encoding

UTF-8

Timezone

UTC

Soft Delete

Enabled

Audit Fields

Enabled

---

# Naming Convention

Tables

snake_case

Columns

snake_case

Primary Key

id

Foreign Keys

xxx_id

Created Date

created_at

Updated Date

updated_at

Deleted Date

deleted_at

---

# Core Entities

Users

Broker Profiles

Owner Profiles

Students

Properties

Listings

Rooms

Beds

Visits

Reviews

Favorites

Amenities

Universities

Cities

Notifications

Messages

QR Codes

Payments

Audit Logs

---

# 1. Users

Purpose

Stores every user.

Columns

id

first_name

last_name

email

phone

password_hash

role

avatar

is_verified

status

last_login

created_at

updated_at

deleted_at

Role Values

Student

Broker

Owner

Admin

Super Admin

---

# 2. Broker Profiles

One-to-One with Users

Columns

id

user_id

company_name

bio

experience_years

rating

review_count

response_rate

response_time

verified_badge

qr_code

slug

---

# 3. Universities

id

name

city_id

latitude

longitude

logo

---

# 4. Cities

id

name

governorate

latitude

longitude

---

# 5. Properties

Purpose

Represents the physical apartment.

Columns

id

owner_id

broker_id

title

description

city_id

district

address

latitude

longitude

building_number

floor

area

bedrooms

bathrooms

living_rooms

kitchens

balcony_count

furnished

gender_allowed

university_id

status

created_at

updated_at

---

# Property Status

Draft

Active

Inactive

Archived

Rented

---

# 6. Property Images

id

property_id

image_url

display_order

is_cover

---

# 7. Property Videos

id

property_id

video_url

thumbnail

---

# 8. Amenities

Master Table

Examples

WiFi

AC

Elevator

Kitchen

Parking

Security

Laundry

Desk

Closet

Microwave

Water Heater

TV

---

# 9. Property Amenities

Many-to-Many

property_id

amenity_id

---

# 10. Rooms

Purpose

Each apartment can contain multiple rooms.

Columns

id

property_id

name

floor

area

beds_count

gender

available

---

# 11. Beds

Purpose

Support bed rental.

Columns

id

room_id

bed_number

price

status

occupied

---

# Bed Status

Available

Reserved

Occupied

Maintenance

---

# 12. Listings

The most important table.

Listing Types

Entire Apartment

Private Room

Shared Bed

Columns

id

property_id

room_id

bed_id

listing_type

price

deposit

minimum_months

available_from

available_to

available_quantity

status

---

# Listing Status

Active

Hidden

Reserved

Expired

Deleted

---

# 13. Visits

Purpose

Booking appointments.

Columns

id

listing_id

student_id

broker_id

visit_date

visit_time

status

booking_fee

payment_status

notes

created_at

---

# Visit Status

Pending

Confirmed

Cancelled

Completed

Expired

No Show Student

No Show Broker

---

# 14. Reviews

id

visit_id

listing_id

student_id

rating

comment

created_at

---

# Rules

Only completed visits can leave reviews.

One review per visit.

---

# 15. Favorites

id

student_id

listing_id

created_at

---

# 16. Notifications

id

user_id

title

body

type

is_read

created_at

---

# Notification Types

Booking

Reminder

Verification

Review

Payment

Promotion

System

---

# 17. Messages

Future

Supports Chat

id

sender_id

receiver_id

conversation_id

message

attachment

created_at

---

# 18. QR Codes

One of Agarly's unique features.

Columns

id

broker_id

property_id

listing_id

qr_type

public_url

scan_count

last_scan

created_at

---

# QR Types

Broker

Property

Listing

---

# QR Analytics

Track

Total Scans

Unique Visitors

Bookings

Conversions

Traffic Source

Location

Device

---

# 19. Payments

Future

id

visit_id

student_id

amount

currency

provider

status

transaction_reference

created_at

---

# 20. Audit Logs

Stores every important action.

id

user_id

action

entity

entity_id

old_value

new_value

ip_address

device

created_at

---

# Relationships

```
User

├── Broker Profile

├── Student

├── Owner

│

├── Properties

│     ├── Rooms

│     │      ├── Beds

│     │

│     ├── Images

│     ├── Videos

│     ├── Amenities

│     └── Listings

│

└── Visits

      ├── Reviews

      └── Payments
```

---

# Database Constraints

Phone must be unique.

Email must be unique.

One review per visit.

A bed belongs to one room.

A room belongs to one property.

A property can have many listings.

Listing type determines required fields.

QR must always be unique.

Slug must always be unique.

---

# Required Indexes

Users

email

phone

role

Properties

city

district

broker

status

Listings

listing_type

price

status

available_from

Visits

student

broker

status

visit_date

Reviews

listing

rating

QR

public_url

scan_count

---

# Soft Delete

Every important table supports

deleted_at

No permanent deletion from production.

---

# Seed Data

The application should automatically seed:

Egyptian Governorates

Major Cities

Universities

Amenities

Listing Types

Roles

Visit Statuses

Notification Types

---

# Future Database Extensions

Roommate Matching

AI Recommendations

Fraud Detection

Subscriptions

Digital Contracts

Rent Payments

Maintenance Requests

Support Tickets

Referral Program

Loyalty System

Marketplace Services

The database has been intentionally designed to support these future modules without requiring structural redesign.

# Volume 5 — Backend Blueprint (API & Business Logic)

This document defines the backend architecture, REST APIs, business logic, validation rules, and service layer implementation for Agarly.

The backend is responsible for managing authentication, property listings, booking visits, QR system, notifications, analytics, and all business rules.

This document is the primary reference for backend developers and AI coding agents.

---

# Backend Philosophy

The backend follows **Clean Architecture** principles.

Business logic must never exist inside controllers.

Controllers only:

- Validate Request
- Call Service
- Return Response

Business Rules belong inside Services.

Database access belongs inside Repositories.

---

# Backend Layers

```

Client

↓

API Router

↓

Controller

↓

Service

↓

Repository

↓

Database

```

---

# Modules

```

Authentication

Users

Students

Brokers

Owners

Properties

Listings

Rooms

Beds

Visits

Reviews

Favorites

Notifications

Universities

Cities

Amenities

QR

Analytics

Payments (Future)

Admin

```

---

# API Standard

Base URL

```

/api/v1

```

Example

```

GET /api/v1/properties

```

---

# Response Format

Every endpoint returns the same structure.

```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {},
  "errors": null
}
```

Error Example

```json
{
  "success": false,
  "message": "Validation Error",
  "data": null,
  "errors": [
    {
      "field": "price",
      "message": "Price is required"
    }
  ]
}
```

---

# Authentication Module

## Register

POST

```

/auth/register

```

Request

- First Name
- Last Name
- Email
- Phone
- Password
- Role

Validation

- Email Unique
- Phone Unique
- Strong Password

Response

JWT

Refresh Token

User Profile

---

## Login

POST

```

/auth/login

```

Supports

Email

Phone

---

## Logout

POST

```

/auth/logout

```

---

## Refresh Token

POST

```

/auth/refresh

```

---

## Forgot Password

POST

```

/auth/forgot-password

```

---

## Reset Password

POST

```

/auth/reset-password

```

---

# User Module

GET

```

/users/me

```

Update Profile

PUT

```

/users/me

```

Upload Avatar

```

POST /users/avatar

```

---

# Broker Module

Create Broker Profile

```

POST /brokers

```

Get Broker

```

GET /brokers/{id}

```

Update Broker

```

PUT /brokers/{id}

```

Generate QR

```

POST /brokers/{id}/qr

```

Broker Analytics

```

GET /brokers/{id}/analytics

```

---

# Property Module

Create Property

```

POST /properties

```

Update

```

PUT /properties/{id}

```

Delete

```

DELETE /properties/{id}

```

Get One

```

GET /properties/{id}

```

Search

```

GET /properties

```

---

# Search Filters

City

University

District

Price

Apartment

Room

Bed

Amenities

Gender

Availability

Broker

Verified

---

# Property Media

Upload Image

```

POST /properties/{id}/images

```

Delete Image

```

DELETE /properties/images/{id}

```

Upload Video

```

POST /properties/{id}/video

```

---

# Listing Module

Create Listing

```

POST /listings

```

Listing Types

Entire Apartment

Private Room

Shared Bed

Update Listing

Delete Listing

Pause Listing

Activate Listing

---

# Room Module

Create Room

Update Room

Delete Room

---

# Bed Module

Create Bed

Update Bed

Delete Bed

Reserve Bed

Release Bed

---

# Visit Module

Book Visit

```

POST /visits

```

Student selects

Date

Time

Listing

Notes

Booking Fee

---

Confirm Visit

```

PUT /visits/{id}/confirm

```

---

Reject Visit

```

PUT /visits/{id}/reject

```

---

Cancel Visit

```

PUT /visits/{id}/cancel

```

---

Complete Visit

```

PUT /visits/{id}/complete

```

---

No Show

```

PUT /visits/{id}/no-show

```

---

Visit Rules

Student cannot have overlapping visits.

Broker cannot exceed available slots.

Completed visits unlock review.

Cancelled visits cannot be reviewed.

---

# Favorites Module

Add Favorite

Remove Favorite

Get Favorites

---

# Review Module

Create Review

Update Review

Delete Review

Get Property Reviews

Business Rules

Only completed visits.

One review per booking.

Rating

1-5

---

# Notification Module

Types

Booking

Reminder

Verification

Promotion

System

Review

Supports

Push

Email

In-App

---

# QR Module

Broker QR

Generate

```

POST /qr/broker

```

Property QR

```

POST /qr/property

```

Listing QR

```

POST /qr/listing

```

Track Scan

```

GET /qr/{slug}

```

Analytics

```

GET /qr/{id}/analytics

```

---

# Search Module

Endpoint

```

GET /search

```

Supports

Keyword

University

District

Nearby

Budget

Amenities

Listing Type

Sorting

Pagination

---

# University Module

List Universities

Search Universities

University Details

Nearby Properties

---

# City Module

Governorates

Cities

Districts

---

# Amenities Module

List Amenities

Admin CRUD

---

# Admin Module

Users

Properties

Listings

Reports

Visits

Universities

Amenities

Cities

Verification

Analytics

QR Analytics

---

# Analytics Module

Broker

Listings

Views

Bookings

Visits

Conversion Rate

Response Time

QR Scans

Student

Saved

Bookings

History

Platform

DAU

MAU

Revenue

Bookings

Properties

Popular Universities

Popular Cities

---

# Middleware

Authentication

Authorization

Rate Limiter

Logging

Error Handler

CORS

Compression

Request ID

---

# Validation Rules

Phone

Egyptian Format

Email

RFC Standard

Password

Minimum

8 Characters

Listing

Price > 0

Visit Date

Cannot be in the past

Review

Only after completed visit

---

# Pagination

Default

20

Maximum

100

---

# Sorting

Newest

Oldest

Price Low

Price High

Distance

Rating

Popularity

---

# Error Codes

400

Bad Request

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

422

Validation Error

500

Internal Server Error

---

# Rate Limiting

Authentication

5 Requests / Minute

Search

100 Requests / Minute

Booking

20 Requests / Minute

QR

Unlimited Read

Generation Protected

---

# Background Jobs

Send Notifications

Generate QR

Compress Images

Delete Expired Listings

Reminder Messages

Analytics Aggregation

---

# Security

Password Hashing

Argon2

JWT

Refresh Token Rotation

HTTPS Only

Input Validation

SQL Injection Protection

XSS Protection

CORS

Audit Logs

---

# Future APIs

Chat

Payments

Digital Contracts

Subscriptions

Roommate Matching

AI Search

AI Recommendation

Fraud Detection

Marketplace Services

Maintenance Requests

Support Tickets

The backend architecture has been intentionally designed to support future expansion without breaking existing APIs or requiring major structural changes.

# Volume 6 — Frontend Blueprint (Pages, Components & User Experience)

This document defines the complete frontend architecture of Agarly.

It specifies every page, component, state, navigation flow, and frontend business behavior.

This document is the primary reference for Frontend Developers, UI Engineers, and AI Coding Agents.

---

# Frontend Philosophy

Agarly is a **modern SaaS platform**, not a traditional real estate website.

The interface must feel:

- Fast
- Lightweight
- Mobile First
- Interactive
- Clean
- Friendly

Inspired by:

- Airbnb
- Stripe
- Linear
- Notion
- Vercel

---

# Frontend Stack

Framework

Next.js 15

Language

TypeScript

UI

React 19

CSS

TailwindCSS v4

Component Library

shadcn/ui

Icons

Lucide React

Animation

Framer Motion

State

Zustand

Server State

TanStack Query

Validation

React Hook Form

Zod

Maps

Google Maps

Image Optimization

Next Image

Charts

Recharts

---

# Application Structure

```
src/

app/

components/

features/

hooks/

services/

stores/

constants/

types/

utils/

styles/

middleware/

```

---

# Routing

Public

```
/

```

```
/login

```

```
/register

```

```
/search

```

```
/property/[id]

```

```
/broker/[slug]

```

Authenticated

```
/dashboard

```

```
/dashboard/profile

```

```
/dashboard/bookings

```

```
/dashboard/favorites

```

Broker

```
/broker/dashboard

```

```
/broker/properties

```

```
/broker/listings

```

```
/broker/visits

```

```
/broker/analytics

```

Admin

```
/admin

```

```
/admin/users

```

```
/admin/properties

```

```
/admin/reports

```

---

# Landing Page

Sections

Hero

Search Bar

Popular Universities

Featured Listings

How It Works

Testimonials

CTA

Footer

---

# Hero Section

Contains

Headline

Subheadline

Search Component

Illustration

Primary CTA

Secondary CTA

---

# Search Component

Fields

City

University

Budget

Listing Type

Search Button

---

# Search Results Page

Components

Search Bar

Filters

Sorting

Map Toggle

Results Grid

Pagination

Loading Skeleton

Empty State

---

# Filters

City

District

University

Budget

Apartment

Room

Bed

Gender

Amenities

Verified Brokers

Availability

---

# Listing Card

Contains

Cover Image

Price

Listing Type

Distance to University

Available Beds

Broker

Rating

Favorite Button

Book Visit Button

---

# Property Details Page

Sections

Gallery

Video

Basic Information

Amenities

Room Details

Available Beds

Map

Nearby Places

Broker Card

Reviews

Book Visit

---

# Gallery

Supports

Images

Fullscreen

Swipe

Zoom

Thumbnail Navigation

---

# Broker Card

Avatar

Name

Verified Badge

Rating

Listings Count

QR Button

Share Button

---

# Book Visit Modal

Steps

Select Date

Select Time

Review Booking

Payment

Confirmation

---

# Student Dashboard

Overview

Upcoming Visits

Favorites

Notifications

Profile

Settings

---

# Broker Dashboard

Overview

Statistics

Recent Visits

Latest Listings

Calendar

Quick Actions

---

# Add Property Page

Sections

Basic Information

Location

Rooms

Amenities

Images

Videos

Listing

Preview

Publish

---

# Add Listing

Supports

Entire Apartment

Private Room

Shared Bed

Automatically updates inventory.

---

# QR Management

Broker QR

Property QR

Download QR

Print QR

Share QR

QR Analytics

---

# Analytics Dashboard

Cards

Views

Bookings

Conversion Rate

QR Scans

Reviews

Revenue (Future)

Charts

Weekly

Monthly

Yearly

---

# Admin Dashboard

Cards

Users

Properties

Visits

Reports

Universities

Cities

Amenities

Analytics

---

# Notification Center

Displays

Unread

Read

Booking

Reminder

Review

Verification

System

---

# Favorites

Grid Layout

Sorting

Remove Favorite

Quick Booking

---

# User Profile

Avatar

Personal Info

Password

Phone

Email

Verification

Account Status

---

# Settings

Language

Notifications

Privacy

Security

Dark Mode (Future)

---

# Shared Components

Button

Input

Textarea

Select

Checkbox

Radio

Switch

Dialog

Modal

Drawer

Tooltip

Dropdown

Accordion

Tabs

Table

Card

Badge

Avatar

Pagination

---

# Loading States

Every page includes

Skeleton Loader

Lazy Loading

Progress Bar

Optimistic Updates

---

# Empty States

No Results

No Favorites

No Listings

No Visits

No Notifications

No Reviews

Each page should include a meaningful illustration.

---

# Error States

404

500

Offline

Unauthorized

Forbidden

Validation Error

Retry Action

---

# Responsive Design

Mobile

Single Column

Bottom Navigation

Tablet

Two Columns

Desktop

Multi Column

Sidebar

---

# Animations

Page Transition

Fade

Slide

Card Hover

Button Ripple

Accordion

Drawer

Toast

Keep animations below 300ms.

---

# Accessibility

Keyboard Navigation

Screen Reader Labels

ARIA Roles

Focus States

Color Contrast

Accessible Forms

---

# Theme

Light Theme

Primary

Agarly Blue

Neutral Gray

White

Future

Dark Theme

---

# Performance

Image Lazy Loading

Code Splitting

Route Prefetching

Caching

Memoization

Virtualized Lists

---

# SEO

Metadata

Open Graph

Twitter Cards

Structured Data

Sitemap

Robots

Canonical URLs

---

# Future Frontend Features

PWA

Offline Support

Dark Mode

Mobile App

AI Assistant

Roommate Matching

Voice Search

Multi-language Support

Interactive Map Search

---

# Frontend Engineering Rules

- Every page must be fully responsive.
- Every API call must use TanStack Query.
- Every form must use React Hook Form + Zod.
- Every image must use Next Image.
- Every page must support loading and error states.
- Components must be reusable and independent.
- No duplicated UI code.
- Follow Atomic Design principles.
- Accessibility is mandatory.
- UI must strictly follow the Agarly Design System.
- Performance should be considered before adding animations.

This blueprint should provide enough detail for any frontend developer or AI coding agent to build the complete Agarly interface without requiring additional clarification.

# Volume 7 — API Specification

This document defines the complete REST API specification for Agarly.

It serves as the communication contract between the Frontend and Backend.

Every endpoint in the platform must follow this specification.

This document should remain stable even if the backend implementation changes.

---

# API Philosophy

The API must be:

- RESTful
- Versioned
- Secure
- Predictable
- Consistent
- Well Documented
- Easy to Consume

All APIs return JSON.

Base URL

```
/api/v1
```

Future versions

```
/api/v2
/api/v3
```

---

# Authentication

Authentication Method

JWT Access Token

Refresh Token

Header

```
Authorization: Bearer <access_token>
```

---

# Standard Response

Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

---

Validation Error

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "price",
      "message": "Price is required"
    }
  ]
}
```

---

Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

# Status Codes

| Code | Meaning |
|-------|----------|
|200|OK|
|201|Created|
|204|No Content|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Validation Error|
|500|Internal Server Error|

---

# Pagination

Every listing endpoint supports pagination.

Example

```
GET /properties?page=1&limit=20
```

Response

```json
{
  "page":1,
  "limit":20,
  "total":256,
  "pages":13,
  "data":[]
}
```

---

# Sorting

```
sort=price

sort=rating

sort=created_at

sort=distance
```

---

# Filtering

Supported Query Parameters

```
city

district

university

price_min

price_max

listing_type

gender

bedrooms

beds

amenities

available

verified

broker

```

Example

```
GET /properties?city=Alexandria&price_max=4000&listing_type=bed
```

---

# Authentication APIs

## Register

```
POST /auth/register
```

Request

```json
{
    "first_name":"",
    "last_name":"",
    "email":"",
    "phone":"",
    "password":"",
    "role":"student"
}
```

Response

```json
{
   "access_token":"",
   "refresh_token":"",
   "user":{}
}
```

---

## Login

```
POST /auth/login
```

Supports

- Email
- Phone

---

## Logout

```
POST /auth/logout
```

---

## Refresh Token

```
POST /auth/refresh
```

---

## Forgot Password

```
POST /auth/forgot-password
```

---

## Reset Password

```
POST /auth/reset-password
```

---

# User APIs

Get Profile

```
GET /users/me
```

Update Profile

```
PUT /users/me
```

Upload Avatar

```
POST /users/avatar
```

Delete Account

```
DELETE /users/me
```

---

# Broker APIs

Create Profile

```
POST /brokers
```

Broker Details

```
GET /brokers/{id}
```

Public Profile

```
GET /brokers/{slug}
```

Update Broker

```
PUT /brokers/{id}
```

Broker Statistics

```
GET /brokers/{id}/analytics
```

Generate QR

```
POST /brokers/{id}/qr
```

Download QR

```
GET /brokers/{id}/qr
```

---

# Property APIs

Create Property

```
POST /properties
```

Update Property

```
PUT /properties/{id}
```

Delete Property

```
DELETE /properties/{id}
```

Property Details

```
GET /properties/{id}
```

Search Properties

```
GET /properties
```

Nearby Properties

```
GET /properties/nearby
```

Latest Listings

```
GET /properties/latest
```

Featured Listings

```
GET /properties/featured
```

---

# Property Media APIs

Upload Images

```
POST /properties/{id}/images
```

Delete Image

```
DELETE /properties/images/{id}
```

Reorder Images

```
PUT /properties/images/order
```

Upload Video

```
POST /properties/{id}/video
```

---

# Room APIs

Create Room

```
POST /rooms
```

Update Room

```
PUT /rooms/{id}
```

Delete Room

```
DELETE /rooms/{id}
```

Room Details

```
GET /rooms/{id}
```

---

# Bed APIs

Create Bed

```
POST /beds
```

Update Bed

```
PUT /beds/{id}
```

Delete Bed

```
DELETE /beds/{id}
```

Bed Details

```
GET /beds/{id}
```

---

# Listing APIs

Create Listing

```
POST /listings
```

Update Listing

```
PUT /listings/{id}
```

Delete Listing

```
DELETE /listings/{id}
```

Listing Details

```
GET /listings/{id}
```

Broker Listings

```
GET /brokers/{id}/listings
```

Pause Listing

```
PUT /listings/{id}/pause
```

Activate Listing

```
PUT /listings/{id}/activate
```

---

# Visit APIs

Book Visit

```
POST /visits
```

Student Visits

```
GET /visits/student
```

Broker Visits

```
GET /visits/broker
```

Visit Details

```
GET /visits/{id}
```

Approve Visit

```
PUT /visits/{id}/approve
```

Reject Visit

```
PUT /visits/{id}/reject
```

Reschedule Visit

```
PUT /visits/{id}/reschedule
```

Cancel Visit

```
PUT /visits/{id}/cancel
```

Complete Visit

```
PUT /visits/{id}/complete
```

No Show

```
PUT /visits/{id}/no-show
```

---

# Favorite APIs

Add Favorite

```
POST /favorites
```

Remove Favorite

```
DELETE /favorites/{listing_id}
```

Get Favorites

```
GET /favorites
```

---

# Review APIs

Create Review

```
POST /reviews
```

Update Review

```
PUT /reviews/{id}
```

Delete Review

```
DELETE /reviews/{id}
```

Property Reviews

```
GET /properties/{id}/reviews
```

Broker Reviews

```
GET /brokers/{id}/reviews
```

---

# University APIs

All Universities

```
GET /universities
```

University Details

```
GET /universities/{id}
```

Nearby Listings

```
GET /universities/{id}/properties
```

---

# City APIs

Governorates

```
GET /governorates
```

Cities

```
GET /cities
```

Districts

```
GET /districts
```

---

# Amenities APIs

Get Amenities

```
GET /amenities
```

Admin CRUD

```
POST /amenities
PUT /amenities/{id}
DELETE /amenities/{id}
```

---

# Notification APIs

Get Notifications

```
GET /notifications
```

Mark Read

```
PUT /notifications/{id}
```

Mark All Read

```
PUT /notifications/read-all
```

Delete Notification

```
DELETE /notifications/{id}
```

---

# QR APIs

Generate Broker QR

```
POST /qr/broker
```

Generate Property QR

```
POST /qr/property
```

Generate Listing QR

```
POST /qr/listing
```

QR Details

```
GET /qr/{id}
```

QR Analytics

```
GET /qr/{id}/analytics
```

Public QR Redirect

```
GET /q/{slug}
```

---

# Search APIs

Global Search

```
GET /search
```

Autocomplete

```
GET /search/suggestions
```

Popular Searches

```
GET /search/popular
```

---

# Admin APIs

Dashboard

```
GET /admin/dashboard
```

Users

```
GET /admin/users
```

Properties

```
GET /admin/properties
```

Listings

```
GET /admin/listings
```

Visits

```
GET /admin/visits
```

Reports

```
GET /admin/reports
```

Analytics

```
GET /admin/analytics
```

Approve Broker

```
PUT /admin/brokers/{id}/approve
```

Reject Broker

```
PUT /admin/brokers/{id}/reject
```

---

# Analytics APIs

Broker Analytics

```
GET /analytics/broker
```

Platform Analytics

```
GET /analytics/platform
```

Listing Analytics

```
GET /analytics/listing/{id}
```

QR Analytics

```
GET /analytics/qr/{id}
```

---

# File Upload Rules

Allowed Types

- JPG
- PNG
- WEBP
- MP4
- PDF

Maximum Image Size

10 MB

Maximum Video Size

100 MB

Images are automatically compressed.

---

# Rate Limiting

| Endpoint | Limit |
|-----------|-------|
|Login|5/min|
|Register|3/min|
|Search|100/min|
|Book Visit|20/min|
|QR Generation|10/min|

---

# API Security

- HTTPS Only
- JWT Authentication
- Refresh Token Rotation
- Input Validation
- Role-Based Authorization (RBAC)
- Request Logging
- Rate Limiting
- SQL Injection Protection
- XSS Protection
- CORS Policy
- Secure File Upload

---

# API Documentation

The backend must automatically generate API documentation using OpenAPI.

Available URLs

```
/docs
```

Swagger UI

```
/redoc
```

ReDoc Documentation

---

# API Versioning Policy

- `/api/v1` → Current Stable Version
- `/api/v2` → New Features (Backward Compatible)
- Deprecated endpoints must remain available for at least one release cycle.
- Breaking changes require a new major API version.

---

# Engineering Standards

- All endpoints must be RESTful.
- Every endpoint must validate input before execution.
- Business logic must never exist inside controllers.
- All write operations must generate audit logs.
- Every endpoint must support standardized error responses.
- Public endpoints must never expose sensitive user data.
- APIs should remain backward compatible whenever possible.

This API Specification is the official contract between the Agarly frontend, backend, mobile applications, and future third-party integrations.

# Volume 8 — User Flows

This document defines the complete user journeys for every user role in Agarly.

The purpose of this document is to ensure that every interaction inside the platform is well-defined before implementation.

This blueprint should be used by:

- Product Managers
- UI/UX Designers
- Frontend Developers
- Backend Developers
- QA Engineers

---

# User Roles

The platform contains four primary user roles:

- Student
- Broker
- Property Owner
- Admin

---

# Student Journey

## Goal

Find suitable accommodation and book a visit.

---

## Flow 1 — Registration

```
Landing Page
      │
      ▼
Register
      │
      ▼
Choose Role (Student)
      │
      ▼
Enter Personal Information
      │
      ▼
Phone / Email Verification
      │
      ▼
Student Dashboard
```

---

## Flow 2 — Search for Accommodation

```
Landing Page
      │
      ▼
Search
      │
      ▼
Apply Filters
      │
      ▼
Browse Results
      │
      ▼
Open Listing Details
```

---

## Available Filters

- University
- Governorate
- City
- District
- Budget
- Listing Type
- Gender
- Bedrooms
- Beds
- Amenities
- Furnished
- Distance from University
- Verified Broker

---

## Flow 3 — View Listing

```
Listing Details
      │
      ├── View Images
      ├── View Video
      ├── View Amenities
      ├── View Location
      ├── View Broker
      ├── Read Reviews
      │
      ▼
Book Visit
```

---

## Flow 4 — Book Visit

```
Book Visit
      │
      ▼
Choose Date
      │
      ▼
Choose Time
      │
      ▼
Review Details
      │
      ▼
Confirm Booking
      │
      ▼
Pending Approval
```

---

## Flow 5 — Booking Lifecycle

```
Pending

│

├── Approved
│       │
│       ▼
│   Visit Scheduled
│       │
│       ▼
│   Visit Completed
│       │
│       ▼
│   Leave Review
│
├── Rejected
│
└── Cancelled
```

---

## Flow 6 — Save Favorite

```
Listing
     │
     ▼
Favorite
     │
     ▼
Favorites Page
```

---

## Flow 7 — Leave Review

```
Completed Visit
        │
        ▼
Rating
        │
        ▼
Comment
        │
        ▼
Publish Review
```

---

# Broker Journey

## Goal

Publish listings and manage visits.

---

## Flow 1 — Registration

```
Landing Page
      │
      ▼
Register
      │
      ▼
Choose Broker
      │
      ▼
Business Information
      │
      ▼
Verification Request
      │
      ▼
Pending Approval
      │
      ▼
Approved
      │
      ▼
Broker Dashboard
```

---

## Flow 2 — Add Property

```
Dashboard
      │
      ▼
Add Property
      │
      ▼
Basic Information
      │
      ▼
Location
      │
      ▼
Rooms
      │
      ▼
Beds
      │
      ▼
Amenities
      │
      ▼
Upload Images
      │
      ▼
Preview
      │
      ▼
Publish
```

---

## Flow 3 — Create Listing

A broker can publish:

- Entire Apartment
- Private Room
- Shared Bed

```
Property
      │
      ▼
Create Listing
      │
      ▼
Select Listing Type
      │
      ▼
Enter Price
      │
      ▼
Availability
      │
      ▼
Publish
```

---

## Flow 4 — Manage Visits

```
Visit Request
      │
      ▼
Review Request
      │
      ├── Approve
      ├── Reject
      └── Reschedule
```

---

## Flow 5 — Visit Day

```
Visit Scheduled
      │
      ▼
Meet Student
      │
      ▼
Complete Visit
      │
      ▼
Listing Remains Available
or
Marked as Reserved
```

---

## Flow 6 — QR Code

```
Broker Dashboard
      │
      ▼
Generate QR
      │
      ▼
Download QR
      │
      ▼
Share QR
      │
      ▼
Student Opens Public Profile
```

---

## Flow 7 — Analytics

```
Dashboard
      │
      ▼
Analytics
      │
      ├── Views
      ├── QR Scans
      ├── Visits
      ├── Reviews
      └── Conversion Rate
```

---

# Property Owner Journey

Property owners have a simplified experience.

They can:

- Register
- Verify Identity
- Add Properties
- Create Listings
- Manage Visits

Unlike brokers, owners only manage their own properties.

---

# Admin Journey

---

## Flow 1 — Login

```
Login
      │
      ▼
Admin Dashboard
```

---

## Flow 2 — Verify Broker

```
Verification Requests
          │
          ▼
Review Documents
          │
          ├── Approve
          └── Reject
```

---

## Flow 3 — Moderate Listings

```
Reported Listing
        │
        ▼
Review
        │
        ├── Keep Active
        ├── Hide
        └── Delete
```

---

## Flow 4 — Manage Platform

```
Dashboard
     │
     ├── Users
     ├── Properties
     ├── Listings
     ├── Visits
     ├── Reviews
     ├── Universities
     ├── Cities
     ├── Amenities
     └── Reports
```

---

# Public User Flow

Visitors can use Agarly without registration.

Allowed Actions

- Search
- View Listings
- View Broker Profiles
- View Reviews

Restricted Actions

- Book Visit
- Favorite Listings
- Leave Reviews
- Contact Broker (Future)

---

# Listing Lifecycle

```
Draft
   │
   ▼
Published
   │
   ▼
Active
   │
   ├── Reserved
   │
   ├── Hidden
   │
   ├── Rented
   │
   └── Archived
```

---

# Visit Lifecycle

```
Requested
     │
     ▼
Pending
     │
     ├── Approved
     │      │
     │      ▼
     │ Scheduled
     │      │
     │      ▼
     │ Completed
     │
     ├── Rejected
     │
     ├── Cancelled
     │
     └── No Show
```

---

# Property Publishing Flow

```
Create Property
        │
        ▼
Add Rooms
        │
        ▼
Add Beds
        │
        ▼
Upload Images
        │
        ▼
Select Amenities
        │
        ▼
Create Listing
        │
        ▼
Publish
```

---

# QR Flow

```
Broker Dashboard
       │
       ▼
Generate QR
       │
       ▼
Share QR
       │
       ▼
Student Scans QR
       │
       ▼
Public Broker Profile
       │
       ▼
Browse Listings
       │
       ▼
Open Listing
       │
       ▼
Book Visit
```

---

# Notification Flow

```
Booking Created
       │
       ▼
Broker Notification
       │
       ▼
Broker Decision
       │
       ▼
Student Notification
```

---

# Review Flow

```
Completed Visit
       │
       ▼
Review Available
       │
       ▼
Student Rating
       │
       ▼
Comment
       │
       ▼
Published
```

---

# Error Flows

## Invalid Login

```
Login
   │
   ▼
Invalid Credentials
   │
   ▼
Retry
```

---

## Booking Conflict

```
Select Time
     │
     ▼
Slot Unavailable
     │
     ▼
Choose Another Time
```

---

## Unauthorized Access

```
Protected Page
      │
      ▼
Not Logged In
      │
      ▼
Login Page
```

---

# Navigation Rules

## Guest

- Home
- Search
- Listing Details
- Broker Profile
- Login
- Register

---

## Student

- Home
- Search
- Favorites
- Bookings
- Notifications
- Profile

---

## Broker

- Dashboard
- Properties
- Listings
- Visits
- QR Codes
- Analytics
- Profile

---

## Admin

- Dashboard
- Users
- Brokers
- Properties
- Listings
- Reports
- Analytics
- Settings

---

# UX Principles

- A user should reach any listing within **3 clicks**.
- Booking a visit should take **less than 60 seconds**.
- Every action must provide immediate visual feedback.
- Every workflow should support loading, success, empty, and error states.
- Users should never lose entered data because of navigation or refresh.
- All flows must be fully responsive and optimized for mobile devices.

---

# Flow Completion Metrics

The product should track key conversion events for future optimization:

- Landing → Search
- Search → Listing View
- Listing View → Book Visit
- Book Visit → Approved Visit
- Approved Visit → Completed Visit
- Completed Visit → Review Submitted

These metrics will be used to measure funnel performance and improve the overall user experience over time.

# Volume 9 — Business Logic Blueprint

This document defines the complete business rules of Agarly.

Unlike the API or Database, this document describes **how the platform behaves**.

Every feature, validation, workflow, and edge case must follow these rules.

This is the single source of truth for developers, QA engineers, and product managers.

---

# Business Philosophy

Agarly is **not** a real estate marketplace.

It is a **Student Housing Marketplace**.

The platform focuses on:

- Student accommodation
- Verified listings
- Scheduled visits
- Transparent information
- Trust between students and brokers

The platform **does not participate in the rental agreement**.

Agarly only facilitates discovery and visit booking.

---

# User Roles

There are four user roles.

- Guest
- Student
- Broker
- Property Owner
- Admin

Each role has different permissions.

---

# Authentication Rules

## Guest

Allowed

- Browse listings
- Search
- View broker profiles
- View property details
- View reviews

Not Allowed

- Book visits
- Save favorites
- Leave reviews
- Create listings

---

## Student

Can

- Book visits
- Save favorites
- Leave reviews
- Manage profile

Cannot

- Publish listings
- Generate broker QR
- Access admin panel

---

## Broker

Can

- Create properties
- Create listings
- Manage visits
- Generate QR
- View analytics

Cannot

- Modify another broker's listings
- Access admin features

---

## Property Owner

Can

- Publish only their own properties
- Manage their own listings
- Accept visit requests

Cannot

- Manage properties belonging to others

---

## Admin

Can access every feature.

---

# Property Rules

A property represents the physical apartment.

A property can exist without any listing.

Example

Apartment A

↓

3 Rooms

↓

6 Beds

↓

No listing yet

This is valid.

---

A property may contain

- Multiple rooms
- Multiple beds
- Multiple listings

---

Property status

- Draft
- Active
- Inactive
- Archived
- Rented

---

Only Active properties can appear in search.

---

# Listing Rules

A listing represents what students can actually rent.

Listing Types

- Entire Apartment
- Private Room
- Shared Bed

Each listing belongs to exactly one property.

---

## Entire Apartment

Requires

- Property
- Price

Room and Bed references are optional.

Only one active "Entire Apartment" listing is allowed per property.

---

## Private Room

Requires

- Property
- Room
- Price

Cannot exist without a room.

---

## Shared Bed

Requires

- Property
- Room
- Bed
- Price

Cannot exist without both room and bed.

---

A broker cannot create duplicate listings for the same room or bed.

---

Listing Status

- Draft
- Active
- Reserved
- Hidden
- Expired
- Archived

---

Hidden listings never appear in search.

---

Expired listings cannot receive bookings.

---

Archived listings become read-only.

---

# Availability Rules

Each listing has

Available From

Available To

Students cannot book outside this range.

---

# Property Images

Each property must contain

Minimum

3 Images

Maximum

30 Images

One cover image is required.

---

Videos

Maximum

1 Video

---

# Visit Rules

Only registered students can book visits.

---

A visit requires

Student

Listing

Date

Time

---

Visit Status

Pending

Approved

Rejected

Cancelled

Completed

Expired

No Show Student

No Show Broker

---

Students cannot book

Expired listings

Hidden listings

Archived listings

Inactive properties

---

Students cannot book the same listing twice on the same day.

---

Students cannot have overlapping visits.

---

Broker cannot approve overlapping appointments.

---

Visit duration

Default

30 Minutes

Configurable

---

Booking Window

Minimum

2 Hours Before Visit

Maximum

30 Days Ahead

---

Late arrival

More than 15 minutes

↓

No Show

---

# Cancellation Rules

Student

Can cancel until

2 Hours Before Visit

Broker

Can cancel anytime

Reason required

---

Admin

Can cancel any visit.

---

# Review Rules

Only completed visits can receive reviews.

---

One review per visit.

---

Rating

1–5

---

Student can edit review

Within

48 Hours

---

Broker cannot edit reviews.

---

Admin can hide reviews violating community guidelines.

---

# Favorites Rules

Students can save unlimited listings.

Duplicate favorites are ignored.

Removing a favorite does not affect bookings.

---

# Broker Rules

Broker profile must be approved by Admin before publishing listings.

Until approval

Dashboard available

Publishing disabled

---

Broker verification requires

- National ID
- Phone Verification
- Email Verification

Optional

Commercial Registration

Tax Card

---

# QR Code Rules

Each broker has one permanent QR Code.

Each property can have one QR Code.

Each listing can have one QR Code.

---

QR Codes never expire.

---

QR destination

Broker QR

↓

Broker Profile

Property QR

↓

Property Page

Listing QR

↓

Listing Page

---

QR Analytics

Track

- Total Scans
- Unique Visitors
- Visits Booked
- Conversion Rate

---

# Search Rules

Search supports

Keyword

City

District

University

Budget

Amenities

Gender

Listing Type

Availability

Verified Broker

Distance

---

Results are sorted by default

1. Verified Broker
2. Active Listing
3. Recently Updated
4. Distance
5. Price

---

# Notification Rules

Student receives notifications when

- Booking Approved
- Booking Rejected
- Booking Cancelled
- Booking Reminder
- Review Reminder

---

Broker receives notifications when

- New Booking
- New Review
- Listing Expiring
- QR Scan Milestones (optional)

---

# Property Ownership Rules

A property can belong to

One Owner

One Broker (optional)

---

Broker can manage

Many properties

---

Owner can own

Many properties

---

# University Rules

Each property is linked to

One primary university.

Future versions may support multiple nearby universities.

---

# Pricing Rules

Price must be greater than zero.

Deposit cannot be negative.

Currency

EGP

---

Listing Types

Apartment

Monthly Price

Room

Monthly Price

Bed

Monthly Price

---

# File Upload Rules

Allowed

JPG

PNG

WEBP

MP4

PDF

---

Images larger than

10 MB

Rejected

---

Video larger than

100 MB

Rejected

---

# Admin Rules

Admin can

Approve brokers

Hide listings

Delete listings

Suspend users

Restore users

Manage universities

Manage amenities

Manage cities

View analytics

---

Every admin action must generate an audit log.

---

# Audit Rules

The following actions must be logged

Login

Password Change

Property Created

Listing Created

Listing Updated

Listing Deleted

Booking Created

Booking Cancelled

Review Submitted

QR Generated

Broker Approved

Admin Actions

---

# Edge Cases

## Apartment rented while visits exist

Future visits become automatically cancelled.

Students receive notifications.

---

## Bed becomes occupied

The corresponding bed listing becomes unavailable.

Room availability updates automatically.

Property statistics refresh.

---

## Entire apartment rented

All room listings become unavailable.

All bed listings become unavailable.

---

## Room rented

Associated bed listings become unavailable.

Entire apartment listing becomes unavailable if exclusive occupancy is required.

---

## Broker suspended

All listings become hidden.

Existing bookings remain accessible to Admin.

New bookings are blocked.

---

## Student deleted

Bookings remain for audit purposes.

Personal information is anonymized according to platform policy.

---

## Property archived

Property becomes read-only.

Listings become archived.

New bookings are disabled.

---

# Security Rules

Only authenticated users may perform protected actions.

Every protected endpoint requires authorization.

Users may only modify resources they own.

Sensitive operations require server-side validation.

---

# Future Business Rules

Reserved listings with expiration timers

Online payments

Digital rental agreements

Subscription plans

Premium listing promotion

Referral rewards

Maintenance requests

Chat between student and broker

Roommate matching

Installment support

Multi-language content

---

# Engineering Principles

- Business rules must be enforced on the backend only.
- Frontend validation is for user experience, not security.
- Every state transition must be validated.
- Every important action must be auditable.
- No business logic should exist inside the frontend.
- Every new feature must define its business rules before implementation.

This document is the definitive reference for how Agarly behaves and should be consulted before implementing or modifying any feature.

# Volume 10 — Admin Dashboard Blueprint

This document defines the complete Admin Dashboard for Agarly.

The Admin Panel is responsible for managing the entire platform, ensuring listing quality, verifying brokers, monitoring activity, resolving reports, and maintaining platform integrity.

It should provide administrators with a centralized control panel to operate Agarly efficiently.

---

# Admin Philosophy

The Admin Dashboard is **not** a CRUD panel.

It is an Operations Center.

Every screen should help administrators:

- Monitor platform health
- Verify brokers
- Moderate listings
- Resolve reports
- Analyze growth
- Manage users

---

# Admin Roles

## Admin

Can

- Manage Users
- Manage Brokers
- Manage Listings
- Verify Brokers
- Manage Universities
- Manage Cities
- Manage Amenities
- View Analytics

Cannot

- Manage Super Admins

---

## Super Admin

Can

- Access everything
- Create Admins
- Suspend Admins
- Manage System Settings
- View Audit Logs
- Configure Platform

---

# Dashboard Layout

```
Sidebar

├── Dashboard
├── Users
├── Brokers
├── Properties
├── Listings
├── Visits
├── Universities
├── Cities
├── Amenities
├── Reports
├── QR Analytics
├── Notifications
├── Audit Logs
├── Settings
└── Profile
```

---

# Dashboard Home

## KPI Cards

Display

- Total Users
- Total Students
- Total Brokers
- Total Property Owners
- Total Properties
- Total Listings
- Active Listings
- Total Visits
- Completed Visits
- Pending Visits
- Verified Brokers
- QR Scans

---

## Charts

Daily Users

Weekly Visits

Monthly Listings

Booking Growth

New Registrations

Listing Types Distribution

Visits by University

Top Cities

---

## Recent Activity

Latest Registrations

Latest Listings

Latest Visits

Latest Reports

Latest Reviews

---

# Users Module

## User List

Columns

- Avatar
- Name
- Email
- Phone
- Role
- Status
- Verification
- Registration Date

Actions

- View
- Edit
- Suspend
- Activate
- Reset Password
- Delete (Soft Delete)

---

## User Details

Personal Information

Activity Summary

Bookings

Listings

Reviews

Login History

Audit History

---

# Brokers Module

## Broker List

Columns

- Name
- Company
- Rating
- Listings
- QR Scans
- Verification Status
- Join Date

Actions

- Approve
- Reject
- Suspend
- View Profile

---

## Verification Queue

Shows

- Pending Applications
- National ID
- Phone Verification
- Email Verification
- Submitted Documents

Actions

- Approve
- Reject
- Request Additional Documents

---

# Property Module

## Property List

Columns

- Cover Image
- Property Name
- Broker
- City
- University
- Status
- Created Date

Actions

- View
- Edit
- Archive
- Hide
- Delete

---

## Property Details

Basic Information

Location

Rooms

Beds

Images

Videos

Amenities

Listings

Visits

Reviews

Owner

Broker

---

# Listings Module

Displays

- Listing Type
- Price
- Status
- Availability
- Views
- Bookings
- Favorites

Actions

- Activate
- Hide
- Archive
- Delete

---

# Visits Module

Displays

- Student
- Broker
- Property
- Date
- Time
- Status

Filters

- Pending
- Approved
- Completed
- Cancelled
- No Show

Actions

- View
- Cancel
- Reschedule
- Export

---

# Reviews Module

Displays

- Student
- Broker
- Rating
- Comment
- Property

Actions

- Hide
- Restore
- Delete

---

# Universities Module

Manage

- Universities
- Faculties (Future)
- Locations

CRUD Operations

Create

Update

Delete

---

# Cities Module

Manage

Governorates

Cities

Districts

CRUD Supported

---

# Amenities Module

Manage

Amenities

Categories

Icons

Display Order

CRUD Supported

---

# Reports Module

Users can report

- Fake Listing
- Incorrect Information
- Spam
- Offensive Content
- Duplicate Listing

Admin View

Report Details

Reporter

Reported Entity

Status

Actions

Resolve

Dismiss

Delete Listing

Suspend Broker

---

# QR Analytics Module

Overview

- Total QR Codes
- Total Scans
- Unique Visitors
- Top Performing Brokers
- Top Performing Listings

Charts

Daily Scans

Weekly Scans

Monthly Scans

Conversion Rate

---

# Notifications Module

Send

Platform Announcement

Maintenance Notice

Promotion

Emergency Notification

Target

All Users

Students

Brokers

Owners

---

# Audit Logs

Tracks

- Admin Login
- User Suspension
- Property Updates
- Listing Changes
- Verification Decisions
- System Configuration Changes

Columns

- Timestamp
- Admin
- Action
- Target Entity
- IP Address

---

# Settings Module

Manage

Platform Name

Logo

Brand Colors

Email Settings

SMS Provider

Notification Settings

File Upload Limits

Maintenance Mode

Terms & Conditions

Privacy Policy

---

# Search

Global Search

Supports

- User
- Broker
- Property
- Listing
- Visit
- University
- City

---

# Filters

Date Range

City

University

Broker

Listing Type

Visit Status

Verification Status

User Role

---

# Bulk Actions

Supported

- Approve Brokers
- Hide Listings
- Archive Listings
- Delete Listings
- Send Notifications
- Export Data

---

# Export

Export to

- CSV
- Excel
- PDF

Supported Modules

Users

Properties

Listings

Visits

Reports

Analytics

---

# Analytics Dashboard

KPIs

User Growth

Broker Growth

Property Growth

Booking Growth

Top Universities

Top Districts

Top Brokers

Most Viewed Listings

Visit Conversion Rate

Review Average

---

# Permissions Matrix

| Module | Admin | Super Admin |
|---------|:-----:|:-----------:|
|Dashboard|✅|✅|
|Users|✅|✅|
|Brokers|✅|✅|
|Properties|✅|✅|
|Listings|✅|✅|
|Visits|✅|✅|
|Reviews|✅|✅|
|Reports|✅|✅|
|Universities|✅|✅|
|Cities|✅|✅|
|Amenities|✅|✅|
|Notifications|✅|✅|
|Settings|❌|✅|
|Audit Logs|❌|✅|
|Admin Management|❌|✅|

---

# Dashboard States

Every page must support

- Loading State
- Empty State
- Success State
- Error State
- Permission Denied State

---

# Security Rules

- Admin authentication required.
- RBAC enforced on every route.
- Every admin action must generate an audit log.
- Sensitive actions require confirmation dialogs.
- Soft delete should be preferred over permanent deletion.
- System settings can only be modified by Super Admin.

---

# Performance Requirements

- Server-side pagination for all large tables.
- Advanced filtering and sorting.
- Debounced search.
- Lazy loading for media.
- Cached dashboard statistics.
- Real-time updates for critical metrics (future).

---

# Future Admin Features

- AI-powered fraud detection dashboard.
- AI moderation assistant.
- Revenue analytics.
- Subscription management.
- Support ticket center.
- Chat moderation.
- Mobile admin application.
- Heatmaps for search activity.
- Live monitoring dashboard.
- Feature flags management.

---

# Engineering Principles

- The Admin Dashboard is an operational tool, not a public-facing product.
- Every action must be traceable through audit logs.
- Bulk operations should be supported where appropriate.
- No destructive action should occur without confirmation.
- Performance and usability are priorities due to large datasets.
- The dashboard must remain modular to support future platform expansion.

This Admin Dashboard Blueprint serves as the definitive specification for building the complete administration system of Agarly.

# Volume 11 — Security Blueprint

This document defines the complete security architecture for Agarly.

Its purpose is to protect users, data, platform operations, and business integrity.

Security is a core requirement of the platform and must be considered in every layer of the application.

This document serves as the reference for Backend Developers, Frontend Developers, DevOps Engineers, and QA Engineers.

---

# Security Philosophy

Security is built into the platform from day one.

Every request must be:

- Authenticated
- Authorized
- Validated
- Logged
- Auditable

Never trust client-side input.

All critical validation must happen on the server.

---

# Security Layers

```
Internet
      │
      ▼
Cloudflare
      │
      ▼
HTTPS
      │
      ▼
Nginx Reverse Proxy
      │
      ▼
Rate Limiter
      │
      ▼
Backend API
      │
      ▼
Authentication
      │
      ▼
Authorization
      │
      ▼
Business Logic
      │
      ▼
Database
```

---

# Authentication

Authentication Method

JWT Access Token

Refresh Token

Access Token Lifetime

15 Minutes

Refresh Token Lifetime

30 Days

Storage

Access Token

Memory

Refresh Token

HTTP Only Cookie

---

# Password Policy

Minimum Length

8 Characters

Recommended

12+ Characters

Must Contain

- Uppercase Letter
- Lowercase Letter
- Number
- Special Character

Passwords must never be stored in plain text.

---

# Password Hashing

Algorithm

Argon2id

Never use

- MD5
- SHA1
- Plain SHA256

Password reset tokens must be single-use and time-limited.

---

# Authorization

Model

RBAC (Role-Based Access Control)

Roles

- Guest
- Student
- Broker
- Property Owner
- Admin
- Super Admin

Users may only access resources they own unless explicitly authorized.

---

# Session Management

Login generates

- Access Token
- Refresh Token

Logout

- Invalidates Refresh Token
- Clears Session

Refresh Token Rotation

Enabled

Old refresh tokens become invalid after use.

---

# Email Verification

Required for

- Brokers
- Property Owners

Recommended for Students

Verification Link

Expires after 24 Hours.

---

# Phone Verification

Required for all registered users.

Verification via

OTP

OTP Expiration

5 Minutes

Maximum Attempts

5

---

# Input Validation

All incoming requests must be validated.

Validation includes

- Required Fields
- Data Types
- Length Limits
- Allowed Values
- File Types
- File Size
- Enum Validation

Reject unknown fields where applicable.

---

# SQL Injection Protection

Use ORM or parameterized queries only.

Never concatenate SQL strings.

All database queries must use prepared statements.

---

# XSS Protection

Escape all user-generated content before rendering.

Sanitize

- Reviews
- Property Descriptions
- Broker Bios
- User Names (if rich text is ever allowed)

Never render raw HTML from users.

---

# CSRF Protection

Required when using cookie-based authentication.

Use CSRF Tokens for state-changing requests.

---

# CORS Policy

Allow only trusted frontend origins.

Allowed Methods

- GET
- POST
- PUT
- PATCH
- DELETE

Credentials allowed only for trusted origins.

---

# HTTPS

HTTPS is mandatory in production.

Enable

- TLS 1.2+
- HSTS
- Secure Cookies

Redirect all HTTP traffic to HTTPS.

---

# Rate Limiting

Authentication

5 Requests / Minute

Registration

3 Requests / Minute

Search

100 Requests / Minute

Visit Booking

20 Requests / Minute

QR Generation

10 Requests / Minute

Password Reset

3 Requests / Hour

---

# File Upload Security

Allowed Images

- JPG
- JPEG
- PNG
- WEBP

Allowed Videos

- MP4

Maximum Image Size

10 MB

Maximum Video Size

100 MB

Rules

- Validate MIME Type
- Validate Extension
- Rename Files
- Strip Metadata (Optional)
- Scan for Malware (Future)

Never execute uploaded files.

---

# Sensitive Data

Sensitive data includes

- Passwords
- Refresh Tokens
- OTP Codes
- National ID Documents
- Verification Documents

Rules

- Encrypt at Rest (where applicable)
- Never expose in API responses
- Restrict access to authorized roles only

---

# Logging

Log

- Login
- Logout
- Failed Login
- Password Reset
- Property Creation
- Listing Updates
- Booking Actions
- Admin Actions
- Verification Decisions

Do not log passwords, tokens, or OTP values.

---

# Audit Logs

Every important action must generate an immutable audit record.

Fields

- User ID
- Action
- Entity
- Entity ID
- Timestamp
- IP Address
- User Agent

Audit logs should not be editable.

---

# Error Handling

Never expose

- Stack Traces
- SQL Errors
- Internal Paths
- Secret Keys

Use standardized error responses.

---

# Secrets Management

Never hardcode

- JWT Secret
- Database Password
- API Keys
- SMTP Credentials

Store secrets in environment variables or a secure secret manager.

---

# Environment Configuration

Separate environments

- Development
- Staging
- Production

Each environment must have isolated credentials.

Never use production credentials in development.

---

# Backup Strategy

Database

Daily Backup

Retention

30 Days

Media Files

Scheduled Backup

Configuration

Version Controlled

Regularly test restore procedures.

---

# Monitoring

Track

- Failed Logins
- Suspicious Requests
- Rate Limit Violations
- API Errors
- Server Errors
- High Traffic

Alerts should be generated for abnormal activity.

---

# Account Protection

Temporary account lock after multiple failed login attempts.

Suggested Policy

- 5 Failed Attempts
- Lock for 15 Minutes

---

# Broker Verification Security

Required Documents

- National ID
- Phone Verification
- Email Verification

Optional

- Commercial Registration
- Tax Card

Verification documents must only be accessible to authorized admins.

---

# Privacy Rules

Users may

- Update Profile
- Change Password
- Delete Account (Soft Delete)
- Request Data Export (Future)

Personal data should only be processed for platform operations.

---

# API Security

All protected endpoints require

- Authentication
- Authorization
- Input Validation

Public endpoints must not expose private user information.

---

# QR Security

QR Codes must contain only public-safe identifiers.

Never expose

- Internal Database IDs
- JWT Tokens
- Sensitive Information

QR URLs should resolve to public pages only.

---

# Dependency Security

- Keep dependencies updated.
- Monitor known vulnerabilities.
- Remove unused packages.
- Pin dependency versions where appropriate.

---

# Infrastructure Security

Production Server

- Firewall Enabled
- SSH Key Authentication
- Disable Password Login
- Automatic Security Updates
- Reverse Proxy
- HTTPS Certificates

---

# Incident Response

If suspicious activity is detected

- Log the event
- Notify administrators
- Restrict affected accounts if necessary
- Preserve audit records
- Investigate before restoring access

---

# Security Checklist

- JWT Authentication
- RBAC Authorization
- Argon2 Password Hashing
- HTTPS Enforcement
- Input Validation
- SQL Injection Protection
- XSS Protection
- CSRF Protection (if cookies are used)
- Rate Limiting
- Secure File Upload
- Audit Logs
- Secure Secrets Management
- Daily Backups
- Monitoring & Alerts
- Secure Production Configuration

---

# Future Security Enhancements

- Two-Factor Authentication (2FA)
- Single Sign-On (SSO)
- Device Management
- Login Notifications
- Suspicious Activity Detection
- Web Application Firewall (WAF)
- Malware Scanning for Uploads
- Automated Security Audits
- Data Encryption for Additional Sensitive Fields
- Security Compliance (ISO 27001 / SOC 2)

---

# Engineering Principles

- Security is the responsibility of every layer.
- Never trust client-side validation.
- Least privilege must be applied to all roles.
- Every critical action must be authenticated and auditable.
- Sensitive information must never be exposed.
- Secure defaults should always be preferred over convenience.

This Security Blueprint defines the minimum security standards that every component of the Agarly platform must follow throughout development and production.

# Volume 12 — DevOps & Deployment Blueprint

This document defines the DevOps architecture, deployment strategy, infrastructure, CI/CD pipeline, monitoring, backup strategy, and production environment for Agarly.

Its purpose is to ensure that the platform is reliable, scalable, secure, and easy to deploy throughout its lifecycle.

This blueprint serves as the primary reference for DevOps Engineers, Backend Developers, and System Administrators.

---

# DevOps Philosophy

Agarly should be deployable with minimal manual intervention.

Every deployment must be:

- Repeatable
- Secure
- Automated
- Version Controlled
- Observable
- Recoverable

Infrastructure should support future growth without requiring major architectural changes.

---

# Deployment Environments

The platform consists of three environments.

## Development

Purpose

- Local development
- Feature implementation
- Testing

Characteristics

- Local Database
- Debug Mode Enabled
- Mock Services Allowed

---

## Staging

Purpose

- QA Testing
- User Acceptance Testing (UAT)
- Final verification before production

Characteristics

- Mirrors production as closely as possible
- Separate database
- Production-like configuration

---

## Production

Purpose

Serve real users.

Characteristics

- High Availability
- HTTPS Only
- Automatic Backups
- Monitoring Enabled
- Debug Disabled

---

# Infrastructure Overview

```
                Internet
                     │
                     ▼
               Cloudflare CDN
                     │
                     ▼
             Nginx Reverse Proxy
                     │
                     ▼
          Docker Compose Stack
      ┌───────────┬───────────┬────────────┐
      │           │           │            │
      ▼           ▼           ▼            ▼
 Frontend     Backend API   PostgreSQL    Redis
 (Next.js)    (FastAPI)                  (Cache)
      │
      ▼
 Object Storage (Images & Videos)
```

---

# Technology Stack

Frontend

- Next.js 15
- React 19
- Tailwind CSS

Backend

- FastAPI
- Python

Database

- PostgreSQL

Cache

- Redis

Reverse Proxy

- Nginx

Containerization

- Docker
- Docker Compose

Process Management

- Uvicorn + Gunicorn

Object Storage

- AWS S3
- Cloudflare R2
- MinIO (Self-hosted)

Monitoring

- Prometheus
- Grafana

Logging

- Loki
- Promtail

Error Tracking

- Sentry

---

# Container Architecture

Each service runs independently.

```
Frontend Container

↓

Backend Container

↓

Database Container

↓

Redis Container

↓

Nginx Container
```

Services communicate through an internal Docker network.

---

# Docker Images

Frontend

```
Node.js LTS
```

Backend

```
Python 3.12 Slim
```

Database

```
PostgreSQL 16
```

Redis

```
Redis 7
```

Nginx

```
Latest Stable
```

---

# Environment Variables

All secrets must be stored in environment variables.

Example

```
DATABASE_URL=

JWT_SECRET=

REDIS_URL=

SMTP_HOST=

SMTP_USER=

SMTP_PASSWORD=

S3_BUCKET=

S3_ACCESS_KEY=

S3_SECRET_KEY=
```

Never commit `.env` files to version control.

---

# CI/CD Pipeline

Trigger

- Pull Request
- Merge to Main
- Release Tag

Pipeline Steps

```
Git Push
    │
    ▼
GitHub Actions
    │
    ├── Install Dependencies
    ├── Lint
    ├── Run Tests
    ├── Build Frontend
    ├── Build Backend
    ├── Build Docker Images
    ├── Security Scan
    ├── Push Images
    └── Deploy
```

---

# Branch Strategy

```
main

development

feature/*

hotfix/*

release/*
```

Rules

- No direct commits to `main`.
- Pull Requests are mandatory.
- Code review required before merge.

---

# Deployment Strategy

Recommended

Rolling Deployment

Future

Blue-Green Deployment

Canary Deployment

Deployment must support zero or minimal downtime.

---

# Reverse Proxy

Nginx Responsibilities

- HTTPS Termination
- Load Balancing (Future)
- Compression
- Static Asset Caching
- API Routing
- Security Headers

---

# SSL

Certificates

Let's Encrypt

Automatic Renewal

Enabled

All traffic redirected to HTTPS.

---

# Database Management

Migration Tool

Alembic

Rules

- Every schema change must have a migration.
- Never modify production schema manually.
- Rollback procedures must be documented.

---

# Redis Usage

Redis will be used for

- API Cache
- Session Cache (if needed)
- Rate Limiting
- Background Jobs (Future)
- Temporary Data

---

# Background Jobs

Future worker

Celery

or

RQ

Jobs

- Send Emails
- Send Notifications
- Image Processing
- Cleanup Tasks
- Scheduled Reports

---

# File Storage

Images

Property Photos

Videos

Property Videos

Future

Documents

Supported Storage Providers

- AWS S3
- Cloudflare R2
- MinIO

Never store uploaded files inside application containers.

---

# Monitoring

Collect Metrics

- CPU Usage
- Memory Usage
- Disk Usage
- API Response Time
- Request Count
- Error Rate
- Active Users

---

# Logging

Application Logs

Access Logs

Error Logs

Audit Logs

Centralized using

- Loki
- Promtail

Logs should be searchable and retained according to platform policy.

---

# Alerts

Notify administrators when

- Server Offline
- Database Unreachable
- High CPU Usage
- High Memory Usage
- API Error Rate
- Disk Almost Full
- SSL Certificate Expiring

---

# Backup Strategy

Database

Daily Full Backup

Retention

30 Days

Media Storage

Scheduled Backup

Configuration Files

Version Controlled

Test backup restoration regularly.

---

# Disaster Recovery

Recovery Objectives

RPO (Recovery Point Objective)

24 Hours

RTO (Recovery Time Objective)

4 Hours

Recovery Plan

- Restore Database
- Restore Media
- Restore Configuration
- Redeploy Containers
- Verify Services

---

# Performance Optimization

Enable

- Gzip Compression
- HTTP/2
- Image Optimization
- Static Asset Caching
- CDN
- Query Optimization

Future

Horizontal Scaling

---

# Scaling Strategy

Current

Single Server Deployment

Future

```
Load Balancer

↓

Multiple Backend Instances

↓

Database

↓

Redis
```

Frontend can be deployed independently.

---

# Security in Deployment

Production servers must

- Use SSH Keys
- Disable Root Login
- Disable Password Authentication
- Enable Firewall
- Keep System Updated
- Rotate Secrets Regularly

---

# Health Checks

Every service must expose a health endpoint.

Backend

```
GET /health
```

Response

```json
{
  "status": "healthy"
}
```

Docker health checks should automatically restart unhealthy containers.

---

# Versioning

Application Version

Semantic Versioning

Example

```
v1.0.0

v1.1.0

v2.0.0
```

Git Tags should match application releases.

---

# Release Process

```
Feature Complete
        │
        ▼
Code Review
        │
        ▼
Merge to Development
        │
        ▼
Deploy to Staging
        │
        ▼
QA Approval
        │
        ▼
Merge to Main
        │
        ▼
Production Deployment
```

---

# Documentation

Every deployment must include

- Deployment Guide
- Environment Variables
- Database Migration Instructions
- Rollback Procedure
- Monitoring Setup
- Backup Instructions

---

# Future DevOps Enhancements

- Kubernetes Deployment
- Helm Charts
- Terraform Infrastructure
- GitOps with ArgoCD
- Auto Scaling
- Multi-Region Deployment
- Read Replicas
- CDN Edge Caching
- Secrets Manager Integration
- Service Mesh

---

# Engineering Principles

- Everything should run inside containers.
- Infrastructure should be reproducible.
- Deployments should be automated.
- Configuration must be externalized.
- Backups must be tested regularly.
- Monitoring and alerting are mandatory.
- Every release should be traceable and reversible.
- Production environments must remain isolated from development.

This DevOps & Deployment Blueprint defines the operational standards required to build, deploy, monitor, and maintain Agarly in a secure and scalable production environment.

# Volume 13 — Testing & QA Blueprint

This document defines the complete testing strategy for Agarly.

Its purpose is to ensure that every feature is reliable, secure, and production-ready before being released.

Testing is an essential part of the development lifecycle and must be integrated into every sprint.

This blueprint serves as the primary reference for QA Engineers, Developers, Product Managers, and DevOps Engineers.

---

# Testing Philosophy

Every feature must be:

- Functional
- Reliable
- Secure
- Performant
- User-Friendly
- Fully Tested

No feature should be deployed without passing the required quality checks.

---

# Testing Pyramid

```
                 E2E Tests
                    ▲
                    │
          Integration Tests
                    ▲
                    │
              Unit Tests
```

Recommended Distribution

- Unit Tests → 70%
- Integration Tests → 20%
- End-to-End Tests → 10%

---

# Testing Types

## Unit Testing

Purpose

Verify individual functions, services, and business logic.

Examples

- Price validation
- Listing availability
- Visit scheduling logic
- Authentication utilities
- Permission checks

Recommended Tools

- Pytest (Backend)
- Vitest (Frontend)

---

## Integration Testing

Purpose

Ensure multiple modules work together correctly.

Examples

- Register → Login
- Create Property → Create Listing
- Book Visit → Notification
- Broker Approval → Publish Listing

---

## End-to-End (E2E) Testing

Purpose

Simulate complete user journeys.

Recommended Tool

- Playwright

Critical Flows

- Student Registration
- Broker Registration
- Login
- Property Creation
- Listing Creation
- Search
- Book Visit
- Review Submission

---

# Manual QA

Manual testing is required before every production release.

Checklist

- UI Consistency
- Responsive Design
- Navigation
- Forms
- Error Messages
- Images
- Performance
- Accessibility

---

# Functional Testing

Verify every feature behaves as expected.

Modules

- Authentication
- Search
- Listings
- Properties
- Visits
- Favorites
- Reviews
- Notifications
- QR Codes
- Admin Dashboard

---

# Regression Testing

Performed before every release.

Ensure new updates do not break existing functionality.

Regression Checklist

- Login
- Registration
- Search
- Listing Details
- Visit Booking
- Admin Dashboard

---

# API Testing

Every API endpoint must be tested.

Verify

- Status Codes
- Authentication
- Authorization
- Validation
- Error Handling
- Response Schema
- Pagination
- Filtering

Recommended Tools

- Postman
- Bruno
- Pytest + HTTPX

---

# UI Testing

Verify

- Layout
- Typography
- Colors
- Icons
- Buttons
- Forms
- Modals
- Navigation
- Responsive Design

Test on

- Desktop
- Tablet
- Mobile

---

# Responsive Testing

Supported Breakpoints

- Mobile
- Tablet
- Laptop
- Desktop

Browsers

- Chrome
- Edge
- Firefox
- Safari

---

# Performance Testing

Measure

- API Response Time
- Search Speed
- Page Load Time
- Image Loading
- Database Queries

Target

Home Page

< 2 Seconds

API Response

< 300 ms

Search

< 500 ms

---

# Load Testing

Simulate

- 100 Concurrent Users
- 500 Concurrent Users
- 1000 Concurrent Users

Critical Endpoints

- Login
- Search
- Listings
- Book Visit

Recommended Tools

- k6
- Locust

---

# Security Testing

Verify

- Authentication
- Authorization
- SQL Injection Protection
- XSS Protection
- Rate Limiting
- JWT Validation
- File Upload Security

---

# Accessibility Testing

Verify

- Keyboard Navigation
- Screen Reader Support
- ARIA Labels
- Focus States
- Color Contrast

Recommended Standard

WCAG 2.1 AA

---

# Cross Browser Testing

Supported Browsers

- Chrome
- Edge
- Firefox
- Safari

Future

Mobile Browsers

- Chrome Android
- Safari iOS

---

# Database Testing

Verify

- Constraints
- Relationships
- Cascade Rules
- Transactions
- Migrations
- Indexes

---

# QR Testing

Verify

- QR Generation
- QR Download
- QR Scan
- QR Redirect
- QR Analytics

---

# Notification Testing

Verify

- Booking Notifications
- Approval Notifications
- Reminder Notifications
- Admin Notifications

Channels

- In-App
- Email

---

# User Acceptance Testing (UAT)

Participants

- Product Owner
- QA Engineer
- Selected Students
- Selected Brokers

Goals

- Validate business requirements
- Validate user experience
- Collect feedback
- Approve release

---

# Smoke Testing

Performed after every deployment.

Verify

- Application Starts
- Login Works
- Database Connected
- APIs Respond
- Frontend Loads

---

# Sanity Testing

Performed after bug fixes.

Verify only the affected functionality.

---

# Test Data

Maintain dedicated test accounts.

Example

Student

```
student@test.com
```

Broker

```
broker@test.com
```

Admin

```
admin@test.com
```

Test data should never affect production users.

---

# Test Environments

Development

Used by developers.

Staging

Used by QA and Product.

Production

Real users only.

Production data must never be modified for testing.

---

# Bug Severity

Critical

- Application Crash
- Data Loss
- Security Issue

High

- Booking Failure
- Login Failure
- Payment Failure (Future)

Medium

- Incorrect Validation
- UI Issues Affecting Workflow

Low

- Typography
- Alignment
- Minor UI Problems

---

# Bug Priority

P0

Immediate Fix

P1

Before Release

P2

Next Sprint

P3

Future Improvement

---

# Release Checklist

Before Production

- Unit Tests Passed
- Integration Tests Passed
- E2E Tests Passed
- Regression Tests Passed
- Security Tests Passed
- Performance Tests Passed
- Manual QA Completed
- Product Approval Received

---

# Test Coverage Goals

Backend

Minimum

80%

Frontend

Minimum

70%

Critical Business Logic

100%

Authentication

100%

Booking System

100%

---

# Automation Strategy

Automate

- Unit Tests
- Integration Tests
- API Tests
- E2E Tests
- Regression Tests

Manual

- UX Review
- Visual Inspection
- Exploratory Testing

---

# CI/CD Quality Gates

Every Pull Request must

- Pass Linting
- Pass Unit Tests
- Pass Integration Tests
- Build Successfully

Production deployment is blocked if any required check fails.

---

# QA Documentation

Maintain

- Test Plan
- Test Cases
- Bug Reports
- Regression Checklist
- Release Notes

Documentation should be version controlled.

---

# Future Testing Enhancements

- Visual Regression Testing
- Mobile Application Testing
- AI-Assisted Test Generation
- Chaos Engineering
- Continuous Performance Testing
- Automated Accessibility Audits

---

# Engineering Principles

- Every bug should have a reproducible test case.
- Bugs must be verified after fixing.
- Critical business logic requires automated tests.
- Manual testing complements, but does not replace, automation.
- Releases must meet defined quality gates before deployment.
- Quality is a shared responsibility across the entire team.

This Testing & QA Blueprint defines the quality assurance standards required to deliver a stable, secure, and reliable Agarly platform.

# Volume 14 — Product Roadmap

This document defines the strategic roadmap for Agarly.

The roadmap outlines the evolution of the platform from a Minimum Viable Product (MVP) into Egypt's leading student housing marketplace.

It serves as the alignment document for Product, Engineering, Design, Marketing, and Business teams.

---

# Product Vision

**Mission**

Make student accommodation in Egypt simple, transparent, and trustworthy.

**Vision**

Become the #1 digital platform for student housing in Egypt, then expand across the MENA region.

---

# Product Strategy

The roadmap follows four major phases:

1. MVP Validation
2. Market Expansion
3. Growth & Monetization
4. Regional Expansion

Each phase focuses on solving the most important business problems before adding new features.

---

# Phase 1 — MVP

**Objective**

Validate Product-Market Fit in Alexandria.

**Target Duration**

2–3 Months

---

## Features

### Authentication

- Student Registration
- Broker Registration
- Property Owner Registration
- Login / Logout
- Password Reset

---

### Student

- Search Listings
- Advanced Filters
- Listing Details
- Favorite Listings
- Book Visit
- Booking History
- Profile Management

---

### Broker

- Broker Dashboard
- Create Property
- Create Listings
- Upload Images
- Manage Visits
- QR Code Generation
- Basic Analytics

---

### Property Owner

- Manage Properties
- Manage Listings
- Accept Visit Requests

---

### Admin

- Dashboard
- User Management
- Broker Verification
- Property Management
- Listing Management
- Visit Management
- Reports
- Analytics

---

### Platform

- Search
- Notifications
- Reviews
- Responsive Website
- SEO Optimization

---

# Success Metrics (Phase 1)

- 100+ Active Brokers
- 1,000+ Published Listings
- 5,000+ Monthly Visitors
- 500+ Visit Bookings
- 80% Booking Completion Rate

---

# Phase 2 — Growth

**Objective**

Expand to additional universities and cities.

**Target Duration**

3–6 Months

---

## New Features

- Broker Analytics
- Property Videos
- Featured Listings
- Listing Expiration
- Advanced Search
- Saved Searches
- Improved Notifications
- QR Analytics
- Broker Verification Badges
- Listing Performance Dashboard

---

## Operational Improvements

- Faster Admin Moderation
- Better Reporting Tools
- Improved Dashboard
- Bulk Management Tools

---

# Success Metrics (Phase 2)

- 500+ Brokers
- 5,000+ Listings
- 50,000+ Monthly Visitors
- 5,000+ Visits
- Expansion to 3 Egyptian Cities

---

# Phase 3 — Monetization

**Objective**

Turn Agarly into a profitable platform.

---

## Revenue Features

### Featured Listings

Brokers can pay to promote listings.

---

### Premium Broker Subscription

Benefits

- Higher Visibility
- Analytics
- Unlimited Listings
- Priority Support
- Verified Badge

---

### QR Premium

Premium QR Landing Pages

Custom Branding

Advanced Analytics

---

### Advertising

Relevant student-focused advertisements.

---

### Business Dashboard

Revenue Reports

Subscription Reports

Growth Metrics

---

# Success Metrics (Phase 3)

- Monthly Recurring Revenue (MRR)
- 1,000+ Paying Brokers
- Positive Cash Flow
- CAC < LTV

---

# Phase 4 — Scale

**Objective**

Become the leading student housing platform in Egypt.

---

## Expansion

- Cairo
- Giza
- Mansoura
- Tanta
- Zagazig
- Assiut
- Minya

---

## Platform Improvements

- Mobile Applications
- Faster Infrastructure
- Better Search
- Multi-language Support
- Enhanced Admin Tools

---

# Success Metrics (Phase 4)

- 50,000+ Listings
- 10,000+ Brokers
- 500,000+ Monthly Users
- Nationwide Coverage

---

# Phase 5 — MENA Expansion

**Objective**

Expand outside Egypt.

Target Markets

- Saudi Arabia
- UAE
- Jordan
- Morocco
- Kuwait

---

## Localization

- Multi-Currency
- Multi-Language
- Local Universities
- Regional Regulations
- Country-specific Pricing

---

# Future Features Backlog

## Student Experience

- Roommate Matching
- Compare Listings
- Share Listings
- Recently Viewed
- Saved Filters
- Move-in Checklist
- Student Guides

---

## Broker Experience

- Team Accounts
- Multiple Staff Members
- CRM Dashboard
- Calendar Management
- Performance Reports
- Lead Management

---

## Property Features

- 360° Photos
- Virtual Tours
- Floor Plans
- Availability Calendar
- Smart Pricing

---

## Platform Features

- Online Chat
- In-App Messaging
- Online Contracts
- Digital Signatures
- Online Payments
- Booking Deposits
- Referral Program

---

## Mobile Applications

### Student App

- Search
- Booking
- Favorites
- Notifications
- QR Scanner

---

### Broker App

- Dashboard
- Property Management
- Visit Management
- QR Management
- Analytics

---

# Technology Roadmap

## Version 1.0

- Next.js
- FastAPI
- PostgreSQL
- Redis
- Docker

---

## Version 1.5

- Mobile API Optimization
- Performance Improvements
- Background Jobs
- Advanced Analytics

---

## Version 2.0

- Native Mobile Apps
- Public API
- Third-party Integrations
- Improved Infrastructure

---

## Version 3.0

- Microservices
- Kubernetes
- Event-Driven Architecture
- Multi-Region Deployment

---

# Business Milestones

## Milestone 1

✅ MVP Launch

---

## Milestone 2

✅ First 100 Brokers

---

## Milestone 3

✅ First 1,000 Listings

---

## Milestone 4

✅ First 10,000 Users

---

## Milestone 5

✅ Break-even

---

## Milestone 6

✅ Expansion Beyond Alexandria

---

## Milestone 7

✅ Nationwide Coverage

---

## Milestone 8

✅ MENA Expansion

---

# KPIs

Product

- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Visit Booking Rate
- Listing Conversion Rate
- Review Rate

---

Business

- Revenue
- MRR
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate

---

Operations

- Broker Verification Time
- Listing Approval Time
- Average Booking Response Time
- Support Resolution Time

---

# Prioritization Framework

Every new feature should be evaluated based on:

- User Value
- Business Impact
- Development Effort
- Technical Risk

Priority Levels

| Priority | Description |
|----------|-------------|
| P0 | Critical (Required for MVP) |
| P1 | High Priority |
| P2 | Medium Priority |
| P3 | Nice to Have |
| P4 | Future Vision |

---

# Roadmap Principles

- Solve real user problems before adding new features.
- Validate assumptions with real users.
- Release small, iterate fast.
- Prioritize reliability over feature quantity.
- Measure every major product decision with KPIs.
- Scale only after achieving Product-Market Fit.

---

# Long-Term Vision

Agarly aims to become the digital infrastructure for student accommodation across the MENA region.

Beyond listing apartments, the platform will evolve into a complete ecosystem where students can discover housing, schedule visits, connect with verified brokers and property owners, manage the rental journey, and access trusted housing-related services through a single platform.

This roadmap should be reviewed quarterly and updated based on user feedback, business performance, and market opportunities.

# Volume 15 — Future Features Blueprint

This document defines the long-term feature backlog for Agarly.

The features listed here are **not required for the MVP**, but represent the future evolution of the platform into a complete student housing ecosystem.

Each feature should be validated through user feedback and business priorities before implementation.

---

# Vision

Agarly is not only a housing marketplace.

The long-term vision is to become the **Operating System for Student Life**, where students can discover accommodation, manage their rental journey, and access trusted services through one platform.

---

# Product Evolution

```
Housing Search
        │
        ▼
Visit Booking
        │
        ▼
Rental Marketplace
        │
        ▼
Student Housing Platform
        │
        ▼
Student Living Ecosystem
```

---

# Student Features

## Roommate Matching

Students can create roommate profiles.

Matching Criteria

- University
- Faculty
- Gender
- Budget
- Smoking Preference
- Study Habits
- Sleep Schedule
- Languages
- Interests

Features

- Compatibility Score
- Suggested Matches
- Roommate Requests

Priority

P1

---

## AI Housing Assistant

AI-powered assistant that helps students find the most suitable accommodation.

Capabilities

- Natural Language Search
- Budget Recommendations
- Area Suggestions
- Listing Comparison
- Personalized Recommendations
- FAQ Support

Priority

P2

---

## Smart Recommendations

Recommend listings based on

- Search History
- Favorite Listings
- University
- Budget
- Previous Visits

Priority

P1

---

## Compare Listings

Students can compare multiple listings side by side.

Comparison

- Price
- Amenities
- Distance
- Reviews
- Broker Rating

Priority

P2

---

## Saved Searches

Students receive notifications when new listings match saved filters.

Priority

P2

---

## Recently Viewed

Automatically save viewed listings.

Priority

P3

---

## Move-in Checklist

Interactive checklist

- Documents
- Payments
- Utilities
- Furniture
- Internet

Priority

P3

---

## Student Guides

Educational content

- Renting Tips
- Area Guides
- University Guides
- Cost of Living
- Safety Tips

Priority

P3

---

# Broker Features

## Broker CRM

Manage

- Leads
- Students
- Visits
- Follow-ups
- Notes

Priority

P2

---

## Team Accounts

Broker agencies can create multiple staff accounts.

Roles

- Manager
- Agent
- Assistant

Priority

P2

---

## Calendar Management

Integrated visit calendar.

Sync with

- Google Calendar
- Outlook Calendar

Priority

P3

---

## Smart Analytics

Advanced insights

- Conversion Rate
- Listing Performance
- Popular Areas
- Peak Visit Hours

Priority

P2

---

## Bulk Listing Import

Import listings using

- Excel
- CSV
- API

Priority

P2

---

# Property Features

## Availability Calendar

Visual calendar showing available dates.

Priority

P2

---

## Virtual Tours

360° property walkthroughs.

Priority

P3

---

## Floor Plans

Upload apartment layouts.

Priority

P3

---

## Property Documents

Store

- Ownership Documents
- Rental Agreements
- Utility Information

Priority

P4

---

# Communication Features

## In-App Chat

Student ↔ Broker messaging.

Features

- Images
- Voice Messages
- Read Receipts
- Typing Indicator

Priority

P2

---

## Video Calls

Schedule online property tours.

Priority

P4

---

## Push Notifications

Support

- Mobile
- Web Push

Priority

P2

---

# Booking Features

## Online Deposit

Reserve a property using a refundable booking deposit.

Priority

P3

---

## Digital Rental Agreement

Electronic contract signing.

Priority

P4

---

## Online Payments

Support

- Credit Cards
- Mobile Wallets
- Bank Transfers

Priority

P4

---

## Installment Plans

Pay deposits or rent in installments through partner providers.

Priority

P4

---

# Community Features

## Reviews with Photos

Students can upload images with reviews.

Priority

P3

---

## Discussion Board

Students discuss

- Universities
- Neighborhoods
- Housing Tips

Priority

P4

---

## Referral Program

Students invite friends.

Rewards

- Discounts
- Credits
- Premium Features

Priority

P2

---

# Marketplace Features

## Student Services Marketplace

Verified partners can offer

- Furniture Rental
- Cleaning Services
- Internet Installation
- Moving Services
- Maintenance

Priority

P3

---

## Local Business Offers

Student discounts from

- Restaurants
- Cafés
- Gyms
- Bookstores
- Transportation Services

Priority

P4

---

# AI Features

## Fraud Detection

Detect suspicious

- Listings
- Brokers
- User Behavior

Priority

P3

---

## Image Quality Analysis

Automatically detect

- Blurry Images
- Duplicate Images
- Low-Quality Uploads

Priority

P3

---

## Listing Description Generator

AI generates professional listing descriptions.

Priority

P2

---

## Automatic Image Tagging

Recognize

- Bed
- Kitchen
- Bathroom
- Balcony
- Air Conditioner
- Washing Machine

Priority

P3

---

# Analytics Features

## Heatmaps

Visualize

- Search Demand
- Popular Areas
- Booking Density

Priority

P3

---

## Demand Forecasting

Predict

- Seasonal Demand
- High-Traffic Areas
- Pricing Trends

Priority

P4

---

# Admin Features

## AI Moderation

Automatically review

- Images
- Descriptions
- Spam
- Duplicate Listings

Priority

P3

---

## Fraud Dashboard

Monitor

- Suspicious Brokers
- Fake Listings
- Unusual Activity

Priority

P3

---

## Automated Verification

OCR + AI verification for submitted documents.

Priority

P4

---

# Mobile Applications

## Student App

Features

- Search
- Favorites
- Booking
- Notifications
- QR Scanner
- AI Assistant

Priority

P2

---

## Broker App

Features

- Dashboard
- Listings
- Visits
- Analytics
- QR Management

Priority

P2

---

# Integrations

Future Integrations

- Google Maps
- Google Calendar
- Outlook Calendar
- WhatsApp Business API
- Firebase Cloud Messaging
- Payment Gateways
- Government Address APIs (if available)

Priority

P3

---

# Enterprise Features

Agency Dashboard

Multi-Branch Support

Team Permissions

White Label Platform

Public API

Webhook Support

Priority

P4

---

# International Expansion

Support

- Multiple Countries
- Multiple Currencies
- Multiple Languages
- Country-specific Regulations
- Country-specific Universities

Priority

P4

---

# Sustainability Features

Carbon-neutral hosting (future)

Paperless agreements

Digital receipts

Priority

P4

---

# Feature Priority Matrix

| Priority | Description |
|----------|-------------|
| **P1** | High-value features planned after MVP validation |
| **P2** | Growth features that improve engagement and retention |
| **P3** | Medium-term enhancements that enrich the platform |
| **P4** | Long-term strategic vision and expansion features |

---

# Innovation Backlog

Potential experimental ideas

- AR Room Visualization
- AI Voice Assistant
- Smart Rent Estimation
- Smart University Recommendations
- Blockchain-based Rental Agreements
- IoT-enabled Smart Apartment Integrations
- Open API for Universities
- Student Housing Index
- Dynamic Pricing Suggestions
- AI Move-in Assistant

These ideas require research and validation before implementation.

---

# Product Decision Principles

Every future feature must answer the following questions:

- Does it solve a real user problem?
- Does it increase trust?
- Does it improve the student experience?
- Does it create measurable business value?
- Can it scale with the platform?
- Is it technically maintainable?

Features that do not satisfy these principles should not be prioritized.

---

# Long-Term Vision

Agarly's long-term goal is to become the most trusted student housing platform in the MENA region.

Beyond helping students find accommodation, the platform will evolve into a complete ecosystem connecting students, brokers, property owners, universities, and trusted service providers through a single digital experience.

This Future Features Blueprint should be reviewed after every major product milestone and updated based on user feedback, market trends, and business strategy.

# Executive Summary

Agarly is a modern PropTech platform focused on solving one of the biggest challenges faced by university students in Egypt: finding safe, verified, and suitable accommodation.

Unlike traditional property marketplaces, Agarly specializes in student housing by connecting students with verified brokers and property owners through a structured and transparent digital experience.

The platform enables brokers and property owners to publish apartments, rooms, or beds, while students can search using advanced filters, view detailed property information, schedule visits, and make informed rental decisions.

Trust is the foundation of the platform. Features such as broker verification, visit scheduling, reviews, QR-based broker profiles, and standardized property information help reduce fraud and improve transparency.

The first version of Agarly focuses on validating the business model in Alexandria before expanding across Egypt and eventually into the MENA region.

The architecture is designed to be scalable, secure, and maintainable using modern technologies including Next.js, FastAPI, PostgreSQL, Redis, Docker, and a cloud-native deployment strategy.

This blueprint defines every aspect of the platform, including product requirements, system architecture, database design, business rules, security, APIs, testing, DevOps, administration, and long-term product evolution.

---

# Blueprint Structure

This Software Blueprint consists of the following volumes:

**Volume 1** — Product Vision & Requirements

**Volume 2** — System Architecture

**Volume 3** — Database Design

**Volume 4** — UI/UX Design System

**Volume 5** — Technology Stack

**Volume 6** — Feature Specification

**Volume 7** — API Specification

**Volume 8** — User Flows

**Volume 9** — Business Logic

**Volume 10** — Admin Dashboard

**Volume 11** — Security

**Volume 12** — DevOps & Deployment

**Volume 13** — Testing & QA

**Volume 14** — Product Roadmap

**Volume 15** — Future Features

Together, these documents provide a complete technical and product specification for designing, developing, deploying, and scaling the Agarly platform.

---

# Conclusion

Agarly is more than a property listing website.

It is a specialized student housing platform built around transparency, trust, and operational efficiency.

By focusing on verified listings, structured visit booking, broker accountability, and an intuitive user experience, Agarly addresses the unique challenges faced by students searching for accommodation in Egypt.

The platform has been intentionally designed with a modular architecture, allowing it to evolve from a focused MVP into a scalable ecosystem supporting students, brokers, property owners, universities, and future service providers.

Every technical decision in this blueprint emphasizes scalability, maintainability, security, and performance, ensuring that future growth can be achieved without major architectural changes.

This blueprint serves as the single source of truth for all stakeholders involved in the project—including founders, product managers, designers, developers, QA engineers, DevOps engineers, and future team members.

As the platform evolves, this document should continue to be updated alongside product discoveries, user feedback, and business strategy.

The ultimate vision of Agarly is to become the leading student housing platform in Egypt and, ultimately, the trusted digital infrastructure for student accommodation across the MENA region.