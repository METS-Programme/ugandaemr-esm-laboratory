# Type Definitions Migration Guide

## Overview
This document outlines the reorganization of type definitions from a monolithic structure to a domain-based architecture.

## New Directory Structure

```
src/types/
├── core/              # Shared core types
│   └── common.ts     # Common interfaces (Patient, Person, Provider, etc.)
├── laboratory/        # Laboratory-specific types
│   └── tests.ts      # Lab tests, orders, observations, samples
├── api/              # API-related types
│   ├── requests.ts   # Request payloads
│   └── responses.ts  # API response types
└── index.ts          # Central exports
```

## Migration Benefits

1. **Better Organization**: Related types are grouped together
2. **Easier Navigation**: Find types by domain (laboratory, API, core)
3. **Reduced Duplication**: Single source of truth for each type
4. **Improved Maintainability**: Changes to types are isolated to specific domains
5. **Better Documentation**: Each file can document its domain-specific types

## Import Examples

### Before (Monolithic)
```typescript
import { Patient, LaboratoryOrder, ObservationPayload } from "../../types/index";
```

### After (Domain-Based)
```typescript
// Import from specific domains
import { Patient, Person } from "../../types/core/common";
import { LaboratoryOrder, Observation } from "../../types/laboratory/tests";
import { ObservationPayload, OrderDiscontinuationPayload } from "../../types/api/requests";

// Or use the central export (maintains backward compatibility)
import { Patient, LaboratoryOrder, ObservationPayload } from "../../types/index";
```

## Type Categories

### Core Types (`core/common.ts`)
- Patient demographics
- Person information
- Provider details
- Location data
- Common identifiers

### Laboratory Types (`laboratory/tests.ts`)
- Laboratory concepts
- Lab orders and tests
- Observations and results
- Samples and tracking
- Work list items
- Referred orders

### API Request Types (`api/requests.ts`)
- Observation payloads
- Order operations
- Sample collection
- Email sending
- Queue management

### API Response Types (`api/responses.ts`)
- API response wrappers
- Transaction results
- Concept responses
- Order/observation responses
- Patient/encounter responses

## Migration Timeline

1. ✅ **Phase 1**: Create new directory structure
2. ✅ **Phase 2**: Migrate existing types to new structure
3. 🔄 **Phase 3**: Update imports across codebase
4. ⏳ **Phase 4**: Deprecate old type files
5. ⏳ **Phase 5**: Complete migration

## Backward Compatibility

During the migration period, the `index.ts` file exports both old and new types to maintain backward compatibility. This allows gradual migration without breaking existing code.

## Type Guidelines

### When to Add Types

- **Core types**: Shared entities used across multiple domains (Patient, Person, Provider)
- **Laboratory types**: Lab-specific concepts and operations
- **API types**: Request/response structures for external APIs

### Naming Conventions

- Interfaces: PascalCase (`LaboratoryOrder`, `ObservationPayload`)
- Enums: PascalCase with UPPER_CASE values (`OrderStatus.NEW`)
- Type aliases: PascalCase (`LaboratoryValue`, `FormValue`)

### Type Organization

- Group related types together
- Export types at the domain level
- Use descriptive names that indicate purpose
- Add JSDoc comments for complex types

## Best Practices

1. **Import Specificity**: Import from specific domain files when possible
2. **Type Exports**: Export types that are used by multiple modules
3. **Documentation**: Add JSDoc comments for complex types
4. **Validation**: Ensure types match actual API responses
5. **Testing**: Test type definitions with real data when possible

## Migration Status

| Domain | Status | Notes |
|--------|--------|-------|
| Core types | ✅ Complete | Migrated to `core/common.ts` |
| Laboratory types | ✅ Complete | Migrated to `laboratory/tests.ts` |
| API requests | ✅ Complete | Migrated to `api/requests.ts` |
| API responses | ✅ Complete | Migrated to `api/responses.ts` |
| Import updates | 🔄 In progress | Updating imports across codebase |
| Old file cleanup | ⏳ Pending | After import migration complete |

## Support

For questions or issues during the migration process, consult this guide or contact the development team.

---

*Last Updated: 2025-04-25*
