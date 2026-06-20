import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/transforms';
import { PRODUCT_STATUS } from '../../common/marketplace';

export class CreateProductDto {
  @Trim()
  @IsString()
  @MaxLength(200)
  title!: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @Trim()
  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQty?: number | null;

  @IsInt()
  categoryId!: number;

  @IsOptional()
  @IsInt()
  storeId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @Trim()
  @IsString()
  @IsIn([PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.DRAFT, PRODUCT_STATUS.ARCHIVED])
  status?: string;
}
