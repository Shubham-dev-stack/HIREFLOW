import { Candidate, Requirement, ValidationItem, AuditEvent } from '../types';

export const INITIAL_ROLE = {
  title: "Senior Backend Engineer",
  department: "Core Platform Engineering",
  location: "Remote / Hybrid (San Francisco, CA)",
  description: `We are looking for a Senior Backend Engineer to join our Core Platform team. In this role, you will design, build, and maintain high-throughput distributed microservices, architect database schemas for transactional integrity, and lead engineering best practices across the team.

Key Responsibilities:
• Build resilient, low-latency backend services utilizing Python (FastAPI/AsyncIO) and distributed caching.
• Design, optimize, and maintain relational databases (PostgreSQL) and structured querying patterns at scale.
• Architect robust RESTful APIs with comprehensive rate limiting, pagination, and OpenAPI contracts.
• Lead system design initiatives for distributed services handling millions of concurrent requests with 99.99% uptime SLAs.
• Institute rigorous testing practices (unit, integration, load/stress testing) to ensure continuous deployment safety.
• Foster technical excellence through code reviews, architectural RFCs, and mentoring junior/mid-level engineers.`
};

export const INITIAL_EXTRACTED_REQUIREMENTS: Requirement[] = [
  {
    id: "req-1",
    name: "Python",
    importance: "Critical",
    status: "SUPPORTED",
    evidence: "Built backend services using Python and FastAPI with async I/O routines.",
    source: "Alex_Morgan_Resume.pdf",
    sourceLocation: "Page 2 — Experience at CloudScale Systems",
    snippet: "Led core backend development in Python 3.11 using FastAPI and SQLAlchemy; transitioned legacy synchronous endpoints to async coroutines.",
    reasoning: "Candidate demonstrates 4+ years of professional production Python experience, specifically with modern async frameworks (FastAPI) and clean architecture.",
    evidenceType: "corroborated",
    corroboratedCount: 2,
    claimedCount: 1,
    provenance: "heuristic"
  },
  {
    id: "req-2",
    name: "SQL",
    importance: "Critical",
    status: "SUPPORTED",
    evidence: "PostgreSQL experience across backend projects with query tuning and index optimization.",
    source: "Alex_Morgan_Resume.pdf",
    sourceLocation: "Page 2 — Experience at CloudScale Systems",
    snippet: "Managed PostgreSQL cluster schemas, optimized slow analytical queries reducing p99 latency by 35%, and wrote complex migration scripts.",
    reasoning: "Direct evidence of schema design, index optimization, query execution plan analysis, and database migrations in production environments.",
    evidenceType: "corroborated",
    corroboratedCount: 2,
    claimedCount: 0,
    provenance: "heuristic"
  },
  {
    id: "req-3",
    name: "API Design",
    importance: "High",
    status: "SUPPORTED",
    evidence: "Designed and implemented 15+ RESTful endpoints for customer account management using FastAPI.",
    source: "Alex_Morgan_Resume.pdf",
    sourceLocation: "Page 2 — Experience at CloudScale Systems",
    snippet: "Designed and implemented 15+ RESTful endpoints for customer account management using FastAPI, Pydantic validation, and OpenAPI specs.",
    reasoning: "Verified standard RESTful API contracts, validation pipelines, and OpenAPI documentation.",
    evidenceType: "corroborated",
    corroboratedCount: 1,
    claimedCount: 1,
    provenance: "heuristic"
  },
  {
    id: "req-4",
    name: "System Design",
    importance: "Critical",
    status: "UNKNOWN",
    evidence: "No concrete evidence of large-scale architecture or distributed systems in submitted records.",
    source: "No sufficient source",
    sourceLocation: "Unverified across Resume.pdf & Readme.pdf",
    snippet: "Designed backend services using FastAPI and PostgreSQL.",
    gapReasoning: "The source demonstrates backend development experience, but does not provide enough evidence about scalability, distributed systems, architectural trade-offs, or failure handling.",
    reasoning: "Insufficient evidence found to determine candidate's ability to handle high-concurrency microservices, distributed caching, data sharding, or disaster recovery.",
    evidenceType: "self_claimed",
    corroboratedCount: 0,
    claimedCount: 1,
    provenance: "heuristic"
  },
  {
    id: "req-5",
    name: "Testing Strategy",
    importance: "High",
    status: "PARTIAL",
    evidence: "Tech stack mentions Pytest, but lacks comprehensive test pyramid strategy documentation.",
    source: "Alex_Morgan_Resume.pdf",
    sourceLocation: "Page 3 — Technical Skills & Tooling",
    snippet: "Technical Skills: Python, FastAPI, Postgres, Redis, Pytest, Docker, Git.",
    gapReasoning: "Resume mentions Pytest tooling, but lacks descriptive evidence of integration testing, network fault mocking, or load testing discipline.",
    reasoning: "Partial evidence: basic unit test tool familiarity established, but automated integration and reliability testing strategies remain unverified.",
    evidenceType: "self_claimed",
    corroboratedCount: 0,
    claimedCount: 1,
    provenance: "heuristic"
  },
  {
    id: "req-6",
    name: "Leadership",
    importance: "Medium",
    status: "CONFLICT",
    evidence: "Conflicting evidence between resume claim of team leadership and interview notes indicating individual contributor scope.",
    source: "Multiple Sources (Conflict)",
    sourceLocation: "Resume (Page 1) vs Interview Notes",
    snippet: "Resume claims 'Led a team of 10' whereas interview transcript indicates 'Worked as individual contributor'.",
    gapReasoning: "Contradictory evidence detected across candidate submissions. Requires qualitative debrief discussion.",
    reasoning: "HireFlow does not choose between contradicting sources. It surfaces the conflict for human review.",
    evidenceType: "self_claimed",
    corroboratedCount: 1,
    claimedCount: 1,
    provenance: "heuristic",
    conflictSnippets: [
      {
        source: "Alex_Morgan_Resume.pdf",
        sourceLocation: "Page 1 — Experience Summary",
        snippet: "Led a team of 10 backend and frontend engineers building core payments microservices.",
        type: "self_claimed",
        label: "Candidate Resume Claim"
      },
      {
        source: "Initial_Screen_Transcript.pdf",
        sourceLocation: "Interviewer Notes — Section 2",
        snippet: "Worked as individual contributor on payments core without direct engineering reports.",
        type: "corroborated",
        label: "Verified Interview Screen"
      }
    ]
  },
  {
    id: "req-7",
    name: "Cloud Infrastructure",
    importance: "Medium",
    status: "UNKNOWN",
    evidence: "No direct AWS or GCP production deployment records cited in resume.",
    source: "No sufficient source",
    sourceLocation: "Unverified across Resume.pdf",
    snippet: "Docker containerization referenced in tooling section.",
    gapReasoning: "Candidate documents mention Docker containers, but lack specific evidence of managing cloud infrastructure, IAM policies, or VPC networks.",
    reasoning: "Awaiting candidate verification for cloud infrastructure provisioning and production orchestration.",
    evidenceType: "self_claimed",
    corroboratedCount: 0,
    claimedCount: 1,
    provenance: "heuristic"
  },
  {
    id: "req-8",
    name: "CI/CD & DevOps",
    importance: "Low",
    status: "SUPPORTED",
    evidence: "Git version control and automated GitHub Actions CI workflow referenced in project repository.",
    source: "Backend_Project_Readme.pdf",
    sourceLocation: "Page 1 — Repository Automation",
    snippet: "Configured GitHub Actions CI pipeline running linting, formatting, and unit test suites on every pull request.",
    reasoning: "Direct evidence of CI workflow definition and version control hygiene.",
    evidenceType: "corroborated",
    corroboratedCount: 1,
    claimedCount: 0,
    provenance: "heuristic"
  }
];

export const INITIAL_CANDIDATE: Candidate = {
  id: "cand-alex-morgan",
  name: "Alex Morgan",
  targetRole: "Senior Backend Engineer",
  documents: [
    {
      id: "doc-1",
      name: "Alex_Morgan_Resume.pdf",
      type: "PDF Document",
      size: "248 KB",
      pages: 3,
      uploadTime: "Today at 10:43 AM",
      isPrimary: true
    },
    {
      id: "doc-2",
      name: "Backend_Project_Readme.pdf",
      type: "PDF Document",
      size: "112 KB",
      pages: 2,
      uploadTime: "Today at 10:44 AM",
      isPrimary: false
    }
  ],
  interviewNotes: "Initial recruiter screen completed. Strong verbal communication and enthusiasm for Python/FastAPI ecosystem.",
  portfolioUrl: "github.com/alexmorgan-dev"
};

export const INITIAL_VALIDATION: ValidationItem = {
  id: "val-sys-design-1",
  requirementId: "req-4",
  requirementName: "System Design",
  title: "System Design Scenario Validation",
  scenario: "Design a backend architecture for a service handling approximately 1 million daily requests with high read-to-write ratios, strict latency requirements (p99 < 80ms), and automated failover.",
  evaluationAreas: [
    {
      area: "Scalability",
      description: "Horizontal scaling of stateless application nodes behind balanced reverse proxies."
    },
    {
      area: "API Architecture",
      description: "Clean separation of public API gateways and internal service boundaries."
    },
    {
      area: "Database Decisions",
      description: "Relational persistence with read-replicas, connection pooling, and transactional integrity."
    },
    {
      area: "Caching Strategy",
      description: "Multi-tier caching (Redis/In-memory) with write-through or cache-aside invalidation."
    },
    {
      area: "Failure Handling",
      description: "Circuit breakers, graceful degradation, and retry queues with exponential backoff."
    }
  ],
  rationale: "System Design is a critical requirement and currently has insufficient evidence. A focused architecture scenario directly tests the missing evidence without requiring an exhaustive 2-hour interview.",
  estimatedTime: "5 minutes",
  defaultResponse: `The service would use stateless API servers behind a load balancer (e.g. AWS ALB or Nginx). PostgreSQL would store transactional data with read-replicas to offload query volume, Redis would handle frequently accessed data via a cache-aside pattern, and asynchronous processing (Celery/SQS) would be used for non-critical background workloads. The architecture supports horizontal scaling and incorporates circuit breakers with fallback responses for graceful failure during downstream degradations.`,
  candidateResponse: `The service would use stateless API servers behind a load balancer (e.g. AWS ALB or Nginx). PostgreSQL would store transactional data with read-replicas to offload query volume, Redis would handle frequently accessed data via a cache-aside pattern, and asynchronous processing (Celery/SQS) would be used for non-critical background workloads. The architecture supports horizontal scaling and incorporates circuit breakers with fallback responses for graceful failure during downstream degradations.`,
  evaluated: false,
  resultEvidence: "Candidate demonstrated clear understanding of horizontal scaling, caching (Redis cache-aside), database read-replica partitioning, and circuit-breaker failure handling.",
  resultSource: "Architecture Validation #VAL-01",
  resultReasoning: "Response directly resolves the uncertainty around distributed microservices and scalability. All 5 core evaluation areas were coherently addressed with concrete architectural choices."
};

export const SECONDARY_VALIDATION: ValidationItem = {
  id: "val-testing-1",
  requirementId: "req-5",
  requirementName: "Testing Strategy",
  title: "Testing & Reliability Validation",
  scenario: "Describe how you would design an automated testing strategy for a payment processing and ledger update API to prevent regressions and handle transient third-party payment gateway outages.",
  evaluationAreas: [
    {
      area: "Unit vs Integration Ratio",
      description: "Layered test pyramid separating pure business logic from external I/O."
    },
    {
      area: "Mocking & Fixtures",
      description: "Deterministic mocking of third-party payment provider webhooks and HTTP calls."
    },
    {
      area: "Contract Testing",
      description: "Schema verification using consumer-driven contract tests."
    },
    {
      area: "Load & Concurrency Tests",
      description: "Race condition verification on ledger balance mutations using concurrent test runners."
    }
  ],
  rationale: "Testing Strategy is currently PARTIAL with no detailed test pyramid evidence in the resume. This 4-minute check tests production safety mindset.",
  estimatedTime: "4 minutes",
  defaultResponse: `I implement a strict test pyramid: fast Pytest unit tests for ledger calculation math, and testcontainers with PostgreSQL for integration tests to verify database constraints. Third-party gateway APIs are mocked using VCR.py/responses with deterministic error codes (e.g. 504 Gateway Timeout, 429 Rate Limit) to test retry logic. Before release, a Locust script validates concurrent ledger debit transactions to ensure row-level locking prevents race conditions.`,
  candidateResponse: `I implement a strict test pyramid: fast Pytest unit tests for ledger calculation math, and testcontainers with PostgreSQL for integration tests to verify database constraints. Third-party gateway APIs are mocked using VCR.py/responses with deterministic error codes (e.g. 504 Gateway Timeout, 429 Rate Limit) to test retry logic. Before release, a Locust script validates concurrent ledger debit transactions to ensure row-level locking prevents race conditions.`,
  evaluated: false,
  resultEvidence: "Candidate articulated a comprehensive test strategy covering unit test isolation, containerized DB integration tests, network fault mocking, and concurrency race-condition testing.",
  resultSource: "Testing Strategy Validation #VAL-02",
  resultReasoning: "Direct evidence confirms candidate's high testing standard and risk mitigation practices."
};

export const INITIAL_AUDIT_TRAIL: AuditEvent[] = [
  {
    id: "audit-1",
    timestamp: "10:42 AM",
    title: "Job description analyzed",
    category: "ROLE",
    source: "Role Setup Input",
    evidence: "Senior Backend Engineer role description submitted for Core Platform.",
    reasoning: "System parsed key technical proficiencies, role scope, and core competencies.",
    nextAction: "Extract prioritized technical requirements",
    user: "Sarah Jenkins (Lead Recruiter)"
  },
  {
    id: "audit-2",
    timestamp: "10:44 AM",
    title: "Requirements extracted",
    category: "ROLE",
    source: "Role Description Parser",
    evidence: "Requirements extracted: Python (Critical), SQL (Critical), API Design (High), System Design (Critical), Testing Strategy (High), Leadership (Medium).",
    reasoning: "Prioritization weighted by explicit job description responsibilities and mission-critical platform needs.",
    nextAction: "Ingest candidate documentation for evidence matching",
    user: "System (HireFlow Engine)"
  },
  {
    id: "audit-3",
    timestamp: "10:45 AM",
    title: "Candidate evidence mapped",
    category: "EVIDENCE",
    source: "Alex_Morgan_Resume.pdf & Backend_Project_Readme.pdf",
    evidence: "Mapped 2 files across extracted requirements: 3 SUPPORTED, 2 PARTIAL, 3 UNKNOWN.",
    reasoning: "Exact source citations linked to Page 2 and Page 3 of candidate resume.",
    nextAction: "Calculate initial Decision Readiness score",
    user: "System (HireFlow Engine)"
  },
  {
    id: "audit-4",
    timestamp: "10:46 AM",
    title: "System Design classified as UNKNOWN",
    category: "EVIDENCE",
    requirement: "System Design",
    previousStatus: undefined,
    newStatus: "UNKNOWN",
    source: "Resume.pdf (Page 2)",
    evidence: "Only single-service FastAPI statements found; no distributed systems proof.",
    reasoning: "Unknown signifies insufficient evidence found. It does not mean candidate lacks the skill.",
    nextAction: "Generate minimum next validation targeting System Design",
    user: "System (HireFlow Engine)"
  },
  {
    id: "audit-5",
    timestamp: "10:47 AM",
    title: "Minimum validation generated",
    category: "VALIDATION",
    requirement: "System Design",
    source: "Next Move Engine",
    evidence: "Scenario: 1M daily requests architecture design.",
    reasoning: "System Design is critical and unresolved. Smallest targeted check selected (5-minute scenario).",
    nextAction: "Awaiting candidate validation submission",
    user: "System (HireFlow Engine)"
  }
];
