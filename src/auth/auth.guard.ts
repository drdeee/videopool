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
}).split('\n');

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (
      request.headers['X-API-TOKEN'] &&
      tokens.includes(request.headers['X-API-TOKEN'])
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
