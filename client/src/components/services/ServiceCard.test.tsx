import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { ServiceDefinition } from '../../types/domain';
import { ServiceCard } from './ServiceCard';

const service: ServiceDefinition = {
  id: 'test-service',
  name: 'Test service',
  description: 'A service used only in this test.',
  icon: 'server',
  destination: '/test-service',
  external: false,
  category: 'local',
  status: 'online',
  roles: ['admin', 'user'],
};

describe('ServiceCard', () => {
  it('renders the supplied service and its destination', () => {
    render(
      <MemoryRouter>
        <ServiceCard service={service} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: service.name }),
    ).toBeInTheDocument();

    expect(screen.getByText(service.description)).toBeInTheDocument();

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      service.destination,
    );
  });
});
