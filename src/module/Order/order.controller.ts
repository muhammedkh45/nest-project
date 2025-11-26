import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, ParamDTO } from './dto/order.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { RoleType } from 'src/common/enums/user.enums';
import { TokenType } from 'src/common/enums/token.enums';
import { User } from 'src/common/decorators';
import type { HUserDocument } from 'src/DB/models/user.model';

@Controller('orders')
export class OrderController {
  constructor(private readonly OrderService: OrderService) {}
  @Auth({ tokenType: TokenType.access, roles: [RoleType.user] })
  @Post('create')
  async createOrder(
    @Body() OrderDto: CreateOrderDto,
    @User() user: HUserDocument,
  ) {
    return await this.OrderService.createOrder(OrderDto, user);
  }

  @Auth({ tokenType: TokenType.access, roles: [RoleType.user] })
  @Post('/checkout/:id')
  async checkOut(@Param() params: ParamDTO, @User() user: HUserDocument) {
    return await this.OrderService.checkOut(params, user);
  }

  @Post('/webhook')
  async webhook(@Body() body: any) {
    return await this.OrderService.webhook(body);
  }

  @Auth({ tokenType: TokenType.access, roles: [RoleType.admin] })
  @Patch('/refund/:id')
  async refund(@Param() params: ParamDTO, @User() user: HUserDocument) {
    return await this.OrderService.refund(params, user);
  }
}
