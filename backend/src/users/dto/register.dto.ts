import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/transforms';

export class RegisterDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @Trim()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}
