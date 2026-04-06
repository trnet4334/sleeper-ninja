## ADDED Requirements

### Requirement: User can navigate to the Prospects News page
The system SHALL provide a Prospects News page accessible at `/news/prospects` via the SideNavBar under the News section.

#### Scenario: User clicks Prospects News in sidebar
- **WHEN** the user clicks "Prospects News" in the SideNavBar under the News section
- **THEN** the system navigates to `/news/prospects`
- **AND** renders the Prospects News page with a page header and placeholder content

#### Scenario: User loads the page directly by URL
- **WHEN** the user navigates directly to `/news/prospects`
- **THEN** the system renders the Prospects News page within the app shell without a full reload

### Requirement: Prospects News page displays relevant header and placeholder content
The system SHALL render the Prospects News page with a consistent page header and a clearly labeled placeholder section indicating future news content.

#### Scenario: Page renders on desktop
- **WHEN** the Prospects News page is loaded on a desktop viewport
- **THEN** the system displays a PageHeader with title "Prospects News" and a descriptive subtitle
- **AND** shows a placeholder content area with a message indicating content is coming

#### Scenario: Page renders on mobile
- **WHEN** the Prospects News page is loaded on a narrow viewport
- **THEN** the page content reflows into a single-column layout without horizontal overflow
