import { IsInt, Min } from 'class-validator';

export class CreatePriceInquiryDto {
  @IsInt()
  @Min(1)
  productId!: number;
}
