import { InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RolEntity } from 'src/rol/entities/rol.entity';
import { RolService } from 'src/rol/rol.service';
import { UsuarioEntity } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
jest.mock('../rol/rol.service', () => ({
  RolService: class RolService {},
}));

describe('UsuariosService registration', () => {
  const rolUsuario = { id: 2, nombre: 'usuario' } as RolEntity;
  const usuarioGuardado = {
    id: 1,
    nombre: 'Ana',
    email: 'ana@example.com',
    password: 'hash',
    rolId: rolUsuario.id,
    rol: rolUsuario,
  } as UsuarioEntity;

  let usuariosRepository: jest.Mocked<
    Pick<Repository<UsuarioEntity>, 'findOne' | 'create' | 'save'>
  >;
  let rolService: jest.Mocked<Pick<RolService, 'findByName' | 'findOne'>>;
  let service: UsuariosService;

  beforeEach(() => {
    usuariosRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(usuarioGuardado),
      save: jest.fn().mockResolvedValue(usuarioGuardado),
    };
    rolService = {
      findByName: jest.fn().mockResolvedValue(rolUsuario),
      findOne: jest.fn(),
    };
    service = new UsuariosService(
      usuariosRepository as unknown as Repository<UsuarioEntity>,
      rolService as unknown as RolService,
    );
  });

  it('assigns the usuario role without accepting a role from the request', async () => {
    const result = await service.createForRegistration({
      nombre: 'Ana',
      email: 'ana@example.com',
      password: 'hash',
    });

    expect(rolService.findByName).toHaveBeenCalledWith('usuario');
    expect(usuariosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ rolId: rolUsuario.id, rol: rolUsuario }),
    );
    expect(result.user).not.toHaveProperty('password');
  });

  it('reports a configuration error when the usuario role is missing', async () => {
    rolService.findByName.mockResolvedValue(null);

    await expect(
      service.createForRegistration({
        nombre: 'Ana',
        email: 'ana@example.com',
        password: 'hash',
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('updates a user role when requested by an administrator', async () => {
    const adminRole = { id: 3, nombre: 'admin' } as RolEntity;
    usuariosRepository.findOne.mockResolvedValue(usuarioGuardado);
    rolService.findOne.mockResolvedValue(adminRole);
    usuariosRepository.save.mockImplementation((user) =>
      Promise.resolve(user as UsuarioEntity),
    );

    const result = await service.updateRole(usuarioGuardado.id, adminRole.id);

    expect(rolService.findOne).toHaveBeenCalledWith(adminRole.id);
    expect(usuariosRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ rolId: adminRole.id, rol: adminRole }),
    );
    expect(result.user.rol.nombre).toBe('admin');
  });
});
