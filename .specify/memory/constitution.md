<!--
Sync Impact Report
- Version change: [CONSTITUTION_VERSION] → 1.0.0
- Modified principles: N/A (initial adoption)
- Added sections: Core Principles, Architecture & Engineering Standards, API Design & Error Handling, Security & Versioning, Governance
- Removed sections: N/A
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (removed reference to non-existent .specify/templates/commands/plan.md)
  - ✅ .specify/templates/spec-template.md (no update required)
  - ✅ .specify/templates/tasks-template.md (no update required)
  - ✅ .specify/templates/checklist-template.md (no update required)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Set the original ratification date once the team formally adopts this constitution.
-->

# Employee Management System Constitution

## Core Principles

### I. Contract-First API Design (OpenAPI is the Source of Truth)
All backend REST endpoints MUST be defined in `openapi.yaml` first, including:

- Request/response schemas
- Validation constraints (as far as OpenAPI supports)
- Error responses and status codes
- Pagination/query parameters for list endpoints

Implementation (Spring Controllers/DTOs) MUST conform to the contract. The frontend (Axios clients) MUST be built against the same contract and MUST NOT rely on undocumented fields.

### II. Clean Layered Architecture (Controller → Service → Repository)
The backend MUST follow a clean layered architecture:

- Controllers handle HTTP concerns only (routing, request mapping, status codes)
- Services own business logic and transaction boundaries
- Repositories own persistence concerns via Spring Data JPA

Controllers MUST NOT access repositories directly. Repositories MUST NOT contain business rules.

### III. Consistent Validation at Every Boundary
Validation MUST exist in both frontend and backend:

- Frontend: validate user inputs before making API calls (e.g., required fields, formats, ranges)
- Backend: validate all inputs regardless of frontend validation (Bean Validation on DTOs)

Backend validation errors MUST be returned using the standard error structure defined in this constitution.

### IV. Standardized Error Responses (No Leaky Exceptions)
All API errors MUST follow a consistent JSON shape (defined below). No endpoint may return raw stack traces or framework default error payloads.

Errors MUST be mapped via centralized exception handling (Spring `@ControllerAdvice`).

### V. Security and Role-Based Access are Non-Negotiable
Role-based access control MUST be enforced on the backend for every protected endpoint using Spring Security (JWT-based):

- `ADMIN`
- `HR`
- `EMPLOYEE`

The frontend MUST implement role-aware navigation/feature gating, but the backend remains the ultimate authority.

## Architecture & Engineering Standards

### Technology Stack (Authoritative)
The system MUST use:

- Frontend: React (latest), Axios, MUI
- Backend: Java 17, Spring Boot, Spring Data JPA
- Database: MySQL
- API Documentation: OpenAPI 3 (`openapi.yaml`)
- Environment-based configuration for API base URLs and secrets

Frontend and backend MUST live in separate repositories.

### Logging and Observability
Backend MUST implement structured, level-appropriate logging:

- `INFO`: business lifecycle events (e.g., employee created, leave request submitted)
- `WARN`: recoverable issues (e.g., validation failures, access denied)
- `ERROR`: unexpected failures and exception handlers

Logs MUST NOT include sensitive data (passwords, full tokens, secrets, or unnecessary PII).

### Pagination for List APIs
Any endpoint returning a collection MUST support pagination.

- Requests MUST accept `page` (0-based) and `size` parameters (or an explicitly defined alternative)
- Responses MUST return pagination metadata in a consistent form (defined in `openapi.yaml`)

### Data Access and Transactions
Services SHOULD define transaction boundaries (e.g., `@Transactional`). Repositories MUST remain focused on persistence operations.

## API Design & Error Handling

### REST API Design Guidelines
- Resource naming MUST be nouns and plural (e.g., `/employees`, `/departments`)
- Use standard HTTP verbs and status codes consistently
- Use `PUT` for full replacement and `PATCH` for partial updates (if exposed)
- Avoid breaking changes without a version bump and migration plan

### Error Response Structure (Canonical)
All errors MUST conform to this structure (exact property names):

```json
{
  "timestamp": "2026-01-31T12:34:56Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "path": "/api/v1/employees",
  "correlationId": "c0a8012e-7b7d-4b6b-9c43-7c5e0d1e8a2f",
  "details": [
    { "field": "email", "issue": "must be a well-formed email address" }
  ]
}
```

Rules:

- `code` MUST be a stable, documented enum-like identifier
- `details` MUST be present for validation errors and MAY be omitted otherwise
- `correlationId` MUST be generated/propagated per request (from header if provided, otherwise generated)

### Exception Handling Strategy
Backend MUST use centralized exception handling:

- `@ControllerAdvice` to map exceptions to the canonical error structure
- Standard mappings for: validation errors, not found, conflicts, access denied, and unexpected errors
- Unexpected errors MUST map to `500` with a non-sensitive `message`

## Security & Versioning

### Authentication and Authorization
Backend security MUST be implemented with Spring Security and JWT:

- Authenticate users and issue JWTs (access token)
- JWT MUST include role claims used for authorization
- Endpoints MUST enforce role constraints via method or route security annotations

JWT handling rules:

- Tokens MUST be validated on every request
- Token secrets/keys MUST be environment-configured and never committed

### Frontend Environment Configuration
Frontend MUST read API base URL from environment-based configuration (e.g., `.env.*`). Axios configuration MUST reference this variable.

### Versioning Strategy
APIs MUST be versioned in the path (e.g., `/api/v1`).

- Backward-compatible additions bump MINOR (e.g., `v1.1` conceptually; path may remain `/v1` if policy is additive-only)
- Breaking changes require a new major path (e.g., `/api/v2`) or explicit deprecation + migration window

The constitution itself uses semantic versioning:

- MAJOR: principle removal or governance breaking change
- MINOR: new principle/section or material expansion of constraints
- PATCH: clarifications and non-semantic edits

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution supersedes local conventions and informal practices.

### Amendment Process
Changes MUST be proposed via a documented change (PR/MR) that includes:

- Rationale for change
- Impact assessment (what existing work/practices are affected)
- Migration plan (if any change affects existing APIs or architecture)

Approval requires review from designated project maintainers/tech leads.

### Compliance Expectations
All feature specifications and implementation plans MUST include a “Constitution Check” section and explicitly confirm:

- OpenAPI contract is defined/updated (`openapi.yaml`)
- Validation exists frontend + backend
- Pagination present for list endpoints
- Error responses match the canonical structure
- Role-based access is enforced

### Documentation Authority
`openapi.yaml` is the authoritative API contract. Any API behavior not captured in `openapi.yaml` is considered undefined and MUST be documented before release.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Set when formally adopted | **Last Amended**: 2026-01-31
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
