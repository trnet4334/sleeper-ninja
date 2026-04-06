## MODIFIED Requirements

### Requirement: System reproduces the approved prototype shell and page hierarchy
The system SHALL reproduce the application shell, navigation hierarchy, major content sections, and visual language defined in `prototype/UIUX/dashboard.html` and `prototype/UIUX/DESIGN.md` as the baseline user experience for the web app. The SideNavBar SHALL include a **News** section positioned between the Tools and Config sections, containing Prospects News and Injury Update navigation items.

#### Scenario: User opens the dashboard on desktop
- **WHEN** a user loads the web application on a desktop viewport
- **THEN** the system renders a left navigation rail, editorial page header hierarchy, and major data modules aligned to the approved prototype structure
- **AND** the SideNavBar displays a News section between Tools and Config with Prospects News and Injury Update items

#### Scenario: User navigates between primary pages
- **WHEN** a user changes pages within the dashboard shell
- **THEN** the system preserves the shared shell, visual hierarchy, and design tokens across pages

#### Scenario: User navigates to a News page from the sidebar
- **WHEN** the user clicks Prospects News or Injury Update in the SideNavBar
- **THEN** the system highlights the active nav item and renders the corresponding page within the app shell
