import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../common/transforms';

export class UpdateStoreDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

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
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsInt({ each: true })
  featuredProductIds?: number[];
}

export class RejectStoreApplicationDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

export class UpdateStoreStatusDto {
  @Trim()
  @IsString()
  @IsIn(['active', 'suspended'])
  status!: 'active' | 'suspended';
}
