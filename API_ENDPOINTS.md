# API Endpoints Documentation

## Current API Endpoints

### Platform Page Endpoints
- `/api/content/hero` - Hero section content
- `/api/content/projects` - Projects data
- `/api/content/projects/items` - Individual project items
- `/api/content/services` - Services data
- `/api/content/about` - About section content

### Company Landing Page Endpoints
Currently missing dedicated API endpoints for company landing page content. The company landing page uses the same data structure as the platform but with different content.

## Missing API Endpoints

### Company Landing Page Specific Endpoints
The following endpoints are needed for full company landing page functionality:

1. **Navigation Endpoints**
   - `/api/content/navigation` - Main navigation menu items
   - `/api/content/navigation/business` - Business section navigation
   - `/api/content/navigation/services` - Services section navigation
   - `/api/content/navigation/company` - Company section navigation
   - `/api/content/navigation/about` - About section navigation
   - `/api/content/navigation/quote` - Get a quote navigation item

2. **Partners Endpoints**
   - `/api/content/partners` - All partner data
   - `/api/content/partners/{id}` - Individual partner data
   - `/api/content/partners/active` - Only active partners

3. **Jobs Endpoints**
   - `/api/content/jobs` - All job listings
   - `/api/content/jobs/{id}` - Individual job details
   - `/api/content/jobs/active` - Only active job listings
   - `/api/content/jobs/status` - Job status management

4. **CTA (Call to Action) Endpoints**
   - `/api/content/cta` - Call to action section content
   - `/api/content/cta/title` - CTA title content
   - `/api/content/cta/subtitle` - CTA subtitle content
   - `/api/content/cta/button` - CTA button text

5. **Additional Company Landing Sections**
   - `/api/content/company/values` - Company values section
   - `/api/content/company/mission` - Company mission statement
   - `/api/content/company/vision` - Company vision statement

### Platform Page Missing Endpoints
1. **Platform-Specific Content**
   - `/api/content/platform/features` - Platform features data
   - `/api/content/platform/clients` - Client testimonials/partners
   - `/api/content/platform/stats` - Platform statistics

2. **User Management**
   - `/api/content/platform/users` - User management
   - `/api/content/platform/users/roles` - User roles and permissions

3. **Project Management**
   - `/api/content/platform/projects` - Platform project management
   - `/api/content/platform/projects/status` - Project status tracking

## Current Implementation Status

### Working Endpoints
- Hero content (platform)
- About content (shared)
- Services data (shared)
- Projects data (shared)
- Platform features (platform-specific)

### Partially Implemented
- Content update functionality exists but needs proper API integration
- Some endpoints fallback to mock data when API is unavailable

### Not Implemented
- Dedicated company landing page endpoints
- Navigation endpoints
- Partners management endpoints
- Jobs management endpoints
- CTA section endpoints

## Recommendations

1. **Create dedicated endpoints** for company landing page content to separate it from platform content
2. **Implement full CRUD operations** for all content types (Create, Read, Update, Delete)
3. **Add authentication and authorization** for content management endpoints
4. **Implement proper error handling** and validation for all API requests
5. **Add caching mechanisms** to improve performance
6. **Create API documentation** using tools like Swagger/OpenAPI

## Data Structure Consistency

All endpoints should follow a consistent data structure with:
- Bilingual support (en/ar)
- Proper error handling
- Standardized response formats
- Consistent field naming conventions
- Support for metadata (IDs, timestamps, etc.)