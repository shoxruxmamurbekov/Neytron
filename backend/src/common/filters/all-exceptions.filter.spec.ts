import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function createHost(url = '/api/v1/test') {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('formats HttpException with the unified error envelope', () => {
    const { host, status, json } = createHost('/api/v1/projects/1');
    filter.catch(new NotFoundException('Loyiha topilmadi'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const body = json.mock.calls[0][0];
    expect(body.error.statusCode).toBe(404);
    expect(body.error.message).toBe('Loyiha topilmadi');
    expect(body.error.path).toBe('/api/v1/projects/1');
    expect(typeof body.error.timestamp).toBe('string');
  });

  it('exposes validation messages as details', () => {
    const { host, json } = createHost();
    filter.catch(new BadRequestException(['name should not be empty']), host);

    const body = json.mock.calls[0][0];
    expect(body.error.statusCode).toBe(400);
    expect(body.error.details).toEqual(['name should not be empty']);
  });

  it('never leaks internal error details for unknown errors', () => {
    const { host, status, json } = createHost();
    filter.catch(new Error('password=secret leaked'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body.error.message).toBe('Ichki server xatosi');
    expect(JSON.stringify(body)).not.toContain('secret');
  });
});
