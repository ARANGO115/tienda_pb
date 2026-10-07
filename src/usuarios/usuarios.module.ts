import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { UsuarioEntity } from './entities/usuario.entity';
import { RolModule } from 'src/rol/rol.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntity]), RolModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, JwtAuthGuard, RolesGuard],
  exports: [UsuariosService],
})
export class UsuariosModule {}
