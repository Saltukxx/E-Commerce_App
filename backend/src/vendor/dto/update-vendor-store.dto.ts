import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../common/transforms';

export class UpdateVendorStoreDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  banner?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactEmail?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  deliveryArea?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  website?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  certifications?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsInt({ each: true })
  featuredProductIds?: number[];
}
