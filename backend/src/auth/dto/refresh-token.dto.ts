import { IsString, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/transforms';

export class RefreshTokenDto {
  @Trim()
  @IsString()
  @MinLength(32)
  @MaxLength(256)
  refresh_token!: string;
}
