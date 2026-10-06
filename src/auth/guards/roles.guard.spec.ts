import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsuarioEntity } from 'src/usuarios/entities/usuario.entity';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const createContext = (role: string): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { rol: { nombre: role } } as UsuarioEntity,
        }),
      }),
    }) as unknown as ExecutionContext;

  it('allows a user whose role is authorized', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext('admin'))).toBe(true);
  });

  it('rejects a user whose role is not authorized', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext('usuario'))).toThrow(
      ForbiddenException,
    );
  });

  it('allows routes without role metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext('usuario'))).toBe(true);
  });

  it('rejects role metadata that does not authorize any role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext('admin'))).toThrow(
      ForbiddenException,
    );
  });
});
