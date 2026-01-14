# 🤝 Contributing to WindWireless SaaS

Thank you for your interest in contributing to WindWireless! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for database)
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/wwusa-saas-app.git
   cd wwusa-saas-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code refactoring

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

## Code Standards

### TypeScript

- **Always use TypeScript** - No `.js` or `.jsx` files
- **Enable strict mode** - Already configured
- **Avoid `any` type** - Use proper types or `unknown`
- **Create type definitions** in `src/types/`

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: any): Promise<any> {
  // ...
}
```

### React Components

#### Functional Components

```typescript
// ✅ Good - Named export with proper typing
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {label}
    </button>
  );
}
```

#### Component Organization

```typescript
// 1. Imports
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// 2. Type definitions
interface Props {
  // ...
}

// 3. Component
export function MyComponent({ prop }: Props) {
  // 3a. Hooks
  const t = useTranslations();
  const [state, setState] = useState();

  // 3b. Handlers
  const handleClick = () => {
    // ...
  };

  // 3c. Render
  return (
    // JSX
  );
}
```

### Internationalization (i18n)

**Never hardcode text!** Always use translation keys:

```typescript
// ❌ Bad
<h1>Inventory Management</h1>

// ✅ Good
const t = useTranslations('Dashboard.Inventory');
<h1>{t('title')}</h1>
```

**Add translations to all language files:**

- `src/messages/en.json`
- `src/messages/pt.json`
- `src/messages/es.json`

### Styling

Use CSS variables defined in `globals.css`:

```css
/* ✅ Good */
.button {
  background: var(--color-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
}

/* ❌ Bad - Hardcoded colors */
.button {
  background: #3b82f6;
  color: #ffffff;
}
```

### File Naming

- **Components**: PascalCase - `UserProfile.tsx`
- **Utilities**: camelCase - `formatDate.ts`
- **Pages**: kebab-case - `[locale]/dashboard/inventory/page.tsx`
- **Types**: PascalCase with `.types.ts` - `User.types.ts`

### Import Order

```typescript
// 1. External libraries
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// 2. Internal absolute imports
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports
import { helper } from './utils';

// 4. Types
import type { User } from '@/types/User.types';

// 5. Styles
import styles from './Component.module.css';
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(inventory): add bulk import functionality

- Implemented Excel upload
- Added validation for IMEI/Serial
- Updated UI with progress indicator

Closes #123

---

fix(auth): resolve login redirect loop

The redirect was caused by middleware not checking session properly.
Now validates session before redirecting.

Fixes #456
```

### Commit Best Practices

- Use present tense ("add feature" not "added feature")
- First line max 72 characters
- Reference issue numbers
- Explain WHY, not just WHAT

## Pull Request Process

### Before Submitting

1. **Run linting**: `npm run lint`
2. **Type check**: `npm run type-check`
3. **Format code**: `npm run format`
4. **Test locally**: Ensure dev server runs without errors
5. **Update documentation**: If adding features

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How to test these changes

## Screenshots (if applicable)

Visual proof of changes

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No console errors
- [ ] i18n properly implemented
```

### PR Review Process

1. At least one approval required
2. All CI checks must pass
3. No merge conflicts
4. Documentation updated

## Testing

### Manual Testing Checklist

- [ ] Feature works in all supported languages (en, pt, es)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] No console errors or warnings
- [ ] Database operations work correctly
- [ ] Form validation works
- [ ] Error states display properly

### Browser Testing

Test in:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Database Changes

### Creating Migrations

1. **Create migration file**

   ```bash
   # Name format: XXX_descriptive_name.sql
   # Example: 043_add_user_preferences.sql
   ```

2. **Include rollback**

   ```sql
   -- Migration
   ALTER TABLE users ADD COLUMN preferences JSONB;

   -- Rollback (comment)
   -- ALTER TABLE users DROP COLUMN preferences;
   ```

3. **Test locally** before committing
4. **Document** breaking changes

### RLS Policies

- Always include RLS policies for new tables
- Test with different user roles
- Document policy logic

## Code Review Guidelines

### As a Reviewer

- Be respectful and constructive
- Explain WHY, not just WHAT to change
- Approve if changes are minor
- Request changes for critical issues

### As an Author

- Respond to all comments
- Explain your decisions
- Don't take feedback personally
- Mark resolved conversations

## Common Pitfalls to Avoid

❌ **Don't**

- Commit directly to `main`
- Use `any` type in TypeScript
- Hardcode text (use i18n)
- Ignore ESLint warnings
- Leave console.logs in code
- Commit `.env.local`

✅ **Do**

- Create feature branches
- Write meaningful commit messages
- Add proper TypeScript types
- Use translation keys
- Clean up before committing
- Test your changes

## Getting Help

- **Slack**: #windwireless-dev
- **Email**: dev@windwireless.com
- **Documentation**: See `ARCHITECTURE.md`
- **Issues**: GitHub Issues

## Recognition

Contributors will be acknowledged in:

- README.md
- Release notes
- Annual contributor list

Thank you for making WindWireless better! 🚀

---

**Questions?** Open an issue or reach out to the team.
