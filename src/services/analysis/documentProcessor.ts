export interface DocumentExtractionResult {
  text: string;
  sourceName: string;
  pageCount: number;
  wordCount: number;
}

export class DocumentProcessor {
  /**
   * Adapts documents or text inputs into a structured string format for the analysis engine.
   */
  static extractText(input: string, sourceName: string = 'Alex_Morgan_Resume.pdf'): DocumentExtractionResult {
    const wordCount = input.trim().split(/\s+/).length;
    const pageCount = Math.max(1, Math.ceil(wordCount / 350));

    return {
      text: input,
      sourceName,
      pageCount,
      wordCount
    };
  }

  /**
   * Sample candidate text fixture for reliable offline verification.
   */
  static getSampleResumeText(): string {
    return `
Alex Morgan — Senior Backend Engineer
San Francisco, CA • github.com/alexmorgan-dev

Summary:
Backend engineer with 5+ years of experience developing high-performance Python microservices, database schemas, and API contracts.

Experience:
Lead Backend Engineer — CloudScale Systems (2021 – Present)
• Led core backend development in Python 3.11 using FastAPI and SQLAlchemy; transitioned legacy synchronous endpoints to async coroutines, reducing median endpoint latency by 28%.
• Managed PostgreSQL cluster schemas, optimized slow analytical queries reducing p99 latency by 35%, and wrote complex migration scripts.
• Designed and implemented 15+ RESTful endpoints for customer account management using FastAPI and Pydantic validation models.
• Designed backend services using FastAPI and PostgreSQL for core client-facing microservices.

Backend Software Engineer — DataBridge Inc. (2019 – 2021)
• Onboarded and mentored 2 junior backend engineers; instituted weekly technical syncs and pair programming sessions.
• Built automated ingestion pipelines processing CSV/JSON batch streams.

Technical Skills:
Python, FastAPI, AsyncIO, PostgreSQL, Redis, Docker, Pytest, Git, CI/CD.
`;
  }
}
