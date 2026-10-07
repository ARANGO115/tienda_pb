import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioEntity } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RolService } from '../rol/rol.service';
import { RolEntity } from '../rol/entities/rol.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuariosRepository: Repository<UsuarioEntity>,
    private readonly rolService: RolService,
  ) {}

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<UsuarioEntity | null> {
    if (includePassword) {
      return await this.usuariosRepository
        .createQueryBuilder('usuario')
        .addSelect('usuario.password')
        .leftJoinAndSelect('usuario.rol', 'rol')
        .where('usuario.email = :email', { email })
        .getOne();
    }
    return await this.usuariosRepository.findOne({
      where: { email },
    });
  }

  async findOne(id: number): Promise<UsuarioEntity | null> {
    return this.usuariosRepository.findOne({
      where: { id },
    });
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const rol = await this.rolService.findOne(createUsuarioDto.rolId);
    return this.persistUser(createUsuarioDto, rol);
  }

  async createForRegistration(
    createUsuarioDto: Omit<CreateUsuarioDto, 'rolId'>,
  ) {
    const rol = await this.rolService.findByName('usuario');
    if (!rol) {
      throw new InternalServerErrorException(
        'El rol "usuario" no está configurado. Créelo antes de habilitar el registro.',
      );
    }

    return this.persistUser({ ...createUsuarioDto, rolId: rol.id }, rol);
  }

  async updateRole(id: number, rolId: number) {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const rol = await this.rolService.findOne(rolId);
    usuario.rolId = rol.id;
    usuario.rol = rol;

    const updatedUser = await this.usuariosRepository.save(usuario);

    return {
      message: 'Rol del usuario actualizado exitosamente',
      user: {
        id: updatedUser.id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        activo: updatedUser.activo,
        rolId: updatedUser.rolId,
        rol: updatedUser.rol,
      },
    };
  }

  private async persistUser(
    createUsuarioDto: CreateUsuarioDto,
    rol: RolEntity,
  ) {
    const userExists = await this.usuariosRepository.findOne({
      where: { email: createUsuarioDto.email },
    });
    if (userExists) {
      throw new ConflictException(
        `El email ${createUsuarioDto.email} ya está registrado`,
      );
    }

    //Crear el usuario con el rol asignado
    const newUser = this.usuariosRepository.create({
      ...createUsuarioDto,
      rol: rol,
    });

    const userSaved = await this.usuariosRepository.save(newUser);

    //Omitir la contraseña en la respuesta
    const { password, ...userWithoutPassword } = userSaved;
    void password;

    return {
      mesage: 'Usuario creado exitosamente',
      user: userWithoutPassword,
    };
  }
}
