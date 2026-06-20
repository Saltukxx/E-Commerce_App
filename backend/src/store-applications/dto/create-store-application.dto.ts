import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/transforms';

export class CreateStoreApplicationDto {
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  businessName!: string;

  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  contactName!: string;

  @Trim()
  @IsEmail()
  contactEmail!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
