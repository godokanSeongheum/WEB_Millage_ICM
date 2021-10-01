import {Get, Post, Body, Req, Controller, UsePipes} from '@nestjs/common';
import {Request} from 'express';
import {UserService} from './user.service';
import {UserRO} from './user.interface';
import {CreateUserDto, LoginUserDto} from './dto';
import {ValidationPipe} from '../shared/pipes/validation.pipe';
import {
  ApiBearerAuth, ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('session')
  async getSession(@Req() request : Request) : Promise<UserRO> {
    if (request.session && request.session.user) {
      return {
        result: 'success',
        session: request.session.user,
      };
    } else {
      return {
        result: 'fail',
      };
    }
  }

  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(@Body() userdata : LoginUserDto, @Req() request: Request): Promise<UserRO> {
    const _user = await this.userService.findOne({
      username: userdata.username,
      password: userdata.password,
    });
    if (!_user) {
      return {
        result: 'fail',
      };
    }

    const {id, username, email, phonenumber, fullname, nickname, unit, role} = _user;
    const user = {id, username, email, phonenumber, fullname, nickname, unit, role};
    request.session.user = user;
    return {
      result: 'success',
    };
  }


  @UsePipes(new ValidationPipe())
  @Post('register')
  async register(@Body() userdata : CreateUserDto): Promise<UserRO> {
    try {
      const user = await this.userService.create(userdata);
      return user;
    } catch (err) {
      return {
        result: 'error',
        message: err,
      };
    }
  }
}
