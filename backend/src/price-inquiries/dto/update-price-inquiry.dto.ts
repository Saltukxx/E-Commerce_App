import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { INQUIRY_STATUS } from '../price-inquiry.constants';

export class UpdatePriceInquiryDto {
  @IsString()
  @IsIn(Object.values(INQUIRY_STATUS))
  status!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quoteCents?: number;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
