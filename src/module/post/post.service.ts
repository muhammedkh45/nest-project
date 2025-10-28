import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
  getPosts(): any {
    return 'All Posts';
  }
}
