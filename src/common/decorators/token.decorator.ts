import { SetMetadata } from '@nestjs/common';
import { TokenType } from '../enums/token.enums';

export const Token = (tokenType: TokenType) => {
  return SetMetadata('tokenType', tokenType);
};
