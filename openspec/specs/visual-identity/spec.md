### Requirement: Body font is DM Sans
The application body font SHALL be DM Sans. The `--sn-font-body` CSS variable, `fontFamily.body` Tailwind config, and `@fontsource` imports SHALL all reference DM Sans, not Inter.

#### Scenario: DM Sans loads from bundle
- **WHEN** the application stylesheet is parsed
- **THEN** `@font-face` declarations for DM Sans weights 400, 500, 600, and 700 are present
- **THEN** no `@font-face` declarations for Inter are present

### Requirement: Page background is flat — no decorative gradients
The `<body>` element background SHALL be a flat color (`var(--sn-background)` or equivalent). No radial or linear CSS gradient SHALL be applied to the body element as a decorative effect.

#### Scenario: Body background has no gradient
- **WHEN** the global `body` CSS rule is inspected
- **THEN** the `background` property is a single color value, not a `radial-gradient()` or multi-stop `linear-gradient()`

### Requirement: MetricCard uses tone-specific top border accent
Each `MetricCard` tone variant SHALL render a 2px top border in the tone's accent color instead of a generic rounded card appearance. The border colors SHALL be: primary → `border-primary`, tertiary → `border-tertiary`, error → `border-error`, neutral → `border-on-surface/30`.

#### Scenario: Primary tone MetricCard has amber top border
- **WHEN** a MetricCard with `tone="primary"` is rendered
- **THEN** the card element has a 2px top border in the primary color (`#ffb77d`)

#### Scenario: Neutral tone MetricCard has subtle top border
- **WHEN** a MetricCard with `tone="neutral"` is rendered
- **THEN** the card element has a 2px top border in a muted on-surface color

### Requirement: shadow-glow token is removed
The `shadow-glow` Tailwind box shadow token SHALL NOT exist in `tailwind.config.ts`. No component SHALL reference `shadow-glow` as a utility class.

#### Scenario: shadow-glow absent from config
- **WHEN** `tailwind.config.ts` boxShadow configuration is inspected
- **THEN** there is no `glow` key in the boxShadow extension
