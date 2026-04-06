## ADDED Requirements

### Requirement: User can navigate to the Injury Update page
The system SHALL provide an Injury Update page accessible at `/news/injury` via the SideNavBar under the News section.

#### Scenario: User clicks Injury Update in sidebar
- **WHEN** the user clicks "Injury Update" in the SideNavBar under the News section
- **THEN** the system navigates to `/news/injury`
- **AND** renders the Injury Update page with a page header and placeholder content

#### Scenario: User loads the page directly by URL
- **WHEN** the user navigates directly to `/news/injury`
- **THEN** the system renders the Injury Update page within the app shell without a full reload

### Requirement: Injury Update page displays relevant header and placeholder content
The system SHALL render the Injury Update page with a consistent page header and a clearly labeled placeholder section indicating future injury tracking content.

#### Scenario: Page renders on desktop
- **WHEN** the Injury Update page is loaded on a desktop viewport
- **THEN** the system displays a PageHeader with title "Injury Update" and a descriptive subtitle
- **AND** shows a placeholder content area with a message indicating content is coming

#### Scenario: Page renders on mobile
- **WHEN** the Injury Update page is loaded on a narrow viewport
- **THEN** the page content reflows into a single-column layout without horizontal overflow
