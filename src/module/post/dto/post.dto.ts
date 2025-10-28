import { IsString } from 'class-validator';

export class CreatePostDTo {
  @IsString()
  content: string;
}
