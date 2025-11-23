import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../enums/user.enums';

export const Role = (roles: RoleType[]) => {
  return SetMetadata('RoleType', roles);
};
