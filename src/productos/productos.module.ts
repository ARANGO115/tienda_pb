import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { CategoriasModule } from '../categorias/categorias.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    CategoriasModule, // Importamos CategoriasModule para poder inyectar CategoriasService
  ],
  controllers: [ProductosController],
  providers: [ProductosService, JwtAuthGuard, RolesGuard],
})
export class ProductosModule {}
