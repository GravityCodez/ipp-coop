# Sample data and sources (Sprint 2)

Everything below is synthetic and invented for the classroom. No real student, employer or university policy is used. The data lives in `src/lib/ai/knowledge.ts`; the Sprint 1 store records (`src/lib/ipp-store.ts`) are unchanged.

## Sources

| Data | Source | Notes |
| --- | --- | --- |
| Approved FAQ v1 (8 questions, FAQ-01 to FAQ-08) | IPP demo rules as built in Sprint 1 (Student, Admin and Faculty views, acceptance tests STU-01 to STU-04), the course group brief's synthetic thread, and the Sprint 2 matching rules | Synthetic classroom policy, not official university policy. Product Owner sign-off pending. |
| Student profiles | Layla Hassan COOP-B001 from the course brief; three invented Sprint 2 fixtures COOP-S201 to COOP-S203 | IDs avoid COOP-B001 to B006, which the class shared database already uses. |
| Listings | OP-026 and OP-027 (Sprint 1 seeds), OP-028 (brief: aviation analytics, Emirates Group, Dubai) and five sample listings OP-S01 to OP-S05 | Sample listings exist only for matching and are not open for applications. |
| Skill vocabulary | Team 1, from the skills named in the brief and the listings | 14 SK- IDs; SK-JIRA-01 follows the brief. |

## Student profiles

| ID | Name | Field interest | Skills as typed (status) | Preferences | Missing or uncertain |
| --- | --- | --- | --- | --- | --- |
| COOP-B001 | Layla Hassan | Data & analytics, Aviation | Python programming (reviewed), SQL (reviewed), Tableau (self-declared), Jira (self-declared, evidence E-JIRA-01 not reviewed) | On-site, Dubai; Summer 2027, 12 weeks | Jira not yet evidenced |
| COOP-S201 | Noah Petrov | Design / UX | UX research (reviewed), Wireframing (self-declared), Figma (reviewed), Public speaking (self-declared) | Remote; Summer 2027, 10 weeks | Preferred location not given |
| COOP-S202 | Mei Tanaka | Software | JavaScript (reviewed), Unit testing (self-declared), GitHub (reviewed), Jira software (self-declared) | none given | Availability, work mode and location missing |
| COOP-S203 | Omar Haddad | Marketing | Presentations, Google Sheets, Social media (all self-declared) | Hybrid, Dubai; 8 weeks | "Social media" not in the vocabulary; eligibility not recorded |

## Listing requirements

| ID | Title | Organization | Field (sector) | Required | Desirable | Origin |
| --- | --- | --- | --- | --- | --- | --- |
| OP-026 | Product Design Intern | Evergreen Labs | Design / UX | User research, Prototyping | Figma, Communication | IPP store |
| OP-027 | Data Analytics Intern | Northstar Analytics | Data & analytics | SQL, Spreadsheets | Data visualization, Python | IPP store |
| OP-028 | Aviation Analytics Intern | Emirates Group | Data & analytics (Aviation) | Python, SQL | Jira, Data visualization | IPP store, once HR-003 submits and the admin approves |
| OP-S01 | Operations Analyst Intern | Sandline Logistics | Data & analytics (Logistics) | Spreadsheets, SQL | Jira | Sample |
| OP-S02 | Software QA Intern | Falconbyte Apps | Software | Software testing, JavaScript | Git, Jira | Sample |
| OP-S03 | Machine Learning Intern | Dune AI Lab | AI / ML | Python, Machine learning | Statistics | Sample |
| OP-S04 | Marketing Insights Intern | Palmgrove Retail | Marketing | Communication, Spreadsheets | Data visualization | Sample |
| OP-S05 | UX Research Intern | Bluewing Travel | Design / UX (Aviation) | User research | Figma, Prototyping | Sample |

A listing an employer adds without skills (any new OP- record) gets requirements inferred from its title and description, and the recommendation says so.

## Data preparation

- Equivalent terms map to one ID: "Python programming", "Python 3" and "pandas" → SK-PY-01; "Tableau", "Power BI" and "dashboards" → SK-VIZ-01; "GitHub" → SK-GIT-01.
- If a skill is typed twice, the stronger status wins (reviewed over self-declared).
- Terms outside the vocabulary are shown as "kept for review" and not used in scoring.
- Self-declared skills count at a lower weight until evidence is reviewed (brief: SK-JIRA-01 stays self-declared until E-JIRA-01 is reviewed).

## Data the chatbot may use

Only the approved FAQ, the selected synthetic profile and the matching output for that profile. The browser sends the approved IPP listings so the server can rank them; the server trims and validates every field. The chat panel tells users not to type real personal information.
