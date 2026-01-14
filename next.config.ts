import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // reactCompiler: true, // Temporarily disabled - causing hydration mismatch with styled-jsx
};

export default withNextIntl(nextConfig);
