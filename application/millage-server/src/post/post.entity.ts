import {BoardEntity} from '../board/board.entity';
import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, JoinTable} from 'typeorm';
import {PostType} from './post.interface';
import {UserEntity} from '../user/user.entity';
import {PollItemEntity} from './poll/poll_item.entity';
import {ImageEntity} from '../image/image.entity';

@Entity('post')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false, default: PostType.NORMAL})
  postType: PostType;

  @Column({type: 'text'})
  title: string;

  @Column({type: 'text'})
  content: string;

  @Column({
    type: 'timestamp',
    default: () => {
      'CURRENT_TIMESTAMP';
    },
  })
  createdAt: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({name: 'userId', referencedColumnName: 'id'})
  userId: number;

  @ManyToOne(() => UserEntity)
  @JoinTable({
    name: 'writer',
    joinColumn: {name: 'userId', referencedColumnName: 'id'},
  })
  writer: UserEntity;

  @ManyToOne(() => BoardEntity)
  @JoinColumn({name: 'boardId', referencedColumnName: 'id'})
  boardId: number;

  @OneToMany(() => PollItemEntity, (pollItem) => pollItem.postId)
  pollItems: PollItemEntity[];

  @OneToMany(() => ImageEntity, (image) => image.postId)
  images: ImageEntity[];
}
