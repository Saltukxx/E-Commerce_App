import { IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/transforms';

export class AddressOrderDto {
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  addressLine!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  state!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postalCode!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  country!: string;
}
