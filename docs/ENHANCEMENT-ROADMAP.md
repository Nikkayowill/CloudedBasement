# Clouded Basement — Enhancement Roadmap

_Last updated: February 2026_

## Immediate Priority
- [ ] **Client ENV Variable Management**
  - Allow clients to set custom environment variables for their deployments
  - UI for adding/editing/removing ENV vars
  - Secure injection during build/deploy
- [ ] **Onboarding Wizard UI/UX Improvements**
  - Add guided onboarding flow, progress tracking, and contextual help for new users

## High Priority
- [ ] **Plan Upgrades/Downgrades**
  - Implement upgrade/downgrade flow for subscriptions
  - Prorate charges, update site limits
- [ ] **Password Reset Flow**
  - Add password reset functionality
- [ ] **Email Sending End-to-End Testing**
  - Verify all transactional emails
- [ ] **Privacy Policy & TOS Legal Review**
  - Ensure compliance, add DigitalOcean disclosure
- [ ] **Production Monitoring/Alerts**
  - Integrate Sentry, set up alert notifications
- [ ] **Mobile Device Testing**
  - Test UI on real hardware

## Medium Priority
- [ ] **Billing History Page**
  - Show past invoices, payments, refunds
- [ ] **Usage Metrics Dashboard**
  - Track bandwidth, deployment success, popular frameworks
- [ ] **Backup/Restore Functionality**
  - UI and automation for server/database backups
- [ ] **Upgrade Flow Polish**
  - Smooth upgrade experience, instant site limit increase

## Low Priority
- [ ] **Custom Server Specs**
  - Let users select RAM, CPU, storage
- [ ] **Multiple Servers Per User**
  - Support more than one server per customer
- [ ] **Team Collaboration Features**
  - Invite/manage team members
- [ ] **Delete Site Functionality**
  - Allow users to delete deployments, free up slots
- [ ] **Staging Environments**
  - Add support for staging/test deployments
- [ ] **Honeypot Fields for Bot Prevention**
- [ ] **Request ID Tracking for Debugging**
- [ ] **Subresource Integrity (SRI) for CDN Scripts**
- [ ] **Web Application Firewall (WAF)**
- [ ] **CAPTCHA for Contact/Payment Forms**

## Security & Compliance
- [ ] **Enable Content Security Policy (CSP)**
- [ ] **Add 2FA (TOTP) for Admins/Users**
- [ ] **Webhook Replay Prevention**
- [ ] **Session Binding & Management**
- [ ] **Regular Dependency Audits (npm audit)**
- [ ] **Penetration Testing Before Launch**

## Admin & Automation
- [ ] **Manual Deploy Trigger (Admin UI)**
  - Add button/endpoint for manual deployment
- [ ] **API Layer & Documentation**
  - Add /api routes, Swagger/OpenAPI docs
- [ ] **Monitoring & Logging (Winston, Sentry)**
- [ ] **Automated Backups**
- [ ] **Log Rotation & Disk Monitoring**

## UX & Onboarding
- [ ] **Enhanced UI/UX Design**
- [ ] **Onboarding Wizard Polish**
- [ ] **Homepage/Landing Page Refinements**
- [ ] **Demo Videos & Documentation**

- [ ] **Dashboard Real-Time Server Status & Notifications**
  - Add real-time updates and notification system for server events, deployments, and alerts

## Docker Support (Planned)

Adding Docker support will allow users to deploy custom environments and launch repositories with their own Dockerfiles, similar to Render and Vercel advanced workflows.

**Benefits:**
- Flexible app hosting (any language, framework, or stack)
- Competitive with Render, Railway, and Vercel
- Enables advanced use cases (private repos, custom dependencies, microservices)

**Implementation Plan:**
- UI: Let users upload/link a Dockerfile with their repo
- Backend: Use DigitalOcean API to build/run containers on droplets
- Dashboard: Show Docker build logs, status, and error handling
- Security: Isolate containers, enforce resource limits, prevent privilege escalation
- Resource Management: Track CPU, RAM, storage usage per container
- Stripe: Optionally add pricing for Docker-enabled plans

**Challenges:**
- Container orchestration (start/stop, networking, volumes)
- Secure handling of user images and credentials
- UI/UX for Docker-specific workflows
- Monitoring and scaling

**Competitive Analysis:**
- Render: Full Docker support, easy custom deploys
- Vercel: Docker support for advanced use cases, but not primary workflow
- Railway: Docker support for flexible deployments

**Next Steps:**
- Start with single-container support per user
- Expand to multi-container and orchestration if demand grows
- Gather customer feedback before full rollout

---

## Feature Gap Analysis (Feb 2026)

### Completed/Working
- Trial tracking & warning system: Implemented (subscriptionMonitor.js, trialService.js, email warnings, DB columns, 3-day trial, abuse prevention)
- Stripe webhook robustness: Implemented (webhook security, idempotency, retries, refund automation, error handling, logs, docs)
- Domain management & SSL automation: Implemented (autoSSL.js, sslVerification.js, dashboard UI, background jobs, DNS validation, certbot, status tracking)
- User support/ticketing system: Implemented (dashboardController.js, support_tickets table, email notifications, founder support)
- Audit logging for critical actions: Implemented (admin_audit_log table, auditLog.js, server_update_log, security_events migration)
- Multi-provider email fallback: Implemented (email.js, SendGrid/Gmail/SMTP/Mailtrap, fallback logic, error logging)
- Yearly subscription discounts: Implemented (10% off, pricingController.js, constants.js, UI toggle, Stripe metadata)
- Enhanced input validation/error messaging: Implemented (express-validator, email/domain validation, client/server error messages, disposable email blocking, MX checks)

### Remaining Gaps vs Top Competitors (Cloudways, Railway, Render, Vercel)
- Real-time dashboard metrics (CPU, RAM, bandwidth, disk usage, server health, alerts)
- Advanced onboarding wizard (step-by-step, guided setup, interactive tutorials)
- Accessibility improvements (WCAG compliance, keyboard navigation, ARIA labels, color contrast)
- Multi-region server deployment (NYC, SFO, LON, SGP, user-selectable, backend support)
- Private repo deployment (GitHub OAuth, PAT, secure token storage)
- Team management (invite users, roles, permissions, billing split)
- API access (REST endpoints for server control, domain management, ticketing)
- 24/7 support or SLA-backed support (currently founder-only, no SLA)
- Usage-based billing (metered, pay-as-you-go, not flat-rate)
- Managed database add-ons (Postgres, MongoDB, Redis, one-click provisioning)
- Advanced backup/restore (self-service, point-in-time, dashboard UI)
- Compliance certifications (SOC2, GDPR, PCI, ISO)
- Enterprise features (SSO, audit exports, custom contracts)

### Actionable Next Steps
- Prioritize real-time dashboard metrics (competitive must-have)
- Build advanced onboarding wizard (improves conversion)
- Enhance accessibility (required for enterprise adoption)
- Add multi-region support (backend + UI)
- Plan for private repo deployment (GitHub OAuth)
- Document gaps and roadmap for team management, API, managed DB, advanced backups, compliance

---

## Competitor Comparison (Cloudways, Railway, Render, Vercel)

| Feature                | Clouded Basement | Cloudways | Railway | Render | Vercel |
|-----------------------|:---------------:|:---------:|:-------:|:------:|:------:|
| Flat pricing          |       ✓         |     ✓     |   ✗     |   ✓    |   ✓    |
| Free trial (no card)  |       ✓         |     ✗     |   ✓     |   ✓    |   ✓    |
| Real-time metrics     |       ✗         |     ✓     |   ✓     |   ✓    |   ✓    |
| Automated SSL         |       ✓         |     ✓     |   ✓     |   ✓    |   ✓    |
| Custom domains        |       ✓         |     ✓     |   ✓     |   ✓    |   ✓    |
| Managed DB add-ons    |       ✗         |     ✓     |   ✓     |   ✓    |   ✓    |
| Team management       |       ✗         |     ✓     |   ✓     |   ✓    |   ✓    |
| API access            |       ✗         |     ✓     |   ✓     |   ✓    |   ✓    |
| Private repo deploy   |       ✗         |     ✓     |   ✓     |   ✓    |   ✓    |
| 24/7 support/SLA      |       ✗         |     ✓     |   ✓     |   ✓    |   ✓    |
| Usage-based billing   |       ✗         |     ✗     |   ✓     |   ✓    |   ✓    |
| Compliance certs      |       ✗         |     ✓     |   ✗     |   ✓    |   ✓    |
| Enterprise features   |       ✗         |     ✓     |   ✗     |   ✓    |   ✓    |

---

## Recommendations
- Target real-time dashboard, onboarding wizard, accessibility, multi-region, private repo deploy as next upgrades
- Document and plan for managed DB, team management, API, advanced backups, compliance, enterprise features
- Highlight solo founder support as a differentiator, but consider SLA or faster response for enterprise

## Enhancement Ideas (Review & Confirm Badge)

For each item below, add a badge: **[Review and confirm this isn't already implemented or unused before working on it]**

1. Managed Database Hosting  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Offer built-in managed databases (Postgres, MySQL, MongoDB) with automated backups and dashboard integration.

2. Team/Collaborator Management  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Invite teammates, set roles/permissions, collaborate on deployments and billing.

3. API Access & CLI Tools  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Provide REST API and/or CLI for automating deployments, server management, and CI/CD integration.

4. Advanced Backup & Restore  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Automate server/database backups with one-click restore, retention policies, and user notifications.

5. Multi-region Deployments  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Allow users to choose server regions for lower latency and compliance.

6. Enterprise/Compliance Features  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Add SSO, audit logs, custom SLAs, and compliance certifications (GDPR, SOC2, PCI).

7. Private Repo Deployments  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Support GitHub/GitLab/Bitbucket private repo deployments with OAuth integration.

8. Real-time Monitoring & Alerts  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Integrate real-time server metrics, uptime monitoring, and alerting (email/SMS/webhook).

9. Custom Domain Automation  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Automate domain setup, SSL, DNS records, and renewal reminders.

10. Accessibility & UI Enhancements  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Add accessibility statement, ARIA support, keyboard navigation, and WCAG compliance.

11. Docker Support  
**[Review and confirm this isn't already implemented or unused before working on it]**  
Allow users to deploy custom environments and launch repos with Dockerfiles.