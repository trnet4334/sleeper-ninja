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

### Requirement: System supports responsive dashboard layouts
The system SHALL adapt the approved prototype layout for tablet and mobile viewports without removing core navigation, league switching, or primary page functionality.

#### Scenario: User opens the dashboard on mobile
- **WHEN** a user loads the web application on a narrow viewport
- **THEN** the system reflows navigation and page modules into a mobile-safe layout
- **AND** keeps page navigation, league switching, and key page actions accessible without horizontal app-level overflow

#### Scenario: Dense desktop modules collapse on smaller screens
- **WHEN** a prototype-derived table, grid, or comparison module no longer fits the current viewport
- **THEN** the system applies a defined responsive variant such as stacked cards, horizontal scrollers, or condensed controls
- **AND** preserves the underlying task flow for that page

### Requirement: System provides installable PWA capabilities
The system SHALL ship as an installable progressive web app with manifest metadata, icons, service worker registration, and shell-first asset caching.

#### Scenario: Browser recognizes installability
- **WHEN** a supported browser evaluates the deployed application
- **THEN** the system exposes valid manifest and icon metadata
- **AND** qualifies for browser install prompts or equivalent add-to-home-screen flows

#### Scenario: User relaunches the installed app
- **WHEN** a user opens the installed PWA after an initial successful load
- **THEN** the system loads the application shell from cached assets
- **AND** continues to fetch live data through network-backed API requests when connectivity is available
