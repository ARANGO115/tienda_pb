import {
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUsuarioRolDto } from './dto/update-usuario-rol.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Patch(':id/rol')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioRolDto: UpdateUsuarioRolDto,
  ) {
    return this.usuariosService.updateRole(id, updateUsuarioRolDto.rolId);
  }
}
 