import { IsInt, Min } from 'class-validator';

export class UpdateUsuarioRolDto {
  @IsInt({ message: 'El rolId debe ser un número entero' })
  @Min(1, { message: 'El rolId debe ser mayor que cero' })
  rolId!: number;
}
