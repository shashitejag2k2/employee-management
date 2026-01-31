---

description: "Task list for Employee Management System implementation"
---

# Tasks: Employee Management System

**Input**: Design documents from `/specs/master/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included (explicitly requested).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Repo structure assumed for execution:
  - `backend/` (Spring Boot)
  - `frontend/` (React)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create repo folders `backend/` and `frontend/` at repository root
- [X] T002 Initialize Spring Boot project in `backend/` (Java 17, Maven, Web, Validation, Security, Data JPA, MySQL Driver)
- [ ] T003 Initialize React project in `frontend/` (Vite + React) and verify dev server boots
- [ ] T004 [P] Add `.env.example` for backend in `backend/.env.example` (DB URL, DB user, DB password, JWT secret)
- [ ] T005 [P] Add `.env.example` for frontend in `frontend/.env.example` (`VITE_API_BASE_URL`)
- [ ] T006 [P] Add formatting/linting: backend (Spotless or Checkstyle) and frontend (ESLint + Prettier)
- [ ] T007 [P] Add basic README placeholders in `backend/README.md` and `frontend/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Define backend package structure in `backend/src/main/java/...` (controller/service/repository/dto/entity/security/exception/config)
- [ ] T009 Configure MySQL connection + profiles in `backend/src/main/resources/application.yml` and `backend/src/main/resources/application-dev.yml`
- [ ] T010 Setup DB migrations (Flyway) and baseline migration in `backend/src/main/resources/db/migration/V1__init.sql`
- [X] T011 Implement standard error response model in `backend/src/main/java/.../exception/ErrorResponse.java` and `ErrorDetail.java`
- [X] T012 Implement global exception handler `@ControllerAdvice` in `backend/src/main/java/.../exception/GlobalExceptionHandler.java`
- [X] T013 Implement request correlation ID filter in `backend/src/main/java/.../config/CorrelationIdFilter.java`
- [ ] T014 Implement consistent logging configuration in `backend/src/main/resources/logback-spring.xml`
- [ ] T015 Add OpenAPI serving in backend via springdoc-openapi and configure at `backend/src/main/java/.../config/OpenApiConfig.java`
- [ ] T016 Create `contracts/openapi.yaml` under `specs/master/contracts/openapi.yaml` as a copied source-of-truth reference to repo root `openapi.yaml`
- [ ] T017 Decide contract-first generation approach and wire it:
  - option A: generate Spring interfaces from `openapi.yaml` using openapi-generator
  - option B: keep `openapi.yaml` and manually implement controllers while validating in CI
  Implement chosen approach in `backend/pom.xml`
- [ ] T018 Setup backend test dependencies in `backend/pom.xml` (JUnit5, Spring Boot Test, Testcontainers for MySQL)
- [X] T019 Setup frontend API base Axios client in `frontend/src/services/httpClient.ts` reading `import.meta.env.VITE_API_BASE_URL`
- [X] T020 Setup frontend routing skeleton in `frontend/src/router/index.tsx` (React Router)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authenticate and access the system (Priority: P1) 🎯 MVP

**Goal**: Users can register/login and access protected routes/APIs according to role.

**Independent Test**: Login returns JWT; calling `GET /employees` without JWT returns standardized 401; UI blocks protected routes.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T021 [P] [US1] Backend contract tests for `/auth/login` and `/auth/register` against `openapi.yaml` in `backend/src/test/java/.../contract/AuthContractTest.java`
- [ ] T022 [P] [US1] Backend security integration test: protected endpoint requires JWT in `backend/src/test/java/.../security/JwtSecurityIT.java`
- [ ] T023 [P] [US1] Frontend unit test for auth token storage helper in `frontend/src/services/authStorage.test.ts`

### Implementation for User Story 1

Backend (Auth + JWT):

- [ ] T024 [P] [US1] Create `User`/`AuthUser` entity for authentication in `backend/src/main/java/.../entity/AuthUser.java`
- [ ] T025 [P] [US1] Create `AuthUserRepository` in `backend/src/main/java/.../repository/AuthUserRepository.java`
- [ ] T026 [P] [US1] Create auth DTOs `LoginRequest`, `RegisterRequest`, `AuthResponse` in `backend/src/main/java/.../dto/auth/`
- [ ] T027 [US1] Implement password hashing + user creation in `backend/src/main/java/.../service/AuthService.java`
- [ ] T028 [P] [US1] Implement JWT utilities in `backend/src/main/java/.../security/JwtService.java`
- [ ] T029 [P] [US1] Implement JWT authentication filter in `backend/src/main/java/.../security/JwtAuthenticationFilter.java`
- [ ] T030 [US1] Configure Spring Security chain and role mapping in `backend/src/main/java/.../security/SecurityConfig.java`
- [ ] T031 [US1] Implement Auth controller endpoints in `backend/src/main/java/.../controller/AuthController.java`
- [ ] T032 [US1] Ensure validation annotations exist on auth DTOs and validation errors return canonical error response

Frontend (Auth flow + protected routes):

- [ ] T033 [P] [US1] Implement auth API client in `frontend/src/services/authApi.ts` (login/register)
- [ ] T034 [P] [US1] Implement auth storage (token + role) in `frontend/src/services/authStorage.ts`
- [ ] T035 [P] [US1] Implement Axios auth interceptor for bearer token in `frontend/src/services/httpClient.ts`
- [ ] T036 [P] [US1] Create login page in `frontend/src/pages/LoginPage.tsx`
- [ ] T037 [P] [US1] Create register page in `frontend/src/pages/RegisterPage.tsx`
- [ ] T038 [US1] Implement protected route wrapper in `frontend/src/router/ProtectedRoute.tsx`
- [ ] T039 [US1] Add app routes (public + protected) in `frontend/src/router/index.tsx`
- [ ] T040 [US1] Add global error + loading UI primitives: `frontend/src/components/ToastProvider.tsx`, `frontend/src/components/LoadingOverlay.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Manage employees (Priority: P1)

**Goal**: HR/Admin can CRUD employees; list employees with server-side pagination and filters.

**Independent Test**: HR creates employee and then lists employees with `page`/`size` and filter by `departmentId`.

### Tests for User Story 2 ⚠️

- [ ] T041 [P] [US2] Backend contract tests for `/employees` and `/employees/{id}` in `backend/src/test/java/.../contract/EmployeeContractTest.java`
- [ ] T042 [P] [US2] Backend service unit tests for employee rules in `backend/src/test/java/.../service/EmployeeServiceTest.java`
- [ ] T043 [P] [US2] Frontend component tests for Employee list query/pagination mapping in `frontend/src/pages/EmployeeListPage.test.tsx`

### Implementation for User Story 2

Backend (Entity/Repo/Service/Controller + validation):

- [ ] T044 [P] [US2] Create `EmployeeStatus` enum in `backend/src/main/java/.../entity/EmployeeStatus.java`
- [ ] T045 [P] [US2] Create `EmployeeRole` enum in `backend/src/main/java/.../entity/EmployeeRole.java`
- [ ] T046 [P] [US2] Create `Employee` JPA entity in `backend/src/main/java/.../entity/Employee.java`
- [ ] T047 [P] [US2] Create `Department` JPA entity (minimal for FK) in `backend/src/main/java/.../entity/Department.java`
- [ ] T048 [P] [US2] Create `EmployeeRepository` in `backend/src/main/java/.../repository/EmployeeRepository.java` (filters: departmentId, role, status)
- [ ] T049 [P] [US2] Create DTOs in `backend/src/main/java/.../dto/employee/` (`EmployeeResponse`, `EmployeeCreateRequest`, `EmployeeUpdateRequest`)
- [ ] T050 [P] [US2] Implement mapper in `backend/src/main/java/.../mapper/EmployeeMapper.java`
- [ ] T051 [US2] Implement `EmployeeService` in `backend/src/main/java/.../service/EmployeeService.java` (create/list/get/update/softDelete)
- [ ] T052 [US2] Implement `EmployeeController` in `backend/src/main/java/.../controller/EmployeeController.java` with pagination and filters
- [ ] T053 [US2] Add method-level security annotations for HR/Admin for create/update/delete and appropriate access for view endpoints
- [ ] T054 [US2] Ensure duplicate email returns `409` using canonical error response


Frontend (Pages + DataGrid + forms):

- [X] T055 [P] [US2] Implement employee API client in `frontend/src/services/employeeApi.ts`
- [X] T056 [P] [US2] Implement Employee List page with MUI DataGrid server pagination in `frontend/src/pages/EmployeeListPage.tsx`
- [ ] T057 [P] [US2] Implement Employee filters UI (departmentId, role, status) in `frontend/src/components/EmployeeFilters.tsx`
- [X] T058 [P] [US2] Implement Employee create/edit form with validation in `frontend/src/pages/EmployeeFormPage.tsx`
- [ ] T059 [P] [US2] Implement reusable form components (TextField wrappers, select for role/status) in `frontend/src/components/forms/`
- [X] T060 [US2] Wire navigation routes for employee pages in `frontend/src/router/index.tsx`
- [ ] T061 [US2] Add role-based UI visibility for employee actions (e.g., hide Create/Edit for EMPLOYEE) in `frontend/src/components/RoleGate.tsx`
- [ ] T062 [US2] Add centralized API error toasts (map backend `ErrorResponse.code`) in `frontend/src/services/errorHandling.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Manage departments (Priority: P2)

**Goal**: HR/Admin can CRUD departments; frontend manages departments and uses them for employee filters/forms.

**Independent Test**: Admin creates a department then lists it; employee create form can pick a department.

### Tests for User Story 3 ⚠️

- [ ] T063 [P] [US3] Backend contract tests for `/departments` and `/departments/{id}` in `backend/src/test/java/.../contract/DepartmentContractTest.java`
- [ ] T064 [P] [US3] Backend service unit tests for department behavior in `backend/src/test/java/.../service/DepartmentServiceTest.java`
- [ ] T065 [P] [US3] Frontend component tests for department page in `frontend/src/pages/DepartmentPage.test.tsx`

### Implementation for User Story 3

Backend:

- [ ] T066 [P] [US3] Create `DepartmentRepository` in `backend/src/main/java/.../repository/DepartmentRepository.java`
- [ ] T067 [P] [US3] Create department DTOs in `backend/src/main/java/.../dto/department/` (`DepartmentResponse`, `DepartmentCreateRequest`, `DepartmentUpdateRequest`)
- [ ] T068 [P] [US3] Implement mapper in `backend/src/main/java/.../mapper/DepartmentMapper.java`
- [ ] T069 [US3] Implement `DepartmentService` in `backend/src/main/java/.../service/DepartmentService.java` (create/list/get/update/delete)
- [ ] T070 [US3] Implement `DepartmentController` in `backend/src/main/java/.../controller/DepartmentController.java` with pagination
- [ ] T071 [US3] Add role-based authorization (HR/Admin) for department mutation endpoints
- [ ] T072 [US3] Add referential integrity behavior (prevent deletion if employees exist OR allow soft delete) and document choice via standardized `409` errors

Frontend:

- [ ] T073 [P] [US3] Implement department API client in `frontend/src/services/departmentApi.ts`
- [ ] T074 [P] [US3] Implement department management page in `frontend/src/pages/DepartmentPage.tsx` (list/create/edit/delete)
- [ ] T075 [P] [US3] Implement department dialog/form with validation in `frontend/src/components/DepartmentDialog.tsx`
- [ ] T076 [US3] Integrate departments into employee filters and employee form (load options, handle loading/errors)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T077 [P] Add backend integration tests with Testcontainers MySQL in `backend/src/test/java/.../integration/`
- [ ] T078 Improve backend pagination response consistency and ensure it matches `openapi.yaml`
- [ ] T079 Add backend API logging for key operations (create/update/delete) ensuring no sensitive fields are logged
- [ ] T080 [P] Add frontend global loading states for all API calls (hook or wrapper) in `frontend/src/hooks/useAsync.ts`
- [ ] T081 [P] Add frontend form-level validation messages and consistent error UI in `frontend/src/components/forms/FormError.tsx`
- [ ] T082 Ensure CORS is configured properly in `backend/src/main/java/.../config/CorsConfig.java`

Deployment:

- [ ] T083 Add backend Dockerfile in `backend/Dockerfile` and `backend/.dockerignore`
- [ ] T084 Add frontend Dockerfile in `frontend/Dockerfile` and `frontend/.dockerignore` (multi-stage build)
- [ ] T085 Add `docker-compose.yml` at repo root for MySQL + backend (+ optional frontend)
- [ ] T086 Add environment configuration documentation in `docs/environment.md`

OpenAPI & Docs:

- [ ] T087 Ensure swagger-ui endpoint is available in backend and link it from `backend/README.md`
- [ ] T088 Add CI check that `openapi.yaml` exists and is valid (lint step) in `.github/workflows/ci.yml`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 and US2 are both P1, but US1 is a practical dependency for end-to-end testing
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Establishes auth/JWT required by protected APIs
- **User Story 2 (P1)**: Depends on US1 for secure access; can be developed in parallel after Phase 2 but tested end-to-end after US1
- **User Story 3 (P2)**: Can be developed in parallel after Phase 2; integrates into US2 UI/filters for best UX

### Parallel Opportunities

- Tasks marked **[P]** can run in parallel
- Backend and frontend tasks can proceed in parallel after Phase 2

---

## Parallel Example: User Story 2

```bash
# Parallelize backend DTOs/mappers/entities:
Task: "Create Employee JPA entity in backend/src/main/java/.../entity/Employee.java"
Task: "Create EmployeeRepository in backend/src/main/java/.../repository/EmployeeRepository.java"
Task: "Create Employee DTOs in backend/src/main/java/.../dto/employee/"

# Parallelize frontend page + API client:
Task: "Implement employee API client in frontend/src/services/employeeApi.ts"
Task: "Implement Employee List page in frontend/src/pages/EmployeeListPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm JWT auth + protected route behavior

### Incremental Delivery

1. Add User Story 2 and validate employee create + list
2. Add User Story 3 and validate department management + integration in employee UI
3. Perform Phase 6 polish + deployment
