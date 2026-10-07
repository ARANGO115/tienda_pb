import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { UsuariosService } from 'src/usuarios/usuarios.service';
import { AuthService } from './auth.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));
jest.mock(
  'src/usuarios/usuarios.service',
  () => ({
    UsuariosService: class UsuariosService {},
  }),
  { virtual: true },
);

describe('AuthService registration', () => {
  let usuariosService: {
    create: jest.Mock;
    createForRegistration: jest.Mock;
  };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    usuariosService = {
      create: jest.fn().mockResolvedValue({ user: { id: 3 } }),
      createForRegistration: jest.fn().mockResolvedValue({ user: { id: 4 } }),
    };
    service = new AuthService(
      usuariosService as unknown as UsuariosService,
      {} as JwtService,
    );
  });

  it('registers with the requested role when rolId is provided', async () => {
    await service.register({
      nombre: 'Admin',
      email: 'admin@example.com',
      password: 'Secret123',
      rolId: 2,
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('Secret123', 10);
    expect(usuariosService.create).toHaveBeenCalledWith({
      nombre: 'Admin',
      email: 'admin@example.com',
      password: 'hashed-password',
      rolId: 2,
    });
    expect(usuariosService.createForRegistration).not.toHaveBeenCalled();
  });

  it('uses the default usuario role when rolId is omitted', async () => {
    await service.register({
      nombre: 'Usuario',
      email: 'user@example.com',
      password: 'Secret123',
    });

    expect(usuariosService.createForRegistration).toHaveBeenCalledWith({
      nombre: 'Usuario',
      email: 'user@example.com',
      password: 'hashed-password',
    });
    expect(usuariosService.create).not.toHaveBeenCalled();
  });
});
