import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsString() category: string;
  @IsNumber() priceXlm: number;
  @IsInt() @Min(0) stock: number;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() sellerWallet?: string;
  @IsOptional() @IsString() listingContractId?: string;
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() priceXlm?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsString() imageUrl?: string;
}

export class ProductQueryDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}
