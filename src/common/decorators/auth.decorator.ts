import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleType } from '../enums/user.enums';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';
import { TokenType } from '../enums/token.enums';
import { Token } from './token.decorator';
import { Role } from './role.decorator';

export function Auth({
  tokenType,
  roles,
}: {
  tokenType: TokenType;
  roles: RoleType[];
}) {
  return applyDecorators(
    Token(tokenType),
    Role(roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
}
