import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { RolEntity } from './entities/rol.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntity])],
  providers: [RolService, JwtAuthGuard, RolesGuard],
  controllers: [RolController],
  exports: [RolService],
})
export class RolModule {}
