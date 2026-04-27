import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId!: number;

  @IsString()
  @MinLength(1)
  productName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;
}
