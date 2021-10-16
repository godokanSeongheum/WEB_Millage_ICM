import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {PostEntity} from '../post/post.entity';
import {FindManyOptions, Like, Repository} from 'typeorm';
import {BoardEntity} from './board.entity';
import {CreateBoardDto, UpdateBoardDto} from './dto';
import {PaginationObject} from './board.interface';
import {UserEntity} from '../user/user.entity';

const POSTS_PER_PAGE = 10;
const POSTS_PER_BOARD_PREVIEW = 4;

@Injectable()
export class BoardService {
  constructor(
        @InjectRepository(BoardEntity)
        private readonly boardRepository: Repository<BoardEntity>,

        @InjectRepository(PostEntity)
        private readonly postRepository: Repository<PostEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
  ) {}


  async getBoardList(id: number, userId: number) : Promise<BoardEntity[]> {
    const list = await this.boardRepository.find({
      where: {
        unitId: id,
      },
    });


    const user = await this.userRepository.findOne(
        userId, {relations: ['starredBoards']});

    const ids = [];
    for (const board of user.starredBoards.values()) {
      ids.push(board.id);
    }
    list.forEach((board) => {
      board.isStarred = ids.includes(board.id);
    });

    return list;
  }

  async getBoardListWithPosts(unitId: number, userId: number): Promise<BoardEntity[]> {
    const boards = await this.boardRepository.find({
      where: {
        unitId: unitId,
      },
    });
    return await Promise.all(boards.map(async (board) => {
      board.posts = await this.postRepository.find({
        relations: ['writer', 'comments', 'recruitStatus', 'recruitStatus.currentMember'],
        where: {board},
        order: {createdAt: 'ASC'},
        take: POSTS_PER_BOARD_PREVIEW,
      });


      const user = await this.userRepository.findOne(
          userId, {relations: ['starredBoards']});

      const ids = [];
      for (const board of user.starredBoards.values()) {
        ids.push(board.id);
      }

      board.isStarred = ids.includes(board.id);

      return board;
    }));
  }

  async create(dto: CreateBoardDto): Promise<BoardEntity> {
    const newBoard = this.boardRepository.create(dto);
    try {
      const savedBoard = await this.boardRepository.save(newBoard);
      return savedBoard;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async update(dto: UpdateBoardDto, boardId: number, unitId: number): Promise<BoardEntity> {
    const updateResult = await this.boardRepository.update(
        {id: boardId, unitId: unitId}, dto
    );
    if (updateResult.affected === 0) {
      throw new Error('Cannot find the board');
    }
    return updateResult.generatedMaps[0] as BoardEntity;
  }

  async delete(boardId: number, unitId: number): Promise<number> {
    const deleteResult = await this.boardRepository.delete(
        {id: boardId, unitId: unitId},
    );
    if (deleteResult.affected === 0) {
      throw new Error('Cannot find the board');
    }
    return boardId;
  }

  private async getPaginationObject(
      boardId: number,
      searchKeyword: string,
      curPage: number,
  ): Promise<PaginationObject<PostEntity>> {
    searchKeyword = searchKeyword ? decodeURI(searchKeyword) : '';
    const searchOptions: FindManyOptions<PostEntity> = {
      where: [
        {boardId: boardId, title: Like(`%${searchKeyword}%`)},
        {boardId: boardId, content: Like(`%${searchKeyword}%`)},
      ],
    };
    const totalCounts = await this.postRepository.count(searchOptions);
    const totalPages = Math.ceil(totalCounts / 10);
    searchOptions.skip = (curPage - 1) * POSTS_PER_PAGE;
    searchOptions.take = POSTS_PER_PAGE;
    searchOptions.relations = ['images', 'writer', 'comments'];
    const results = await this.postRepository.find(searchOptions);
    return {results, curPage, totalCounts, totalPages};
  }

  async getBoardData(id: number, page: number, searchKeyword: string): Promise<BoardEntity> {
    let board: BoardEntity = null;
    try {
      board = await this.boardRepository.findOne(id);
      board.paginationObject = await this.getPaginationObject(board.id, searchKeyword, page);
      return board;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getRecruitAndPollList(unitId: number) {
    const posts = await this.boardRepository.query(`
    select post.id, post.title, recruit.totalMember,(select count(*) from recruitingUser where recruitId = recruit.id) as currentCount
    from post 
      inner join board on post.boardId = board.id and unitID = ${unitId} and (recruitAllowed = true or pollAllowed = true)
      inner join recruit on recruit.postId = post.id 
      where postType='RECRUIT' order by post.createdAt DESC LIMIT 5
    `);

    return posts;
  }

  async toggleStar(boardId: number, userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne(
        userId, {relations: ['starredBoards']});
    let isAlreadyStarred = false;
    for (const [idx, board] of user.starredBoards.entries()) {
      if (board.id === boardId) {
        isAlreadyStarred = true;
        user.starredBoards.splice(idx, 1);
        break;
      }
    }
    if (!isAlreadyStarred) {
      const board = await this.boardRepository.findOne(boardId);
      user.starredBoards.push(board);
    }
    await this.userRepository.save(user);
    return true;
  }
}
