---
name: hrms-enterprise-engineering
description: Enforces production-grade clean architecture, multi-tenant security, repository pagination rules, bespoke corporate SaaS UI, and automated QA verification for the HRMS platform.
---

# HRMS Enterprise Engineering Skill

Follow all instructions in [SKILLS.md](../../SKILLS.md).

## Critical Enforcement Checklist
1. **Repository Queries**: Never use unbounded `findAll()`. All list endpoints must accept `Pageable pageable` and return `Page<T>` or `Slice<T>`, scoped by `tenant_id`.
2. **Multi-Tenancy Security**: `TenantContext.getTenantId()` must be checked in all queries. `TenantContext.clear()` must run in a `finally` block in `TenantContextFilter`.
3. **Transaction Boundaries**: Mutating methods must be annotated with `@Transactional(rollbackFor = Exception.class)`. Queries must use `@Transactional(readOnly = true)`.
4. **Corporate SaaS UI**: Pure white cards (`bg-white border border-slate-200 rounded-2xl shadow-sm`). No dark arcade or neon pills.
5. **Quality Gate**: Every feature must have an automated PowerShell verification script and pass 100% of all regression test suites before concluding.
