import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/transforms';

export class CreateCategoryDto {
  @Trim()
  @IsString()
  @MaxLength(200)
  name!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;
}
