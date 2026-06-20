import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Trim } from '../../common/transforms';

export class VendorUpdatePriceInquiryDto {
  @Trim()
  @IsString()
  @IsIn(['pending', 'quoted', 'closed'])
  status!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quoteCents?: number;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}
