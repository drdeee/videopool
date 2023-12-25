import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { readFileSync } from 'fs';
import { Observable } from 'rxjs';

const tokens: string[] = readFileSync('api_tokens.txt', {
  encoding: 'utf-8',
})
  .toString()
  .split('\n');

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (
      request.headers['x-api-token'] &&
      tokens.includes(request.headers['x-api-token'])
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
